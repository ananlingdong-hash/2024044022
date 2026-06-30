"""
腾讯控股 风险事件种子数据

基于腾讯2025年年报及公开监管/媒体信息创建的风险事件。
覆盖：CMC黑名单、AI芯片供应、版号/游戏监管、VIE结构、市场竞争、汇率波动。
"""

from __future__ import annotations
import uuid
from datetime import datetime, timedelta
from typing import Any

TENCENT_RISK_EVENTS: list[dict[str, Any]] = [
    # ── 地缘政治/监管 ──
    {
        "id": "", "type": "监管风险", "severity": "critical",
        "region": "北美", "lat": 38.9, "lng": -77.0,
        "description": "2024年1月腾讯被美国国防部列入CMC军工企业黑名单，虽已起诉但尚未移除。境外投资者合规审查趋严，影响港股外资持仓信心。年报披露此为重大风险因素。",
        "timestamp": "", "source": "全球监管监测", "category": "CMC黑名单",
    },
    {
        "id": "", "type": "监管风险", "severity": "high",
        "region": "北美", "lat": 37.7, "lng": -122.4,
        "description": "新一轮AI芯片出口管制升级，NVIDIA H200/B200对华供应进一步收紧。腾讯2025年资本开支仅¥792亿，管理层坦承'买不到卡'，与字节¥1,500亿、阿里千亿级差距拉大。年报风险因素：'无法获得稳定先进芯片供应'。",
        "timestamp": "", "source": "AI芯片供应监测", "category": "芯片出口管制",
    },
    # ── 市场竞争 ──
    {
        "id": "", "type": "竞争风险", "severity": "critical",
        "region": "中国", "lat": 39.9, "lng": 116.4,
        "description": "字节系用户时长占比37.4%首次超越腾讯30.0%。豆包MAU 2.26亿远超腾讯元宝4071万。腾讯在AI应用层和用户注意力争夺战中落后，年报识别其为重大竞争风险。",
        "timestamp": "", "source": "竞争态势监测", "category": "用户时长争夺",
    },
    {
        "id": "", "type": "竞争风险", "severity": "medium",
        "region": "中国", "lat": 30.2, "lng": 120.1,
        "description": "网易海外游戏收入占比突破35%，《逆水寒》《蛋仔派对》在MMO/派对游戏确立优势。腾讯国内游戏用户见顶，《王者荣耀》面临用户老化和年轻玩家分流。年报风险因素：'游戏行业供过于求加剧'。",
        "timestamp": "", "source": "游戏行业监测", "category": "游戏竞争",
    },
    # ── AI投入回报 ──
    {
        "id": "", "type": "战略风险", "severity": "high",
        "region": "中国", "lat": 22.5, "lng": 114.0,
        "description": "2026年腾讯宣布大幅削减回购(¥800亿→规模缩减)转向AI投入，股价单日大跌7%市值蒸发¥3,400亿。投资者从'稳健收割者'预期转向'AI追赶者'不确定性。年报：AI变现路径尚未完全验证。",
        "timestamp": "", "source": "战略/资本市场监测", "category": "AI战略争议",
    },
    # ── 汇率波动 ──
    {
        "id": "", "type": "汇率波动", "severity": "medium",
        "region": "全球", "lat": 22.3, "lng": 114.2,
        "description": "港元联系汇率制下美元走强，腾讯国际游戏收入(¥774亿/$100亿+)折算人民币受益，但海外投资(Supercell/Riot/Epic)以外币计价资产受汇率波动影响。USD敞口¥850亿对冲率48%尚可。",
        "timestamp": "", "source": "汇率监测", "category": "USD/HKD",
    },
    {
        "id": "", "type": "汇率波动", "severity": "low",
        "region": "欧洲", "lat": 60.1, "lng": 24.9,
        "description": "欧元区经济增长乏力，Supercell(芬兰)EUR收入折算人民币面临压力。EUR敞口¥280亿对冲率52%较为充足。关注Supercell新游戏《Squad Busters》持续表现对EUR敞口的影响。",
        "timestamp": "", "source": "汇率监测", "category": "EUR/CNY",
    },
    # ── 游戏监管 ──
    {
        "id": "", "type": "监管风险", "severity": "medium",
        "region": "中国", "lat": 39.9, "lng": 116.4,
        "description": "游戏版号虽恢复常态发放但审查趋细，防沉迷合规成本持续上升。2025年移动端新游约20万款，供需失衡加剧。年报风险因素：'版号审批、内容审查、虚拟道具交易等监管变动'。",
        "timestamp": "", "source": "游戏监管监测", "category": "版号与防沉迷",
    },
    # ── VIE结构 ──
    {
        "id": "", "type": "监管风险", "severity": "medium",
        "region": "中国", "lat": 22.5, "lng": 114.0,
        "description": "腾讯通过VIE结构控制境内互联网内容运营实体，涉及'控制权变更'的VIE交易将受反垄断审查。中美监管摩擦加剧VIE结构的不确定性。年报：'VIE结构及其相关风险'为常规披露事项。",
        "timestamp": "", "source": "合规监测", "category": "VIE结构",
    },
    # ── 微信生态 ──
    {
        "id": "", "type": "运营风险", "severity": "low",
        "region": "中国", "lat": 22.5, "lng": 114.0,
        "description": "微信视频号用户时长同比增长超20%但货币化率仍低于抖音。微信小店带货规模高速增长但电商基础设施投入持续。微信生态内容治理成本上升。",
        "timestamp": "", "source": "业务监测", "category": "微信生态",
    },
    # ── 金融科技 ──
    {
        "id": "", "type": "运营风险", "severity": "low",
        "region": "中国", "lat": 31.2, "lng": 121.4,
        "description": "金融科技业务增速放缓至约10%（三大业务中最慢），受益于理财服务+消费贷款增长但商业支付增速趋缓。监管对金融科技持审慎态度，需关注微粒贷不良率变化。",
        "timestamp": "", "source": "金融科技监测", "category": "金融科技增速",
    },
    # ── 投资组合 ──
    {
        "id": "", "type": "投资风险", "severity": "low",
        "region": "全球", "lat": 22.3, "lng": 114.2,
        "description": "腾讯投资组合公允价值约¥8,000亿(含上市+非上市)。2025年策略从'主营业务+投资'双轮转为聚焦核心业务。拼多多等联营公司利润波动大，2024年贡献¥252亿但可持续性存疑。",
        "timestamp": "", "source": "投资组合监测", "category": "投资策略转型",
    },
]


def inject_company_events() -> list[dict[str, Any]]:
    now = datetime.utcnow()
    events = []
    for i, event in enumerate(TENCENT_RISK_EVENTS):
        evt = dict(event)
        evt["id"] = f"tx-{uuid.uuid4().hex[:12]}"
        if i < 3:
            hours_ago = i * 6
        else:
            hours_ago = 24 + i * 10
        evt["timestamp"] = (now - timedelta(hours=hours_ago)).isoformat()
        events.append(evt)
    return events


def inject_company_kpi_alerts() -> list[dict[str, Any]]:
    from app.services.company_config import KPI_TARGETS
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
                "region": "全球", "lat": 22.5, "lng": 114.0,
                "description": (
                    f"[{kpi['name']}] 实际值{kpi['actual']}，"
                    f"目标值{kpi['target']}，偏差{deviation:.1%}。{kpi.get('note', '')}"
                ),
                "timestamp": now.isoformat(),
                "source": "腾讯 KPI监测", "category": "KPI",
            })
    return alerts


def get_company_all_events() -> list[dict[str, Any]]:
    return inject_company_events() + inject_company_kpi_alerts()
