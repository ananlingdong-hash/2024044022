export interface FactorContribution {
  factor: string
  contribution: number
  description: string
}

export interface VarEntry {
  method: string
  confidence: string
  value: number
}

export interface RiskEvaluateResponse {
  risk_score: number
  trend: string
  probability_distribution: { x: number; y: number }[]
  var_table: VarEntry[]
  factor_contributions: FactorContribution[]
  time_sensitivity_hours: number
  elapsed_ms?: number
  assumptions?: Record<string, string>
  var_table_detailed?: VarEntryDetailed[]
}

export interface VarEntryDetailed extends VarEntry {
  cvar?: number
  simulations?: number
  elapsed_ms?: number
  technique?: string
  sample_size?: number
}

export interface GanttTask {
  name: string
  start: number
  end: number
  milestone: string
  estimated_hours?: number
  role?: string
}

export interface StrategyOption {
  name: string
  type: "conservative" | "balanced" | "aggressive"
  cost: number
  residual_risk: number
  hedge_ratio: number
  credit_limit: number
  safety_stock_days: number
  description: string
  gantt: GanttTask[]
  feasibility_warnings?: string[]
  assumptions?: Record<string, string>
  actions?: string[]
}

export interface StrategyOptimizeResponse {
  conservative: StrategyOption
  balanced: StrategyOption
  aggressive: StrategyOption
  scatter_data: { name: string; type: string; cost: number; residual_risk: number }[]
  optimization_meta?: {
    generations: number
    pareto_size: number
    converged: boolean
    hypervolume?: number
    elapsed_ms?: number
  }
}

export interface PdcaExecuteResponse {
  plan_id: string
  status: string
  instructions: Record<string, unknown>
  message: string
}

export interface FeedbackResponse {
  id: string
  strategy_id: string
  suggestions: string
  recorded_at: string
  optimization_tips: string[]
}

export interface MonitorKpiItem {
  name: string
  actual: number
  target: number
  threshold: number
  unit: string
  status: string
}

export interface RiskEventItem {
  id: string
  type: string
  severity: string
  region: string
  lat: number
  lng: number
  description: string
  timestamp: string
}

export interface FxExposureItem {
  currency: string
  exposure: number
  hedge_ratio: number
  hedge_cost: number
  period_30d: number
  period_60d: number
  period_90d: number
  unhedged_pnl: number[]
  hedged_pnl: number[]
}

export interface FxExposureItem {
  currency: string
  exposure: number
  hedge_ratio: number
  hedge_cost: number
  period_30d: number
  period_60d: number
  period_90d: number
  unhedged_pnl: number[]
  hedged_pnl: number[]
  historical_vol?: number
  implied_vol?: number
  vol_spread_pct?: number
}

export interface NaturalHedgeScore {
  match_score: number
  net_receivable: number
  net_payable: number
  recommendation: string
}

export interface ScenarioFxResponse {
  exposures: FxExposureItem[]
  total_exposure: number
  coverage_ratio: number
  alerts: string[]
  natural_hedge_scores?: Record<string, NaturalHedgeScore>
  assumptions?: string[]
  company_context?: CompanyContext
}

export interface CompanyContext {
  company: string
  ticker: string
  fiscal_year: number
  headline: string
  key_metrics: Record<string, string | number>
  data_source: string
  disclaimer: string
}

export interface CreditPdLgdItem {
  borrower: string
  pd: number
  lgd: number
  ead: number
  raroc: number
  rating: string
  sentiment?: number
  cox_pd?: number
  cox_hazard_ratio?: number
  censored?: boolean
}

export interface ScenarioCreditResponse {
  pd_lgd_table: CreditPdLgdItem[]
  portfolio_npl_forecast: number[]
  optimization_suggestions: string[]
  sentiment_triggers?: string[]
  assumptions?: string[]
  company_context?: CompanyContext
}

export interface SupplierItem {
  id: string
  name: string
  disruption_prob: number
  lead_time_days: number
  safety_stock_recommendation: number
  is_alternative: boolean
  geo_region?: string
  geo_score?: number
  switching_cost?: number
  composite_score?: number
  category?: string
}

export interface CascadeImpact {
  primary_disruption: number
  secondary_cascade_prob: number
  affected_alternative: string
  estimated_impact_days: number
}

export interface ScenarioSupplyResponse {
  suppliers: SupplierItem[]
  disruption_forecast: { day: number; probability: number }[]
  material_price_index: { day: number; index: number }[]
  suggestions: string[]
  cascade_impacts?: Record<string, CascadeImpact>
  assumptions?: string[]
  company_context?: CompanyContext
}

export interface RiskReportResponse {
  id: string
  risk_score: number
  trend: string
  var_table: VarEntry[]
  factor_contributions: FactorContribution[]
  generated_at: string
}

export interface LoginV1Response {
  token: string
  userId: string
  email: string
  nickname: string
  role: string
}
