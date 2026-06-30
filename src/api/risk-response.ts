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
      factors: params.factors ?? ["监管合规", "AI算力", "国际化经营"],
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
  ticker: "0700.HK",
  fiscal_year: 2025,
  headline: "基于腾讯公开披露、官方运营数据与课堂建模参数构建的风险监管样例",
  key_metrics: {
    "2025营收": "¥7,518 亿",
    "Non-IFRS净利润": "¥2,596 亿",
    "微信及WeChat月活": "14.18 亿",
    "公司状态": "上市公司",
  },
  data_source: "腾讯 2025 年经审核年度业绩公告、年度报告、公开运营数据与监管公开信息",
  disclaimer: "腾讯为上市公司，核心财务指标优先采用官方披露；部分压力测试参数、PD/LGD 与中断概率为课堂演示建模参数。",
}

function fallbackRiskEvaluate(): RiskEvaluateResponse {
  return {
    risk_score: 66.0,
    trend: "上升",
    probability_distribution: Array.from({ length: 31 }, (_, i) => ({
      x: +(36 + i * 2).toFixed(1),
      y: +Math.max(0, 100 - ((i - 15) ** 2) / 2.9).toFixed(2),
    })),
    var_table: [
      { method: "监管压力测试", confidence: "95%", value: 3.12 },
      { method: "蒙特卡洛模拟", confidence: "95%", value: 2.76 },
      { method: "历史事件法", confidence: "95%", value: 2.34 },
      { method: "监管压力测试", confidence: "99%", value: 4.65 },
      { method: "蒙特卡洛模拟", confidence: "99%", value: 4.06 },
      { method: "历史事件法", confidence: "99%", value: 3.58 },
    ],
    factor_contributions: [
      { factor: "监管合规", contribution: 43.0, description: "游戏版号、未成年人保护、数据合规与金融科技监管仍是腾讯当前最高权重风险因子。" },
      { factor: "AI算力", contribution: 32.0, description: "腾讯云、混元大模型、推荐系统和内容安全模型依赖高性能算力与数据中心资源。" },
      { factor: "国际化经营", contribution: 25.0, description: "国际游戏、跨境支付与多币种收入带来汇率、政策与区域经营波动。" },
    ],
    time_sensitivity_hours: 52.0,
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
      name: "合规防御方案",
      type: "conservative",
      cost: 2_650_000,
      residual_risk: 88_000,
      hedge_ratio: 0.88,
      credit_limit: 520_000,
      safety_stock_days: 45,
      description: "优先压降监管与算力尾部风险，适合重大监管窗口或资本开支高峰前。",
      gantt: buildGantt("合规防御", tw),
      actions: ["建立监管事项专项台账", "云与 AI 算力双供应锁定", "国际业务压力测试前置"],
    },
    balanced: {
      name: "平衡响应方案",
      type: "balanced",
      cost: 1_720_000,
      residual_risk: 172_000,
      hedge_ratio: 0.66,
      credit_limit: 860_000,
      safety_stock_days: 28,
      description: "兼顾合规确定性与业务连续性，适合课堂展示中的主推荐方案。",
      gantt: buildGantt("平衡响应", tw),
      actions: ["48小时监管事项复核", "算力保障池切换演练", "国际游戏与广告业务月度复盘"],
    },
    aggressive: {
      name: "增长优先方案",
      type: "aggressive",
      cost: 760_000,
      residual_risk: 405_000,
      hedge_ratio: 0.34,
      credit_limit: 1_280_000,
      safety_stock_days: 14,
      description: "保留更高业务投入效率，仅覆盖极端监管与资源断供风险。",
      gantt: buildGantt("增长优先", tw),
      actions: ["保留核心业务投放节奏", "仅覆盖尾部风险", "降低短期资源冗余成本"],
    },
    scatter_data: [
      { name: "合规防御方案", type: "conservative", cost: 2_650_000, residual_risk: 88_000 },
      { name: "平衡响应方案", type: "balanced", cost: 1_720_000, residual_risk: 172_000 },
      { name: "增长优先方案", type: "aggressive", cost: 760_000, residual_risk: 405_000 },
      { name: "防御-轻量版", type: "conservative", cost: 2_180_000, residual_risk: 126_000 },
      { name: "平衡-算力优先", type: "balanced", cost: 1_520_000, residual_risk: 210_000 },
      { name: "增长-极简版", type: "aggressive", cost: 620_000, residual_risk: 465_000 },
    ],
  }
}

function fallbackKpi() {
  return {
    kpis: [
      { name: "regulatory_response_sla", actual: 0.84, target: 0.90, threshold: 0.70, unit: "%", status: "warning" },
      { name: "content_safety_intercept_rate", actual: 0.998, target: 0.999, threshold: 0.995, unit: "%", status: "normal" },
      { name: "ai_compute_backup_coverage", actual: 0.66, target: 0.78, threshold: 0.52, unit: "%", status: "warning" },
      { name: "ad_receivable_overdue_rate", actual: 0.019, target: 0.015, threshold: 0.035, unit: "%", status: "warning" },
      { name: "fx_hedge_coverage", actual: 0.61, target: 0.68, threshold: 0.40, unit: "%", status: "normal" },
    ],
    period: "T+15",
  }
}

function fallbackEvents(): { events: RiskEventItem[] } {
  const types = ["监管审查", "数据合规", "AI算力波动", "汇率波动", "内容安全", "国际经营政策"]
  const severities = ["medium", "high", "critical", "medium"]
  const regions = [
    { r: "中国", lat: 35, lng: 105 },
    { r: "中国香港", lat: 22.3, lng: 114.2 },
    { r: "美国", lat: 38, lng: -97 },
    { r: "欧洲", lat: 50, lng: 10 },
    { r: "东南亚", lat: 10, lng: 106 },
  ]
  return {
    events: Array.from({ length: 20 }, (_, i) => {
      const reg = regions[i % regions.length]
      const type = types[i % types.length]
      return {
        id: `tx-evt-${i}`,
        type,
        severity: severities[i % severities.length],
        region: reg.r,
        lat: reg.lat + (Math.random() - 0.5) * 10,
        lng: reg.lng + (Math.random() - 0.5) * 10,
        description: `${reg.r}${type}信号触发，已进入腾讯风险监管台账。`,
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
      {
        currency: "USD",
        exposure: 182_000_000_000,
        hedge_ratio: 0.61,
        hedge_cost: 1_120_000_000,
        period_30d: 86_000_000_000,
        period_60d: 61_000_000_000,
        period_90d: 35_000_000_000,
        unhedged_pnl: series(0, 14_000_000, 420_000_000),
        hedged_pnl: series(0, 4_000_000, 120_000_000),
        historical_vol: 6.8,
        implied_vol: 7.9,
        vol_spread_pct: 16,
      },
      {
        currency: "EUR",
        exposure: 58_000_000_000,
        hedge_ratio: 0.47,
        hedge_cost: 420_000_000,
        period_30d: 25_000_000_000,
        period_60d: 20_000_000_000,
        period_90d: 13_000_000_000,
        unhedged_pnl: series(0, 7_000_000, 200_000_000),
        hedged_pnl: series(0, 2_000_000, 72_000_000),
        historical_vol: 6.1,
        implied_vol: 7.2,
        vol_spread_pct: 18,
      },
      {
        currency: "JPY/SEA",
        exposure: 44_000_000_000,
        hedge_ratio: 0.36,
        hedge_cost: 260_000_000,
        period_30d: 18_000_000_000,
        period_60d: 15_000_000_000,
        period_90d: 11_000_000_000,
        unhedged_pnl: series(0, 5_000_000, 160_000_000),
        hedged_pnl: series(0, 1_800_000, 60_000_000),
        historical_vol: 8.7,
        implied_vol: 10.5,
        vol_spread_pct: 21,
      },
    ],
    total_exposure: 284_000_000_000,
    coverage_ratio: 0.57,
    alerts: [
      "国际游戏与海外支付业务的美元收入需要与资本开支计划联动压力测试。",
      "欧洲合规要求增加了数据、本地化与内容治理成本，建议设置专项预算阈值。",
      "东南亚跨境支付与国际业务增速较快，本币波动需要周度复核。",
    ],
    natural_hedge_scores: {
      USD: { match_score: 62, net_receivable: 182_000_000_000, net_payable: 78_000_000_000, recommendation: "国际游戏收入与云资源采购存在部分自然对冲，仍建议远期覆盖核心敞口。" },
      EUR: { match_score: 48, net_receivable: 58_000_000_000, net_payable: 22_000_000_000, recommendation: "欧洲合规与内容治理成本可以抵消部分收入敞口，但尾部波动仍需单独处理。" },
      SEA: { match_score: 41, net_receivable: 24_000_000_000, net_payable: 10_000_000_000, recommendation: "国际支付与商家回款周期存在错配，建议提升本币监控频率。" },
    },
    assumptions: [
      "币种敞口按腾讯国际游戏、跨境支付与企业服务公开业务特征估算。",
      "对冲成本按国际收入与云资源结算现金流综合估算。",
      "监管事件造成的现金流波动通过压力测试折算至 VaR。",
    ],
    company_context: companyContext,
  }
}

function fallbackCredit(): ScenarioCreditResponse {
  return {
    pd_lgd_table: [
      { borrower: "大型品牌广告主", pd: 0.017, lgd: 0.21, ead: 11_500_000_000, raroc: 0.24, rating: "AA-", sentiment: 2, cox_pd: 0.019 },
      { borrower: "中小广告主长尾池", pd: 0.072, lgd: 0.35, ead: 7_800_000_000, raroc: 0.13, rating: "BBB", sentiment: -1, cox_pd: 0.089 },
      { borrower: "企业服务客户", pd: 0.026, lgd: 0.28, ead: 5_200_000_000, raroc: 0.19, rating: "A", sentiment: 1, cox_pd: 0.029 },
      { borrower: "跨境支付商户池", pd: 0.081, lgd: 0.38, ead: 4_300_000_000, raroc: 0.12, rating: "BBB-", sentiment: -1, cox_pd: 0.096 },
      { borrower: "游戏联运合作方", pd: 0.038, lgd: 0.29, ead: 3_600_000_000, raroc: 0.17, rating: "A-", sentiment: 0, cox_pd: 0.043 },
      { borrower: "本地生活与小程序商家", pd: 0.059, lgd: 0.33, ead: 2_900_000_000, raroc: 0.15, rating: "BBB+", sentiment: 0, cox_pd: 0.065 },
    ],
    portfolio_npl_forecast: Array.from({ length: 12 }, (_, i) => +(0.017 + i * 0.001 + (Math.random() - 0.5) * 0.003).toFixed(4)),
    optimization_suggestions: [
      "跨境支付商户池 PD 上行，建议提高高波动区域保证金与结算审核频率。",
      "大型品牌广告主 RAROC 最高，可保留较高额度并绑定季度回款监控。",
      "企业服务客户风险整体可控，但需结合云业务合同周期动态调整信用额度。",
    ],
    sentiment_triggers: [
      "广告预算削减新闻热度上升时，自动上调中小广告主 PD。",
      "区域支付政策变化触发跨境商户保证金复核。",
    ],
    assumptions: [
      "PD/LGD 为课堂演示模型参数，按广告主、企业服务与商户类型估算。",
      "舆情触发项通过关键词热度影响 Cox 调整 PD。",
    ],
    company_context: companyContext,
  }
}

function fallbackSupply(): ScenarioSupplyResponse {
  const days = Array.from({ length: 60 }, (_, i) => i + 1)
  return {
    suppliers: [
      { id: "S001", name: "NVIDIA GPU 算力", category: "AI芯片", disruption_prob: 0.21, lead_time_days: 90, safety_stock_recommendation: 3, is_alternative: false, geo_region: "美国/全球", geo_score: 32, switching_cost: 520_000_000, composite_score: 59 },
      { id: "S002", name: "国产 AI 芯片替代池", category: "AI芯片-备选", disruption_prob: 0.14, lead_time_days: 60, safety_stock_recommendation: 2, is_alternative: true, geo_region: "中国", geo_score: 78, switching_cost: 360_000_000, composite_score: 67 },
      { id: "S003", name: "腾讯云数据中心", category: "基础设施", disruption_prob: 0.06, lead_time_days: 30, safety_stock_recommendation: 4, is_alternative: false, geo_region: "中国/东南亚", geo_score: 84, switching_cost: 180_000_000, composite_score: 83 },
      { id: "S004", name: "全球云与 CDN", category: "云资源", disruption_prob: 0.10, lead_time_days: 14, safety_stock_recommendation: 3, is_alternative: false, geo_region: "全球", geo_score: 76, switching_cost: 120_000_000, composite_score: 74 },
      { id: "S005", name: "内容安全运营团队", category: "合规运营", disruption_prob: 0.08, lead_time_days: 7, safety_stock_recommendation: 5, is_alternative: false, geo_region: "全球", geo_score: 80, switching_cost: 60_000_000, composite_score: 79 },
      { id: "S006", name: "第三方安全审计", category: "合规服务-备选", disruption_prob: 0.12, lead_time_days: 21, safety_stock_recommendation: 2, is_alternative: true, geo_region: "中国香港/海外", geo_score: 62, switching_cost: 80_000_000, composite_score: 69 },
    ],
    disruption_forecast: days.map((d) => ({ day: d, probability: +(0.08 + d * 0.0022 + (Math.random() - 0.5) * 0.018).toFixed(3) })),
    material_price_index: days.map((d) => ({ day: d, index: +(100 + d * 0.42 + Math.sin(d / 6) * 2.8).toFixed(1) })),
    suggestions: [
      "建立 GPU、国产替代、腾讯云与自建数据中心的多层算力保障池。",
      "针对监管与内容治理事项，提前排班内容安全和第三方审计资源。",
      "在国际游戏与混元推理高峰期设置算力冗余阈值，避免业务峰值与监管事件叠加。",
    ],
    cascade_impacts: {
      S001: { primary_disruption: 21, secondary_cascade_prob: 34, affected_alternative: "国产 AI 芯片替代池", estimated_impact_days: 21 },
      S004: { primary_disruption: 10, secondary_cascade_prob: 18, affected_alternative: "腾讯云数据中心", estimated_impact_days: 9 },
      S005: { primary_disruption: 8, secondary_cascade_prob: 14, affected_alternative: "第三方安全审计", estimated_impact_days: 6 },
    },
    assumptions: [
      "供应风险在本案例中指数字基础设施、AI 算力、云资源和合规运营，不是制造业原材料。",
      "中断概率为课堂演示参数，结合监管、出口管制、云资源与内容治理压力设定。",
    ],
    company_context: companyContext,
  }
}
