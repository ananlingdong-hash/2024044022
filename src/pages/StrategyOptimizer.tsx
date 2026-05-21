import { useCallback, useEffect, useState } from "react"
import ReactECharts from "echarts-for-react"
import { Bot, ChevronDown, ChevronUp, Shield, Scale, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { optimizeStrategy } from "@/api/risk-response"
import type { StrategyOptimizeResponse, StrategyOption } from "@/types/risk-response"

const typeMeta: Record<string, { icon: typeof Shield; label: string; color: string; bg: string; border: string }> = {
  conservative: { icon: Shield, label: "保守", color: "text-[var(--success)]", bg: "rgba(52,211,153,0.06)", border: "rgba(52,211,153,0.18)" },
  balanced: { icon: Scale, label: "平衡", color: "text-[var(--brand)]", bg: "rgba(165,153,240,0.06)", border: "rgba(165,153,240,0.18)" },
  aggressive: { icon: Zap, label: "激进", color: "text-[var(--warning)]", bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.18)" },
}

function formatCurrency(v: number) {
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
  return `${v}`
}

function StrategyCard({ s, expanded, onToggle }: { s: StrategyOption; expanded: boolean; onToggle: () => void }) {
  const meta = typeMeta[s.type] ?? typeMeta.balanced
  const Icon = meta.icon
  return (
    <Card variant="soft" padding="sm" style={{ borderColor: meta.border, background: meta.bg }}>
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={onToggle}>
        <div className="flex items-center gap-2.5">
          <Icon size={16} className={meta.color} />
          <div>
            <div className="text-sm font-semibold text-white tracking-[-0.01em]">{s.name}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{s.description.slice(0, 40)}...</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-[var(--text-muted)]">成本</div>
            <div className="text-xs font-mono tabular-nums text-white">{formatCurrency(s.cost)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[var(--text-muted)]">剩余风险</div>
            <div className="text-xs font-mono tabular-nums text-[var(--warning)]">{formatCurrency(s.residual_risk)}</div>
          </div>
          {expanded ? <ChevronUp size={14} className="text-[var(--text-muted)]" /> : <ChevronDown size={14} className="text-[var(--text-muted)]" />}
        </div>
      </div>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[rgba(139,132,190,0.08)] grid grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          <div><span className="text-[var(--text-muted)]">对冲比率</span><div className="text-white font-mono mt-0.5">{(s.hedge_ratio * 100).toFixed(0)}%</div></div>
          <div><span className="text-[var(--text-muted)]">信用额度</span><div className="text-white font-mono mt-0.5">{formatCurrency(s.credit_limit)}</div></div>
          <div><span className="text-[var(--text-muted)]">安全库存</span><div className="text-white font-mono mt-0.5">{s.safety_stock_days} 天</div></div>
          <div><span className="text-[var(--text-muted)]">详细描述</span><div className="text-[var(--text-secondary)] mt-0.5">{s.description}</div></div>
        </div>
      )}
    </Card>
  )
}

export function StrategyOptimizer() {
  const [riskAppetite, setRiskAppetite] = useState(500_000)
  const [budget, setBudget] = useState(2_000_000)
  const [timeWindow, setTimeWindow] = useState(90)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<StrategyOptimizeResponse | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const fetch = useCallback(async () => {
    setLoading(true)
    const res = await optimizeStrategy({ risk_appetite: riskAppetite, budget, time_window: timeWindow })
    setData(res)
    setLoading(false)
  }, [riskAppetite, budget, timeWindow])

  useEffect(() => { fetch() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return null

  const toggle = (t: string) => setExpanded(prev => ({ ...prev, [t]: !prev[t] }))

  // ── Gantt chart option ──
  const allTasks = [
    ...data.conservative.gantt.map(g => ({ ...g, strategy: "保守" })),
    ...data.balanced.gantt.map(g => ({ ...g, strategy: "平衡" })),
    ...data.aggressive.gantt.map(g => ({ ...g, strategy: "激进" })),
  ]
  const strategyNames = ["保守", "平衡", "激进"]
  const ganttOption = {
    backgroundColor: "transparent",
    grid: { top: 10, right: 30, bottom: 20, left: 60 },
    xAxis: { type: "value", name: "天数", nameTextStyle: { color: "#726d8c", fontSize: 10 }, axisLabel: { color: "#726d8c", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(139,132,190,0.06)" } } },
    yAxis: { type: "category", data: strategyNames, axisLabel: { color: "#b0acc6", fontSize: 10 }, axisLine: { lineStyle: { color: "rgba(139,132,190,0.10)" } } },
    series: [
      { type: "custom", renderItem: (_params: unknown, api: { value: (idx: number) => number; coord: (vals: [number, number]) => [number, number]; size: (vals: [number, number]) => [number, number]; visual: (key: string) => unknown }) => {
        const apiAny = api as { value: (idx: number) => number; coord: (vals: [number, number]) => [number, number]; size: (vals: [number, number]) => [number, number]; visual: (key: string) => unknown }
        const categoryIndex = apiAny.value(0)
        const startVal = apiAny.value(1)
        const endVal = apiAny.value(2)
        const start = apiAny.coord([startVal, categoryIndex])
        const end = apiAny.coord([endVal, categoryIndex])
        const height = (apiAny.size([0, 1])[1] as number) * 0.4
        const colors = ["#34d399", "#a599f0", "#fbbf24"]
        return { type: "rect", shape: { x: start[0], y: start[1] - height / 2, width: Math.max(end[0] - start[0], 4), height }, style: { fill: colors[categoryIndex] ?? "#a599f0", rx: 3, ry: 3 } }
      }, encode: { x: [1, 2], y: 0 }, data: [
        ...data.conservative.gantt.map(g => [0, g.start, g.end]),
        ...data.balanced.gantt.map(g => [1, g.start, g.end]),
        ...data.aggressive.gantt.map(g => [2, g.start, g.end]),
      ] },
    ],
    tooltip: {
      trigger: "item", backgroundColor: "rgba(22,18,42,0.95)", borderColor: "rgba(139,132,190,0.18)", textStyle: { color: "#eeecf7", fontSize: 11 },
      formatter: (p: { data: number[] }) => `${strategyNames[p.data[0]]} · T+${p.data[1]} → T+${p.data[2]}`,
    },
  }

  // ── Scatter chart ──
  const scatterOption = {
    backgroundColor: "transparent",
    grid: { top: 20, right: 20, bottom: 30, left: 60 },
    xAxis: { type: "value", name: "成本", nameTextStyle: { color: "#726d8c", fontSize: 10 }, axisLabel: { color: "#726d8c", fontSize: 10, formatter: (v: number) => formatCurrency(v) }, splitLine: { lineStyle: { color: "rgba(139,132,190,0.06)" } } },
    yAxis: { type: "value", name: "剩余风险", nameTextStyle: { color: "#726d8c", fontSize: 10 }, axisLabel: { color: "#726d8c", fontSize: 10, formatter: (v: number) => formatCurrency(v) }, splitLine: { lineStyle: { color: "rgba(139,132,190,0.06)" } } },
    series: [
      { name: "保守", type: "scatter", data: data.scatter_data.filter(d => d.type === "conservative").map(d => [d.cost, d.residual_risk]), symbolSize: 10, itemStyle: { color: "#34d399" } },
      { name: "平衡", type: "scatter", data: data.scatter_data.filter(d => d.type === "balanced").map(d => [d.cost, d.residual_risk]), symbolSize: 10, itemStyle: { color: "#a599f0" } },
      { name: "激进", type: "scatter", data: data.scatter_data.filter(d => d.type === "aggressive").map(d => [d.cost, d.residual_risk]), symbolSize: 10, itemStyle: { color: "#fbbf24" } },
    ],
    legend: { bottom: 0, textStyle: { color: "#726d8c", fontSize: 10 }, itemWidth: 8, itemHeight: 8 },
    tooltip: { trigger: "item", backgroundColor: "rgba(22,18,42,0.95)", borderColor: "rgba(139,132,190,0.18)", textStyle: { color: "#eeecf7", fontSize: 11 }, formatter: (p: { seriesName: string; data: number[] }) => `${p.seriesName}<br/>成本: ${formatCurrency(p.data[0])}<br/>剩余风险: ${formatCurrency(p.data[1])}` },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-white">策略优化引擎</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">多目标约束优化 · 三套方案对比 · 帕累托前沿</p>
      </div>

      {/* ── Controls ── */}
      <Card variant="soft" padding="sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[var(--text-muted)]">风险偏好额度</label>
            <Input size="sm" type="number" value={riskAppetite} onChange={e => setRiskAppetite(+e.target.value || 0)} className="w-36" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[var(--text-muted)]">预算上限</label>
            <Input size="sm" type="number" value={budget} onChange={e => setBudget(+e.target.value || 0)} className="w-36" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[var(--text-muted)]">时间窗口 (天)</label>
            <Input size="sm" type="number" value={timeWindow} onChange={e => setTimeWindow(+e.target.value || 1)} className="w-28" />
          </div>
          <Button size="sm" onClick={fetch} disabled={loading}>
            <Bot size={13} />
            {loading ? "优化中..." : "优化计算"}
          </Button>
        </div>
      </Card>

      {/* ── Strategy cards ── */}
      <div className="space-y-3">
        <StrategyCard s={data.conservative} expanded={!!expanded["conservative"]} onToggle={() => toggle("conservative")} />
        <StrategyCard s={data.balanced} expanded={!!expanded["balanced"]} onToggle={() => toggle("balanced")} />
        <StrategyCard s={data.aggressive} expanded={!!expanded["aggressive"]} onToggle={() => toggle("aggressive")} />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card variant="soft" padding="sm">
          <h3 className="text-xs font-semibold text-white tracking-[-0.01em] mb-2">策略甘特图</h3>
          <ReactECharts option={ganttOption} style={{ height: 220 }} />
        </Card>
        <Card variant="soft" padding="sm">
          <h3 className="text-xs font-semibold text-white tracking-[-0.01em] mb-2">成本 vs 剩余风险 (帕累托前沿)</h3>
          <ReactECharts option={scatterOption} style={{ height: 220 }} />
        </Card>
      </div>
    </div>
  )
}
