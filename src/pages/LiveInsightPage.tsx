import { useEffect, useState } from "react"
import ReactECharts from "echarts-for-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchLiveTicks, fetchWatchlist } from "@/api/market"
import { createMarketSocket } from "@/lib/ws"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, TrendingUp, Zap } from "lucide-react"

export function LiveInsightPage() {
  const [watchlist, setWatchlist] = useState<Array<{ symbol: string; name: string }>>([])
  const [latestTick, setLatestTick] = useState<{ symbol: string; price: number; ts: number } | null>(null)
  const [historyTicks, setHistoryTicks] = useState<Array<{ time: string; price: number }>>([])
  const [loading, setLoading] = useState(true)

  const [watchlistError, setWatchlistError] = useState(false)

  useEffect(() => {
    fetchWatchlist().then(setWatchlist).catch(() => { setWatchlistError(true); setLoading(false) }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (watchlist.length === 0) return
    fetchLiveTicks(watchlist[0].symbol).then(setHistoryTicks).catch(() => undefined)
    const ws = createMarketSocket((payload) => { setLatestTick(payload) })
    return () => ws.close()
  }, [watchlist])

  const eliteSeriesDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
  const eliteStrategySeries = [
    { name: "桥水宏观轮动", data: [0.6, 1.1, 1.8, 2.1, 2.8, 3.7, 4.2], color: "#818cf8" },
    { name: "文艺复兴短频动量", data: [0.9, 1.4, 2.6, 3.1, 4.2, 5.3, 6.8], color: "#38bdf8" },
    { name: "高瓴成长精选", data: [0.4, 0.8, 1.3, 1.9, 2.5, 3.0, 3.5], color: "#34d399" },
    { name: "达里奥全天候基金", data: [0.3, 0.7, 1.2, 1.6, 2.0, 2.6, 3.1], color: "#fbbf24" },
    { name: "索罗斯事件驱动", data: [0.2, 0.6, 1.5, 2.8, 3.4, 4.7, 5.5], color: "#fb7185" },
  ]

  const strategyDetails = [
    { name: "Bridgewater 宏观轮动（基金）", ret: "+4.2%", logic: "通胀预期回落 + 风险资产修复，仓位切换节奏稳定" },
    { name: "Renaissance 短频动量（股票）", ret: "+6.8%", logic: "高流动性标的短周期趋势强化，回撤控制优异" },
    { name: "高瓴基本面成长（股票）", ret: "+3.5%", logic: "盈利兑现 + 估值切换双驱动，偏中长线持有" },
    { name: "达里奥全天候基金（基金）", ret: "+3.1%", logic: "多资产风险平价，利用相关性分散波动" },
    { name: "索罗斯事件驱动（股票）", ret: "+5.5%", logic: "政策与宏观事件窗口下的快进快出交易" },
  ]

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {/* Main chart */}
      <Card variant="cyber" className="lg:col-span-2 scan-line" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-300/15">
            <TrendingUp size={13} className="text-indigo-300/80" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-[-0.01em]">实盘透视室</h2>
            <p className="text-[10px] text-[var(--text-muted)]">REST + WebSocket 实时推送</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant="brand" size="sm">趋势跟随</Badge>
          <Badge variant="success" size="sm">胜率 58%</Badge>
          <Badge variant="info" size="sm">盈亏比 1.92</Badge>
          {latestTick ? <Badge variant="success" size="sm" className="live-badge">LIVE {latestTick.symbol} {latestTick.price}</Badge> : <Badge variant="info" size="sm" className="live-badge">LIVE</Badge>}
        </div>
        <ReactECharts
          option={{
            backgroundColor: "transparent",
            tooltip: { trigger: "axis", borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(16,16,24,0.95)", textStyle: { fontSize: 11 } },
            grid: { left: 12, right: 12, top: 8, bottom: 12, containLabel: true },
            xAxis: { type: "category", data: historyTicks.slice(-30).map((_, idx) => `${idx + 1}`), axisLabel: { color: "#71717a", fontSize: 10 }, axisLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } } },
            yAxis: { type: "value", axisLabel: { color: "#71717a", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } } },
            series: [{
              type: "line", smooth: true, showSymbol: false, data: historyTicks.slice(-30).map((x) => x.price),
              lineStyle: { color: "#818cf8", width: 2 },
              areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(129,140,248,0.30)" }, { offset: 1, color: "rgba(129,140,248,0.02)" }] } },
            }],
          }}
          style={{ height: 220 }}
        />
      </Card>

      {/* Strategy comparison */}
      <Card className="lg:col-span-1" variant="cyber" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-300/15">
            <Zap size={13} className="text-amber-300/80" />
          </div>
          <h2 className="text-sm font-semibold tracking-[-0.01em]">高手实盘策略</h2>
        </div>
        <ReactECharts
          option={{
            backgroundColor: "transparent",
            legend: { top: 0, textStyle: { color: "#a1a1aa", fontSize: 9 } },
            tooltip: { trigger: "axis", borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(16,16,24,0.95)", textStyle: { fontSize: 10 } },
            grid: { left: 10, right: 8, top: 28, bottom: 10, containLabel: true },
            xAxis: { type: "category", data: eliteSeriesDays, axisLabel: { color: "#71717a", fontSize: 9 }, axisLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } } },
            yAxis: { type: "value", axisLabel: { color: "#71717a", formatter: "{value}%", fontSize: 9 }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } } },
            series: eliteStrategySeries.map((item) => ({
              name: item.name, type: "line", smooth: true, showSymbol: false, data: item.data,
              lineStyle: { width: 1.6, color: item.color },
            })),
          }}
          style={{ height: 160 }}
        />
        <div className="mt-3 space-y-1.5 max-h-[220px] overflow-auto">
          {strategyDetails.map((s) => (
            <div key={s.name} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2 text-[11px] transition hover:border-white/[0.10]">
              <div className="flex items-center justify-between mb-0.5">
                <p className="font-medium text-[var(--text)]">{s.name}</p>
                <span className="mono-metric text-emerald-300/90 text-[11px]">{s.ret}</span>
              </div>
              <p className="text-[var(--text-muted)]">{s.logic}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom bar */}
      <Card className="lg:col-span-3" variant="flat" padding="default">
        <div className="flex items-center gap-2 mb-1">
          <Activity size={13} className="text-[var(--text-muted)]" />
          <h3 className="text-sm font-semibold tracking-[-0.01em]">策略对比看板</h3>
        </div>
        {loading ? <Skeleton className="h-8 w-full mb-2" /> : null}
        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
          <span>历史分时点数: {historyTicks.length}</span>
          <span className="text-white/[0.10]">|</span>
          <span>自选池: {watchlistError ? "数据加载失败" : watchlist.length > 0 ? watchlist.map((item) => `${item.symbol}(${item.name})`).join(" | ") : "暂无数据"}</span>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[var(--text-muted)]">
          <p>策略分析1：当前市场风格偏"成长+动量"，短频策略 alpha 更高，但交易成本敏感。</p>
          <p>策略分析2：基金类高手策略在回撤控制上更稳定，适合做组合底仓；股票策略适合做增强层。</p>
          <p>策略分析3：建议采用"70%稳健 + 30%主动"的分层配置，周频复盘动态再平衡。</p>
        </div>
      </Card>
    </section>
  )
}
