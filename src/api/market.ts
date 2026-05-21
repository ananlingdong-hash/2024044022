import { http } from "@/api/http"

export async function fetchWatchlist() {
  const result = await http.get("/market/watchlist")
  return result.data as Array<{ symbol: string; name: string }>
}

export async function fetchLiveTicks(symbol: string) {
  const result = await http.get(`/market/ticks/${symbol}`)
  return result.data as Array<{ time: string; price: number }>
}

export async function submitBacktest(payload: {
  strategyCode: string
  symbols: string[]
  strategyName?: string
  dataSource?: "tushare" | "csv"
  tsCode?: string
  startDate?: string
  endDate?: string
  csvPath?: string
}) {
  const result = await http.post("/quant/backtest", payload)
  return result.data as {
    winRate: number
    annualReturn: number
    sharpe: number
    maxDrawdown: number
    reportText: string
    engine: string
  }
}
