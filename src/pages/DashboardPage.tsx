import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  Shield,
  Activity,
  Target,
  Layers,
  AlertTriangle,
  Zap,
  Brain,
  Clock3,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataSourceBadge } from "@/components/charts/v2/DataSourceBadge"
import { RiskTrendAreaChart } from "@/components/charts/v2/RiskTrendAreaChart"
import { RiskCompositionRoseChart } from "@/components/charts/v2/RiskCompositionRoseChart"
import { RealtimeCandleChart } from "@/components/charts/v2/RealtimeCandleChart"
import { StrategyRadarComparisonChart } from "@/components/charts/v2/StrategyRadarComparisonChart"
import { KpiBulletChart } from "@/components/charts/v2/KpiBulletChart"
import { useRiskWorkbenchData, subscribeRealtimeTick } from "@/features/v2/useRiskWorkbenchData"
import { useUIStore } from "@/lib/stores/uiStore"
import { useCountUp } from "@/hooks/useCountUp"

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
}

function RingProgress({ value, color, size = 68, strokeWidth = 3 }: { value: number; color: string; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const animated = useCountUp(value, 1500)
  const offset = circumference - (animated / 100) * circumference

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.3s linear", filter: `drop-shadow(0 0 6px ${color}66) drop-shadow(0 0 2px ${color}99)` }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center mono-metric text-sm font-bold" style={{ color }}>
        {animated}
      </span>
    </div>
  )
}

interface KpiSummaryItem {
  icon: LucideIcon
  label: string
  value: number
  unit: string
  color: string
  bg: string
  iconClr: string
  isFloat?: boolean
}

function KpiSummaryCard({ item, delay }: { item: KpiSummaryItem; delay: number }) {
  const animatedValue = useCountUp(Math.round(item.value * 10), 1200)

  return (
    <motion.div variants={fadeUp} transition={{ delay }}>
      <Card variant="cyber" padding="sm" className="glass-edge-glow h-full">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${item.bg}`}>
            <item.icon size={15} className={item.iconClr} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-[10px] text-[var(--text-muted)]">{item.label}</p>
            <p className="mono-metric text-2xl font-bold tracking-tight" style={{ color: item.color }}>
              {item.isFloat ? (animatedValue / 10).toFixed(1) : animatedValue / 10}
              {item.unit}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export function DashboardPage() {
  const { sourceMeta, riskTrend, priceTrend, breakdown, strategyRadar, kpiBullets, suggestionCards, firstSymbol, latestReport } =
    useRiskWorkbenchData()
  const upsertCards = useUIStore((state) => state.upsertSuggestionCards)

  useEffect(() => {
    if (suggestionCards.length) upsertCards(suggestionCards)
  }, [suggestionCards, upsertCards])

  const sentiment = latestReport?.marketSentiment ?? 55
  const gaugeColor = sentiment >= 70 ? "#34d399" : sentiment >= 45 ? "#fbbf24" : "#f87171"
  const sentimentDisplay = useCountUp(sentiment, 1500)
  const riskLevel = sentiment >= 70 ? "低风险" : sentiment >= 45 ? "中等风险" : "高风险"
  const aiRecommendation =
    sentiment < 58
      ? "建议进入平衡响应方案，优先覆盖监管合规与 AI 算力两类高权重风险因子。"
      : "当前整体风险可控，建议维持监测并对国际业务、广告回款和算力成本做滚动复核。"
  const riskPulse = sentiment < 58 ? "触发观察窗口" : "常规监控"
  const [chartBaseTime] = useState(() => Date.now())

  const candleRows = useMemo(
    () => priceTrend.map((item, idx) => ({ time: new Date(chartBaseTime - (50 - idx) * 60_000).toISOString(), price: item.value })),
    [chartBaseTime, priceTrend],
  )

  return (
    <motion.section initial="initial" animate="animate" className="mx-auto space-y-4" style={{ maxWidth: 1800 }}>
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-300/12 bg-[linear-gradient(135deg,rgba(99,102,241,0.25),rgba(79,84,221,0.12))] shadow-[0_0_18px_rgba(99,102,241,0.10)]">
            <BarChart3 size={16} className="text-indigo-200" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-[-0.02em]">Dashboard 总览</h1>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">风险全景 · 实时监控 · 策略对比</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="success" dot size="sm">系统正常</Badge>
            <DataSourceBadge meta={sourceMeta} />
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card variant="elevated" padding="lg" className="border-indigo-300/15 bg-[linear-gradient(135deg,rgba(22,18,42,0.92),rgba(10,18,30,0.88))]">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.25fr_0.85fr]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-400/[0.06] px-3 py-1 text-[11px] text-emerald-200">
                <Brain size={12} />
                风险哨兵 Agent 已接管
              </div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">总览指挥台</h2>
              <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                系统正把市场情绪、风险因子、场景信号与策略建议汇总成一个适合课堂展示的管理驾驶舱。
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "风险等级", value: riskLevel, icon: Shield, color: gaugeColor },
                { label: "处置状态", value: riskPulse, icon: AlertTriangle, color: sentiment < 58 ? "#fbbf24" : "#34d399" },
                { label: "爆发窗口", value: "52h", icon: Clock3, color: "#38bdf8" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text-muted)]">{item.label}</span>
                    <item.icon size={13} style={{ color: item.color }} />
                  </div>
                  <div className="mt-2 text-lg font-semibold tracking-[-0.02em]" style={{ color: item.color }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-indigo-300/14 bg-indigo-400/[0.045] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-indigo-100">
                <CheckCircle2 size={14} className="text-emerald-300" />
                AI 推荐动作
              </div>
              <p className="text-xs leading-5 text-[var(--text-secondary)]">{aiRecommendation}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#38bdf8,#a599f0,#fbbf24)]" style={{ width: `${Math.min(100, Math.max(20, sentiment))}%` }} />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div variants={fadeUp}>
          <Card variant="cyber" padding="sm" className="glass-edge-glow h-full">
            <div className="flex items-center gap-3">
              <RingProgress value={sentiment} color={gaugeColor} size={56} strokeWidth={3} />
              <div className="min-w-0">
                <p className="mb-0.5 text-[10px] text-[var(--text-muted)]">综合风险评分</p>
                <p className="mono-metric text-xl font-bold tracking-tight" style={{ color: gaugeColor }}>
                  {sentimentDisplay}
                </p>
                <p className="text-[10px] opacity-60" style={{ color: gaugeColor }}>
                  {riskLevel}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {([
          { icon: TrendingUp, label: "市场情绪", value: sentiment, unit: "", color: "#818cf8", bg: "bg-indigo-500/10 ring-indigo-300/15", iconClr: "text-indigo-300/80" },
          { icon: AlertTriangle, label: "活跃预警", value: sentiment < 58 ? 3 : 1, unit: "", color: sentiment < 58 ? "#fbbf24" : "#34d399", bg: sentiment < 58 ? "bg-amber-500/10 ring-amber-300/15" : "bg-emerald-500/10 ring-emerald-300/15", iconClr: sentiment < 58 ? "text-amber-300/80" : "text-emerald-300/80" },
          { icon: Zap, label: "组合 VaR (95%)", value: 4.8, unit: "%", color: "#818cf8", bg: "bg-indigo-500/10 ring-indigo-300/15", iconClr: "text-indigo-300/80", isFloat: true },
        ] satisfies KpiSummaryItem[]).map((kpi, i) => (
          <KpiSummaryCard key={kpi.label} item={kpi} delay={(i + 1) * 0.06} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <motion.div variants={fadeUp}>
            <Card variant="cyber" padding="lg" className="scan-line">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-300/15">
                    <TrendingUp size={13} className="text-indigo-300/80" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold tracking-[-0.01em]">风险趋势图</h2>
                    <p className="text-[10px] text-[var(--text-muted)]">全景投影 · 实时更新</p>
                  </div>
                </div>
                <Badge size="sm" variant="info" className="live-badge">LIVE</Badge>
              </div>
              <RiskTrendAreaChart points={riskTrend} />
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card variant="cyber" padding="lg">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-300/15">
                    <Activity size={13} className="text-emerald-300/80" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold tracking-[-0.01em]">实时波动监控</h2>
                    <p className="text-[10px] text-[var(--text-muted)]">{firstSymbol} · 分钟级序列</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="status-dot online animate-status-pulse" />
                  <span className="mono-metric text-[10px] text-[var(--text-muted)]">{firstSymbol}</span>
                </div>
              </div>
              <RealtimeCandleChart rows={candleRows} onTick={(cb) => subscribeRealtimeTick((tick) => cb(tick.price))} />
            </Card>
          </motion.div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-1">
          <motion.div variants={fadeUp}>
            <Card variant="cyber" padding="lg">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 ring-1 ring-rose-300/15">
                    <Shield size={13} className="text-rose-300/80" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold tracking-[-0.01em]">风险构成</h2>
                    <p className="text-[10px] text-[var(--text-muted)]">高权重因子分布</p>
                  </div>
                </div>
              </div>
              <RiskCompositionRoseChart data={breakdown} />
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card variant="cyber" padding="lg">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-300/15">
                    <Target size={13} className="text-amber-300/80" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold tracking-[-0.01em]">多目标策略对比</h2>
                    <p className="text-[10px] text-[var(--text-muted)]">稳健 / 平衡 / 增长</p>
                  </div>
                </div>
              </div>
              <StrategyRadarComparisonChart metrics={strategyRadar} />
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card variant="cyber" padding="lg">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-300/15">
                  <Layers size={13} className="text-violet-300/80" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-[-0.01em]">KPI 仪表板</h2>
                  <p className="text-[10px] text-[var(--text-muted)]">关键指标与目标对比</p>
                </div>
              </div>
            </div>
            <KpiBulletChart rows={kpiBullets} />
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="lg:col-span-1">
          <Card variant="cyber" padding="lg">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-300/15">
                <AlertTriangle size={13} className="text-indigo-300/80" />
              </div>
              <h2 className="text-sm font-semibold tracking-[-0.01em]">最新预警</h2>
            </div>
            <div className="space-y-2">
              {[
                { level: "high", text: "监管事项热度上升，建议启动专项复核", time: "5 分钟前" },
                { level: "mid", text: "AI 算力保障指数升至 61，需要检查替代池容量", time: "18 分钟前" },
                { level: "low", text: "商业信用指标保持稳定，回款节奏正常", time: "42 分钟前" },
                { level: "mid", text: "国际业务美元敞口偏高，建议复核短周期对冲", time: "1 小时前" },
              ].map((alert, i) => (
                <div key={i} className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 text-xs transition hover:border-white/[0.10]">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${alert.level === "high" ? "bg-rose-400 animate-status-pulse" : alert.level === "mid" ? "bg-amber-400" : "bg-emerald-400"}`} />
                      <span className="font-medium text-[var(--text)]">{alert.text}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)]">{alert.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  )
}
