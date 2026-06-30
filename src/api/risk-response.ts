import { http } from "./http"
import type {
  FeedbackResponse,
  LoginV1Response,
  MonitorKpiItem,
  PdcaExecuteResponse,
  RiskEvaluateResponse,
  RiskEventItem,
  RiskReportResponse,
  ScenarioCreditResponse,
  ScenarioFxResponse,
  ScenarioSupplyResponse,
  StrategyOptimizeResponse,
} from "@/types/risk-response"

const V1 = "/v1"

export async function loginV1(email: string, password: string): Promise<LoginV1Response> {
  const { data } = await http.post(`${V1}/auth/login`, { email, password })
  return data
}

export async function evaluateRisk(params: {
  portfolio_value?: number
  confidence?: number
  factors?: string[]
}): Promise<RiskEvaluateResponse> {
  try {
    const { data } = await http.post(`${V1}/risk/evaluate`, {
      portfolio_value: params.portfolio_value ?? 10_000_000,
      confidence: params.confidence ?? 0.95,
      factors: params.factors ?? ["监管合规", "AI算力", "全球化经营"],
    })
    return data
  } catch {
    return fallbackRiskEvaluate()
  }
}

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

export async function executePdca(planId: string): Promise<PdcaExecuteResponse> {
  const { data } = await http.post(`${V1}/pdca/execute/${planId}`, { plan_id: planId, action: "execute" })
  return data
}

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

export async function getRiskReport(id: string): Promise<RiskReportResponse> {
  const { data } = await http.get(`${V1}/risk/report/${id}`)
  return data
}

export async function getMonitorKpi(): Promise<{ kpis: MonitorKpiItem[]; period: string }> {
  try {
    const { data } = await http.get(`${V1}/monitor/kpi`)
    return data
  } catch {
    return fallbackKpi()
  }
}

export async function getMonitorEvents(): Promise<{ events: RiskEventItem[] }> {
  try {
    const { data } = await http.get(`${V1}/monitor/events`)
    return data
  } catch {
    return fallbackEvents()
  }
}

export async function getScenarioFx(): Promise<ScenarioFxResponse> {
  try {
    const { data } = await http.get(`${V1}/scenario/fx`)
    return data
  } catch {
    return fallbackFx()
  }
}

export async function getScenarioCredit(): Promise<ScenarioCreditResponse> {
  try {
    const { data } = await http.get(`${V1}/scenario/credit`)
    return data
  } catch {
    return fallbackCredit()
  }
}

export async function getScenarioSupply(): Promise<ScenarioSupplyResponse> {
  try {
    const { data } = await http.get(`${V1}/scenario/supply`)
    return data
  } catch {
    return fallbackSupply()
  }
}

const companyContext = {
  company: "腾讯控股",
  ticker: "Private",
  fiscal_year: 2024,
  headline: "基于腾讯控股公开资料、官方披露与媒体估算构建的风险监管样例",
  key_metrics: {
    "2024营收估算": "$155B+",
    "估值区间": "$300B+",
    "微信及WeChat MAU": "170M+",
    "公司状态": "非上市",
  },
  data_source: "Tencent 官方资料、欧盟委员会公告、美国国会法案文本、Reuters/The Information 等公开报道",
  disclaimer: "腾讯控股为非上市公司，财务与估值数据为公开媒体估算；风险敞口、PD/LGD 与供应中断概率为课堂演示模型参数。",
}

function fallbackRiskEvaluate(): RiskEvaluateResponse {
  return {
    risk_score: 68.2,
    trend: "上升",
    probability_distribution: Array.from({ length: 31 }, (_, i) => ({
      x: +(38 + i * 2).toFixed(1),
      y: +Math.max(0, 100 - ((i - 16) ** 2) / 2.8).toFixed(2),
    })),
    var_table: [
      { method: "监管压力测试", confidence: "95%", value: 3.18 },
      { method: "蒙特卡洛模拟", confidence: "95%", value: 2.84 },
      { method: "历史事件法", confidence: "95%", value: 2.42 },
      { method: "监管压力测试", confidence: "99%", value: 4.88 },
      { method: "蒙特卡洛模拟", confidence: "99%", value: 4.26 },
      { method: "历史事件法", confidence: "99%", value: 3.71 },
    ],
    factor_contributions: [
      { factor: "监管合规", contribution: 45.8, description: "美国 CMC黑名单 法案、游戏版号 与数据本地化要求叠加，是当前最高权重因子。" },
      { factor: "AI算力", contribution: 30.7, description: "大模型、推荐系统和内容安全模型依赖高性能 GPU 与云资源，供应与成本弹性不足。" },
      { factor: "全球化经营", contribution: 23.5, description: "海外广告、Tencent FinTech 和多币种收入敞口带来汇率、政策与回款波动。" },
    ],
    time_sensitivity_hours: 48.0,
  }
}

function buildGantt(prefix: string, tw: number) {
  return [
    { name: `${prefix}-评估`, start: 1, end: 3, milestone: "完成分级" },
    { name: `${prefix}-审批`, start: 3, end: 7, milestone: "形成方案" },
    { name: `${prefix}-执行`, start: 7, end: tw - 14, milestone: "" },
    { name: `${prefix}-复盘`, start: tw - 14, end: tw, milestone: "PDCA复盘" },
  ]
}

function fallbackStrategyOptimize(): StrategyOptimizeResponse {
  const tw = 90
  return {
    conservative: {
      name: "合规防御方案", type: "conservative", cost: 2_800_000, residual_risk: 95_000,
      hedge_ratio: 0.90, credit_limit: 520_000, safety_stock_days: 45,
      description: "优先压降监管尾部风险：美国与欧盟专项合规投入前置，AI 算力建立高冗余替代池，适合重大监管窗口前。",
      gantt: buildGantt("合规防御", tw),
      actions: ["建立美国 CMC黑名单 应急台账", "游戏版号 合规材料预审", "GPU/云资源双供应池锁定"],
    },
    balanced: {
      name: "平衡响应方案", type: "balanced", cost: 1_760_000, residual_risk: 180_000,
      hedge_ratio: 0.68, credit_limit: 860_000, safety_stock_days: 28,
      description: "兼顾合规确定性与业务连续性：优先覆盖高风险市场，同时保留广告、电商与 AI 产品增长弹性。",
      gantt: buildGantt("平衡响应", tw),
      actions: ["48小时监管事件复核", "高风险市场合规预算前置", "AI 算力供应切换演练"],
    },
    aggressive: {
      name: "增长优先方案", type: "aggressive", cost: 780_000, residual_risk: 410_000,
      hedge_ratio: 0.35, credit_limit: 1_360_000, safety_stock_days: 14,
      description: "保留更高业务投入效率，仅对极端监管和算力断供风险做保护，适合风险窗口回落后使用。",
      gantt: buildGantt("增长优先", tw),
      actions: ["保留核心市场投放", "仅覆盖尾部监管事件", "低成本云资源弹性采购"],
    },
    scatter_data: [
      { name: "合规防御方案", type: "conservative", cost: 2_800_000, residual_risk: 95_000 },
      { name: "平衡响应方案", type: "balanced", cost: 1_760_000, residual_risk: 180_000 },
      { name: "增长优先方案", type: "aggressive", cost: 780_000, residual_risk: 410_000 },
      { name: "防御-轻量版", type: "conservative", cost: 2_200_000, residual_risk: 130_000 },
      { name: "平衡-算力优先", type: "balanced", cost: 1_520_000, residual_risk: 220_000 },
      { name: "增长-极简保护", type: "aggressive", cost: 620_000, residual_risk: 470_000 },
    ],
  }
}

function fallbackKpi() {
  return {
    kpis: [
      { name: "regulatory_response_sla", actual: 0.82, target: 0.90, threshold: 0.70, unit: "%", status: "warning" },
      { name: "content_safety_intercept_rate", actual: 0.998, target: 0.999, threshold: 0.995, unit: "%", status: "normal" },
      { name: "ai_compute_backup_coverage", actual: 0.64, target: 0.75, threshold: 0.50, unit: "%", status: "warning" },
      { name: "ad_receivable_overdue_rate", actual: 0.021, target: 0.015, threshold: 0.035, unit: "%", status: "warning" },
      { name: "fx_hedge_coverage", actual: 0.58, target: 0.65, threshold: 0.40, unit: "%", status: "normal" },
    ],
    period: "T+15",
  }
}

function fallbackEvents(): { events: RiskEventItem[] } {
  const types = ["监管审查", "数据合规", "AI芯片限制", "汇率波动", "内容安全", "跨境电商政策"]
  const severities = ["medium", "high", "critical", "medium"]
  const regions = [
    { r: "美国", lat: 38, lng: -97 },
    { r: "欧盟", lat: 50, lng: 10 },
    { r: "中国", lat: 35, lng: 105 },
    { r: "东南亚", lat: 10, lng: 106 },
    { r: "巴西", lat: -15, lng: -55 },
  ]
  return {
    events: Array.from({ length: 20 }, (_, i) => {
      const reg = regions[i % regions.length]
      const type = types[i % types.length]
      return {
        id: `bd-evt-${i}`,
        type,
        severity: severities[i % severities.length],
        region: reg.r,
        lat: reg.lat + (Math.random() - 0.5) * 10,
        lng: reg.lng + (Math.random() - 0.5) * 10,
        description: `${reg.r}${type}信号触发，已进入腾讯控股风险监管台账。`,
        timestamp: new Date(Date.now() - i * 3600000 * 6).toISOString(),
      }
    }),
  }
}

function fallbackFx(): ScenarioFxResponse {
  const p = Array.from({ length: 90 }, (_, i) => i + 1)
  const series = (base: number, drift: number, noise: number) =>
    p.map((i) => base + (i - 45) * drift + (Math.random() - 0.5) * noise)

  return {
    exposures: [
      { currency: "USD", exposure: 280_000_000_000, hedge_ratio: 0.58, hedge_cost: 1_820_000_000,
        period_30d: 132_000_000_000, period_60d: 92_000_000_000, period_90d: 56_000_000_000,
        unhedged_pnl: series(0, 18_000_000, 680_000_000), hedged_pnl: series(0, 5_000_000, 180_000_000), historical_vol: 7.2, implied_vol: 8.8, vol_spread_pct: 22 },
      { currency: "EUR", exposure: 92_000_000_000, hedge_ratio: 0.46, hedge_cost: 690_000_000,
        period_30d: 41_000_000_000, period_60d: 32_000_000_000, period_90d: 19_000_000_000,
        unhedged_pnl: series(0, 9_000_000, 260_000_000), hedged_pnl: series(0, 3_000_000, 90_000_000), historical_vol: 6.4, implied_vol: 7.6, vol_spread_pct: 19 },
      { currency: "GBP/JPY/SEA", exposure: 66_000_000_000, hedge_ratio: 0.38, hedge_cost: 420_000_000,
        period_30d: 29_000_000_000, period_60d: 22_000_000_000, period_90d: 15_000_000_000,
        unhedged_pnl: series(0, 6_000_000, 220_000_000), hedged_pnl: series(0, 2_000_000, 80_000_000), historical_vol: 9.1, implied_vol: 11.4, vol_spread_pct: 25 },
    ],
    total_exposure: 438_000_000_000,
    coverage_ratio: 0.52,
    alerts: [
      "美国 CMC黑名单 监管窗口未完全落地，美元收入与合规成本需联动压力测试。",
      "游戏版号 调查提升内容治理与算法透明合规投入，建议设置专项预算阈值。",
      "东南亚与拉美 Tencent FinTech 增速快，但本币波动和平台政策变化需要周度复核。",
    ],
    natural_hedge_scores: {
      USD: { match_score: 58, net_receivable: 280_000_000_000, net_payable: 96_000_000_000, recommendation: "广告收入与云资源采购存在部分自然对冲，但仍需远期覆盖核心敞口。" },
      EUR: { match_score: 46, net_receivable: 92_000_000_000, net_payable: 28_000_000_000, recommendation: "欧盟合规支出能抵消部分收入敞口，DSA 罚款尾部风险需单独处理。" },
      "SEA": { match_score: 39, net_receivable: 38_000_000_000, net_payable: 12_000_000_000, recommendation: "Tencent FinTech 回款与补贴周期错配，建议提高本币监控频率。" },
    },
    assumptions: [
      "币种敞口为公开业务规模基础上的演示估算。",
      "对冲成本按广告、云资源和电商结算现金流综合估算。",
      "监管事件造成的现金流波动通过压力测试折算至 VaR。",
    ],
    company_context: companyContext,
  }
}

function fallbackCredit(): ScenarioCreditResponse {
  return {
    pd_lgd_table: [
      { borrower: "大型品牌广告主", pd: 0.018, lgd: 0.22, ead: 12_000_000_000, raroc: 0.24, rating: "AA-", sentiment: 2, cox_pd: 0.020 },
      { borrower: "中小广告主长尾池", pd: 0.075, lgd: 0.36, ead: 8_500_000_000, raroc: 0.13, rating: "BBB", sentiment: -1, cox_pd: 0.092 },
      { borrower: "Tencent FinTech 头部商家", pd: 0.041, lgd: 0.30, ead: 6_800_000_000, raroc: 0.18, rating: "A-", sentiment: 1, cox_pd: 0.048 },
      { borrower: "跨境商家长尾池", pd: 0.096, lgd: 0.42, ead: 4_600_000_000, raroc: 0.10, rating: "BB+", sentiment: -2, cox_pd: 0.118 },
      { borrower: "企业服务客户", pd: 0.024, lgd: 0.28, ead: 3_200_000_000, raroc: 0.20, rating: "A", sentiment: 1, cox_pd: 0.027 },
      { borrower: "本地生活商户池", pd: 0.061, lgd: 0.34, ead: 3_000_000_000, raroc: 0.15, rating: "BBB+", sentiment: 0, cox_pd: 0.067 },
    ],
    portfolio_npl_forecast: Array.from({ length: 12 }, (_, i) => +(0.018 + i * 0.0011 + (Math.random() - 0.5) * 0.003).toFixed(4)),
    optimization_suggestions: [
      "跨境商家长尾池 PD 上行，建议将高投诉类目结算周期缩短并提高保证金。",
      "大型品牌广告主 RAROC 最高，可保留较高额度并绑定季度回款监控。",
      "Tencent FinTech 头部商家风险可控，但需按国家政策变化动态调整信用额度。",
    ],
    sentiment_triggers: [
      "广告预算削减新闻热度上升时，自动上调中小广告主 PD。",
      "跨境电商政策变更触发商家保证金复核。",
    ],
    assumptions: [
      "PD/LGD 为课堂演示模型参数，按广告主、商家和企业服务客户类型估算。",
      "舆情触发项通过关键词热度影响 Cox 调整 PD。",
    ],
    company_context: companyContext,
  }
}

function fallbackSupply(): ScenarioSupplyResponse {
  const days = Array.from({ length: 60 }, (_, i) => i + 1)
  return {
    suppliers: [
      { id: "S001", name: "NVIDIA GPU 算力", category: "AI芯片", disruption_prob: 0.22, lead_time_days: 90, safety_stock_recommendation: 3, is_alternative: false, geo_region: "美国/全球", geo_score: 32, switching_cost: 520_000_000, composite_score: 58 },
      { id: "S002", name: "国产 AI 芯片替代池", category: "AI芯片-备选", disruption_prob: 0.14, lead_time_days: 60, safety_stock_recommendation: 2, is_alternative: true, geo_region: "中国", geo_score: 78, switching_cost: 360_000_000, composite_score: 66 },
      { id: "S003", name: "自建数据中心", category: "基础设施", disruption_prob: 0.06, lead_time_days: 30, safety_stock_recommendation: 4, is_alternative: false, geo_region: "中国/东南亚", geo_score: 84, switching_cost: 180_000_000, composite_score: 82 },
      { id: "S004", name: "全球云与 CDN", category: "云资源", disruption_prob: 0.10, lead_time_days: 14, safety_stock_recommendation: 3, is_alternative: false, geo_region: "全球", geo_score: 76, switching_cost: 120_000_000, composite_score: 74 },
      { id: "S005", name: "内容审核运营团队", category: "合规运营", disruption_prob: 0.08, lead_time_days: 7, safety_stock_recommendation: 5, is_alternative: false, geo_region: "全球", geo_score: 80, switching_cost: 60_000_000, composite_score: 79 },
      { id: "S006", name: "第三方安全审计", category: "合规服务-备选", disruption_prob: 0.12, lead_time_days: 21, safety_stock_recommendation: 2, is_alternative: true, geo_region: "美国/欧盟", geo_score: 62, switching_cost: 80_000_000, composite_score: 69 },
    ],
    disruption_forecast: days.map((d) => ({ day: d, probability: +(0.08 + d * 0.0022 + (Math.random() - 0.5) * 0.018).toFixed(3) })),
    material_price_index: days.map((d) => ({ day: d, index: +(100 + d * 0.42 + Math.sin(d / 6) * 2.8).toFixed(1) })),
    suggestions: [
      "NVIDIA GPU 供应与出口管制相关，建议建立国产芯片、海外云资源和自建数据中心三层替代池。",
      "游戏版号 与美国数据安全审查需要第三方审计与内容治理团队提前排班。",
      "混元大模型推理高峰期需预留推理算力冗余，避免监管事件与流量峰值叠加。",
    ],
    cascade_impacts: {
      S001: { primary_disruption: 22, secondary_cascade_prob: 36, affected_alternative: "国产 AI 芯片替代池", estimated_impact_days: 21 },
      S004: { primary_disruption: 10, secondary_cascade_prob: 18, affected_alternative: "自建数据中心", estimated_impact_days: 9 },
      S005: { primary_disruption: 8, secondary_cascade_prob: 15, affected_alternative: "第三方安全审计", estimated_impact_days: 6 },
    },
    assumptions: [
      "供应链在本案例中指数字基础设施、AI 算力、云资源和合规运营，不是制造业原材料。",
      "中断概率为演示参数，结合监管、出口管制、云资源与内容治理压力设定。",
    ],
    company_context: companyContext,
  }
}
