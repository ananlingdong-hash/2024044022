"""
比亚迪(BYD) 风险事件种子数据

基于比亚迪真实业务特征创建的供应链、汇率、地缘政治风险事件。
系统启动时调用 inject_byd_events() 自动注入风险事件库。

所有事件基于比亚迪2024年年报披露的经营环境和宏观风险。
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from typing import Any


# ═══════════════════════════════════════════════
# 比亚迪风险事件库
# ═══════════════════════════════════════════════

BYD_RISK_EVENTS: list[dict[str, Any]] = [
    # ── 锂矿价格波动事件 ──
    {
        "id": "",
        "type": "供应链中断",
        "severity": "high",
        "region": "南美",
        "lat": -22.9,
        "lng": -68.2,
        "description": "智利SQM阿塔卡马盐湖扩产计划延期，锂精矿供应缺口扩大。比亚迪智利锂矿长协面临量价调整风险，预计影响2025H1正极材料成本。",
        "timestamp": "",
        "source": "BYD供应链监测",
        "category": "锂矿供应",
    },
    {
        "id": "",
        "type": "供应链中断",
        "severity": "medium",
        "region": "大洋洲",
        "lat": -21.0,
        "lng": 119.5,
        "description": "澳洲Pilbara Minerals矿区遭受飓风影响，出货延迟2-3周。比亚迪锂精矿库存可维持约30天，暂未触发预警阈值。",
        "timestamp": "",
        "source": "BYD供应链监测",
        "category": "锂矿供应",
    },
    {
        "id": "",
        "type": "供应链中断",
        "severity": "low",
        "region": "非洲",
        "lat": -10.5,
        "lng": 25.5,
        "description": "刚果金钴矿出口政策收紧，新增出口关税5%。比亚迪钴供应链成本面临小幅上升，建议加速高镍低钴电池技术路线。",
        "timestamp": "",
        "source": "BYD供应链监测",
        "category": "钴矿供应",
    },

    # ── 汇率波动事件 ──
    {
        "id": "",
        "type": "汇率波动",
        "severity": "high",
        "region": "亚太区",
        "lat": 35.0,
        "lng": 105.0,
        "description": "人民币兑美元升值至6.85关口，比亚迪境外营收28.55%（¥2,218.84亿）面临汇兑损失压力。USD敞口对冲比率仅38%，建议紧急追加远期合约覆盖。",
        "timestamp": "",
        "source": "BYD汇率监测",
        "category": "CNY/USD",
    },
    {
        "id": "",
        "type": "汇率波动",
        "severity": "medium",
        "region": "欧洲区",
        "lat": 50.0,
        "lng": 10.0,
        "description": "欧元区经济数据不及预期，EUR/CNY贬值预期上升。比亚迪欧洲营收敞口约¥320亿，当前对冲率42%需平稳维持。",
        "timestamp": "",
        "source": "BYD汇率监测",
        "category": "CNY/EUR",
    },
    {
        "id": "",
        "type": "汇率波动",
        "severity": "medium",
        "region": "南美区",
        "lat": -15.0,
        "lng": -55.0,
        "description": "巴西雷亚尔(BRL)剧烈贬值，比亚迪巴西工厂本地化生产成本优势减弱。BRL敞口约¥180亿，对冲率仅25%为所有币种最低。",
        "timestamp": "",
        "source": "BYD汇率监测",
        "category": "CNY/BRL",
    },
    {
        "id": "",
        "type": "汇率波动",
        "severity": "low",
        "region": "亚太区",
        "lat": 35.6,
        "lng": 139.6,
        "description": "日本央行加息预期升温，JPY波动率攀升至16%。比亚迪日本敞口约¥80亿，对冲率55%相对充足。关注套息交易平仓风险。",
        "timestamp": "",
        "source": "BYD汇率监测",
        "category": "CNY/JPY",
    },

    # ── 芯片供应风险事件 ──
    {
        "id": "",
        "type": "供应链中断",
        "severity": "critical",
        "region": "台湾/中国",
        "lat": 24.0,
        "lng": 121.0,
        "description": "台积电先进制程产能受地缘政治影响，车规级MCU芯片交付周期从60天延长至90天。比亚迪车规芯片仍部分依赖外部代工(yearly spend约¥38亿)，建议加速IGBT/SiC自研替代。",
        "timestamp": "",
        "source": "BYD半导体监测",
        "category": "芯片供应",
    },
    {
        "id": "",
        "type": "供应链中断",
        "severity": "medium",
        "region": "中国",
        "lat": 28.2,
        "lng": 112.9,
        "description": "比亚迪半导体宁波IGBT产线例行维护，预计停产7天。自产IGBT库存可维持14天，不影响整车交付计划。",
        "timestamp": "",
        "source": "BYD半导体监测",
        "category": "芯片供应",
    },

    # ── 地缘政治事件 ──
    {
        "id": "",
        "type": "政策变更",
        "severity": "high",
        "region": "南美区",
        "lat": -23.5,
        "lng": -46.6,
        "description": "巴西宣布对中国产电动汽车加征15%进口关税。比亚迪巴西巴伊亚州工厂在建(设计产能15万辆/年)，短期影响CBU出口但中长期可通过本地化生产规避。",
        "timestamp": "",
        "source": "公开新闻/政策监测",
        "category": "关税壁垒",
    },
    {
        "id": "",
        "type": "政策变更",
        "severity": "high",
        "region": "北美区",
        "lat": 19.4,
        "lng": -99.1,
        "description": "墨西哥考虑对中国电动汽车征收额外关税。比亚迪墨西哥建厂计划面临不确定性，若实施将影响北美市场拓展战略。当前墨西哥销量占比极小（<0.5%），直接影响有限。",
        "timestamp": "",
        "source": "公开新闻/政策监测",
        "category": "关税壁垒",
    },
    {
        "id": "",
        "type": "政策变更",
        "severity": "medium",
        "region": "欧洲区",
        "lat": 50.8,
        "lng": 4.4,
        "description": "欧盟反补贴调查初步裁定：比亚迪被加征17.0%额外关税（低于上汽的38.1%）。比亚迪具备电池成本优势，加税后仍具价格竞争力。预估影响：每辆车利润减少约€2,000-3,000。",
        "timestamp": "",
        "source": "公开新闻/政策监测",
        "category": "反补贴调查",
    },
    {
        "id": "",
        "type": "信用违约",
        "severity": "medium",
        "region": "亚太区",
        "lat": 1.3,
        "lng": 103.8,
        "description": "比亚迪东南亚经销商出现回款延迟，涉及敞口约¥8亿。比亚迪金融事业部启动授信重审流程，建议降低该区域经销商信用额度20%。",
        "timestamp": "",
        "source": "BYD信用监测",
        "category": "经销商信用",
    },

    # ── 供应链宏观事件 ──
    {
        "id": "",
        "type": "自然灾害",
        "severity": "low",
        "region": "东南亚",
        "lat": 14.0,
        "lng": 101.0,
        "description": "泰国洪灾导致比亚迪罗勇府工厂周边物流受阻，预计影响交付2-3天。工厂自身未受直接影响，已启动应急预案。",
        "timestamp": "",
        "source": "BYD运营监测",
        "category": "自然灾害",
    },
    {
        "id": "",
        "type": "政策变更",
        "severity": "low",
        "region": "中国",
        "lat": 39.9,
        "lng": 116.4,
        "description": "中国新能源汽车购置税减免政策延续至2027年底，利好比亚迪国内销量。预计2025年国内销量可维持20%+增长。",
        "timestamp": "",
        "source": "公开新闻/政策监测",
        "category": "产业政策",
    },
]


def inject_byd_events() -> list[dict[str, Any]]:
    """生成带时间戳的比亚迪风险事件列表。

    时间戳分布在过去7天内，确保前端地图显示合理。
    每个事件带有唯一ID，可用于风险事件持久化。
    """
    now = datetime.utcnow()
    events = []

    for i, event in enumerate(BYD_RISK_EVENTS):
        evt = dict(event)
        evt["id"] = f"byd-{uuid.uuid4().hex[:12]}"
        # 事件时间分布：最近3个在24h内，其余分布在前7天
        if i < 3:
            hours_ago = i * 8  # 最近8小时*3
        else:
            hours_ago = 24 + i * 12  # 其余分布在1-7天
        evt["timestamp"] = (now - timedelta(hours=hours_ago)).isoformat()
        events.append(evt)

    return events


def inject_byd_kpi_alerts() -> list[dict[str, Any]]:
    """生成基于比亚迪KPI数据的预警事件。

    当KPI偏差超过阈值时自动生成预警消息。
    """
    from app.services.byd_config import KPI_TARGETS

    alerts = []
    now = datetime.utcnow()

    for key, kpi in KPI_TARGETS.items():
        deviation = abs(kpi["actual"] - kpi["target"]) / max(abs(kpi["target"]), 1e-6)
        if deviation > 0.10:
            severity = "critical" if kpi["actual"] > kpi["threshold"] else "warning"
            alerts.append({
                "id": f"kpi-{uuid.uuid4().hex[:12]}",
                "type": "KPI预警",
                "severity": severity,
                "region": "全球",
                "lat": 22.5,
                "lng": 114.0,
                "description": (
                    f"[{kpi['name']}] 实际值{kpi['actual']}，"
                    f"目标值{kpi['target']}，偏差{deviation:.1%}。"
                    f"{kpi.get('note', '')}"
                ),
                "timestamp": now.isoformat(),
                "source": "BYD KPI监测",
                "category": "KPI",
            })

    return alerts


def get_byd_all_events() -> list[dict[str, Any]]:
    """获取比亚迪全部风险事件（风险事件 + KPI预警）。"""
    return inject_byd_events() + inject_byd_kpi_alerts()
