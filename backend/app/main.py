from __future__ import annotations

import base64
import hashlib
import hmac
import json
import uuid
import asyncio
from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, Header, HTTPException, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.db import Base, engine, get_db, SessionLocal
from app.models import ApiKey, FeedbackRecord, KpiLog, MonitorTask, RiskEvent, SentimentReport, Strategy, StrategyBacktest, User, UserCredential, UserSession, UserWatchlist
from app.schemas import (
    AIRequest,
    AIResponse,
    ApiKeySaveRequest,
    AuthResponse,
    BacktestRequest,
    BacktestResponse,
    FeedbackRequest,
    FeedbackResponse,
    LoginRequest,
    LoginV1Request,
    LoginV1Response,
    MonitorEventsResponse,
    MonitorKpiResponse,
    PdcaExecuteRequest,
    PdcaExecuteResponse,
    RegisterRequest,
    RiskEvaluateRequest,
    RiskEvaluateResponse,
    RiskReportResponse,
    ScenarioCreditResponse,
    ScenarioFxResponse,
    ScenarioSupplyResponse,
    SentimentCreateRequest,
    SentimentReportResponse,
    StrategyOptimizeRequest,
    StrategyOptimizeResponse,
    TaskCreateRequest,
    TaskResponse,
    WatchlistUpdateRequest,
)
from app.services.ai_service import run_ai
from app.services.market_service import build_realtime_tick, build_ticks, get_universe, get_watchlist
from app.services.quant_service import run_backtest
from app.services.risk_service import (
    evaluate_risk,
    execute_pdca,
    get_credit_scenario,
    get_fx_scenario,
    get_kpi_data,
    get_risk_report,
    get_supply_scenario,
    optimize_strategy,
    process_feedback,
    _gen_events,
)
from app.services.plugin_registry import init_default_plugins, get_registry
from app.services.scheduler_service import start_scheduler, stop_scheduler, upsert_job
from app.services.sentiment_service import generate_sentiment_report
from app.services.company_seed import get_company_all_events
from app.services.real_data import get_real_market_context, can_fetch_real_data

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def _hash_password(password: str) -> str:
    return hashlib.sha256(f"astraquant::{password}".encode("utf-8")).hexdigest()


def _build_auth_response(user: User, token: str) -> AuthResponse:
    return AuthResponse(token=token, userId=user.id, email=user.email, nickname=user.nickname or "User")


def get_current_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未登录")
    token = authorization.replace("Bearer ", "", 1).strip()
    # Try JWT v1 token first
    user = _decode_jwt(token, db)
    if user:
        return user
    # Fall back to legacy session token
    session = db.scalar(select(UserSession).where(UserSession.token == token))
    if not session:
        raise HTTPException(status_code=401, detail="会话已失效")
    user = db.scalar(select(User).where(User.id == session.user_id))
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user


_JWT_SECRET = "astrquant-risk-response-v1-secret-key-2026"


def _encode_jwt(payload: dict) -> str:
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
    body = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signature = hmac.new(_JWT_SECRET.encode(), f"{header}.{body}".encode(), hashlib.sha256).hexdigest()[:32]
    return f"{header}.{body}.{signature}"


def _decode_jwt(token: str, db: Session) -> User | None:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, body, signature = parts
        expected = hmac.new(_JWT_SECRET.encode(), f"{header}.{body}".encode(), hashlib.sha256).hexdigest()[:32]
        if not hmac.compare_digest(signature, expected):
            return None
        # Pad for base64 decoding
        payload = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        exp = payload.get("exp", 0)
        if exp and datetime.utcnow().timestamp() > exp:
            return None
        return db.scalar(select(User).where(User.id == payload.get("sub")))
    except Exception:
        return None


def require_role(*roles: str):
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="权限不足")
        return user
    return dependency


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    _seed_rbac_users()
    start_scheduler()
    init_default_plugins()


def _seed_rbac_users():
    from app.db import SessionLocal as SL
    db = SL()
    try:
        defaults = [
            ("admin@astrquant.com", "admin123", "管理员", "admin"),
            ("analyst@astrquant.com", "analyst123", "风险分析师", "risk_analyst"),
            ("executor@astrquant.com", "executor123", "执行操作员", "executor"),
            ("viewer@astrquant.com", "viewer123", "观察者", "viewer"),
        ]
        for email, pwd, nick, role in defaults:
            exists = db.scalar(select(User).where(User.email == email))
            if not exists:
                user = User(email=email, nickname=nick, role=role)
                db.add(user)
                db.commit()
                db.refresh(user)
                db.add(UserCredential(user_id=user.id, password_hash=_hash_password(pwd)))
                db.commit()
    finally:
        db.close()


@app.on_event("shutdown")
def on_shutdown():
    stop_scheduler()


@app.get("/api/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@app.get("/api/status/data-sources")
def data_source_status():
    """数据源状态 — 显示哪些数据源是真实数据，哪些是模拟数据"""
    real_available = can_fetch_real_data()
    market_ctx = get_real_market_context() if real_available else None

    sources = {
        "fx_rates": {"live": real_available, "source": "东方财富外汇API" if real_available else "模拟"},
        "stock_quotes": {"live": True, "source": "腾讯行情API"},
        "kline_history": {"live": True, "source": "东方财富K线API"},
        "sentiment_news": {"live": True, "source": "Google News RSS"},
    }

    return {
        "status": "ok",
        "real_data_available": real_available,
        "sources": sources,
        "market_context": market_ctx,
        "time": datetime.utcnow().isoformat(),
    }


@app.post("/api/auth/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    exists = db.scalar(select(User).where(User.email == payload.email))
    if exists:
        raise HTTPException(status_code=400, detail="邮箱已注册")
    user = User(email=payload.email, nickname=payload.nickname)
    db.add(user)
    db.commit()
    db.refresh(user)
    db.add(UserCredential(user_id=user.id, password_hash=_hash_password(payload.password)))
    token = uuid.uuid4().hex
    db.add(UserSession(token=token, user_id=user.id))
    db.commit()
    return _build_auth_response(user, token)


@app.post("/api/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    credential = db.scalar(select(UserCredential).where(UserCredential.user_id == user.id))
    if not credential or credential.password_hash != _hash_password(payload.password):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    token = uuid.uuid4().hex
    db.add(UserSession(token=token, user_id=user.id))
    db.commit()
    return _build_auth_response(user, token)


@app.get("/api/auth/me")
def me(user: User = Depends(get_current_user)):
    return {"userId": user.id, "email": user.email, "nickname": user.nickname or "User"}


@app.get("/api/market/watchlist")
def market_watchlist():
    return get_watchlist()


@app.get("/api/market/universe")
def market_universe():
    return get_universe()


@app.get("/api/market/ticks/{symbol}")
def market_ticks(symbol: str):
    return build_ticks(symbol)


@app.get("/api/profile/watchlist")
def get_profile_watchlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    model = db.scalar(select(UserWatchlist).where(UserWatchlist.user_id == user.id))
    if not model:
        return {"symbols": ["Tencent", "Tencent-Ads", "Tencent-Cloud", "Tencent-Games"]}
    return {"symbols": json.loads(model.symbols)}


@app.put("/api/profile/watchlist")
def update_profile_watchlist(payload: WatchlistUpdateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    unique_symbols = list(dict.fromkeys(payload.symbols))[:30]
    if not unique_symbols:
        raise HTTPException(status_code=400, detail="至少选择一个监控标的")
    model = db.scalar(select(UserWatchlist).where(UserWatchlist.user_id == user.id))
    if model:
        model.symbols = json.dumps(unique_symbols, ensure_ascii=False)
        model.updated_at = datetime.utcnow()
    else:
        db.add(UserWatchlist(user_id=user.id, symbols=json.dumps(unique_symbols, ensure_ascii=False)))
    db.commit()
    return {"saved": True, "symbols": unique_symbols}


@app.websocket("/ws/kpi")
async def kpi_ws(ws: WebSocket):
    """WebSocket KPI monitoring — pushes KPI data every 15 seconds with dual-condition alerts."""
    await ws.accept()
    try:
        while True:
            kpi_data = get_kpi_data()
            await ws.send_json(kpi_data)
            await asyncio.sleep(15)
    except Exception:
        return


@app.websocket("/ws/market")
async def market_ws(ws: WebSocket):
    await ws.accept()
    symbols = ["Tencent", "Tencent-Ads", "Tencent-Cloud", "Tencent-Games"]
    i = 0
    try:
        while True:
            symbol = symbols[i % len(symbols)]
            await ws.send_json(build_realtime_tick(symbol, i))
            i += 1
            await asyncio.sleep(1)
    except Exception:
        return


@app.post("/api/quant/backtest", response_model=BacktestResponse)
def quant_backtest(payload: BacktestRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    metrics = run_backtest(
        strategy_code=payload.strategyCode,
        symbols=payload.symbols,
        strategy_name=payload.strategyName,
        data_source=payload.dataSource,
        ts_code=payload.tsCode,
        start_date=payload.startDate,
        end_date=payload.endDate,
        csv_path=payload.csvPath,
    )
    record = StrategyBacktest(
        user_id=user.id,
        strategy_name=payload.strategyName or f"Strategy-{datetime.utcnow().strftime('%H%M%S')}",
        input_code=payload.strategyCode,
        win_rate=float(metrics["winRate"]),
        annual_return=float(metrics["annualReturn"]),
        max_drawdown=float(metrics["maxDrawdown"]),
        sharpe=float(metrics["sharpe"]),
    )
    db.add(record)
    db.commit()
    return BacktestResponse(**metrics)


@app.post("/api/ai/research", response_model=AIResponse)
def ai_research(payload: AIRequest):
    return run_ai(payload)


@app.post("/api/ai/chat", response_model=AIResponse)
def ai_chat(payload: AIRequest):
    return run_ai(payload)


@app.post("/api/sentiment/generate", response_model=SentimentReportResponse)
def sentiment_generate(payload: SentimentCreateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    report = generate_sentiment_report(payload.symbols)
    model = SentimentReport(
        id=report["id"],
        user_id=user.id,
        symbols=json.dumps(report["symbols"], ensure_ascii=False),
        market_sentiment=report["marketSentiment"],
        summary=report["summary"],
        stock_scores=json.dumps(report["stockScores"], ensure_ascii=False),
        suggestion=report["suggestion"],
        generated_at=report["generatedAt"],
    )
    db.merge(model)
    db.commit()
    return SentimentReportResponse(**report)


@app.get("/api/sentiment/history", response_model=list[SentimentReportResponse])
def sentiment_history(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.scalars(
        select(SentimentReport).where(SentimentReport.user_id == user.id).order_by(SentimentReport.generated_at.desc()).limit(20)
    ).all()
    return [
      SentimentReportResponse(
          id=item.id,
          generatedAt=item.generated_at,
          symbols=json.loads(item.symbols),
          marketSentiment=item.market_sentiment,
          summary=item.summary,
          stockScores=json.loads(item.stock_scores),
          suggestion=item.suggestion,
          reportTitle=f"Agent智能风险应对决策支持报告 #{item.id}",
          eventHighlights=[
              f"{score.get('symbol', 'N/A')}: 风险评分{score.get('score', 0)}，建议结合最新行情与波动复核。"
              for score in json.loads(item.stock_scores)[:4]
          ],
          recommendationBullets=[
              "优先执行平衡策略并按风险预算控制仓位。",
              "若波动率持续上行，逐步切换至更保守的对冲配置。",
              "每周复盘风险评分变化并更新执行阈值。",
          ],
          reportBody=item.summary,
      )
      for item in rows
    ]


@app.post("/api/tasks", response_model=TaskResponse)
def create_task(payload: TaskCreateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    user_id = user.id
    task = MonitorTask(user_id=user.id, name=payload.name, cron_expr=payload.cronExpr, enabled=1)
    db.add(task)
    db.commit()
    db.refresh(task)

    def _job():
        with Session(engine) as job_db:
            watchlist_model = job_db.scalar(select(UserWatchlist).where(UserWatchlist.user_id == user_id))
            symbols = json.loads(watchlist_model.symbols) if watchlist_model else ["Tencent", "Tencent-Ads", "Tencent-Cloud", "Tencent-Games"]
            report = generate_sentiment_report(symbols)
            job_db.merge(
                SentimentReport(
                    id=f"{report['id']}-{task.id[:6]}",
                    user_id=user_id,
                    symbols=json.dumps(report["symbols"], ensure_ascii=False),
                    market_sentiment=report["marketSentiment"],
                    summary=report["summary"],
                    stock_scores=json.dumps(report["stockScores"], ensure_ascii=False),
                    suggestion=report["suggestion"],
                    generated_at=report["generatedAt"],
                )
            )
            job_db.commit()

    upsert_job(task.id, payload.cronExpr, _job)
    return TaskResponse(id=task.id, name=task.name, cronExpr=task.cron_expr, enabled=bool(task.enabled), createdAt=task.created_at)


@app.get("/api/tasks", response_model=list[TaskResponse])
def list_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.scalars(
        select(MonitorTask).where(MonitorTask.user_id == user.id).order_by(MonitorTask.created_at.desc()).limit(20)
    ).all()
    return [TaskResponse(id=row.id, name=row.name, cronExpr=row.cron_expr, enabled=bool(row.enabled), createdAt=row.created_at) for row in rows]


@app.post("/api/profile/api-keys")
def save_api_key(payload: ApiKeySaveRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = ApiKey(
        id=str(uuid.uuid4()),
        user_id=user.id,
        provider=payload.provider,
        encrypted_key=payload.encryptedKey,
    )
    db.add(item)
    db.commit()
    return {"saved": True, "id": item.id}


# ── V1 Auth (JWT + RBAC) ──

@app.post("/api/v1/auth/login", response_model=LoginV1Response)
def login_v1(payload: LoginV1Request, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    credential = db.scalar(select(UserCredential).where(UserCredential.user_id == user.id))
    if not credential or credential.password_hash != _hash_password(payload.password):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    token = _encode_jwt({
        "sub": user.id,
        "role": user.role,
        "email": user.email,
        "iat": int(datetime.utcnow().timestamp()),
        "exp": int((datetime.utcnow() + timedelta(hours=24)).timestamp()),
    })
    return LoginV1Response(token=token, userId=user.id, email=user.email, nickname=user.nickname or "User", role=user.role)


# ── Risk Response v1 endpoints ──

@app.post("/api/v1/risk/evaluate", response_model=RiskEvaluateResponse)
def risk_evaluate(payload: RiskEvaluateRequest, _user: User = Depends(require_role("admin", "risk_analyst"))):
    result = evaluate_risk(payload.portfolio_value, payload.confidence, payload.factors)
    return RiskEvaluateResponse(**result)


@app.post("/api/v1/strategy/optimize", response_model=StrategyOptimizeResponse)
def strategy_optimize(payload: StrategyOptimizeRequest, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "risk_analyst"))):
    result = optimize_strategy(payload.risk_appetite, payload.budget, payload.time_window)
    # Persist strategies
    for stype, sdata in [("conservative", result["conservative"]), ("balanced", result["balanced"]), ("aggressive", result["aggressive"])]:
        strategy = Strategy(
            name=sdata["name"],
            type=stype,
            params_json=json.dumps({"risk_appetite": payload.risk_appetite, "budget": payload.budget, "time_window": payload.time_window}, ensure_ascii=False),
            cost=sdata["cost"],
            residual_risk=sdata["residual_risk"],
            status="optimized",
        )
        db.add(strategy)
    db.commit()
    return StrategyOptimizeResponse(**result)


@app.post("/api/v1/pdca/execute/{plan_id}", response_model=PdcaExecuteResponse)
def pdca_execute(plan_id: str, payload: PdcaExecuteRequest, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "executor"))):
    strategy = db.scalar(select(Strategy).where(Strategy.id == plan_id))
    if strategy:
        strategy.status = "executed"
        db.commit()
    result = execute_pdca(plan_id, max_retries=3)
    return PdcaExecuteResponse(**result)


@app.post("/api/v1/feedback", response_model=FeedbackResponse)
def submit_feedback(payload: FeedbackRequest, db: Session = Depends(get_db), _user: User = Depends(require_role("admin", "risk_analyst", "executor"))):
    record = FeedbackRecord(
        strategy_id=payload.strategy_id,
        plan_params=payload.plan_params,
        actual_loss=payload.actual_loss,
        actual_cost=payload.actual_cost,
        residual_risk=payload.residual_risk,
        suggestions=payload.suggestions,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    result = process_feedback(payload.strategy_id, payload.suggestions)
    return FeedbackResponse(
        id=record.id,
        strategy_id=record.strategy_id,
        suggestions=payload.suggestions,
        recorded_at=record.recorded_at,
        optimization_tips=result["optimization_tips"],
    )


@app.get("/api/v1/risk/report/{report_id}", response_model=RiskReportResponse)
def risk_report(report_id: str, _user: User = Depends(require_role("admin", "risk_analyst", "executor", "viewer"))):
    result = get_risk_report(report_id)
    return RiskReportResponse(**result)


@app.get("/api/v1/monitor/kpi", response_model=MonitorKpiResponse)
def monitor_kpi(_user: User = Depends(require_role("admin", "risk_analyst", "executor", "viewer"))):
    return MonitorKpiResponse(**get_kpi_data())


@app.get("/api/v1/monitor/events", response_model=MonitorEventsResponse)
def monitor_events(_user: User = Depends(require_role("admin", "risk_analyst", "executor", "viewer"))):
    # ── 使用腾讯控股真实风险事件数据（含随机通用事件补充） ──
    byd_events = get_company_all_events()
    extra_events = _gen_events()[:6]  # 取少量通用事件补充
    all_events = byd_events + extra_events
    all_events.sort(key=lambda e: e["timestamp"], reverse=True)
    return MonitorEventsResponse(events=all_events)


@app.get("/api/v1/scenario/fx", response_model=ScenarioFxResponse)
def scenario_fx(_user: User = Depends(require_role("admin", "risk_analyst", "executor", "viewer"))):
    """汇率风险场景 — 以腾讯控股(Tencent) 2024年年报数据为例。

    基于腾讯控股境外营收¥2,218.84亿（占比28.55%）的币种敞口分布。
    """
    result = get_fx_scenario()
    return ScenarioFxResponse(**result)


@app.get("/api/v1/scenario/credit", response_model=ScenarioCreditResponse)
def scenario_credit(_user: User = Depends(require_role("admin", "risk_analyst", "executor", "viewer"))):
    """信用风险场景 — 以腾讯控股(Tencent)广告主、商家与企业服务客户为例。

    基于广告主授信、FinTech商家结算、企业服务客户应收等业务特征的PD/LGD估算。
    """
    result = get_credit_scenario()
    return ScenarioCreditResponse(**result)


@app.get("/api/v1/scenario/supply", response_model=ScenarioSupplyResponse)
def scenario_supply(_user: User = Depends(require_role("admin", "risk_analyst", "executor", "viewer"))):
    """供应链风险场景 — 以腾讯控股(Tencent)核心供应链为例。

    基于腾讯控股AI算力、云资源、数据中心、CDN与内容审核运营能力的供应风险估算。
    """
    result = get_supply_scenario()
    return ScenarioSupplyResponse(**result)


@app.get("/api/v1/plugins")
def list_plugins(_user: User = Depends(require_role("admin", "risk_analyst"))):
    """List registered risk type plugins with their tools and data sources."""
    reg = get_registry()
    return {
        "risk_types": [
            {
                "type": rt,
                "display_name": p.display_name,
                "data_sources": p.data_sources,
                "tools": p.tools,
                "alert_conditions": p.alert_conditions,
                "description": p.description,
            }
            for rt, p in reg._plugins.items()
        ]
    }


@app.get("/api/v1/system/performance")
def system_performance(_user: User = Depends(require_role("admin", "risk_analyst"))):
    """System performance diagnostics."""
    import time as _time
    t0 = _time.perf_counter()
    eval_result = evaluate_risk(10_000_000, 0.95, ["汇率", "信用", "供应链"])
    eval_ms = (_time.perf_counter() - t0) * 1000

    t0 = _time.perf_counter()
    strategy_result = optimize_strategy(500_000, 2_000_000, 90)
    strategy_ms = (_time.perf_counter() - t0) * 1000

    return {
        "risk_evaluation_ms": round(eval_ms, 1),
        "strategy_optimization_ms": round(strategy_ms, 1),
        "risk_evaluation_target_ms": 3000,
        "strategy_optimization_target_ms": 10000,
        "risk_evaluation_status": "pass" if eval_ms <= 3000 else "degraded",
        "strategy_optimization_status": "pass" if strategy_ms <= 10000 else "degraded",
        "sobol_enabled": True,
        "harrell_davis_enabled": True,
        "nsga2_early_termination": True,
        "plugin_registry_size": len(get_registry()._plugins),
    }
