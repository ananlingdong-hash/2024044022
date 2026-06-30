from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class AIRequest(BaseModel):
    task: str
    context: str
    model: str = "minimax-m2.7"


class AIResponse(BaseModel):
    content: str
    model: str
    latencyMs: int
    diagnostic: str | None = None


class BacktestRequest(BaseModel):
    strategyCode: str = Field(min_length=3)
    symbols: list[str] = Field(default_factory=list)
    strategyName: str = "moving_average"
    dataSource: str = "tushare"
    tsCode: str = "000001.SZ"
    startDate: str = "2024-01-01"
    endDate: str | None = None
    csvPath: str = "data/sample_prices.csv"


class BacktestResponse(BaseModel):
    winRate: float
    annualReturn: float
    sharpe: float
    maxDrawdown: float
    reportText: str
    engine: str


class SentimentCreateRequest(BaseModel):
    symbols: list[str]


class StockScore(BaseModel):
    symbol: str
    score: int


class SentimentReportResponse(BaseModel):
    id: str
    generatedAt: datetime
    symbols: list[str]
    marketSentiment: int
    summary: str
    stockScores: list[StockScore]
    suggestion: str
    reportTitle: str = "舆情分析报告"
    eventHighlights: list[str] = Field(default_factory=list)
    recommendationBullets: list[str] = Field(default_factory=list)
    reportBody: str = ""


class TaskCreateRequest(BaseModel):
    name: str
    cronExpr: str


class TaskResponse(BaseModel):
    id: str
    name: str
    cronExpr: str
    enabled: bool
    createdAt: datetime


class ApiKeySaveRequest(BaseModel):
    provider: str
    encryptedKey: str


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    nickname: str = Field(min_length=2, max_length=64)


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)


class AuthResponse(BaseModel):
    token: str
    userId: str
    email: str
    nickname: str


class WatchlistUpdateRequest(BaseModel):
    symbols: list[str]


# ── Risk Response schemas ──

class RiskEvaluateRequest(BaseModel):
    portfolio_value: float = 10_000_000
    confidence: float = 0.95
    factors: list[str] = Field(default_factory=lambda: ["汇率", "信用", "供应链"])


class FactorContribution(BaseModel):
    factor: str
    contribution: float
    description: str


class VarEntry(BaseModel):
    method: str
    confidence: str
    value: float


class RiskEvaluateResponse(BaseModel):
    risk_score: float
    trend: str
    probability_distribution: list[dict]
    var_table: list[VarEntry]
    factor_contributions: list[FactorContribution]
    time_sensitivity_hours: float = 72.0
    elapsed_ms: float | None = None
    assumptions: dict | None = None
    var_table_detailed: list[dict] | None = None


class StrategyOptimizeRequest(BaseModel):
    risk_appetite: float = 500_000
    budget: float = 2_000_000
    time_window: int = 90


class GanttTask(BaseModel):
    name: str
    start: int
    end: int
    milestone: str = ""


class StrategyOption(BaseModel):
    name: str
    type: str
    cost: float
    residual_risk: float
    hedge_ratio: float
    credit_limit: float
    safety_stock_days: int
    description: str
    gantt: list[GanttTask]


class StrategyOptimizeResponse(BaseModel):
    conservative: dict
    balanced: dict
    aggressive: dict
    scatter_data: list[dict]
    optimization_meta: dict | None = None


class PdcaExecuteRequest(BaseModel):
    plan_id: str
    action: str = "execute"


class PdcaExecuteResponse(BaseModel):
    plan_id: str
    status: str
    instructions: dict
    message: str


class FeedbackRequest(BaseModel):
    strategy_id: str
    plan_params: str = "{}"
    actual_loss: float = 0.0
    actual_cost: float = 0.0
    residual_risk: float = 0.0
    suggestions: str = ""


class FeedbackResponse(BaseModel):
    id: str
    strategy_id: str
    suggestions: str
    recorded_at: datetime
    optimization_tips: list[str] = Field(default_factory=list)
    assumptions: list[str] | None = None
    sliding_window_size: int | None = None
    deviation_trend: str | None = None


class RiskReportResponse(BaseModel):
    id: str
    risk_score: float
    trend: str
    var_table: list[VarEntry]
    factor_contributions: list[FactorContribution]
    generated_at: datetime


class MonitorKpiItem(BaseModel):
    name: str
    actual: float
    target: float
    threshold: float
    unit: str
    status: str


class MonitorKpiResponse(BaseModel):
    kpis: list[MonitorKpiItem]
    period: str
    alert_logic: str | None = None
    company_context: dict | None = None


class RiskEventItem(BaseModel):
    id: str
    type: str
    severity: str
    region: str
    lat: float
    lng: float
    description: str
    timestamp: datetime


class MonitorEventsResponse(BaseModel):
    events: list[RiskEventItem]


class FxExposureItem(BaseModel):
    currency: str
    exposure: float
    hedge_ratio: float
    hedge_cost: float
    period_30d: float
    period_60d: float
    period_90d: float
    unhedged_pnl: list[float]
    hedged_pnl: list[float]


class ScenarioFxResponse(BaseModel):
    exposures: list[dict]
    total_exposure: float
    coverage_ratio: float
    alerts: list[str]
    natural_hedge_scores: dict | None = None
    assumptions: list[str] | None = None
    company_context: dict | None = None


class CreditPdLgdItem(BaseModel):
    borrower: str
    pd: float
    lgd: float
    ead: float
    raroc: float
    rating: str


class ScenarioCreditResponse(BaseModel):
    pd_lgd_table: list[dict]
    portfolio_npl_forecast: list[float]
    optimization_suggestions: list[str]
    sentiment_triggers: list[str] | None = None
    assumptions: list[str] | None = None
    company_context: dict | None = None


class SupplierItem(BaseModel):
    id: str
    name: str
    disruption_prob: float
    lead_time_days: int
    safety_stock_recommendation: int
    is_alternative: bool


class ScenarioSupplyResponse(BaseModel):
    suppliers: list[dict]
    disruption_forecast: list[dict]
    material_price_index: list[dict]
    suggestions: list[str]
    cascade_impacts: dict | None = None
    assumptions: list[str] | None = None
    company_context: dict | None = None


class LoginV1Request(BaseModel):
    email: str
    password: str = Field(min_length=6)


class LoginV1Response(BaseModel):
    token: str
    userId: str
    email: str
    nickname: str
    role: str
