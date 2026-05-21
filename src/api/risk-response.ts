import { http } from "./http"
import type {
  RiskEvaluateResponse,
  StrategyOptimizeResponse,
  PdcaExecuteResponse,
  FeedbackResponse,
  RiskReportResponse,
  MonitorKpiItem,
  RiskEventItem,
  ScenarioFxResponse,
  ScenarioCreditResponse,
  ScenarioSupplyResponse,
  LoginV1Response,
} from "@/types/risk-response"

const V1 = "/v1"

// ── Auth ──
export async function loginV1(email: string, password: string): Promise<LoginV1Response> {
  const { data } = await http.post(`${V1}/auth/login`, { email, password })
  return data
}

// ── Risk evaluate ──
export async function evaluateRisk(params: {
  portfolio_value?: number
  confidence?: number
  factors?: string[]
}): Promise<RiskEvaluateResponse> {
  try {
    const { data } = await http.post(`${V1}/risk/evaluate`, {
      portfolio_value: params.portfolio_value ?? 10_000_000,
      confidence: params.confidence ?? 0.95,
      factors: params.factors ?? ["汇率", "信用", "供应链"],
    })
    return data
  } catch {
    return fallbackRiskEvaluate()
  }
}

// ── Strategy optimize ──
export async function optimizeStrategy(params: {
  risk_appetite?: number
  budget?: number
  time_window?: number
}): Promise<StrategyOptimizeResponse> {
  try {
    const { data } = await http.post(`${V1}/strategy/optimize`, {
      risk_appetite: params.risk_appetite ?? 500_000,
      budget: params.budget ?? 2_000_000,
      time_window: params.time_window ?? 90,
    })
    return data
  } catch {
    return fallbackStrategyOptimize()
  }
}

// ── PDCA execute ──
export async function executePdca(planId: string): Promise<PdcaExecuteResponse> {
  const { data } = await http.post(`${V1}/pdca/execute/${planId}`, { plan_id: planId, action: "execute" })
  return data
}

// ── Feedback ──
export async function submitFeedback(params: {
  strategy_id: string
  plan_params?: string
  actual_loss?: number
  actual_cost?: number
  residual_risk?: number
  suggestions?: string
}): Promise<FeedbackResponse> {
  const { data } = await http.post(`${V1}/feedback`, {
    strategy_id: params.strategy_id,
    plan_params: params.plan_params ?? "{}",
    actual_loss: params.actual_loss ?? 0,
    actual_cost: params.actual_cost ?? 0,
    residual_risk: params.residual_risk ?? 0,
    suggestions: params.suggestions ?? "",
  })
  return data
}

// ── Risk report ──
export async function getRiskReport(id: string): Promise<RiskReportResponse> {
  const { data } = await http.get(`${V1}/risk/report/${id}`)
  return data
}

// ── Monitor KPI ──
export async function getMonitorKpi(): Promise<{ kpis: MonitorKpiItem[]; period: string }> {
  try {
    const { data } = await http.get(`${V1}/monitor/kpi`)
    return data
  } catch {
    return fallbackKpi()
  }
}

// ── Monitor events ──
export async function getMonitorEvents(): Promise<{ events: RiskEventItem[] }> {
  try {
    const { data } = await http.get(`${V1}/monitor/events`)
    return data
  } catch {
    return fallbackEvents()
  }
}

// ── Scenario FX ──
export async function getScenarioFx(): Promise<ScenarioFxResponse> {
  try {
    const { data } = await http.get(`${V1}/scenario/fx`)
    return data
  } catch {
    return fallbackFx()
  }
}

// ── Scenario Credit ──
export async function getScenarioCredit(): Promise<ScenarioCreditResponse> {
  try {
    const { data } = await http.get(`${V1}/scenario/credit`)
    return data
  } catch {
    return fallbackCredit()
  }
}

// ── Scenario Supply ──
export async function getScenarioSupply(): Promise<ScenarioSupplyResponse> {
  try {
    const { data } = await http.get(`${V1}/scenario/supply`)
    return data
  } catch {
    return fallbackSupply()
  }
}

// ── Fallback mock data ──

function fallbackRiskEvaluate(): RiskEvaluateResponse {
  return {
    risk_score: 62.4,
    trend: "↑",
    probability_distribution: Array.from({ length: 31 }, (_, i) => ({
      x: +(40 + i * 2).toFixed(1),
      y: +Math.max(0, 100 - ((i - 15) ** 2) / 3).toFixed(2),
    })),
    var_table: [
      { method: "蒙特卡洛模拟", confidence: "95%", value: 2.65 },
      { method: "历史模拟法", confidence: "95%", value: 2.48 },
      { method: "参数法", confidence: "95%", value: 2.31 },
      { method: "蒙特卡洛模拟", confidence: "99%", value: 4.12 },
      { method: "历史模拟法", confidence: "99%", value: 3.89 },
      { method: "参数法", confidence: "99%", value: 3.55 },
    ],
    factor_contributions: [
      { factor: "汇率", contribution: 42.5, description: "汇率波动对敞口价值的影响占主导地位" },
      { factor: "信用", contribution: 32.1, description: "交易对手信用评级下调导致违约概率上升" },
      { factor: "供应链", contribution: 25.4, description: "关键供应商交付延迟引发库存短缺风险" },
    ],
    time_sensitivity_hours: 52.8,
  }
}

function _buildGantt(prefix: string, tw: number) {
  return [
    { name: `${prefix}-审批`, start: 3, end: 6, milestone: "" },
    { name: `${prefix}-签约`, start: 6, end: 10, milestone: "签约" },
    { name: `${prefix}-执行`, start: 10, end: tw - 14, milestone: "" },
    { name: `${prefix}-监控`, start: tw - 14, end: tw, milestone: "" },
  ]
}

function fallbackStrategyOptimize(): StrategyOptimizeResponse {
  const tw = 90
  return {
    conservative: {
      name: "保守方案", type: "conservative", cost: 1_640_000, residual_risk: 75_000,
      hedge_ratio: 0.92, credit_limit: 560_000, safety_stock_days: 45,
      description: "全面对冲汇率风险，严格信用额度管控，高安全库存水位。适合风险极度厌恶时期。",
      gantt: _buildGantt("保守", tw),
    },
    balanced: {
      name: "平衡方案", type: "balanced", cost: 1_160_000, residual_risk: 190_000,
      hedge_ratio: 0.65, credit_limit: 840_000, safety_stock_days: 25,
      description: "选择性对冲核心敞口，保持适中的信用额度和安全库存。性价比最优方案。",
      gantt: _buildGantt("平衡", tw),
    },
    aggressive: {
      name: "激进方案", type: "aggressive", cost: 640_000, residual_risk: 360_000,
      hedge_ratio: 0.30, credit_limit: 1_300_000, safety_stock_days: 10,
      description: "仅对冲极端尾部风险，最大化资金效率。适合市场平稳时期。",
      gantt: _buildGantt("激进", tw),
    },
    scatter_data: [
      { name: "保守方案", type: "conservative", cost: 1_640_000, residual_risk: 75_000 },
      { name: "平衡方案", type: "balanced", cost: 1_160_000, residual_risk: 190_000 },
      { name: "激进方案", type: "aggressive", cost: 640_000, residual_risk: 360_000 },
      { name: "保守-变体A", type: "conservative", cost: 1_400_000, residual_risk: 90_000 },
      { name: "平衡-变体A", type: "balanced", cost: 980_000, residual_risk: 210_000 },
      { name: "激进-变体A", type: "aggressive", cost: 550_000, residual_risk: 380_000 },
    ],
  }
}

function fallbackKpi() {
  return {
    kpis: [
      { name: "hedge_deviation_rate", actual: 0.042, target: 0.05, threshold: 0.10, unit: "%", status: "normal" },
      { name: "default_trigger_rate", actual: 0.018, target: 0.01, threshold: 0.03, unit: "%", status: "warning" },
      { name: "delivery_rate", actual: 0.962, target: 0.95, threshold: 0.90, unit: "%", status: "normal" },
      { name: "var_breach_count", actual: 1, target: 0, threshold: 5, unit: "次", status: "normal" },
      { name: "liquidity_coverage", actual: 1.45, target: 1.5, threshold: 1.0, unit: "倍", status: "normal" },
    ],
    period: "T+15",
  }
}

function fallbackEvents(): { events: RiskEventItem[] } {
  const types = ["汇率波动", "信用违约", "供应链中断", "政策变更", "自然灾害", "地缘冲突"]
  const severities = ["low", "medium", "high", "critical"]
  const regions = [
    { r: "亚太区", lat: 35, lng: 105 },
    { r: "欧洲区", lat: 50, lng: 10 },
    { r: "北美区", lat: 40, lng: -100 },
    { r: "中东区", lat: 30, lng: 45 },
    { r: "南美区", lat: -15, lng: -55 },
  ]
  const events: RiskEventItem[] = Array.from({ length: 20 }, (_, i) => {
    const reg = regions[i % regions.length]
    return {
      id: `evt-${i}`,
      type: types[i % types.length],
      severity: severities[i % severities.length],
      region: reg.r,
      lat: reg.lat + (Math.random() - 0.5) * 16,
      lng: reg.lng + (Math.random() - 0.5) * 16,
      description: `${reg.r}发生${types[i % types.length]}事件`,
      timestamp: new Date(Date.now() - i * 3600000 * 7).toISOString(),
    }
  })
  return { events }
}

function fallbackFx(): ScenarioFxResponse {
  const p = Array.from({ length: 90 }, (_, i) => i + 1)
  const usdU = p.map(i => 1_000_000 + (i - 45) * 5000 + (Math.random() - 0.5) * 60000)
  const usdH = p.map(i => 1_000_000 + (i - 45) * 1200 + (Math.random() - 0.5) * 16000)
  const eurU = p.map(i => 600_000 + (i - 45) * 3000 + (Math.random() - 0.5) * 36000)
  const eurH = p.map(i => 600_000 + (i - 45) * 800 + (Math.random() - 0.5) * 10000)
  const jpyU = p.map(i => 400_000 + (i - 45) * 2000 + (Math.random() - 0.5) * 24000)
  const jpyH = p.map(i => 400_000 + (i - 45) * 500 + (Math.random() - 0.5) * 8000)
  return {
    exposures: [
      { currency: "USD", exposure: 2_500_000, hedge_ratio: 0.68, hedge_cost: 45_000,
        period_30d: 1_200_000, period_60d: 800_000, period_90d: 500_000,
        unhedged_pnl: usdU, hedged_pnl: usdH },
      { currency: "EUR", exposure: 1_500_000, hedge_ratio: 0.55, hedge_cost: 32_000,
        period_30d: 700_000, period_60d: 500_000, period_90d: 300_000,
        unhedged_pnl: eurU, hedged_pnl: eurH },
      { currency: "JPY", exposure: 1_000_000, hedge_ratio: 0.42, hedge_cost: 18_000,
        period_30d: 500_000, period_60d: 300_000, period_90d: 200_000,
        unhedged_pnl: jpyU, hedged_pnl: jpyH },
    ],
    total_exposure: 5_000_000,
    coverage_ratio: 0.58,
    alerts: [
      "USD敞口覆盖率低于目标值70%，建议追加远期合约",
      "JPY波动率在过去30日上升22%，关注套息交易平仓风险",
      "EUR利率决议将在7日后公布，建议提前锁定部分敞口",
    ],
  }
}

function fallbackCredit(): ScenarioCreditResponse {
  return {
    pd_lgd_table: [
      { borrower: "企业A (制造业)", pd: 0.012, lgd: 0.40, ead: 5_000_000, raroc: 0.18, rating: "A" },
      { borrower: "企业B (贸易)", pd: 0.025, lgd: 0.45, ead: 3_500_000, raroc: 0.14, rating: "BBB+" },
      { borrower: "企业C (科技)", pd: 0.008, lgd: 0.35, ead: 8_000_000, raroc: 0.22, rating: "AA-" },
      { borrower: "企业D (地产)", pd: 0.055, lgd: 0.55, ead: 2_000_000, raroc: 0.08, rating: "BB" },
      { borrower: "企业E (能源)", pd: 0.018, lgd: 0.42, ead: 4_500_000, raroc: 0.16, rating: "A-" },
      { borrower: "企业F (消费)", pd: 0.032, lgd: 0.48, ead: 2_800_000, raroc: 0.11, rating: "BBB" },
    ],
    portfolio_npl_forecast: Array.from({ length: 12 }, (_, i) => +(0.018 + i * 0.0002 + (Math.random() - 0.5) * 0.004).toFixed(4)),
    optimization_suggestions: [
      "企业D信用评级跌破投资级，建议降低授信额度20%",
      "企业C RAROC最高(22%)，可适度增加敞口",
      "整体贷款组合集中度偏高，建议增加行业分散度",
    ],
  }
}

function fallbackSupply(): ScenarioSupplyResponse {
  const days = Array.from({ length: 60 }, (_, i) => i + 1)
  return {
    suppliers: [
      { id: "S001", name: "芯片供应商A", disruption_prob: 0.08, lead_time_days: 30, safety_stock_recommendation: 5000, is_alternative: false },
      { id: "S002", name: "芯片供应商A-备选", disruption_prob: 0.15, lead_time_days: 45, safety_stock_recommendation: 8000, is_alternative: true },
      { id: "S003", name: "钢材供应商B", disruption_prob: 0.05, lead_time_days: 15, safety_stock_recommendation: 3000, is_alternative: false },
      { id: "S004", name: "钢材供应商B-备选", disruption_prob: 0.09, lead_time_days: 20, safety_stock_recommendation: 4000, is_alternative: true },
      { id: "S005", name: "物流服务商C", disruption_prob: 0.18, lead_time_days: 7, safety_stock_recommendation: 2000, is_alternative: false },
      { id: "S006", name: "物流服务商C-备选", disruption_prob: 0.22, lead_time_days: 10, safety_stock_recommendation: 3500, is_alternative: true },
    ],
    disruption_forecast: days.map(d => ({ day: d, probability: +(0.05 + d * 0.002 * (0.8 + Math.random() * 0.4)).toFixed(3) })),
    material_price_index: days.map(d => ({ day: d, index: +(100 + d * 0.3 + (Math.random() - 0.5) * 3).toFixed(1) })),
    suggestions: [
      "芯片供应商A备选方案建议在15天内完成资质审核",
      "物流服务商C中断概率上升至18%，建议增加备选签约",
      "原材料价格指数呈上升趋势，建议提前锁定30天用量",
    ],
  }
}
