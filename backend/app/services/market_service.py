from __future__ import annotations

import math
from datetime import datetime, timedelta


UNIVERSE = [
    {"symbol": "Tencent", "name": "腾讯控股"},
    {"symbol": "Tencent-Ads", "name": "腾讯广告"},
    {"symbol": "Tencent-Cloud", "name": "欧盟DSA合规"},
    {"symbol": "Tencent-Games", "name": "AI算力成本"},
    {"symbol": "Douyin-Ads", "name": "抖音广告景气"},
    {"symbol": "Tencent-FinTech", "name": "Tencent FinTech"},
    {"symbol": "USD-CNY", "name": "美元敞口"},
    {"symbol": "Content-Safety", "name": "内容安全"},
    {"symbol": "Data-Local", "name": "数据本地化"},
    {"symbol": "Cloud-CDN", "name": "云与CDN"},
]

_BASE_LEVELS = {
    "Tencent": 312.4,
    "Tencent-Ads": 74.0,
    "Tencent-Cloud": 68.5,
    "Tencent-Games": 82.8,
    "Douyin-Ads": 61.2,
    "Tencent-FinTech": 77.6,
    "USD-CNY": 7.18,
    "Content-Safety": 96.3,
    "Data-Local": 72.4,
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
