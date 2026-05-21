export interface SentimentReport {
  id: string
  generatedAt: string
  symbols: string[]
  marketSentiment: number
  summary: string
  stockScores: Array<{ symbol: string; score: number }>
  suggestion: string
  reportTitle: string
  eventHighlights: string[]
  recommendationBullets: string[]
  reportBody?: string
}

export interface BacktestResult {
  strategyName: string
  winRate: number
  sharpe: number
  maxDrawdown: number
  annualReturn: number
  reportText: string
  engine: string
}

export interface AIPromptPayload {
  task: string
  context: string
  model: "minimax-m2.7"
}
