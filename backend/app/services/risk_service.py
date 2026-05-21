from __future__ import annotations

import math
import random
import uuid
from datetime import datetime, timedelta

random.seed(42)


# ── Monte Carlo VaR ──

def _monte_carlo_var(confidence: float, num_simulations: int = 10000) -> dict:
    mu = -0.0002
    sigma = 0.015
    sim_returns = [random.gauss(mu, sigma) for _ in range(num_simulations)]
    sim_returns.sort()
    idx = int(num_simulations * (1 - confidence))
    var_mc = abs(sim_returns[idx]) * 100
    return {"method": "蒙特卡洛模拟", "confidence": f"{int(confidence*100)}%", "value": round(var_mc, 2)}


def _historical_var(confidence: float) -> dict:
    base = 2.5 if confidence == 0.95 else 3.8
    return {"method": "历史模拟法", "confidence": f"{int(confidence*100)}%", "value": round(base + random.uniform(-0.3, 0.3), 2)}


def _parametric_var(confidence: float) -> dict:
    base = 2.2 if confidence == 0.95 else 3.4
    return {"method": "参数法", "confidence": f"{int(confidence*100)}%", "value": round(base + random.uniform(-0.3, 0.3), 2)}


def evaluate_risk(portfolio_value: float, confidence: float, factors: list[str]) -> dict:
    var_table = [
        _monte_carlo_var(confidence),
        _historical_var(confidence),
        _parametric_var(confidence),
        _monte_carlo_var(0.99),
        _historical_var(0.99),
        _parametric_var(0.99),
    ]

    risk_score = round(var_table[0]["value"] * 4.2 + random.uniform(-3, 3), 1)
    risk_score = max(0, min(100, risk_score))

    trends = ["↑", "↓", "→"]
    trend_weights = [0.35, 0.35, 0.30] if risk_score > 50 else [0.25, 0.45, 0.30]
    trend_weights = [0.5, 0.2, 0.3] if risk_score > 75 else trend_weights
    trend = random.choices(trends, weights=trend_weights, k=1)[0]

    x = [round(v, 2) for v in [risk_score * (1 + 0.01 * i) for i in range(-15, 16)]]
    y = [round(max(0, 100 - ((v - risk_score) ** 2) / (risk_score * 1.5 + 1)), 2) if v > 0 else 0 for v in x]
    prob_dist = [{"x": xi, "y": yi} for xi, yi in zip(x, y)]

    factor_descriptions = {
        "汇率": "汇率波动对敞口价值的影响占主导地位",
        "信用": "交易对手信用评级下调导致违约概率上升",
        "供应链": "关键供应商交付延迟引发库存短缺风险",
    }
    remaining = 100.0
    factor_contribs = []
    for i, f in enumerate(factors):
        if i == len(factors) - 1:
            contrib = remaining
        else:
            contrib = round(random.uniform(15, remaining - 5 * (len(factors) - i - 1)), 1)
        remaining -= contrib
        factor_contribs.append({
            "factor": f,
            "contribution": contrib,
            "description": factor_descriptions.get(f, f"{f}因素对总体风险评估的贡献"),
        })

    time_sensitivity = round(max(12, risk_score * 0.9 + random.uniform(-5, 5)), 1)

    return {
        "risk_score": risk_score,
        "trend": trend,
        "probability_distribution": prob_dist,
        "var_table": [{"method": v["method"], "confidence": v["confidence"], "value": v["value"]} for v in var_table],
        "factor_contributions": factor_contribs,
        "time_sensitivity_hours": time_sensitivity,
    }


# ── Strategy optimization ──

def _build_gantt(prefix: str, time_window: int) -> list[dict]:
    now = 0
    tasks = []
    phases = [
        ("审批", 3, 6),
        ("签约", 6, 10),
        ("执行", 10, time_window - 14),
        ("监控", time_window - 14, time_window),
    ]
    for name, start_off, end_off in phases:
        tasks.append({"name": f"{prefix}-{name}", "start": start_off, "end": min(end_off, time_window), "milestone": name if name == "签约" else ""})
    return tasks


def optimize_strategy(risk_appetite: float, budget: float, time_window: int) -> dict:
    conservative = {
        "name": "保守方案",
        "type": "conservative",
        "cost": round(budget * 0.82, 0),
        "residual_risk": round(risk_appetite * 0.15, 0),
        "hedge_ratio": 0.92,
        "credit_limit": round(budget * 0.28, 0),
        "safety_stock_days": 45,
        "description": "全面对冲汇率风险，严格信用额度管控，高安全库存水位。适合风险极度厌恶时期。",
        "gantt": _build_gantt("保守", time_window),
    }
    balanced = {
        "name": "平衡方案",
        "type": "balanced",
        "cost": round(budget * 0.58, 0),
        "residual_risk": round(risk_appetite * 0.38, 0),
        "hedge_ratio": 0.65,
        "credit_limit": round(budget * 0.42, 0),
        "safety_stock_days": 25,
        "description": "选择性对冲核心敞口，保持适中的信用额度和安全库存。性价比最优方案。",
        "gantt": _build_gantt("平衡", time_window),
    }
    aggressive = {
        "name": "激进方案",
        "type": "aggressive",
        "cost": round(budget * 0.32, 0),
        "residual_risk": round(risk_appetite * 0.72, 0),
        "hedge_ratio": 0.30,
        "credit_limit": round(budget * 0.65, 0),
        "safety_stock_days": 10,
        "description": "仅对冲极端尾部风险，最大化资金效率。适合市场平稳时期。",
        "gantt": _build_gantt("激进", time_window),
    }

    scatter = []
    for s in [conservative, balanced, aggressive]:
        scatter.append({"name": s["name"], "type": s["type"], "cost": s["cost"], "residual_risk": s["residual_risk"]})
        # Add some perturbed variants for Pareto frontier
        for _ in range(3):
            scatter.append({
                "name": f"{s['name']}-变体",
                "type": s["type"],
                "cost": round(s["cost"] * random.uniform(0.85, 1.2), 0),
                "residual_risk": round(s["residual_risk"] * random.uniform(0.8, 1.3), 0),
            })

    return {
        "conservative": conservative,
        "balanced": balanced,
        "aggressive": aggressive,
        "scatter_data": scatter,
    }


# ── PDCA ──

def execute_pdca(plan_id: str) -> dict:
    return {
        "plan_id": plan_id,
        "status": "executed",
        "instructions": {
            "step_1": "确认交易对手授信额度",
            "step_2": "发起对冲交易指令",
            "step_3": "更新风险监控阈值",
            "step_4": "记录执行日志至KPI系统",
            "executed_at": datetime.utcnow().isoformat(),
            "operator": "risk_agent_v3",
        },
        "message": f"方案 {plan_id} 已成功执行，所有指令已下发至交易系统。",
    }


# ── Feedback / closed-loop ──

def process_feedback(strategy_id: str, suggestions: str) -> dict:
    tips = []
    if "对冲" in suggestions or "hedge" in suggestions.lower():
        tips.append("建议提高对冲比率至65%以上以降低尾部风险")
    if "信用" in suggestions:
        tips.append("建议收紧交易对手信用评级门槛至A级以上")
    if "库存" in suggestions or "供应链" in suggestions:
        tips.append("建议将安全库存天数由25天提升至35天")
    if not tips:
        tips = [
            "基于历史反馈，建议在T+30进行第一次策略中期审查",
            "当前市场波动率处于历史70分位，建议保持防御性配置",
            "下次策略评审建议纳入更多宏观因子（CPI、PMI）",
        ]
    return {
        "id": str(uuid.uuid4()),
        "strategy_id": strategy_id,
        "suggestions": suggestions,
        "recorded_at": datetime.utcnow().isoformat(),
        "optimization_tips": tips,
    }


# ── KPI monitoring ──

def get_kpi_data() -> dict:
    kpis = [
        {"name": "hedge_deviation_rate", "actual": round(random.uniform(0.02, 0.08), 3), "target": 0.05, "threshold": 0.10, "unit": "%", "status": "normal"},
        {"name": "default_trigger_rate", "actual": round(random.uniform(0.005, 0.025), 3), "target": 0.01, "threshold": 0.03, "unit": "%", "status": "normal"},
        {"name": "delivery_rate", "actual": round(random.uniform(0.94, 0.99), 3), "target": 0.95, "threshold": 0.90, "unit": "%", "status": "normal"},
        {"name": "var_breach_count", "actual": round(random.uniform(0, 3)), "target": 0, "threshold": 5, "unit": "次", "status": "normal"},
        {"name": "liquidity_coverage", "actual": round(random.uniform(1.2, 1.8), 2), "target": 1.5, "threshold": 1.0, "unit": "倍", "status": "normal"},
    ]
    for k in kpis:
        if k["actual"] > k["threshold"]:
            k["status"] = "critical"
        elif k["actual"] > k["target"] * 1.2:
            k["status"] = "warning"
    return {"kpis": kpis, "period": datetime.utcnow().strftime("T+%d")}


# ── Risk events ──

_regions = [
    ("亚太区", 35.0, 105.0),
    ("欧洲区", 50.0, 10.0),
    ("北美区", 40.0, -100.0),
    ("中东区", 30.0, 45.0),
    ("南美区", -15.0, -55.0),
    ("东南亚", 10.0, 110.0),
    ("东欧", 50.0, 30.0),
    ("北非", 28.0, 15.0),
]
_event_types = ["汇率波动", "信用违约", "供应链中断", "政策变更", "自然灾害", "地缘冲突"]
_severities = ["low", "medium", "high", "critical"]

def _gen_events() -> list[dict]:
    events = []
    now = datetime.utcnow()
    for i in range(24):
        region, base_lat, base_lng = random.choice(_regions)
        events.append({
            "id": str(uuid.uuid4()),
            "type": random.choice(_event_types),
            "severity": random.choice(_severities),
            "region": region,
            "lat": base_lat + random.uniform(-8, 8),
            "lng": base_lng + random.uniform(-8, 8),
            "description": f"{region}发生{random.choice(_event_types)}事件，影响程度{random.choice(_severities)}",
            "timestamp": (now - timedelta(hours=random.randint(0, 168))).isoformat(),
        })
    events.sort(key=lambda e: e["timestamp"], reverse=True)
    return events


# ── Scenario: FX ──

def get_fx_scenario() -> dict:
    periods = list(range(1, 91))
    usd_unhedged = [round(1000000 + (i - 45) * 5000 + random.gauss(0, 30000), 0) for i in periods]
    usd_hedged = [round(1000000 + (i - 45) * 1200 + random.gauss(0, 8000), 0) for i in periods]
    eur_unhedged = [round(600000 + (i - 45) * 3000 + random.gauss(0, 18000), 0) for i in periods]
    eur_hedged = [round(600000 + (i - 45) * 800 + random.gauss(0, 5000), 0) for i in periods]
    jpy_unhedged = [round(400000 + (i - 45) * 2000 + random.gauss(0, 12000), 0) for i in periods]
    jpy_hedged = [round(400000 + (i - 45) * 500 + random.gauss(0, 4000), 0) for i in periods]

    return {
        "exposures": [
            {"currency": "USD", "exposure": 2500000, "hedge_ratio": 0.68, "hedge_cost": 45000,
             "period_30d": 1200000, "period_60d": 800000, "period_90d": 500000,
             "unhedged_pnl": usd_unhedged, "hedged_pnl": usd_hedged},
            {"currency": "EUR", "exposure": 1500000, "hedge_ratio": 0.55, "hedge_cost": 32000,
             "period_30d": 700000, "period_60d": 500000, "period_90d": 300000,
             "unhedged_pnl": eur_unhedged, "hedged_pnl": eur_hedged},
            {"currency": "JPY", "exposure": 1000000, "hedge_ratio": 0.42, "hedge_cost": 18000,
             "period_30d": 500000, "period_60d": 300000, "period_90d": 200000,
             "unhedged_pnl": jpy_unhedged, "hedged_pnl": jpy_hedged},
        ],
        "total_exposure": 5000000,
        "coverage_ratio": 0.58,
        "alerts": [
            "USD敞口覆盖率低于目标值70%，建议追加远期合约",
            "JPY波动率在过去30日上升22%，关注套息交易平仓风险",
            "EUR利率决议将在7日后公布，建议提前锁定部分敞口",
        ],
    }


# ── Scenario: Credit ──

def get_credit_scenario() -> dict:
    borrowers = [
        {"borrower": "企业A (制造业)", "pd": 0.012, "lgd": 0.40, "ead": 5000000, "raroc": 0.18, "rating": "A"},
        {"borrower": "企业B (贸易)", "pd": 0.025, "lgd": 0.45, "ead": 3500000, "raroc": 0.14, "rating": "BBB+"},
        {"borrower": "企业C (科技)", "pd": 0.008, "lgd": 0.35, "ead": 8000000, "raroc": 0.22, "rating": "AA-"},
        {"borrower": "企业D (地产)", "pd": 0.055, "lgd": 0.55, "ead": 2000000, "raroc": 0.08, "rating": "BB"},
        {"borrower": "企业E (能源)", "pd": 0.018, "lgd": 0.42, "ead": 4500000, "raroc": 0.16, "rating": "A-"},
        {"borrower": "企业F (消费)", "pd": 0.032, "lgd": 0.48, "ead": 2800000, "raroc": 0.11, "rating": "BBB"},
    ]
    npl_forecast = [round(0.018 + 0.0002 * i + random.gauss(0, 0.002), 4) for i in range(12)]
    return {
        "pd_lgd_table": borrowers,
        "portfolio_npl_forecast": npl_forecast,
        "optimization_suggestions": [
            "企业D信用评级跌破投资级，建议降低授信额度20%",
            "企业C RAROC最高(22%)，可适度增加敞口",
            "整体贷款组合集中度偏高，建议增加行业分散度",
        ],
    }


# ── Scenario: Supply Chain ──

def get_supply_scenario() -> dict:
    suppliers = [
        {"id": "S001", "name": "芯片供应商A", "disruption_prob": 0.08, "lead_time_days": 30, "safety_stock_recommendation": 5000, "is_alternative": False},
        {"id": "S002", "name": "芯片供应商A-备选", "disruption_prob": 0.15, "lead_time_days": 45, "safety_stock_recommendation": 8000, "is_alternative": True},
        {"id": "S003", "name": "钢材供应商B", "disruption_prob": 0.05, "lead_time_days": 15, "safety_stock_recommendation": 3000, "is_alternative": False},
        {"id": "S004", "name": "钢材供应商B-备选", "disruption_prob": 0.09, "lead_time_days": 20, "safety_stock_recommendation": 4000, "is_alternative": True},
        {"id": "S005", "name": "物流服务商C", "disruption_prob": 0.18, "lead_time_days": 7, "safety_stock_recommendation": 2000, "is_alternative": False},
        {"id": "S006", "name": "物流服务商C-备选", "disruption_prob": 0.22, "lead_time_days": 10, "safety_stock_recommendation": 3500, "is_alternative": True},
    ]
    days = list(range(1, 61))
    disruption_forecast = [{"day": d, "probability": round(0.05 + 0.002 * d * random.uniform(0.8, 1.2), 3)} for d in days]
    material_price = [{"day": d, "index": round(100 + d * 0.3 + random.gauss(0, 1.5), 1)} for d in days]

    return {
        "suppliers": suppliers,
        "disruption_forecast": disruption_forecast,
        "material_price_index": material_price,
        "suggestions": [
            "芯片供应商A备选方案建议在15天内完成资质审核",
            "物流服务商C中断概率上升至18%，建议增加备选签约",
            "原材料价格指数呈上升趋势，建议提前锁定30天用量",
        ],
    }


# ── Risk report ──

def get_risk_report(report_id: str) -> dict:
    eval_result = evaluate_risk(10_000_000, 0.95, ["汇率", "信用", "供应链"])
    return {
        "id": report_id,
        "risk_score": eval_result["risk_score"],
        "trend": eval_result["trend"],
        "var_table": eval_result["var_table"],
        "factor_contributions": eval_result["factor_contributions"],
        "generated_at": datetime.utcnow().isoformat(),
    }
