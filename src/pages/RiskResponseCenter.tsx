import { useCallback, useEffect, useState } from "react"
import ReactECharts from "echarts-for-react"
import { TrendingDown, TrendingUp, Minus, Zap, Clock3, Brain, Database, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { evaluateRisk } from "@/api/risk-response"
import type { RiskEvaluateResponse } from "@/types/risk-response"

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

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchRisk() }, 0)
    return () => window.clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-white">智能风险评估中心</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">正在加载评估模型...</p>
        </div>
        <Card variant="soft" padding="sm"><Skeleton className="h-10 w-full rounded-lg" /></Card>
        <Card variant="elevated" glow padding="lg" className="flex flex-col items-center justify-center text-center">
          <Skeleton className="h-20 w-40 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-lg mt-3" />
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card variant="soft" padding="sm"><Skeleton className="h-[200px] w-full rounded-lg" /></Card>
          <Card variant="soft" padding="sm"><Skeleton className="h-[200px] w-full rounded-lg" /></Card>
        </div>
      </div>
    )
  }

  const summary = summaryLabel(data.risk_score)
  const topFactor = [...data.factor_contributions].sort((a, b) => b.contribution - a.contribution)[0]
  const recommendedAction = data.risk_score >= 75
    ? "立即切换保守方案，冻结新增高风险敞口。"
    : data.risk_score >= 50
      ? "推荐平衡方案，优先覆盖高贡献风险因子。"
      : "保持常规监控，等待新风险信号触发。"
  const scorePosition = Math.max(0, Math.min(100, data.risk_score))

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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-white">智能风险评估中心</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">蒙特卡洛模拟 + VaR + 行业对标 · 实时风险评估</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card variant="elevated" padding="sm" className="border-amber-300/16 bg-[linear-gradient(135deg,rgba(251,191,36,0.08),rgba(22,18,42,0.92))]">
          <div className="mb-3 flex items-center gap-2">
            <Brain size={15} className="text-amber-300" />
            <span className="text-xs font-semibold text-white">AI 评估结论</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={`text-2xl font-semibold tracking-[-0.03em] ${summary.cls}`}>{summary.label}</div>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">主导因子：{topFactor?.factor ?? "核心因子"}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 text-right">
              <div className="text-[10px] text-[var(--text-muted)]">风险评分</div>
              <div className={`mt-0.5 font-mono text-lg font-semibold ${summary.cls}`}>{data.risk_score.toFixed(1)}</div>
            </div>
          </div>
          <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-[linear-gradient(90deg,#34d399_0%,#34d399_45%,#fbbf24_45%,#fbbf24_75%,#f87171_75%,#f87171_100%)]">
            <span className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.45)]" style={{ left: `calc(${scorePosition}% - 2px)` }} />
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
            当前组合为{summary.label}，主要由{topFactor?.factor ?? "核心因子"}驱动。
          </p>
        </Card>

        <Card variant="soft" padding="sm">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-300" />
            <span className="text-xs font-semibold text-white">推荐处置动作</span>
          </div>
          <p className="text-xs leading-5 text-[var(--text-secondary)]">{recommendedAction}</p>
          <div className="mt-3 rounded-lg border border-white/[0.05] bg-white/[0.025] px-3 py-2 text-[10px] text-[var(--text-muted)]">
            风险爆发窗口：<span className="font-mono text-sky-300">{data.time_sensitivity_hours.toFixed(1)}h</span>
          </div>
        </Card>

        <Card variant="soft" padding="sm">
          <div className="mb-3 flex items-center gap-2">
            <Database size={15} className="text-indigo-300" />
            <span className="text-xs font-semibold text-white">模型可信度</span>
          </div>
          <div className="space-y-2">
            {[
              ["数据完整度", "94%"],
              ["模型置信度", `${Math.round(confidence * 100)}%`],
              ["因子覆盖", `${data.factor_contributions.length} 类`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--text-muted)]">{label}</span>
                <span className="font-mono text-white">{value}</span>
              </div>
            ))}
          </div>
        </Card>
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

      <Card variant="elevated" glow padding="lg" className="border-indigo-300/14 bg-[linear-gradient(135deg,rgba(32,26,56,0.92),rgba(15,23,42,0.88))]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-[-0.01em] text-white">评分拆解与风险带</h2>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">把单一评分拆成区间、趋势和主导因子，避免只看一个裸数字。</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <TrendIcon trend={data.trend} />
            <span>趋势: {data.trend === "↑" ? "上升" : data.trend === "↓" ? "下降" : "平稳"}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div className="mb-3 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
              <span>低风险</span>
              <span>中等风险</span>
              <span>高风险</span>
            </div>
            <div className="relative h-5 rounded-full bg-[linear-gradient(90deg,rgba(52,211,153,0.9)_0%,rgba(52,211,153,0.9)_45%,rgba(251,191,36,0.9)_45%,rgba(251,191,36,0.9)_75%,rgba(248,113,113,0.9)_75%,rgba(248,113,113,0.9)_100%)]">
              <span className="absolute top-1/2 h-9 w-1.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.55)]" style={{ left: `calc(${scorePosition}% - 3px)` }} />
              <span className="absolute -top-8 rounded-md border border-white/[0.08] bg-black/30 px-2 py-1 font-mono text-xs text-white" style={{ left: `min(calc(${scorePosition}% - 24px), calc(100% - 48px))` }}>
                {data.risk_score.toFixed(1)}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                ["VaR阈值", `${data.risk_score.toFixed(1)}`],
                ["主导因子", topFactor?.factor ?? "-"],
                ["窗口", `${hours.toFixed(1)}h`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/[0.05] bg-white/[0.025] px-3 py-2">
                  <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
                  <div className="mt-1 font-mono text-sm text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div className="mb-3 text-xs font-semibold text-white">因子贡献 Top 3</div>
            <div className="space-y-3">
              {data.factor_contributions.slice(0, 3).map((factor) => (
                <div key={factor.factor}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-secondary)]">{factor.factor}</span>
                    <span className="font-mono text-white">{factor.contribution.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#38bdf8,#a599f0)]" style={{ width: `${factor.contribution}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card variant="soft" padding="sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock3 size={13} className="text-[var(--text-muted)]" />
            <span className="text-[11px] text-[var(--text-muted)]">风险爆发倒计时</span>
          </div>
          <ReactECharts option={gaugeOption} style={{ height: 180 }} />
        </Card>
        <Card variant="soft" padding="sm">
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
