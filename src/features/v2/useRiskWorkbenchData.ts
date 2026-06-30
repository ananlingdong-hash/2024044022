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
    const trend = 56 + Math.sin(i / 7) * 10 + Math.sin(i / 3.2) * 6
    const shock = i > 24 && i < 33 ? 7 : 0
    const value = Math.round(Math.max(22, Math.min(92, trend + shock + (stableNoise(i + 5) - 0.5) * 8)))
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
    source: "腾讯公告/公开资料/课堂建模参数",
    fetchedAt: new Date().toISOString(),
    isFallback: true,
    latencyMs: tickQuery.data ? 280 : 0,
  }

  const priceTrend: RiskPoint[] = useMemo(() => {
    const rows = tickQuery.data
    if (!rows?.length) {
      const now = dayjs()
      let indexValue = 360
      return Array.from({ length: 48 }, (_, idx) => {
        const t = now.subtract((47 - idx) * 30, "minute")
        indexValue += (stableNoise(idx + 11) - 0.46) * 3.2
        indexValue = Math.max(300, Math.min(420, indexValue))
        return { ts: t.format("HH:mm"), value: Number(indexValue.toFixed(2)) }
      })
    }
    return rows.slice(-48).map((row) => ({
      ts: dayjs(row.time).format("HH:mm"),
      value: row.price ?? (350 + stableNoise(row.time.length) * 40),
    }))
  }, [tickQuery.data])

  const riskTrend: RiskPoint[] = useMemo(() => {
    const rows = tickQuery.data
    if (!rows?.length) return buildFallbackTimeSeries()
    return rows.slice(-48).map((row, idx) => ({
      ts: dayjs(row.time).format("HH:mm"),
      value: Math.max(20, Math.min(95, 58 + Math.sin(idx / 4) * 14 + (stableNoise(idx + 29) - 0.5) * 10)),
    }))
  }, [tickQuery.data])

  const breakdown: RiskBreakdown[] = useMemo(() => {
    const score = latestReport?.marketSentiment ?? 66
    const regulation = Math.max(34, Math.min(54, 43 + Math.round((score - 60) * 0.3)))
    const compute = Math.max(24, Math.min(38, 32 + Math.round((score - 64) * 0.18)))
    const globalOps = Math.max(16, 100 - regulation - compute)
    return [
      { name: "监管合规风险", value: regulation },
      { name: "AI算力风险", value: compute },
      { name: "全球化经营风险", value: globalOps },
    ]
  }, [latestReport?.marketSentiment])

  const strategyRadar: StrategyRadarMetric[] = [
    { name: "合规确定性", conservative: 91, balanced: 78, aggressive: 56 },
    { name: "业务连续性", conservative: 72, balanced: 84, aggressive: 89 },
    { name: "算力保障", conservative: 88, balanced: 76, aggressive: 58 },
    { name: "资本效率", conservative: 43, balanced: 75, aggressive: 90 },
    { name: "国际韧性", conservative: 74, balanced: 82, aggressive: 68 },
  ]

  const supplyNodes: SupplyNode[] = [
    { id: "腾讯控股", category: "核心企业", risk: 61 },
    { id: "监管事项", category: "一级风险节点", risk: 80 },
    { id: "云与AI算力", category: "一级风险节点", risk: 72 },
    { id: "数据中心", category: "二级保障节点", risk: 48 },
    { id: "内容安全", category: "二级保障节点", risk: 52 },
  ]

  const supplyLinks: SupplyLink[] = [
    { source: "腾讯控股", target: "监管事项", weight: 9 },
    { source: "腾讯控股", target: "云与AI算力", weight: 8 },
    { source: "云与AI算力", target: "数据中心", weight: 7 },
    { source: "监管事项", target: "内容安全", weight: 8 },
    { source: "内容安全", target: "数据中心", weight: 4 },
  ]

  const kpiBullets: KpiBullet[] = [
    { name: "监管响应 SLA", actual: 84, target: 90, threshold: 70 },
    { name: "AI 算力备份覆盖", actual: 66, target: 78, threshold: 52 },
    { name: "内容安全拦截率", actual: 96, target: 98, threshold: 92 },
  ]

  const suggestionCards: SuggestionCard[] =
    (latestReport?.marketSentiment ?? 66) >= 60
      ? [{
          id: `tencent-risk-${latestReport?.id ?? "now"}`,
          title: "腾讯风险窗口触发：建议启动平衡响应",
          score: latestReport?.marketSentiment ?? 66,
          summary: "当前风险主要来自监管事项、云与 AI 算力投入以及国际化业务波动，建议优先复核高确定性合规动作。",
          actions: ["生成监管台账", "复核算力保障池", "48小时后复盘"],
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
  const symbols = ["Tencent", "Weixin-Eco", "Tencent-Cloud", "Intl-Games"]
  let idx = 0
  let basePrice = 360 + Math.random() * 20

  const emit = () => {
    if (!active) return
    const symbol = symbols[idx % symbols.length]
    idx += 1
    basePrice += (Math.random() - 0.45) * 2.0
    basePrice = Math.max(300, Math.min(420, basePrice))
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
