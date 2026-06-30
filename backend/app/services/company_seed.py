"""
腾讯控股风险事件种子数据

用于课堂演示的腾讯案例事件池，覆盖监管合规、AI 算力、国际化经营、
内容生态、商业信用与平台运营等核心风险主题。
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from typing import Any


TENCENT_RISK_EVENTS: list[dict[str, Any]] = [
    {
        "id": "",
        "type": "监管风险",
        "severity": "high",
        "region": "中国",
        "lat": 39.9,
        "lng": 116.4,
        "description": "监管政策窗口活跃，游戏、内容治理、未成年人保护和数据合规仍是平台经营的高权重约束条件。",
        "timestamp": "",
        "source": "监管公开信息",
        "category": "监管合规",
    },
    {
        "id": "",
        "type": "算力风险",
        "severity": "high",
        "region": "全球",
        "lat": 22.5,
        "lng": 114.0,
        "description": "大模型训练、内容安全审核和云业务扩容推高 GPU 与数据中心资源压力，算力保障成为腾讯当前重要经营变量。",
        "timestamp": "",
        "source": "AI 基础设施监测",
        "category": "AI算力",
    },
    {
        "id": "",
        "type": "国际化经营",
        "severity": "medium",
        "region": "全球",
        "lat": 22.3,
        "lng": 114.2,
        "description": "国际游戏、跨境支付和企业服务收入受汇率波动、当地监管要求和区域经营景气度共同影响。",
        "timestamp": "",
        "source": "国际业务监测",
        "category": "全球化经营",
    },
    {
        "id": "",
        "type": "内容生态",
        "severity": "medium",
        "region": "中国",
        "lat": 31.2,
        "lng": 121.4,
        "description": "视频号、公众号和社交内容生态仍在提升商业化效率，内容治理投入与平台活跃度需要持续平衡。",
        "timestamp": "",
        "source": "平台生态监测",
        "category": "内容治理",
    },
    {
        "id": "",
        "type": "商业信用",
        "severity": "medium",
        "region": "中国",
        "lat": 23.1,
        "lng": 113.3,
        "description": "广告主、商家和企业服务客户的回款节奏出现分化，中小客户信用波动对现金流管理更敏感。",
        "timestamp": "",
        "source": "商业信用监测",
        "category": "回款风险",
    },
    {
        "id": "",
        "type": "云资源保障",
        "severity": "low",
        "region": "中国",
        "lat": 22.5,
        "lng": 114.0,
        "description": "腾讯云与自建数据中心整体运行稳定，但高峰期容量调度、容灾冗余和跨区协同仍需持续优化。",
        "timestamp": "",
        "source": "云基础设施监测",
        "category": "基础设施",
    },
    {
        "id": "",
        "type": "资本配置",
        "severity": "low",
        "region": "中国香港",
        "lat": 22.3,
        "lng": 114.2,
        "description": "腾讯在 AI 投入、股东回报和主营业务扩张之间需要维持资本配置平衡，这会影响市场预期与估值弹性。",
        "timestamp": "",
        "source": "资本市场监测",
        "category": "资本配置",
    },
]


def inject_company_events() -> list[dict[str, Any]]:
  now = datetime.utcnow()
  events = []
  for i, event in enumerate(TENCENT_RISK_EVENTS):
    item = dict(event)
    item["id"] = f"tx-{uuid.uuid4().hex[:12]}"
    item["timestamp"] = (now - timedelta(hours=4 + i * 7)).isoformat()
    events.append(item)
  return events


def inject_company_kpi_alerts() -> list[dict[str, Any]]:
  from app.services.company_config import KPI_TARGETS

  now = datetime.utcnow()
  alerts: list[dict[str, Any]] = []

  for kpi in KPI_TARGETS.values():
    deviation = abs(kpi["actual"] - kpi["target"]) / max(abs(kpi["target"]), 1e-6)
    if deviation <= 0.10:
      continue

    severity = "critical" if kpi["actual"] > kpi["threshold"] else "warning"
    alerts.append(
      {
        "id": f"kpi-{uuid.uuid4().hex[:12]}",
        "type": "KPI预警",
        "severity": severity,
        "region": "中国",
        "lat": 22.5,
        "lng": 114.0,
        "description": f"[{kpi['name']}] 实际值 {kpi['actual']}，目标值 {kpi['target']}，偏差 {deviation:.1%}。{kpi.get('note', '')}",
        "timestamp": now.isoformat(),
        "source": "腾讯 KPI 监测",
        "category": "KPI",
      }
    )

  return alerts


def get_company_all_events() -> list[dict[str, Any]]:
  return inject_company_events() + inject_company_kpi_alerts()
