import { useMemo, useState } from "react"
import ReactECharts from "echarts-for-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitBacktest } from "@/api/market"
import { useIncrementalList } from "@/hooks/useIncrementalList"
import { useVirtualRows } from "@/hooks/useVirtualRows"
import { PriceMiniChart } from "@/components/charts/PriceMiniChart"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Bot, Download, Play, TrendingUp, Zap } from "lucide-react"

const factors = Array.from({ length: 300 }, (_, i) => `因子-${i + 1}`)

export function QuantWorkbenchPage() {
  const [scrollTop, setScrollTop] = useState(0)
  const [strategyInput, setStrategyInput] = useState("使用MACD金叉 + 成交量放大筛选龙头股")
  const [strategyName, setStrategyName] = useState("moving_average")
  const [dataSource, setDataSource] = useState<"tushare" | "csv">("tushare")
  const [tsCode, setTsCode] = useState("000001.SZ")
  const [metrics, setMetrics] = useState({
    winRate: 0.58, annualReturn: 0.29, sharpe: 1.8, maxDrawdown: 0.12,
    reportText: "等待回测执行。", engine: "builtin",
  })
  const [running, setRunning] = useState(false)
  const [feedback, setFeedback] = useState("")
  const incrementalFactors = useIncrementalList(factors, 40, 25)
  const { rows, offsetY, totalHeight } = useVirtualRows(incrementalFactors, 34, 220, scrollTop)

  const onBacktest = async () => {
    try {
      setRunning(true); setFeedback("")
      const result = await submitBacktest({
        strategyCode: strategyInput, symbols: ["AAPL", "NVDA", "600519.SS"],
        strategyName, dataSource, tsCode, startDate: "2024-01-01", csvPath: "data/sample_prices.csv",
      })
      setMetrics(result)
      setFeedback(`回测成功，结果已入库。引擎: ${result.engine}`)
    } catch { setFeedback("回测失败，请确认后端服务与登录状态。") }
    finally { setRunning(false) }
  }

  const option = useMemo(() => ({
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(16,16,24,0.95)", textStyle: { fontSize: 11 } },
    grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "category", data: ["1月", "2月", "3月", "4月", "5月"], axisLabel: { color: "#71717a", fontSize: 10 } },
    yAxis: { type: "value", axisLabel: { color: "#71717a", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } } },
    series: [{
      data: [
        Number((metrics.annualReturn * 100 * 0.35).toFixed(2)),
        Number((metrics.annualReturn * 100 * 0.52).toFixed(2)),
        Number((metrics.annualReturn * 100 * 0.68).toFixed(2)),
        Number((metrics.annualReturn * 100 * 0.9).toFixed(2)),
        Number((metrics.annualReturn * 100).toFixed(2)),
      ],
      type: "line", smooth: true, showSymbol: false,
      lineStyle: { color: "#a5b4fc", width: 2 },
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(129,140,248,0.35)" }, { offset: 1, color: "rgba(129,140,248,0.03)" }] } },
    }],
  }), [metrics.annualReturn])

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      {/* Main workbench */}
      <Card className="xl:col-span-7" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-300/15">
            <Bot size={13} className="text-indigo-300/80" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-[-0.01em]">量化策略工坊</h2>
            <p className="text-[10px] text-[var(--text-muted)]">信息 → 分析 → 策略 → 验证</p>
          </div>
        </div>

        <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1.5">策略描述（自然语言 / Python）</label>
        <Input value={strategyInput} onChange={(e) => setStrategyInput(e.target.value)} />

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">策略名</label>
            <Input size="sm" value={strategyName} onChange={(e) => setStrategyName(e.target.value)} placeholder="moving_average" />
          </div>
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">数据源</label>
            <select value={dataSource} onChange={(e) => setDataSource(e.target.value as "tushare" | "csv")}
              className="focus-outline h-8 w-full rounded-lg border border-white/[0.08] bg-[rgba(18,18,28,0.60)] px-2.5 text-xs text-[var(--text)]">
              <option value="tushare">tushare</option>
              <option value="csv">csv</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">标的代码</label>
            <Input size="sm" value={tsCode} onChange={(e) => setTsCode(e.target.value)} placeholder="000001.SZ" />
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button onClick={onBacktest} disabled={running} size="sm">
            <Play size={12} className="mr-1" />{running ? "回测执行中..." : "提交回测"}
          </Button>
          <Button variant="outline" size="sm">
            <Download size={12} className="mr-1" />导出 Excel
          </Button>
        </div>
        {feedback ? <p className="mt-2 text-[11px] text-[var(--brand)]">{feedback}</p> : null}

        <div className="mt-4">
          {running ? <Skeleton className="h-[240px] w-full rounded-xl" /> : <ReactECharts option={option} style={{ height: 240 }} />}
        </div>
      </Card>

      {/* Mini chart */}
      <Card className="xl:col-span-5" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-300/15">
            <TrendingUp size={13} className="text-emerald-300/80" />
          </div>
          <h2 className="text-sm font-semibold tracking-[-0.01em]">模拟交易盘</h2>
        </div>
        <PriceMiniChart />
      </Card>

      {/* Metric cards */}
      <Card className="xl:col-span-3" variant="flat" padding="default">
        <p className="text-[10px] text-[var(--text-muted)] mb-1">年化收益</p>
        <p className="mono-metric text-3xl font-semibold text-emerald-300">+{(metrics.annualReturn * 100).toFixed(1)}%</p>
      </Card>
      <Card className="xl:col-span-2" variant="flat" padding="default">
        <p className="text-[10px] text-[var(--text-muted)] mb-1">胜率</p>
        <p className="mono-metric text-3xl font-semibold text-indigo-300">{(metrics.winRate * 100).toFixed(1)}%</p>
      </Card>
      <Card className="xl:col-span-2" variant="flat" padding="default">
        <p className="text-[10px] text-[var(--text-muted)] mb-1">最大回撤</p>
        <p className="mono-metric text-3xl font-semibold text-rose-300">-{(metrics.maxDrawdown * 100).toFixed(1)}%</p>
      </Card>

      {/* Factor library */}
      <Card className="xl:col-span-4" padding="default">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10 ring-1 ring-violet-300/15">
            <BarChart3 size={11} className="text-violet-300/80" />
          </div>
          <h3 className="text-sm font-semibold tracking-[-0.01em]">选股因子库</h3>
        </div>
        <div className="h-[220px] overflow-auto rounded-lg border border-[var(--border)] bg-[var(--bg-muted)]"
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
          <div style={{ height: totalHeight, position: "relative" }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {rows.map((name) => (
                <div key={name} className="virtual-row h-[34px] border-b border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)] flex items-center">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Rankings */}
      <Card className="xl:col-span-8" padding="default">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 ring-1 ring-amber-300/15">
            <Zap size={11} className="text-amber-300/80" />
          </div>
          <h3 className="text-sm font-semibold tracking-[-0.01em]">策略排行榜</h3>
        </div>
        <div className="grid gap-2 text-xs md:grid-cols-3 mb-3">
          {[
            { name: "AlphaPulse v2", ret: "38.4%", dd: "9.1%" },
            { name: "EventSniper", ret: "31.2%", dd: "8.7%" },
            { name: "NorthFlow AI", ret: "27.8%", dd: "7.4%" },
          ].map((s) => (
            <div key={s.name} className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
              <p className="font-medium text-[var(--text)]">{s.name}</p>
              <div className="flex items-center gap-3 mt-0.5 text-[var(--text-muted)]">
                <span>年化 <span className="text-emerald-300/90">{s.ret}</span></span>
                <span>回撤 <span className="text-rose-300/90">{s.dd}</span></span>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-black/10 p-3">
          <p className="mb-1 text-[11px] font-medium text-white/80">回测分析报告</p>
          <pre className="max-h-36 overflow-auto whitespace-pre-wrap text-[11px] text-[var(--text-muted)] leading-5">{metrics.reportText}</pre>
        </div>
      </Card>
    </section>
  )
}
