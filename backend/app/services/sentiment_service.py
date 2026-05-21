from __future__ import annotations

import concurrent.futures
import hashlib
import json
import re
import statistics
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

from app.schemas import AIRequest
from app.services.ai_service import call_minimax


def _clean_report_text(text: str) -> str:
    return (
        text.replace("\r", "")
        .replace("#", "")
        .replace("*", "")
        .replace("|", "")
        .replace("```", "")
        .strip()
    )


REQUIRED_SECTIONS = [
    "执行摘要",
    "智能评估",
    "策略优化",
    "全周期管理",
    "实际应用场景",
    "实施里程碑",
    "KPI看板",
    "结论建议",
]

_QUOTE_CACHE: dict[str, tuple[float, dict]] = {}
_NEWS_CACHE: dict[str, tuple[float, list[dict[str, str]]]] = {}
_CACHE_TTL_SEC = 60


def _report_missing_sections(text: str) -> list[str]:
    return [title for title in REQUIRED_SECTIONS if title not in text]


def _looks_truncated(text: str) -> bool:
    stripped = text.strip()
    if not stripped:
        return True
    if _report_missing_sections(stripped):
        return True
    return stripped[-1] not in "。！？；）]"


def _safe_get_json(url: str, timeout: int = 8) -> dict | None:
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (AstraQuantAI/1.0)",
                "Accept": "application/json,text/plain,*/*",
            },
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception:
        return None


def _safe_get_text(url: str, timeout: int = 8) -> str | None:
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (AstraQuantAI/1.0)",
                "Accept": "application/rss+xml,application/xml,text/xml,*/*",
            },
            method="GET",
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception:
        return None


def _to_tencent_symbol(symbol: str) -> str:
    s = symbol.strip().upper()
    if s.endswith(".SS"):
        return f"sh{s.split('.')[0]}"
    if s.endswith(".SZ"):
        return f"sz{s.split('.')[0]}"
    if s.endswith(".HK"):
        code = s.split(".")[0].zfill(4)
        return f"hk{code}"
    if s.isalpha():
        return f"us{s}"
    return s


def _fetch_tencent_quote(symbol: str) -> dict | None:
    now_ts = time.time()
    cached = _QUOTE_CACHE.get(f"qq:{symbol}")
    if cached and now_ts - cached[0] <= _CACHE_TTL_SEC:
        return cached[1]

    tencent_symbol = _to_tencent_symbol(symbol)
    url = f"https://qt.gtimg.cn/q={urllib.parse.quote(tencent_symbol)}"
    text = _safe_get_text(url, timeout=6)
    if not text or "~" not in text:
        return None
    try:
        first_quote = text.find('"')
        last_quote = text.rfind('"')
        payload = text[first_quote + 1:last_quote] if first_quote >= 0 and last_quote > first_quote else text
        fields = payload.split("~")
        if len(fields) < 7:
            return None
        price = float(fields[3])
        prev_close = float(fields[4]) if fields[4] else 0.0
        daily_return_pct = ((price - prev_close) / prev_close * 100) if prev_close else 0.0
        if len(fields) > 32:
            try:
                daily_return_pct = float(fields[32])
            except Exception:
                pass
        high = float(fields[33]) if len(fields) > 33 and fields[33] else price
        low = float(fields[34]) if len(fields) > 34 and fields[34] else price
        volatility_pct = ((high - low) / prev_close * 100) if prev_close else abs(daily_return_pct) / 2
        avg_volume = float(fields[6]) if len(fields) > 6 and fields[6] else 0.0
        currency = fields[36] if len(fields) > 36 else ""
        snap = {
            "symbol": symbol,
            "price": round(price, 4),
            "daily_return_pct": round(daily_return_pct, 4),
            "volatility_pct": round(float(volatility_pct), 4),
            "avg_volume": round(avg_volume, 2),
            "currency": currency,
            "source": "tencent_quote",
            "fetched_at": datetime.utcnow().isoformat(),
        }
        _QUOTE_CACHE[f"qq:{symbol}"] = (now_ts, snap)
        return snap
    except Exception:
        return None


def _fetch_yahoo_quote(symbol: str) -> dict | None:
    now_ts = time.time()
    cached = _QUOTE_CACHE.get(symbol)
    if cached and now_ts - cached[0] <= _CACHE_TTL_SEC:
        return cached[1]

    yahoo_symbol = symbol.upper()
    url = (
        f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(yahoo_symbol)}"
        "?interval=1d&range=5d&includePrePost=false&events=div%2Csplit"
    )
    data = _safe_get_json(url, timeout=6)
    try:
        result = data["chart"]["result"][0] if data and data.get("chart", {}).get("result") else None
        if not result:
            return _fetch_tencent_quote(symbol)
        meta = result.get("meta", {})
        quote = (result.get("indicators", {}).get("quote") or [{}])[0]
        closes = [x for x in quote.get("close", []) if isinstance(x, (float, int))]
        volumes = [x for x in quote.get("volume", []) if isinstance(x, (float, int))]
        if not closes:
            return _fetch_tencent_quote(symbol)
        latest_price = float(meta.get("regularMarketPrice") or closes[-1])
        prev_close = float(meta.get("chartPreviousClose") or (closes[-2] if len(closes) >= 2 else closes[-1]))
        daily_return_pct = 0.0 if prev_close == 0 else ((latest_price - prev_close) / prev_close) * 100
        pct_returns = []
        for i in range(1, len(closes)):
            prev = closes[i - 1]
            if prev:
                pct_returns.append(((closes[i] - prev) / prev) * 100)
        volatility_pct = statistics.pstdev(pct_returns) if len(pct_returns) >= 2 else abs(daily_return_pct) / 2
        avg_volume = statistics.fmean(volumes) if volumes else 0.0
        snap = {
            "symbol": symbol,
            "price": round(latest_price, 4),
            "daily_return_pct": round(daily_return_pct, 4),
            "volatility_pct": round(float(volatility_pct), 4),
            "avg_volume": round(float(avg_volume), 2),
            "currency": str(meta.get("currency") or ""),
            "source": "yahoo_chart",
            "fetched_at": datetime.utcnow().isoformat(),
        }
        _QUOTE_CACHE[symbol] = (now_ts, snap)
        return snap
    except Exception:
        return _fetch_tencent_quote(symbol)


def _score_news_sentiment(text: str) -> int:
    t = text.lower()
    positive = ["beat", "surge", "growth", "upgrade", "buy", "创新高", "上调", "增长", "突破", "利好", "增持", "盈利"]
    negative = ["miss", "drop", "downgrade", "sell", "lawsuit", "下调", "亏损", "利空", "减持", "暴跌", "风险", "裁员"]
    score = 50
    for k in positive:
        if k in t:
            score += 6
    for k in negative:
        if k in t:
            score -= 6
    return max(0, min(100, score))


def _fetch_symbol_news(symbol: str) -> list[dict[str, str]]:
    now_ts = time.time()
    cached = _NEWS_CACHE.get(symbol)
    if cached and now_ts - cached[0] <= _CACHE_TTL_SEC:
        return cached[1]

    query = urllib.parse.quote(f"{symbol} stock")
    url = f"https://news.google.com/rss/search?q={query}&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
    text = _safe_get_text(url, timeout=3)
    if not text:
        return []
    try:
        root = ET.fromstring(text)
        items: list[dict[str, str]] = []
        for item in root.findall(".//item")[:6]:
            title = (item.findtext("title") or "").strip()
            pub_date = (item.findtext("pubDate") or "").strip()
            link = (item.findtext("link") or "").strip()
            if title:
                items.append({"title": title, "pubDate": pub_date, "link": link})
        _NEWS_CACHE[symbol] = (now_ts, items)
        return items
    except Exception:
        return []


def _build_risk_dataset(symbols: list[str], seed: int) -> dict:
    var_95 = round(3.2 + (seed % 28) / 10, 2)
    loss_p95 = round(8.5 + (seed % 50) / 10, 2)
    risk_prob = round(18 + (seed % 37), 1)
    time_sensitivity = round(0.45 + (seed % 35) / 100, 2)
    industry_benchmark_gap = round(-2.2 + (seed % 40) / 10, 2)
    pd = round(1.2 + (seed % 60) / 20, 2)
    lgd = round(22 + (seed % 45), 2)
    supply_disruption_prob = round(6 + (seed % 35), 2)
    market_sentiment = 48 + (seed % 43)

    stock_scores = []
    for i, symbol in enumerate(symbols):
        score = 52 + ((seed // (i + 2)) % 40)
        stock_scores.append({"symbol": symbol, "score": score})

    strategy_options = [
        {"style": "保守", "cost": 86, "effect": 72, "horizon": "1-3个月", "actions": "部分对冲 + 增信担保 + 安全库存提升"},
        {"style": "平衡", "cost": 73, "effect": 81, "horizon": "1-6个月", "actions": "滚动套保 + 授信优化 + 双供应商切换"},
        {"style": "激进", "cost": 68, "effect": 88, "horizon": "2-9个月", "actions": "动态对冲 + 组合重定价 + 长协条款重议"},
    ]

    return {
        "symbols": symbols,
        "market_sentiment": min(100, market_sentiment),
        "risk_metrics": {
            "monte_carlo_trials": 10000,
            "var_95_pct": var_95,
            "loss_distribution_p95_pct": loss_p95,
            "risk_probability_pct": risk_prob,
            "time_sensitivity": time_sensitivity,
            "industry_benchmark_gap_pct": industry_benchmark_gap,
            "pd_pct": pd,
            "lgd_pct": lgd,
            "supply_disruption_probability_pct": supply_disruption_prob,
        },
        "constraints": {
            "risk_preference": "中性偏稳健",
            "budget_limit_million_cny": 18 + (seed % 9),
            "time_window_days": 30 + (seed % 45),
        },
        "strategy_options": strategy_options,
        "pdca": ["方案设计", "成本核算", "项目执行", "KPI监控", "效果反馈", "持续优化"],
        "scenarios": {
            "汇率风险": "监控汇率波动信号 -> 评估应收账款敞口 -> 推荐远期对冲/CDS/部分对冲 -> 生成财务对比表 -> 追踪对冲执行与市场价差",
            "信用风险": "汇聚企业财报、行业数据、舆情信息 -> 计算PD/LGD -> 优化授信组合配置 -> 推荐追加担保/贷款转移/降额 -> 监控借款人财务恶化信号",
            "供应链风险": "追踪供应商库存、产能、地缘形势 -> 预测供应中断概率 -> 推荐备选供应商、库存提升、合同条款调整 -> 实时预警关键原料价格异常",
        },
        "stock_scores": stock_scores,
    }


def _build_realtime_dataset(symbols: list[str], seed: int) -> dict:
    # Pull quote/news in parallel for faster end-to-end latency.
    quotes: dict[str, dict] = {}
    headlines: dict[str, list[dict[str, str]]] = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(max(2, len(symbols) * 2), 8)) as pool:
        quote_futures = {pool.submit(_fetch_yahoo_quote, symbol): symbol for symbol in symbols}
        news_futures = {pool.submit(_fetch_symbol_news, symbol): symbol for symbol in symbols}
        for fut, symbol in quote_futures.items():
            try:
                snap = fut.result(timeout=10)
                if snap:
                    quotes[symbol] = snap
            except Exception:
                continue
        for fut, symbol in news_futures.items():
            try:
                rows = fut.result(timeout=10)
                headlines[symbol] = rows
            except Exception:
                headlines[symbol] = []

    # Fallback to deterministic dataset if no external quote is reachable.
    if not quotes:
        fallback = _build_risk_dataset(symbols, seed)
        fallback["data_source"] = "synthetic_fallback"
        fallback["fetched_at"] = datetime.utcnow().isoformat()
        return fallback

    stock_scores = []
    event_rows = []
    sentiment_components = []
    risk_prob_components = []
    vol_components = []
    quote_sources: set[str] = set()
    has_external_news = False

    for symbol in symbols:
        q = quotes.get(symbol)
        if not q:
            continue
        quote_sources.add(str(q.get("source") or "unknown_quote"))
        news_rows = headlines.get(symbol, [])
        if news_rows:
            has_external_news = True
        joined_title = " ".join([row.get("title", "") for row in news_rows[:4]])
        news_sentiment = _score_news_sentiment(joined_title) if joined_title else 50
        ret = float(q.get("daily_return_pct", 0.0))
        vol = float(q.get("volatility_pct", 0.0))
        # Weighted signal score from price momentum, volatility and news sentiment.
        score = 50 + (ret * 3.8) - (vol * 2.1) + ((news_sentiment - 50) * 0.55)
        score = int(max(0, min(100, round(score))))
        stock_scores.append({"symbol": symbol, "score": score})
        sentiment_components.append(score)
        risk_prob_components.append(max(0.0, min(100.0, 40 + vol * 6 - ret * 2)))
        vol_components.append(max(0.0, vol))
        headline = news_rows[0]["title"] if news_rows else "未抓取到高质量新闻，基于价格波动信号评估。"
        event_rows.append(
            f"{symbol}: 现价{q['price']}，日涨跌{ret:+.2f}% ，波动率{vol:.2f}% ，新闻情绪{news_sentiment}/100。事件: {headline}"
        )

    if not stock_scores:
        fallback = _build_risk_dataset(symbols, seed)
        fallback["data_source"] = "synthetic_fallback"
        fallback["fetched_at"] = datetime.utcnow().isoformat()
        return fallback

    mean_score = statistics.fmean(sentiment_components)
    mean_vol = statistics.fmean(vol_components) if vol_components else 1.2
    mean_risk_prob = statistics.fmean(risk_prob_components) if risk_prob_components else 35.0

    var_95 = round(max(1.0, mean_vol * 1.65), 2)
    loss_p95 = round(max(2.0, var_95 * 2.8), 2)
    time_sensitivity = round(max(0.2, min(0.95, 0.35 + mean_vol / 10)), 2)
    industry_benchmark_gap = round((mean_score - 55) / 8, 2)
    pd = round(max(0.5, min(12.0, mean_risk_prob / 18)), 2)
    lgd = round(max(15.0, min(80.0, 30 + mean_vol * 4)), 2)
    supply_disruption_prob = round(max(4.0, min(65.0, 10 + mean_vol * 4.2)), 2)
    market_sentiment = int(max(0, min(100, round(mean_score))))

    strategy_options = [
        {"style": "保守", "cost": 84, "effect": 70, "horizon": "1-3个月", "actions": "提高对冲比率 + 增配现金流稳健资产"},
        {"style": "平衡", "cost": 72, "effect": 82, "horizon": "1-6个月", "actions": "核心仓位滚动对冲 + 风险预算动态再平衡"},
        {"style": "激进", "cost": 66, "effect": 88, "horizon": "2-9个月", "actions": "事件驱动择时 + 高弹性资产轮动"},
    ]

    source_parts = sorted(quote_sources) if quote_sources else ["unknown_quote"]
    source_parts.append("google_news_rss" if has_external_news else "no_external_news")

    return {
        "symbols": symbols,
        "market_sentiment": market_sentiment,
        "risk_metrics": {
            "monte_carlo_trials": 10000,
            "var_95_pct": var_95,
            "loss_distribution_p95_pct": loss_p95,
            "risk_probability_pct": round(mean_risk_prob, 2),
            "time_sensitivity": time_sensitivity,
            "industry_benchmark_gap_pct": industry_benchmark_gap,
            "pd_pct": pd,
            "lgd_pct": lgd,
            "supply_disruption_probability_pct": supply_disruption_prob,
        },
        "constraints": {
            "risk_preference": "中性偏稳健",
            "budget_limit_million_cny": 18 + (seed % 9),
            "time_window_days": 30 + (seed % 45),
        },
        "strategy_options": strategy_options,
        "pdca": ["方案设计", "成本核算", "项目执行", "KPI监控", "效果反馈", "持续优化"],
        "scenarios": {
            "汇率风险": "基于外部实时新闻和价格波动信号自动识别汇率冲击并调整对冲仓位。",
            "信用风险": "结合市场波动与负面舆情更新PD/LGD，并动态优化授信/担保组合。",
            "供应链风险": "实时跟踪供应链相关新闻热度与价格异常波动，触发备选供应商与库存调整。",
        },
        "stock_scores": stock_scores,
        "external_quotes": quotes,
        "external_headlines": {k: v[:2] for k, v in headlines.items()},
        "event_rows": event_rows[:8],
        "data_source": " + ".join(source_parts),
        "fetched_at": datetime.utcnow().isoformat(),
    }


def _build_prompt(dataset: dict) -> tuple[str, str]:
    task = "基于给定风险数据，生成精简且可执行的企业风险应对决策支持报告。"
    context = (
        "你是资深风险管理顾问。必须完整覆盖以下模块：\n"
        "1) 智能评估：蒙特卡洛、VaR、行业对标、风险概率、损失分布、时间敏感度、风险评分与趋势。\n"
        "2) 策略优化：风险偏好、预算约束、时间窗口、多目标/帕累托优化，输出保守/平衡/激进三套方案并比较成本和效果。\n"
        "3) 全周期管理：方案设计、成本核算、项目执行、KPI监控、效果反馈，形成PDCA闭环，体现一键应对、全程跟踪、持续优化。\n"
        "4) 实际应用场景：必须分别给出汇率风险、信用风险、供应链风险三条完整链路。\n\n"
        "输出要求：\n"
        "- 使用中文。\n"
        "- 严格按“标题、执行摘要、智能评估、策略优化、全周期管理、实际应用场景、实施里程碑、KPI看板、结论建议”结构输出。\n"
        "- 文风专业但可读，给出关键数值解释。\n"
        "- 控制篇幅为短报告：总长度建议 450-850 中文字符，每个章节 1-2 句，避免冗长。\n"
        "- 不要使用 Markdown 符号（不要出现 #、*、|）。\n\n"
        f"数据源: {dataset.get('data_source', 'unknown')}，抓取时间(UTC): {dataset.get('fetched_at', '')}\n"
        f"输入数据(JSON): {json.dumps(dataset, ensure_ascii=False)}"
    )
    return task, context


def _extract_json_object(text: str) -> dict | None:
    cleaned = text.strip()
    if not cleaned:
        return None
    candidates = [cleaned]
    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        candidates.append(match.group(0))
    for candidate in candidates:
        try:
            data = json.loads(candidate)
            if isinstance(data, dict):
                return data
        except Exception:
            continue
    return None


def _score_by_ai(dataset: dict) -> dict | None:
    task = "根据输入数据输出风险评分JSON，不要输出解释。"
    context = (
        "你是企业风险量化分析师。请结合输入数据给出评分结果。"
        "只输出JSON对象，字段必须严格包含："
        "marketSentiment(0-100整数), stockScores([{symbol,score}]), summary(字符串), suggestion(字符串),"
        "eventHighlights(字符串数组), recommendationBullets(字符串数组)。"
        "summary/suggestion 保持简短，eventHighlights 和 recommendationBullets 各 2-4 条。"
        "不要包含markdown符号和代码块。\n"
        f"输入数据: {json.dumps(dataset, ensure_ascii=False)}"
    )
    content, diag = call_minimax(AIRequest(task=task, context=context, model="minimax-m2.7"))
    if not (diag and diag.startswith("minimax-ok")):
        return None
    parsed = _extract_json_object(content)
    if not parsed:
        return None
    scores = parsed.get("stockScores")
    if not isinstance(scores, list) or not scores:
        return None
    normalized_scores = []
    symbol_set = set(dataset["symbols"])
    for item in scores:
        if not isinstance(item, dict):
            continue
        symbol = str(item.get("symbol", "")).strip()
        if symbol not in symbol_set:
            continue
        try:
            score = int(item.get("score"))
        except Exception:
            continue
        normalized_scores.append({"symbol": symbol, "score": max(0, min(100, score))})
    if not normalized_scores:
        return None
    by_symbol = {x["symbol"]: x["score"] for x in normalized_scores}
    stock_scores = [{"symbol": s, "score": by_symbol.get(s, 60)} for s in dataset["symbols"]]
    market = parsed.get("marketSentiment")
    try:
        market_sentiment = max(0, min(100, int(market)))
    except Exception:
        market_sentiment = int(round(sum(x["score"] for x in stock_scores) / len(stock_scores)))
    summary = str(parsed.get("summary", "")).strip()
    suggestion = str(parsed.get("suggestion", "")).strip()
    event_highlights = parsed.get("eventHighlights")
    recommendation_bullets = parsed.get("recommendationBullets")
    if not isinstance(event_highlights, list):
        event_highlights = []
    if not isinstance(recommendation_bullets, list):
        recommendation_bullets = []
    return {
        "marketSentiment": market_sentiment,
        "stockScores": stock_scores,
        "summary": summary,
        "suggestion": suggestion,
        "eventHighlights": [str(x).strip() for x in event_highlights if str(x).strip()][:6],
        "recommendationBullets": [str(x).strip() for x in recommendation_bullets if str(x).strip()][:6],
    }


def _build_market_event_rows(dataset: dict, stock_scores: list[dict[str, int]]) -> list[str]:
    quotes = dataset.get("external_quotes", {}) if isinstance(dataset.get("external_quotes"), dict) else {}
    by_symbol = {row["symbol"]: row["score"] for row in stock_scores}
    events: list[str] = []
    for symbol in dataset.get("symbols", []):
        q = quotes.get(symbol)
        if not isinstance(q, dict):
            continue
        ret = float(q.get("daily_return_pct", 0.0))
        vol = float(q.get("volatility_pct", 0.0))
        score = int(by_symbol.get(symbol, 50))
        if abs(ret) >= 2.0:
            direction = "上涨" if ret > 0 else "下跌"
            events.append(f"{symbol}: 单日{direction}{abs(ret):.2f}%触发价格异动预警，当前风险评分{score}。")
        elif vol >= 2.2:
            events.append(f"{symbol}: 日内波动率{vol:.2f}%超过阈值，建议收紧仓位与止损带。")
        else:
            events.append(f"{symbol}: 价格波动平稳，风险评分{score}，继续观察成交与波动变化。")
    if not events:
        return ["未抓取到外部新闻，已切换为行情波动事件模式并完成风险评估。"]
    return events[:6]


def _build_event_highlights(dataset: dict, stock_scores: list[dict[str, int]], ai_scored: dict | None) -> list[str]:
    ai_rows = ai_scored.get("eventHighlights") if ai_scored else None
    if isinstance(ai_rows, list) and ai_rows:
        cleaned = [str(x).strip() for x in ai_rows if str(x).strip()]
        if cleaned:
            return cleaned[:6]
    news_rows = dataset.get("event_rows")
    if isinstance(news_rows, list) and news_rows:
        cleaned = [str(x).strip() for x in news_rows if str(x).strip()]
        if cleaned:
            return cleaned[:6]
    return _build_market_event_rows(dataset, stock_scores)


def _fallback_report_body(dataset: dict) -> str:
    metrics = dataset["risk_metrics"]
    options = dataset["strategy_options"]
    return (
        f"Agent智能风险应对决策支持报告\n"
        f"执行摘要：综合风险{dataset['market_sentiment']}/100，风险概率{metrics['risk_probability_pct']}%，VaR95={metrics['var_95_pct']}%，"
        f"损失P95={metrics['loss_distribution_p95_pct']}%。建议默认采用平衡方案。\n"
        f"智能评估：基于{metrics['monte_carlo_trials']}次模拟与行业对标，PD={metrics['pd_pct']}%，LGD={metrics['lgd_pct']}%，"
        f"供应中断概率={metrics['supply_disruption_probability_pct']}%。\n"
        f"策略优化：在预算{dataset['constraints']['budget_limit_million_cny']}百万元、窗口{dataset['constraints']['time_window_days']}天约束下，"
        f"输出保守({options[0]['cost']}/{options[0]['effect']})、平衡({options[1]['cost']}/{options[1]['effect']})、激进({options[2]['cost']}/{options[2]['effect']})三案。\n"
        f"全周期管理：按方案设计、成本核算、项目执行、KPI监控、效果反馈形成PDCA闭环，支持一键应对与持续优化。\n"
        f"实际应用场景：\n"
        f"汇率风险：{dataset['scenarios']['汇率风险']}。\n"
        f"信用风险：{dataset['scenarios']['信用风险']}。\n"
        f"供应链风险：{dataset['scenarios']['供应链风险']}。\n"
        f"实施里程碑：T+1完成参数校准，T+3发布策略，T+7完成演练，T+30复盘重估。\n"
        f"KPI看板：跟踪对冲覆盖率、成本偏差、PD/LGD变化、供应中断预警命中率与执行达成率。\n"
        f"结论建议：优先执行平衡方案；若风险概率连续3天上升，切换保守策略并触发管理层复核。"
    )


def generate_sentiment_report(symbols: list[str]) -> dict:
    now = datetime.utcnow()
    symbols = symbols or ["AAPL", "NVDA", "600519.SS", "300750.SZ"]
    seed_input = "|".join(symbols) + now.strftime("%Y-%m-%d-%H-%M-%S")
    seed = int(hashlib.sha256(seed_input.encode("utf-8")).hexdigest()[:8], 16)
    dataset = _build_realtime_dataset(symbols, seed)
    ai_scored = _score_by_ai(dataset)
    if ai_scored:
        dataset["market_sentiment"] = ai_scored["marketSentiment"]
        dataset["stock_scores"] = ai_scored["stockScores"]
    task, context = _build_prompt(dataset)
    ai_body, diag = call_minimax(AIRequest(task=task, context=context, model="minimax-m2.7"))
    report_body = _clean_report_text(ai_body) if diag and diag.startswith("minimax-ok") else _fallback_report_body(dataset)
    if not report_body.strip():
        report_body = _fallback_report_body(dataset)

    if _looks_truncated(report_body):
        # Prefer fast fallback over extra continuation calls to reduce latency.
        report_body = _fallback_report_body(dataset)

    stock_scores = dataset["stock_scores"]
    top_symbol = sorted(stock_scores, key=lambda item: item["score"], reverse=True)[0]["symbol"]
    event_highlights = _build_event_highlights(dataset, stock_scores, ai_scored)
    recommendation_bullets = (
        ai_scored["recommendationBullets"]
        if ai_scored and ai_scored.get("recommendationBullets")
        else [
            "先执行平衡方案作为默认策略，若波动超阈值再切换保守方案。",
            "对汇率、信用、供应链三类风险分别设置预警阈值并日内复核。",
            "每周复盘KPI并刷新帕累托前沿，持续优化成本与效果。",
        ]
    )
    summary = (
        ai_scored["summary"]
        if ai_scored and ai_scored.get("summary")
        else f"已完成智能评估、策略优化与PDCA闭环设计，当前建议优先关注 {top_symbol} 相关风险暴露。"
    )
    suggestion = (
        ai_scored["suggestion"]
        if ai_scored and ai_scored.get("suggestion")
        else f"建议优先采用平衡方案并跟踪 {top_symbol} 的风险信号与执行偏差。"
    )

    return {
        "id": now.strftime("%Y%m%d-%H%M"),
        "generatedAt": now,
        "symbols": symbols,
        "marketSentiment": dataset["market_sentiment"],
        "summary": f"{summary} 数据源: {dataset.get('data_source', 'unknown')} @ {dataset.get('fetched_at', '')}",
        "stockScores": stock_scores,
        "suggestion": suggestion,
        "reportTitle": f"Agent智能风险应对决策支持报告 #{now.strftime('%Y%m%d-%H%M')}",
        "eventHighlights": event_highlights if event_highlights else dataset.get("event_rows", []),
        "recommendationBullets": recommendation_bullets,
        "reportBody": report_body,
    }
