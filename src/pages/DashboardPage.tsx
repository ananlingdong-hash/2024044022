import { useEffect } from "react"
import { BarChart3, TrendingUp, Shield, Activity, GitGraph, Target, Layers } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataSourceBadge } from "@/components/charts/v2/DataSourceBadge"
import { RiskTrendAreaChart } from "@/components/charts/v2/RiskTrendAreaChart"
import { RiskCompositionRoseChart } from "@/components/charts/v2/RiskCompositionRoseChart"
import { RealtimeCandleChart } from "@/components/charts/v2/RealtimeCandleChart"
import { StrategyRadarComparisonChart } from "@/components/charts/v2/StrategyRadarComparisonChart"
import { SupplyChainForceGraph } from "@/components/charts/v2/SupplyChainForceGraph"
import { KpiBulletChart } from "@/components/charts/v2/KpiBulletChart"
import { useRiskWorkbenchData, subscribeRealtimeTick } from "@/features/v2/useRiskWorkbenchData"
import { useUIStore } from "@/lib/stores/uiStore"

export function DashboardPage() {
  const { sourceMeta, riskTrend, breakdown, strategyRadar, supplyNodes, supplyLinks, kpiBullets, suggestionCards, firstSymbol } =
    useRiskWorkbenchData()
  const upsertCards = useUIStore((s) => s.upsertSuggestionCards)

  useEffect(() => {
    if (suggestionCards.length) upsertCards(suggestionCards)
  }, [suggestionCards, upsertCards])

  return (
    <section className="animate-stagger grid grid-cols-1 gap-4 xl:grid-cols-12">
      {/* Page header */}
      <div className="xl:col-span-12 mb-1">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(99,102,241,0.25),rgba(79,84,221,0.12))] border border-indigo-300/12 shadow-[0_0_18px_rgba(99,102,241,0.10)]">
            <BarChart3 size={16} className="text-indigo-200" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-[-0.02em]">Dashboard 总览</h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">风险全景 · 实时监控 · 策略对比</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="success" dot size="sm">系统正常</Badge>
            <DataSourceBadge meta={sourceMeta} />
          </div>
        </div>
      </div>

      {/* Row 1: Risk trend + composition */}
      <Card className="xl:col-span-8" variant="default" padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-300/15">
              <TrendingUp size={13} className="text-indigo-300/80" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-[-0.01em]">风险趋势图</h2>
              <p className="text-[10px] text-[var(--text-muted)]">平滑面积 · 实时更新</p>
            </div>
          </div>
          <Badge size="sm" variant="info">LIVE</Badge>
        </div>
        <RiskTrendAreaChart points={riskTrend} />
      </Card>

      <Card className="xl:col-span-4" variant="elevated" padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 ring-1 ring-rose-300/15">
              <Shield size={13} className="text-rose-300/80" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-[-0.01em]">风险构成</h2>
              <p className="text-[10px] text-[var(--text-muted)]">南丁格尔玫瑰图</p>
            </div>
          </div>
        </div>
        <RiskCompositionRoseChart data={breakdown} />
      </Card>

      {/* Row 2: Realtime + Strategy */}
      <Card className="xl:col-span-7" variant="default" padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-300/15">
              <Activity size={13} className="text-emerald-300/80" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-[-0.01em]">实时波动监控</h2>
              <p className="text-[10px] text-[var(--text-muted)]">{firstSymbol} · K线序列</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-dot online animate-status-pulse" />
            <span className="text-[10px] text-[var(--text-muted)] mono-metric">{firstSymbol}</span>
          </div>
        </div>
        <RealtimeCandleChart rows={riskTrend.map((x, idx) => ({ time: new Date(Date.now() - (50 - idx) * 60_000).toISOString(), price: x.value }))} onTick={(cb) => subscribeRealtimeTick((tick) => cb(tick.price))} />
      </Card>

      <Card className="xl:col-span-5" variant="default" padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-300/15">
              <Target size={13} className="text-amber-300/80" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-[-0.01em]">多目标优化对比</h2>
              <p className="text-[10px] text-[var(--text-muted)]">雷达图</p>
            </div>
          </div>
        </div>
        <StrategyRadarComparisonChart metrics={strategyRadar} />
      </Card>

      {/* Row 3: Supply chain + KPI */}
      <Card className="xl:col-span-7" variant="default" padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 ring-1 ring-sky-300/15">
              <GitGraph size={13} className="text-sky-300/80" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-[-0.01em]">供应链关系</h2>
              <p className="text-[10px] text-[var(--text-muted)]">力导向图</p>
            </div>
          </div>
        </div>
        <SupplyChainForceGraph nodes={supplyNodes} links={supplyLinks} />
      </Card>

      <Card className="xl:col-span-5" variant="default" padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-300/15">
              <Layers size={13} className="text-violet-300/80" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-[-0.01em]">KPI 仪表盘</h2>
              <p className="text-[10px] text-[var(--text-muted)]">子弹图</p>
            </div>
          </div>
        </div>
        <KpiBulletChart rows={kpiBullets} />
      </Card>
    </section>
  )
}
