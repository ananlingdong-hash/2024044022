export type DataSourceMeta = {
  source: string
  fetchedAt: string
  isFallback: boolean
  latencyMs: number
}

export type RiskPoint = {
  ts: string
  value: number
}

export type RiskBreakdown = {
  name: "监管合规风险" | "AI算力风险" | "全球化经营风险"
  value: number
}

export type StrategyRadarMetric = {
  name: string
  conservative: number
  balanced: number
  aggressive: number
}

export type SupplyNode = {
  id: string
  category: "核心企业" | "一级风险节点" | "二级保障节点"
  risk: number
}

export type SupplyLink = {
  source: string
  target: string
  weight: number
}

export type KpiBullet = {
  name: string
  actual: number
  target: number
  threshold: number
}

export type SuggestionCard = {
  id: string
  title: string
  score: number
  summary: string
  actions: string[]
}
