from __future__ import annotations

import math
from datetime import datetime, timedelta


UNIVERSE = [
    {"symbol": "AAPL", "name": "Apple"},
    {"symbol": "NVDA", "name": "NVIDIA"},
    {"symbol": "MSFT", "name": "Microsoft"},
    {"symbol": "GOOGL", "name": "Alphabet"},
    {"symbol": "AMZN", "name": "Amazon"},
    {"symbol": "META", "name": "Meta"},
    {"symbol": "TSLA", "name": "Tesla"},
    {"symbol": "AMD", "name": "AMD"},
    {"symbol": "TSM", "name": "台积电"},
    {"symbol": "BABA", "name": "阿里巴巴"},
    {"symbol": "PDD", "name": "拼多多"},
    {"symbol": "0700.HK", "name": "腾讯控股"},
    {"symbol": "9988.HK", "name": "阿里巴巴-SW"},
    {"symbol": "3690.HK", "name": "美团-W"},
    {"symbol": "600519.SS", "name": "贵州茅台"},
    {"symbol": "300750.SZ", "name": "宁德时代"},
    {"symbol": "601318.SS", "name": "中国平安"},
    {"symbol": "600036.SS", "name": "招商银行"},
    {"symbol": "000858.SZ", "name": "五粮液"},
    {"symbol": "600276.SS", "name": "恒瑞医药"},
    {"symbol": "601888.SS", "name": "中国中免"},
    {"symbol": "688981.SS", "name": "中芯国际"},
    {"symbol": "002594.SZ", "name": "比亚迪"},
    {"symbol": "601012.SS", "name": "隆基绿能"},
    {"symbol": "300059.SZ", "name": "东方财富"},
    {"symbol": "002415.SZ", "name": "海康威视"},
    {"symbol": "601899.SS", "name": "紫金矿业"},
    {"symbol": "600900.SS", "name": "长江电力"},
    {"symbol": "601398.SS", "name": "工商银行"},
]


def get_watchlist() -> list[dict[str, str]]:
    return UNIVERSE[:10]


def get_universe() -> list[dict[str, str]]:
    return UNIVERSE


def build_ticks(symbol: str, count: int = 40) -> list[dict[str, float | str]]:
    now = datetime.utcnow()
    base = 100 + (sum(ord(ch) for ch in symbol) % 40)
    rows: list[dict[str, float | str]] = []
    for i in range(count):
        angle = i / 6
        price = round(base + math.sin(angle) * 2.4 + i * 0.03, 2)
        rows.append(
            {
                "time": (now - timedelta(minutes=count - i)).isoformat(),
                "price": price,
            }
        )
    return rows


def build_realtime_tick(symbol: str, offset: int) -> dict[str, float | str | int]:
    base = 100 + (sum(ord(ch) for ch in symbol) % 35)
    price = round(base + math.sin(offset / 2.5) * 1.8 + offset * 0.02, 2)
    return {"symbol": symbol, "price": price, "ts": int(datetime.utcnow().timestamp() * 1000)}
