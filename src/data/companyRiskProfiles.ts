export type CompanyRiskProfile = {
  id: string
  name: string
  nameEn: string
  status: string
  industry: string
  selected: boolean
  sourceNote: string
  metrics: {
    label: string
    value: string
    note: string
  }[]
  risks: {
    label: string
    value: string
    detail: string
    tone: "cyan" | "violet" | "amber" | "rose" | "emerald"
  }[]
}

export const companyRiskProfiles: CompanyRiskProfile[] = [
  {
    id: "tencent",
    name: "腾讯控股",
    nameEn: "Tencent Holdings",
    status: "上市公司 · 0700.HK · 2025 年经审核业绩",
    industry: "社交、游戏、广告、金融科技、企业服务、云与 AI",
    selected: true,
    sourceNote: "核心财务口径采用腾讯 2025 年经审核年度业绩公告；监管与业务风险采用年报、公告和公开信息整理。",
    metrics: [
      { label: "2025 营收", value: "¥7,518 亿", note: "官方公告，同比 +8%" },
      { label: "Non-IFRS 净利润", value: "¥2,596 亿", note: "官方公告，同比 +14%" },
      { label: "微信及 WeChat 月活", value: "14.18 亿", note: "官方披露，生态基本盘稳定" },
      { label: "资本开支", value: "¥768 亿", note: "官方公告，继续投入云与 AI 基础设施" },
    ],
    risks: [
      { label: "监管合规风险", value: "中高", detail: "游戏版号、未成年人保护、数据合规与金融科技监管持续影响经营节奏。", tone: "rose" },
      { label: "云与 AI 算力风险", value: "中高", detail: "GPU、数据中心、云资源和大模型推理成本抬升，影响腾讯云与混元能力建设。", tone: "amber" },
      { label: "国际化经营风险", value: "中", detail: "海外游戏、跨境支付与多币种收入带来汇率、政策与区域经营波动。", tone: "cyan" },
    ],
  },
]

export const activeCompanyProfile = companyRiskProfiles[0]
