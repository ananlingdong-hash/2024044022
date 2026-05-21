import { useCallback, useEffect, useState } from "react"
import ReactECharts from "echarts-for-react"
import { ShieldAlert, TrendingDown, TrendingUp, Minus, Zap, Clock3 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { evaluateRisk } from "@/api/risk-response"
import type { RiskEvaluateResponse } from "@/types/risk-response"

function formatCurrency(v: number) {
  return v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : `${v}`
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "↑") return <TrendingUp size={18} className="text-[var(--danger)]" />
  if (trend === "↓") return <TrendingDown size={18} className="text-[var(--success)]" />
  return <Minus size={18} className="text-[var(--text-muted)]" />
}

function summaryLabel(score: number) {
  if (score >= 75) return { label: "高风险", cls: "text-[var(--danger)]", badge: "danger" as const }
  if (score >= 50) return { label: "中等风险", cls: "text-[var(--warning)]", badge: "warning" as const }
  return { label: "低风险", cls: "text-[var(--success)]", badge: "success" as const }
}

export function RiskResponseCenter() {
  const [portfolioValue, setPortfolioValue] = useState(10_000_000)
  const [confidence, setConfidence] = useState(0.95)
  const [factors, setFactors] = useState("汇率, 信用, 供应链")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RiskEvaluateResponse | null>(null)

  const fetchRisk = useCallback(async () => {
    setLoading(true)
    const res = await evaluateRisk({
      portfolio_value: portfolioValue,
      confidence,
      factors: factors.split(",").map(f => f.trim()).filter(Boolean),
    })
    setData(res)
    setLoading(false)
  }, [portfolioValue, confidence, factors])

  useEffect(() => { fetchRisk() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return null

  const summary = summaryLabel(data.risk_score)

  // ── Probability distribution chart ──
  const distOption = {
    backgroundColor: "transparent",
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: { type: "value", name: "风险评分", nameTextStyle: { color: "#726d8c", fontSize: 10 }, axisLine: { lineStyle: { color: "rgba(139,132,190,0.12)" } }, axisLabel: { color: "#726d8c", fontSize: 10 } },
    yAxis: { type: "value", name: "密度", nameTextStyle: { color: "#726d8c", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(139,132,190,0.06)" } }, axisLabel: { color: "#726d8c", fontSize: 10 } },
    series: [{
      type: "line", data: data.probability_distribution.map(d => [d.x, d.y]), smooth: true, symbol: "none",
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(165,153,240,0.25)" }, { offset: 1, color: "rgba(165,153,240,0.02)" }] } },
      lineStyle: { color: "#a599f0", width: 2 },
      markLine: { silent: true, symbol: "none", lineStyle: { color: "#f87171", type: "dashed", width: 1 }, label: { formatter: `VaR: ${data.risk_score}`, color: "#f87171", fontSize: 10 }, data: [{ xAxis: data.risk_score }] },
    }],
    tooltip: { trigger: "axis", backgroundColor: "rgba(22,18,42,0.95)", borderColor: "rgba(139,132,190,0.18)", textStyle: { color: "#eeecf7", fontSize: 11 } },
  }

  // ── Time sensitivity gauge ──
  const hours = data.time_sensitivity_hours
  const gaugeOption = {
    backgroundColor: "transparent",
    series: [{
      type: "gauge", radius: "90%", center: ["50%", "58%"],
      startAngle: 210, endAngle: -30,
      min: 0, max: 120,
      splitNumber: 6,
      axisLine: { show: true, lineStyle: { width: 12, color: [[0.3, "#34d399"], [0.6, "#fbbf24"], [1, "#f87171"]] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: { offsetCenter: [0, "60%"], formatter: `{value}h`, color: "#eeecf7", fontSize: 16, fontFamily: "JetBrains Mono" },
      title: { offsetCenter: [0, "95%"], color: "#726d8c", fontSize: 10 },
      data: [{ value: hours, name: "爆发倒计时" }],
      pointer: { length: "70%", width: 3, itemStyle: { color: "#a599f0" } },
    }],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-white">智能风险评估中心</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">蒙特卡洛模拟 + VaR + 行业对标 · 实时风险评估</p>
        </div>
      </div>

      {/* ── Controls ── */}
      <Card variant="soft" padding="sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[var(--text-muted)]">组合价值</label>
            <Input size="sm" type="number" value={portfolioValue} onChange={e => setPortfolioValue(+e.target.value || 0)} className="w-40" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[var(--text-muted)]">置信度</label>
            <select value={confidence} onChange={e => setConfidence(+e.target.value)} className="focus-outline h-8 w-32 rounded-lg border border-[rgba(139,132,190,0.16)] bg-[rgba(22,18,42,0.75)] px-3 text-xs text-[var(--text)]">
              <option value={0.90}>90%</option>
              <option value={0.95}>95%</option>
              <option value={0.99}>99%</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[var(--text-muted)]">风险因子 (逗号分隔)</label>
            <Input size="sm" value={factors} onChange={e => setFactors(e.target.value)} className="w-64" />
          </div>
          <Button size="sm" onClick={fetchRisk} disabled={loading}>
            <Zap size={13} />
            {loading ? "评估中..." : "触发评估"}
          </Button>
        </div>
      </Card>

      {/* ── Risk Score Hero ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card variant="elevated" glow padding="lg" className="lg:col-span-1 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">综合风险评分</div>
          <div className={`text-6xl font-bold tracking-[-0.04em] font-mono ${summary.cls}`}>{data.risk_score.toFixed(1)}</div>
          <Badge variant={summary.badge} size="sm" className="mt-2">{summary.label}</Badge>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-[var(--text-secondary)]">
            <TrendIcon trend={data.trend} />
            <span>趋势: {data.trend === "↑" ? "上升" : data.trend === "↓" ? "下降" : "平稳"}</span>
          </div>
        </Card>

        {/* Time sensitivity */}
        <Card variant="soft" padding="sm" className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock3 size={13} className="text-[var(--text-muted)]" />
            <span className="text-[11px] text-[var(--text-muted)]">风险爆发倒计时</span>
          </div>
          <ReactECharts option={gaugeOption} style={{ height: 180 }} />
        </Card>

        {/* Probability distribution */}
        <Card variant="soft" padding="sm" className="lg:col-span-1">
          <div className="text-[11px] text-[var(--text-muted)] mb-1">概率分布曲线</div>
          <ReactECharts option={distOption} style={{ height: 200 }} />
        </Card>
      </div>

      {/* ── VaR Table + Factor Contributions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card variant="soft" padding="sm">
          <h3 className="text-xs font-semibold text-white tracking-[-0.01em] mb-3">VaR 风险值</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-[var(--text-muted)] border-b border-[rgba(139,132,190,0.08)]">
                  <th className="text-left py-2 font-medium">方法</th>
                  <th className="text-right py-2 font-medium">置信度</th>
                  <th className="text-right py-2 font-medium">VaR (%)</th>
                </tr>
              </thead>
              <tbody>
                {data.var_table.map((v, i) => (
                  <tr key={i} className="border-b border-[rgba(139,132,190,0.04)] hover:bg-white/[0.02]">
                    <td className="py-2 text-[var(--text-secondary)]">{v.method}</td>
                    <td className="py-2 text-right tabular-nums text-[var(--text)]">{v.confidence}</td>
                    <td className={`py-2 text-right tabular-nums font-mono ${v.value > 3.5 ? "text-[var(--danger)]" : v.value > 2.5 ? "text-[var(--warning)]" : "text-[var(--success)]"}`}>{v.value}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card variant="soft" padding="sm">
          <h3 className="text-xs font-semibold text-white tracking-[-0.01em] mb-3">因子贡献分析</h3>
          <div className="space-y-3">
            {data.factor_contributions.map((f, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[var(--text-secondary)]">{f.factor}</span>
                  <span className="text-[11px] tabular-nums font-mono text-white">{f.contribution.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#8b7cf0,#a599f0)] transition-all duration-700" style={{ width: `${f.contribution}%` }} />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{f.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
