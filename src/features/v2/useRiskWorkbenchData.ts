import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
import { fetchSentimentHistory } from "@/api/sentiment"
import { fetchLiveTicks, fetchWatchlist } from "@/api/market"
import { createMarketSocket } from "@/lib/ws"
import type { DataSourceMeta, KpiBullet, RiskBreakdown, RiskPoint, StrategyRadarMetric, SuggestionCard, SupplyLink, SupplyNode } from "@/types/v2"

function buildFallbackTimeSeries(): RiskPoint[] {
  const now = dayjs()
  return Array.from({ length: 48 }, (_, index) => {
    const i = 47 - index
    const t = now.subtract(i * 30, "minute")
    const trend = 58 + Math.sin(i / 7) * 12 + Math.sin(i / 3.2) * 7
    const shock = i > 24 && i < 33 ? 8 : 0
    const value = Math.round(Math.max(22, Math.min(92, trend + shock + (Math.random() - 0.5) * 8)))
    return { ts: t.format("HH:mm"), value }
  })
}

function stableNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
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

  const firstSymbol = watchlistQuery.data?.[0]?.symbol ?? "Tencent"

  const tickQuery = useQuery({
    queryKey: ["ticks-v2", firstSymbol],
    queryFn: () => fetchLiveTicks(firstSymbol),
    staleTime: 20_000,
    retry: 1,
    enabled: !!firstSymbol,
  })

  const latestReport = historyQuery.data?.[0]

  const sourceMeta: DataSourceMeta = {
    source: "公开资料/媒体估算",
    fetchedAt: new Date().toISOString(),
    isFallback: true,
    latencyMs: tickQuery.data ? 280 : 0,
  }

  const priceTrend: RiskPoint[] = useMemo(() => {
    const rows = tickQuery.data
    if (!rows?.length) {
      const now = dayjs()
      let indexValue = 300
      return Array.from({ length: 48 }, (_, idx) => {
        const t = now.subtract((47 - idx) * 30, "minute")
        indexValue += (stableNoise(idx + 11) - 0.46) * 3.8
        indexValue = Math.max(240, Math.min(360, indexValue))
        return { ts: t.format("HH:mm"), value: Number(indexValue.toFixed(2)) }
      })
    }
    return rows.slice(-48).map((row) => ({
      ts: dayjs(row.time).format("HH:mm"),
      value: row.price ?? (280 + stableNoise(row.time.length) * 40),
    }))
  }, [tickQuery.data])

  const riskTrend: RiskPoint[] = useMemo(() => {
    const rows = tickQuery.data
    if (!rows?.length) return buildFallbackTimeSeries()
    return rows.slice(-48).map((row, idx) => ({
      ts: dayjs(row.time).format("HH:mm"),
      value: Math.max(20, Math.min(95, 60 + Math.sin(idx / 4) * 16 + (stableNoise(idx + 29) - 0.5) * 10)),
    }))
  }, [tickQuery.data])

  const breakdown: RiskBreakdown[] = useMemo(() => {
    const score = latestReport?.marketSentiment ?? 68
    const regulation = Math.max(35, Math.min(55, 45 + Math.round((score - 60) * 0.3)))
    const compute = Math.max(24, Math.min(38, 31 + Math.round((score - 65) * 0.15)))
    const globalOps = Math.max(16, 100 - regulation - compute)
    return [
      { name: "监管合规风险", value: regulation },
      { name: "AI算力风险", value: compute },
      { name: "全球化经营风险", value: globalOps },
    ]
  }, [latestReport?.marketSentiment])

  const strategyRadar: StrategyRadarMetric[] = [
    { name: "合规确定性", conservative: 92, balanced: 78, aggressive: 55 },
    { name: "业务连续性", conservative: 70, balanced: 84, aggressive: 90 },
    { name: "算力保障", conservative: 88, balanced: 76, aggressive: 58 },
    { name: "成本效率", conservative: 42, balanced: 75, aggressive: 90 },
    { name: "舆情响应", conservative: 80, balanced: 86, aggressive: 65 },
  ]

  const supplyNodes: SupplyNode[] = [
    { id: "腾讯控股", category: "核心企业", risk: 62 },
    { id: "CMC监管", category: "一级风险节点", risk: 82 },
    { id: "AI算力池", category: "一级风险节点", risk: 70 },
    { id: "数据中心", category: "二级保障节点", risk: 46 },
    { id: "内容审核", category: "二级保障节点", risk: 54 },
  ]
  const supplyLinks: SupplyLink[] = [
    { source: "腾讯控股", target: "CMC监管", weight: 9 },
    { source: "腾讯控股", target: "AI算力池", weight: 8 },
    { source: "AI算力池", target: "数据中心", weight: 7 },
    { source: "CMC监管", target: "内容审核", weight: 8 },
    { source: "内容审核", target: "数据中心", weight: 4 },
  ]

  const kpiBullets: KpiBullet[] = [
    { name: "监管响应SLA", actual: 82, target: 90, threshold: 70 },
    { name: "AI算力备份覆盖", actual: 64, target: 75, threshold: 50 },
    { name: "内容安全拦截率", actual: 96, target: 98, threshold: 92 },
  ]

  const suggestionCards: SuggestionCard[] =
    (latestReport?.marketSentiment ?? 68) >= 60
      ? [{
          id: `tencent-risk-${latestReport?.id ?? "now"}`,
          title: "监管窗口触发：建议启动平衡响应",
          score: latestReport?.marketSentiment ?? 68,
          summary: "当前风险主要来自 CMC黑名单监管、游戏版号 与 AI 算力供应，建议优先复核高确定性合规动作。",
          actions: ["生成合规台账", "复核算力替代池", "48小时后复盘"],
        }]
      : []

  return {
    sourceMeta,
    firstSymbol,
    latestReport,
    riskTrend,
    priceTrend,
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
  const symbols = ["Tencent", "WeChat", "Douyin", "AI Compute"]
  let idx = 0
  let basePrice = 300 + Math.random() * 20

  const emit = () => {
    if (!active) return
    const symbol = symbols[idx % symbols.length]
    idx += 1
    basePrice += (Math.random() - 0.45) * 2.2
    basePrice = Math.max(240, Math.min(360, basePrice))
    onTick({ symbol, price: Number(basePrice.toFixed(2)), ts: Date.now() })
  }

  emit()
  const interval = setInterval(emit, 2000)

  const ws = createMarketSocket((payload) => {
    if (active) onTick(payload)
  })

  return () => {
    active = false
    clearInterval(interval)
    ws.close()
  }
}
