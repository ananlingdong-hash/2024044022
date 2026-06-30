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
    status: "上市公司 · 0700.HK · 2025年报",
    industry: "游戏、社交、广告、金融科技、云与企业服务",
    selected: true,
    sourceNote: "财务数据来自腾讯2025年经审核综合业绩公告（2026.3.18发布）；监管、风险因素来自年报披露及公开监管文件。",
    metrics: [
      { label: "2025营收", value: "¥7,518亿", note: "同比+14%，三大业务均增长" },
      { label: "净利润", value: "¥2,248亿", note: "Non-IFRS经调整¥2,596亿" },
      { label: "毛利率", value: "56%", note: "连续9季度提升，创历史新高" },
      { label: "微信MAU", value: "14.18亿", note: "WeChat合并月活，同比+2%" },
      { label: "国际游戏收入", value: "¥774亿", note: "首破$100亿，同比+33%" },
      { label: "AI研发投入", value: "¥857亿", note: "资本开支¥792亿创历史新高" },
    ],
    risks: [
      { label: "地缘政治风险", value: "高", detail: "2024.1被列入美国CMC军工黑名单；AI芯片出口管制升级；VIE结构合规不确定性", tone: "rose" },
      { label: "AI算力/供应链", value: "中高", detail: "GPU采购受限(管理层坦承'买不到卡')，资本开支仅¥792亿远低于字节的¥1,500亿", tone: "amber" },
      { label: "市场竞争加剧", value: "高", detail: "字节系用户时长占比37.4%首次超越腾讯30.0%；混元月活远超元宝；网易海外游戏挤压", tone: "rose" },
      { label: "游戏监管", value: "中", detail: "版号虽恢复但审查趋细；青少年防沉迷合规成本持续；每年20万款新游供过于求", tone: "amber" },
      { label: "投资回报不确定", value: "中", detail: "AI投入回报未验证；2026年大幅削减回购转投AI致股价大跌7%市值蒸发¥3,400亿", tone: "cyan" },
    ],
  },
  {
    id: "bytedance",
    name: "字节跳动",
    nameEn: "ByteDance",
    status: "非上市公司 · 公开资料/媒体估算",
    industry: "社交内容、广告、电商、AI 与企业服务",
    selected: false,
    sourceNote: "财务与估值采用公开媒体估算；监管、产品与用户数据采用官方/监管公开资料。",
    metrics: [
      { label: "2025营收估算", value: "$1,900亿+", note: "非上市口径，媒体估算" },
      { label: "估值区间", value: "$3,000-5,500亿", note: "二级市场/回购估值口径" },
      { label: "TikTok全球MAU", value: "20亿+", note: "官方披露" },
      { label: "核心产品矩阵", value: "8+", note: "抖音、TikTok、CapCut、飞书等" },
    ],
    risks: [
      { label: "监管合规风险", value: "高", detail: "美国TikTok法案、欧盟DSA、数据本地化与内容治理", tone: "rose" },
      { label: "AI 算力风险", value: "中高", detail: "GPU供应、云资源、训练/推理成本上行", tone: "amber" },
      { label: "全球化经营风险", value: "中", detail: "美元/欧元收入、TikTok Shop、跨境政策波动", tone: "cyan" },
    ],
  },
]

export const activeCompanyProfile = companyRiskProfiles.find((item) => item.selected) ?? companyRiskProfiles[0]
