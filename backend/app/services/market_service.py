from __future__ import annotations

import math
from datetime import datetime, timedelta


UNIVERSE = [
    {"symbol": "Tencent", "name": "腾讯控股"},
    {"symbol": "Weixin-Eco", "name": "微信生态活跃度"},
    {"symbol": "Tencent-Cloud", "name": "腾讯云景气度"},
    {"symbol": "Intl-Games", "name": "国际游戏收入热度"},
    {"symbol": "FinTech", "name": "金融科技回款"},
    {"symbol": "Hunyuan-AI", "name": "混元算力成本"},
    {"symbol": "USD-CNY", "name": "美元兑人民币"},
    {"symbol": "Content-Safety", "name": "内容安全"},
    {"symbol": "Data-Compliance", "name": "数据合规"},
    {"symbol": "Cloud-CDN", "name": "云与 CDN"},
]

_BASE_LEVELS = {
    "Tencent": 385.2,
    "Weixin-Eco": 141.8,
    "Tencent-Cloud": 72.6,
    "Intl-Games": 88.4,
    "FinTech": 79.2,
    "Hunyuan-AI": 68.5,
    "USD-CNY": 7.18,
    "Content-Safety": 96.3,
    "Data-Compliance": 71.4,
    "Cloud-CDN": 66.9,
}


def get_watchlist() -> list[dict[str, str]]:
    return UNIVERSE[:10]


def get_universe() -> list[dict[str, str]]:
    return UNIVERSE


def _base(symbol: str) -> float:
    return _BASE_LEVELS.get(symbol, 60 + (sum(ord(ch) for ch in symbol) % 40))


def build_realtime_tick(symbol: str, offset: int) -> dict[str, float | str | int]:
    now = datetime.utcnow()
    base = _base(symbol)
    wave = math.sin(offset / 2.7 + len(symbol) * 0.3)
    drift = 0.05 * offset
    price = round(base + wave * 1.8 + drift, 2)
    prev = round(base + math.sin((offset - 1) / 2.7 + len(symbol) * 0.3) * 1.8 + 0.05 * (offset - 1), 2)
    return {
        "symbol": symbol,
        "price": price,
        "change": round(price - prev, 2),
        "change_pct": round((price / prev - 1) * 100, 2) if prev else 0,
        "name": next((item["name"] for item in UNIVERSE if item["symbol"] == symbol), symbol),
        "ts": int(now.timestamp() * 1000),
        "source": "腾讯风险指标模拟",
    }


def build_ticks(symbol: str, count: int = 40) -> list[dict[str, float | str]]:
    now = datetime.utcnow()
    base = _base(symbol)
    rows: list[dict[str, float | str]] = []
    for i in range(count):
        angle = i / 6 + len(symbol) * 0.2
        price = round(base + math.sin(angle) * 2.4 + i * 0.035, 2)
        rows.append({
            "time": (now - timedelta(minutes=count - i)).isoformat(),
            "price": price,
        })
    return rows


def get_all_real_quotes() -> list[dict]:
    return [build_realtime_tick(item["symbol"], index) for index, item in enumerate(UNIVERSE)]
