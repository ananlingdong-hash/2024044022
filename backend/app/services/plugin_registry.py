"""
Plugin registry for extensible risk types.
New risk types (e.g., interest rate risk) can be added via configuration
without modifying the core engine.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass
class RiskTypePlugin:
    """Defines a pluggable risk type with its data sources and evaluation logic."""

    risk_type: str
    display_name: str
    data_sources: list[str] = field(default_factory=list)
    tools: list[str] = field(default_factory=list)
    evaluate: Callable[[dict[str, Any]], dict[str, Any]] | None = None
    scenario_generator: Callable[[], dict[str, Any]] | None = None
    default_factors: list[dict[str, Any]] = field(default_factory=list)
    alert_conditions: list[dict[str, Any]] = field(default_factory=list)
    description: str = ""


class PluginRegistry:
    """Thread-safe registry for risk type plugins."""

    def __init__(self) -> None:
        self._plugins: dict[str, RiskTypePlugin] = {}

    def register(self, plugin: RiskTypePlugin) -> None:
        self._plugins[plugin.risk_type] = plugin

    def unregister(self, risk_type: str) -> None:
        self._plugins.pop(risk_type, None)

    def get(self, risk_type: str) -> RiskTypePlugin | None:
        return self._plugins.get(risk_type)

    def list_types(self) -> list[str]:
        return list(self._plugins.keys())

    def evaluate_all(self, context: dict[str, Any]) -> dict[str, Any]:
        results: dict[str, Any] = {}
        for rtype, plugin in self._plugins.items():
            if plugin.evaluate:
                try:
                    results[rtype] = plugin.evaluate(context)
                except Exception:
                    results[rtype] = {"error": f"Evaluation failed for {rtype}"}
        return results

    def generate_all_scenarios(self) -> dict[str, Any]:
        scenarios: dict[str, Any] = {}
        for rtype, plugin in self._plugins.items():
            if plugin.scenario_generator:
                try:
                    scenarios[rtype] = plugin.scenario_generator()
                except Exception:
                    scenarios[rtype] = {"error": f"Scenario generation failed for {rtype}"}
        return scenarios


_registry: PluginRegistry | None = None


def get_registry() -> PluginRegistry:
    global _registry
    if _registry is None:
        _registry = PluginRegistry()
    return _registry


def init_default_plugins() -> PluginRegistry:
    """Initialize the registry with built-in risk types."""
    reg = get_registry()

    # FX risk
    reg.register(RiskTypePlugin(
        risk_type="fx",
        display_name="汇率风险",
        data_sources=["yahoo_finance", "tencent_quote", "oanda_rates"],
        tools=["forward_contract", "currency_swap", "option"],
        default_factors=[
            {"name": "volatility", "weight": 0.35, "description": "Implied vs historical vol spread"},
            {"name": "exposure_ratio", "weight": 0.30, "description": "Unhedged exposure as % of total"},
            {"name": "correlation", "weight": 0.20, "description": "Cross-currency correlation shift"},
            {"name": "carry_cost", "weight": 0.15, "description": "Cost of maintaining hedge positions"},
        ],
        alert_conditions=[
            {"condition": "vol_spread > 30%", "action": "启动Agent提前对冲"},
            {"condition": "unhedged > 80%分位", "action": "强制部分对冲"},
        ],
        description="外汇汇率波动风险：含远期曲线、隐含波动率、自然对冲匹配度分析",
    ))

    # Credit risk
    reg.register(RiskTypePlugin(
        risk_type="credit",
        display_name="信用风险",
        data_sources=["bloomberg_credit", "moodys_ratings", "google_news_rss"],
        tools=["cds", "collateral_enhancement", "loan_transfer", "credit_limit_reduction"],
        default_factors=[
            {"name": "pd", "weight": 0.30, "description": "Probability of default (Cox model)"},
            {"name": "lgd", "weight": 0.25, "description": "Loss given default"},
            {"name": "ead", "weight": 0.20, "description": "Exposure at default"},
            {"name": "sentiment", "weight": 0.15, "description": "News sentiment intensity (-5 to +5)"},
            {"name": "concentration", "weight": 0.10, "description": "Industry/sector concentration risk"},
        ],
        alert_conditions=[
            {"condition": "sentiment < -3", "action": "触发信用预警"},
            {"condition": "pd > 5%", "action": "启动授信重审"},
        ],
        description="交易对手信用风险：含Cox生存分析、情感分级、组合集中度",
    ))

    # Supply chain risk
    reg.register(RiskTypePlugin(
        risk_type="supply_chain",
        display_name="供应链风险",
        data_sources=["supplier_portal", "logistics_api", "commodity_prices"],
        tools=["alternative_sourcing", "safety_stock", "contract_renegotiation"],
        default_factors=[
            {"name": "disruption_prob", "weight": 0.30, "description": "Primary supplier disruption probability"},
            {"name": "cascade_impact", "weight": 0.25, "description": "Multi-tier cascade propagation impact"},
            {"name": "geo_diversity", "weight": 0.20, "description": "Geographic diversity score"},
            {"name": "lead_time", "weight": 0.15, "description": "Alternative sourcing lead time"},
            {"name": "price_trend", "weight": 0.10, "description": "Material price index trend"},
        ],
        alert_conditions=[
            {"condition": "disruption_prob > 15%", "action": "触发备选供应商评估"},
            {"condition": "cascade_impact > 30%", "action": "启动多级供应链应急"},
        ],
        description="供应链中断风险：含多级扰动传播、地理分散度、备选切换成本",
    ))

    # Interest rate risk (extensible example)
    reg.register(RiskTypePlugin(
        risk_type="interest_rate",
        display_name="利率风险",
        data_sources=["central_bank_api", "yield_curve_data"],
        tools=["interest_rate_swap", "duration_matching", "convexity_hedge"],
        default_factors=[
            {"name": "duration_gap", "weight": 0.40, "description": "Asset-liability duration mismatch"},
            {"name": "yield_curve_shift", "weight": 0.35, "description": "Parallel & non-parallel curve shifts"},
            {"name": "basis_risk", "weight": 0.25, "description": "Floating vs fixed rate basis spread"},
        ],
        alert_conditions=[
            {"condition": "duration_gap > 2 years", "action": "启动久期匹配"},
            {"condition": "yield_curve_inversion", "action": "触发利率风险预警"},
        ],
        description="利率变动风险：久期缺口、收益率曲线变化、基差风险",
    ))

    return reg
