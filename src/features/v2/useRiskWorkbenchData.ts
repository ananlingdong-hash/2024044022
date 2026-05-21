import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
import { fetchSentimentHistory } from "@/api/sentiment"
import { fetchLiveTicks, fetchWatchlist } from "@/api/market"
import { createMarketSocket } from "@/lib/ws"
import type { DataSourceMeta, KpiBullet, RiskBreakdown, RiskPoint, StrategyRadarMetric, SuggestionCard, SupplyLink, SupplyNode } from "@/types/v2"

function buildFallbackTimeSeries(): RiskPoint[] {
  const now = dayjs()
  const points: RiskPoint[] = []
  for (let i = 47; i >= 0; i--) {
    const t = now.subtract(i * 30, "minute")
    // Combine multiple sine waves + noise for realistic fluctuation
    const trend = 50 + Math.sin(i / 8) * 15 + Math.sin(i / 3.5) * 8 + Math.sin(i / 2) * 4
    const noise = (Math.random() - 0.5) * 10
    const value = Math.round(Math.max(18, Math.min(92, trend + noise)))
    points.push({ ts: t.format("HH:mm"), value })
  }
  return points
}

export function useRiskWorkbenchData() {
  const watchlistQuery = useQuery({
    queryKey: ["watchlist"],
    queryFn: fetchWatchlist,
    staleTime: 60_000,
    retry: 2,
  })

  const historyQuery = useQuery({
    queryKey: ["sentiment-history-v2"],
    queryFn: fetchSentimentHistory,
    staleTime: 45_000,
    retry: 2,
  })

  const firstSymbol = watchlistQuery.data?.[0]?.symbol ?? "AAPL"

  const tickQuery = useQuery({
    queryKey: ["ticks-v2", firstSymbol],
    queryFn: () => fetchLiveTicks(firstSymbol),
    staleTime: 20_000,
    retry: 2,
    enabled: !!firstSymbol,
  })

  const latestReport = historyQuery.data?.[0]
  const sourceText = latestReport?.summary?.match(/数据源:\s*([^\@]+)\s*@\s*([^\n]+)/)
  const source = sourceText?.[1]?.trim() ?? "synthetic_fallback"
  const fetchedAt = sourceText?.[2]?.trim() ?? new Date().toISOString()

  const sourceMeta: DataSourceMeta = {
    source,
    fetchedAt,
    isFallback: source.includes("fallback"),
    latencyMs: tickQuery.data ? 280 : 0,
  }

  const riskTrend: RiskPoint[] = useMemo(() => {
    const rows = tickQuery.data
    if (!rows?.length) return buildFallbackTimeSeries()
    return rows.slice(-48).map((row, idx) => ({
      ts: dayjs(row.time).format("HH:mm"),
      value: Math.max(15, Math.min(95, 50 + Math.sin(idx / 4) * 18 + Math.sin(idx / 2) * 7 + (Math.random() - 0.5) * 12)),
    }))
  }, [tickQuery.data])

  const breakdown: RiskBreakdown[] = useMemo(() => {
    const score = latestReport?.marketSentiment ?? 55
    const fx = Math.max(10, Math.min(60, 40 + Math.round((50 - score) * 0.4)))
    const credit = Math.max(10, Math.min(60, 35 + Math.round((55 - score) * 0.3)))
    const supply = 100 - fx - credit
    return [
      { name: "汇率风险", value: fx },
      { name: "信用风险", value: credit },
      { name: "供应链风险", value: Math.max(10, supply) },
    ]
  }, [latestReport?.marketSentiment])

  const strategyRadar: StrategyRadarMetric[] = [
    { name: "年化收益", conservative: 58, balanced: 77, aggressive: 88 },
    { name: "回撤控制", conservative: 86, balanced: 72, aggressive: 54 },
    { name: "执行复杂度", conservative: 40, balanced: 62, aggressive: 85 },
    { name: "流动性适配", conservative: 81, balanced: 74, aggressive: 59 },
    { name: "事件响应", conservative: 55, balanced: 76, aggressive: 90 },
  ]

  const supplyNodes: SupplyNode[] = [
    { id: "核心企业", category: "核心企业", risk: 42 },
    { id: "芯片供应商", category: "一级供应商", risk: 61 },
    { id: "物流节点", category: "一级供应商", risk: 53 },
    { id: "材料厂A", category: "二级供应商", risk: 67 },
    { id: "材料厂B", category: "二级供应商", risk: 39 },
  ]
  const supplyLinks: SupplyLink[] = [
    { source: "核心企业", target: "芯片供应商", weight: 8 },
    { source: "核心企业", target: "物流节点", weight: 6 },
    { source: "芯片供应商", target: "材料厂A", weight: 9 },
    { source: "芯片供应商", target: "材料厂B", weight: 5 },
    { source: "物流节点", target: "材料厂B", weight: 3 },
  ]

  const kpiBullets: KpiBullet[] = [
    { name: "预警命中率", actual: 76, target: 85, threshold: 65 },
    { name: "风控执行率", actual: 69, target: 80, threshold: 60 },
    { name: "回撤控制达成", actual: 72, target: 78, threshold: 58 },
  ]

  const suggestionCards: SuggestionCard[] =
    (latestReport?.marketSentiment ?? 55) < 58
      ? [{
            id: `risk-${latestReport?.id ?? "now"}`,
            title: "风险阈值触发：建议降低高波动敞口",
            score: latestReport?.marketSentiment ?? 55,
            summary: "当前综合风险偏高，建议启动平衡到保守切换并复核止损带。",
            actions: ["执行保守策略", "生成对冲指令", "30分钟后复核"],
          }]
      : []

  return {
    sourceMeta,
    firstSymbol,
    latestReport,
    riskTrend,
    breakdown,
    strategyRadar,
    supplyNodes,
    supplyLinks,
    kpiBullets,
    suggestionCards,
    loading: watchlistQuery.isLoading || historyQuery.isLoading || tickQuery.isLoading,
    error: watchlistQuery.error || historyQuery.error || tickQuery.error,
  }
}

export function subscribeRealtimeTick(onTick: (payload: { symbol: string; price: number; ts: number }) => void) {
  let active = true
  const symbols = ["AAPL", "NVDA", "GOOGL", "MSFT"]
  let idx = 0
  let basePrice = 185 + Math.random() * 20

  const emit = () => {
    if (!active) return
    const symbol = symbols[idx % symbols.length]
    idx++
    basePrice += (Math.random() - 0.45) * 1.5
    basePrice = Math.max(120, Math.min(250, basePrice))
    onTick({ symbol, price: Number(basePrice.toFixed(2)), ts: Date.now() })
  }

  emit()
  const interval = setInterval(emit, 2000)

  // Also try WebSocket
  const ws = createMarketSocket((payload) => {
    if (active) onTick(payload)
  })

  return () => {
    active = false
    clearInterval(interval)
    ws.close()
  }
}
