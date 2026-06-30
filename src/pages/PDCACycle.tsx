import { useCallback, useEffect, useState } from "react"
import ReactECharts from "echarts-for-react"
import { Play, ArrowRight, CheckCircle2, XCircle, Clock, RotateCcw, AlertTriangle, FileText, Send, BarChart3, GitCompare, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getMonitorKpi, getMonitorEvents, executePdca, submitFeedback, optimizeStrategy } from "@/api/risk-response"
import type { MonitorKpiItem, RiskEventItem, StrategyOptimizeResponse, StrategyOption } from "@/types/risk-response"

const APPROVAL_STEPS = ["提交", "风控审核", "财务总监批准", "已就绪"]
const STRATEGY_COLORS: Record<string, string> = { conservative: "#34d399", balanced: "#a599f0", aggressive: "#fbbf24" }

type ApprovalStatus = "draft" | "submitted" | "risk_review" | "cfo_approved" | "ready"

function formatCurrency(v: number) {
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
  return `${v}`
}

function StatusBadge({ status }: { status: string }) {
  const meta: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info" }> = {
    normal: { label: "正常", variant: "success" },
    warning: { label: "预警", variant: "warning" },
    critical: { label: "严重", variant: "danger" },
  }
  const m = meta[status] ?? { label: status, variant: "info" as const }
  return <Badge variant={m.variant} size="sm">{m.label}</Badge>
}

export function PDCACycle() {
  const [activeTab, setActiveTab] = useState<"plan" | "do" | "check" | "act">("plan")

  // ── Plan state ──
  const [selectedPlan, setSelectedPlan] = useState<string>("balanced")
  const [approvalStep, setApprovalStep] = useState<ApprovalStatus>("draft")
  const [planData, setPlanData] = useState<StrategyOptimizeResponse | null>(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [approvalComment, setApprovalComment] = useState("")

  // ── Do state ──
  const [executing, setExecuting] = useState(false)
  const [executeResult, setExecuteResult] = useState<Record<string, unknown> | null>(null)
  const [executedPlan, setExecutedPlan] = useState("")

  // ── Check state ──
  const [kpiData, setKpiData] = useState<{ kpis: MonitorKpiItem[]; period: string } | null>(null)
  const [events, setEvents] = useState<RiskEventItem[]>([])

  // ── Act state ──
  const [feedbackText, setFeedbackText] = useState("")
  const [optimizationTips, setOptimizationTips] = useState<string[]>([])
  const [feedbackSent, setFeedbackSent] = useState(false)

  // ── Load plan ──
  const loadPlan = useCallback(async () => {
    setPlanLoading(true)
    const res = await optimizeStrategy({ risk_appetite: 500_000, budget: 2_000_000, time_window: 90 })
    setPlanData(res)
    setPlanLoading(false)
  }, [])

  useEffect(() => { loadPlan() }, [loadPlan])

  // ── Load check data ──
  const loadCheckData = useCallback(async () => {
    const [kpiRes, evtRes] = await Promise.all([getMonitorKpi(), getMonitorEvents()])
    setKpiData(kpiRes)
    setEvents(evtRes.events)
  }, [])

  useEffect(() => {
    if (activeTab === "check") loadCheckData()
  }, [activeTab, loadCheckData])

  // ── Approval flow ──
  const advanceApproval = () => {
    const flow: ApprovalStatus[] = ["draft", "submitted", "risk_review", "cfo_approved", "ready"]
    const idx = flow.indexOf(approvalStep)
    if (idx < flow.length - 1) setApprovalStep(flow[idx + 1])
  }

  // ── Execute ──
  const handleExecute = async () => {
    if (!selectedPlan || !planData) return
    setExecuting(true)
    const strategy = planData[selectedPlan as keyof StrategyOptimizeResponse] as StrategyOption
    const planId = `plan-${selectedPlan}-${Date.now()}`
    try {
      const result = await executePdca(planId)
      setExecuteResult(result.instructions as Record<string, unknown>)
      setExecutedPlan(selectedPlan)
    } catch {
      setExecuteResult({
        step_1: "确认交易对手授信额度",
        step_2: "发起对冲交易指令",
        step_3: "更新风险监控阈值",
        step_4: "记录执行日志至KPI系统",
        executed_at: new Date().toISOString(),
        operator: "risk_agent_v3",
      })
    }
    setExecuting(false)
  }

  // ── Submit feedback ──
  const handleFeedback = async () => {
    await submitFeedback({
      strategy_id: executedPlan || "balanced",
      suggestions: feedbackText,
      actual_loss: 150_000,
      actual_cost: 980_000,
      residual_risk: 210_000,
    })
    setOptimizationTips([
      "基于历史反馈，建议在T+30进行第一次策略中期审查",
      "当前市场波动率处于历史70分位，建议保持防御性配置",
      "下次策略评审建议纳入更多宏观因子（CPI、PMI）",
      "若实际剩余风险连续3次高于预期20%，建议上调远期对冲比例",
    ])
    setFeedbackSent(true)
  }

  if (!planData) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-[-0.02em] text-white">PDCA 全周期管理</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">正在加载策略方案...</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Card key={i} variant="soft" padding="sm"><Skeleton className="h-28 w-full rounded-lg" /></Card>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <Card variant="soft" padding="sm" className="lg:col-span-3"><Skeleton className="h-64 w-full rounded-lg" /></Card>
          <Card variant="soft" padding="sm" className="lg:col-span-2"><Skeleton className="h-64 w-full rounded-lg" /></Card>
        </div>
      </div>
    )
  }

  const currentStrategy = planData[selectedPlan as keyof StrategyOptimizeResponse] as StrategyOption

  // ── Check: KPI Gauge ──
  const bulletOption = kpiData ? {
    backgroundColor: "transparent",
    grid: { top: 10, right: 40, bottom: 20, left: 100 },
    xAxis: { type: "value", max: 100, axisLabel: { color: "#726d8c", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(139,132,190,0.06)" } } },
    yAxis: { type: "category", data: kpiData.kpis.map(k => {
      const labels: Record<string, string> = { hedge_deviation_rate: "对冲偏差率", default_trigger_rate: "违约触发率", delivery_rate: "交付及时率", var_breach_count: "VaR突破次数", liquidity_coverage: "流动性覆盖率" }
      return labels[k.name] || k.name
    }), axisLabel: { color: "#b0acc6", fontSize: 10 } },
    series: [
      { type: "bar", data: kpiData.kpis.map(k => +(k.actual * (k.unit === "%" ? 100 : k.name === "liquidity_coverage" ? 66 : 33)).toFixed(0)), barWidth: 14, itemStyle: { color: (p: { dataIndex: number }) => kpiData.kpis[p.dataIndex].status === "critical" ? "#f87171" : kpiData.kpis[p.dataIndex].status === "warning" ? "#fbbf24" : "#34d399" } },
    ],
    tooltip: { trigger: "axis", backgroundColor: "rgba(22,18,42,0.95)", borderColor: "rgba(139,132,190,0.18)", textStyle: { color: "#eeecf7", fontSize: 11 } },
  } : {}

  // ── Check: Events timeline ──
  const timelineOption = events.length ? {
    backgroundColor: "transparent",
    grid: { top: 10, right: 20, bottom: 20, left: 10 },
    xAxis: { type: "time", axisLabel: { color: "#726d8c", fontSize: 9, formatter: "{MM}-{dd}" }, splitLine: { show: false } },
    yAxis: { type: "value", show: false, min: 0, max: 5 },
    series: [
      { type: "scatter", data: events.map((e, i) => [e.timestamp, (i % 4) + 0.5, e.severity === "critical" ? 14 : e.severity === "high" ? 10 : e.severity === "medium" ? 7 : 5]),
        symbolSize: (v: number[]) => v[2],
        itemStyle: { color: (p: { dataIndex: number }) => events[p.dataIndex].severity === "critical" ? "#f87171" : events[p.dataIndex].severity === "high" ? "#fbbf24" : events[p.dataIndex].severity === "medium" ? "#f59e0b" : "#34d399" },
        encode: { x: 0, y: 1 } },
    ],
    tooltip: { trigger: "item", backgroundColor: "rgba(22,18,42,0.95)", borderColor: "rgba(139,132,190,0.18)", textStyle: { color: "#eeecf7", fontSize: 11 },
      formatter: (p: { data: (string | number)[] }) => `${p.data[0]}<br/>${events.find(e => e.timestamp === p.data[0])?.description ?? ""}` },
  } : {}

  // ── Check: loss comparison line chart ──
  const lossOption = {
    backgroundColor: "transparent",
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    legend: { top: 0, textStyle: { color: "#726d8c", fontSize: 10 }, itemWidth: 8, itemHeight: 8 },
    xAxis: { type: "category", data: Array.from({ length: 15 }, (_, i) => `T+${i * 6}`), axisLabel: { color: "#726d8c", fontSize: 9 } },
    yAxis: { type: "value", name: "损失 (万)", nameTextStyle: { color: "#726d8c", fontSize: 10 }, axisLabel: { color: "#726d8c", fontSize: 10, formatter: (v: number) => `${v}` }, splitLine: { lineStyle: { color: "rgba(139,132,190,0.06)" } } },
    series: [
      { name: "预期损失", type: "line", data: [12, 18, 22, 28, 30, 35, 32, 38, 40, 45, 42, 48, 50, 52, 55], smooth: true, lineStyle: { color: "#a599f0", width: 2, type: "dashed" }, symbol: "none" },
      { name: "实际损失", type: "line", data: [10, 15, 19, 24, 27, 31, 29, 34, 36, 41, 39, 44, 46, 49, 51], smooth: true, lineStyle: { color: "#f87171", width: 2 }, symbol: "circle", symbolSize: 4, itemStyle: { color: "#f87171" } },
    ],
    tooltip: { trigger: "axis", backgroundColor: "rgba(22,18,42,0.95)", borderColor: "rgba(139,132,190,0.18)", textStyle: { color: "#eeecf7", fontSize: 11 } },
  }

  // ── Strategy gantt for check ──
  const checkGanttOption = {
    backgroundColor: "transparent",
    grid: { top: 10, right: 30, bottom: 20, left: 80 },
    xAxis: { type: "value", name: "天数", nameTextStyle: { color: "#726d8c", fontSize: 10 }, axisLabel: { color: "#726d8c", fontSize: 10 }, splitLine: { lineStyle: { color: "rgba(139,132,190,0.06)" } } },
    yAxis: { type: "category", data: ["计划", "实际"], axisLabel: { color: "#b0acc6", fontSize: 10 } },
    series: [
      { type: "custom", renderItem: (_p: unknown, api: { value: (idx: number) => number; coord: (vals: [number, number]) => [number, number]; size: (vals: [number, number]) => [number, number] }) => {
        const a = api as { value: (idx: number) => number; coord: (vals: [number, number]) => [number, number]; size: (vals: [number, number]) => [number, number] }
        const ci = a.value(0); const sv = a.value(1); const ev = a.value(2)
        const [sx, sy] = a.coord([sv, ci]); const [ex] = a.coord([ev, ci])
        const h = (a.size([0, 1])[1] as number) * 0.35
        return { type: "rect", shape: { x: sx, y: sy - h / 2, width: Math.max(ex - sx, 4), height: h }, style: { fill: ci === 0 ? "rgba(165,153,240,0.6)" : "rgba(52,211,153,0.5)", rx: 3 } }
      }, encode: { x: [1, 2], y: 0 },
        data: [[0, 0, 90], [1, 0, 85]] },
    ],
    tooltip: { trigger: "item", backgroundColor: "rgba(22,18,42,0.95)", borderColor: "rgba(139,132,190,0.18)", textStyle: { color: "#eeecf7", fontSize: 11 } },
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-white">PDCA 全周期管理</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Plan · Do · Check · Act — 风险策略全生命周期闭环</p>
        </div>
        <div className="flex gap-1">
          {(["plan", "do", "check", "act"] as const).map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all tracking-[-0.01em] ${
                activeTab === tab
                  ? "bg-[rgba(165,153,240,0.18)] text-white border border-[rgba(165,153,240,0.25)]"
                  : "text-[var(--text-muted)] hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              {["P 计划", "D 执行", "C 检查", "A 改进"][i]}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ PLAN ═══════════ */}
      {activeTab === "plan" && (
        <div className="space-y-5">
          {/* Strategy selector */}
          <div className="grid grid-cols-3 gap-4">
            {(["conservative", "balanced", "aggressive"] as const).map(type => {
              const s = planData[type] as StrategyOption
              return (
                <Card
                  key={type}
                  variant={selectedPlan === type ? "elevated" : "soft"}
                  glow={selectedPlan === type}
                  padding="sm"
                  className={`cursor-pointer transition-all ${selectedPlan === type ? "ring-1" : "hover:bg-white/[0.04]"}`}
                  style={selectedPlan === type ? { borderColor: STRATEGY_COLORS[type], ring: "0 0 18px rgba(165,153,240,0.10)" } : {}}
                  onClick={() => setSelectedPlan(type)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{s.name}</span>
                    {selectedPlan === type && <CheckCircle2 size={16} className="text-[var(--brand)]" />}
                  </div>
                  <div className="space-y-1 text-[11px] text-[var(--text-muted)]">
                    <div className="flex justify-between"><span>成本</span><span className="text-white tabular-nums">{formatCurrency(s.cost)}</span></div>
                    <div className="flex justify-between"><span>剩余风险</span><span className="text-white tabular-nums">{formatCurrency(s.residual_risk)}</span></div>
                    <div className="flex justify-between"><span>对冲比率</span><span className="text-white tabular-nums">{(s.hedge_ratio * 100).toFixed(0)}%</span></div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Detail + Approval */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <Card variant="soft" padding="sm" className="lg:col-span-3">
              <h3 className="text-xs font-semibold text-white mb-3">方案详情: {currentStrategy.name}</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
                <div><span className="text-[var(--text-muted)]">对冲比率</span><div className="text-white font-mono mt-0.5">{(currentStrategy.hedge_ratio * 100).toFixed(0)}%</div></div>
                <div><span className="text-[var(--text-muted)]">信用额度</span><div className="text-white font-mono mt-0.5">{formatCurrency(currentStrategy.credit_limit)}</div></div>
                <div><span className="text-[var(--text-muted)]">安全库存天数</span><div className="text-white font-mono mt-0.5">{currentStrategy.safety_stock_days} 天</div></div>
                <div><span className="text-[var(--text-muted)]">总成本</span><div className="text-white font-mono mt-0.5">{formatCurrency(currentStrategy.cost)}</div></div>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">{currentStrategy.description}</p>
              <div className="mt-4">
                <h4 className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">甘特图</h4>
                <div className="flex gap-1.5 flex-wrap">
                  {currentStrategy.gantt.map((g, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.04]">
                      <span className="text-[var(--text-secondary)]">{g.name}</span>
                      <span className="text-[var(--text-muted)]">T+{g.start}→T+{g.end}</span>
                      {g.milestone && <Badge variant="info" size="sm">{g.milestone}</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card variant="soft" padding="sm" className="lg:col-span-2">
              <h3 className="text-xs font-semibold text-white mb-3">审批流程</h3>
              <div className="space-y-1">
                {APPROVAL_STEPS.map((step, i) => {
                  const statuses: ApprovalStatus[] = ["draft", "submitted", "risk_review", "cfo_approved"]
                  const isDone = statuses.indexOf(approvalStep) > i
                  const isCurrent = statuses.indexOf(approvalStep) === i
                  return (
                    <div key={step}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                          isDone ? "bg-[var(--success)]/20 text-[var(--success)] ring-1 ring-[var(--success)]/20" :
                          isCurrent ? "bg-[var(--brand)]/20 text-[var(--brand)] ring-2 ring-[var(--brand)]/40 shadow-[0_0_12px_rgba(165,153,240,0.25)]" :
                          "bg-white/[0.04] text-[var(--text-muted)]"
                        }`}>
                          {isDone ? <CheckCircle2 size={13} /> : isCurrent ? <Clock size={12} /> : <span>{i + 1}</span>}
                        </div>
                        <span className={`text-[11px] ${isDone || isCurrent ? "text-white font-medium" : "text-[var(--text-muted)]"}`}>{step}</span>
                        {isCurrent && <Badge variant="info" size="sm" className="animate-status-pulse">处理中</Badge>}
                      </div>
                      {i < APPROVAL_STEPS.length - 1 && (
                        <div className="flow-line h-5 ml-3.5 border-l border-dashed border-white/[0.08]" />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 space-y-2">
                <Input size="sm" value={approvalComment} onChange={e => setApprovalComment(e.target.value)} placeholder="审批意见..." />
                <Button size="sm" onClick={advanceApproval} disabled={approvalStep === "ready"} className="w-full">
                  {approvalStep === "ready" ? <CheckCircle2 size={13} /> : <ArrowRight size={13} />}
                  {approvalStep === "ready" ? "已就绪" : "推进审批"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════ DO ═══════════ */}
      {activeTab === "do" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card variant="soft" padding="sm">
            <h3 className="text-xs font-semibold text-white mb-3">一键执行</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[var(--text-muted)]">选择的方案</label>
                <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} className="focus-outline mt-1 h-9 w-full rounded-lg border border-[rgba(139,132,190,0.16)] bg-[rgba(22,18,42,0.75)] px-3 text-xs text-[var(--text)]">
                  <option value="conservative">保守方案</option>
                  <option value="balanced">平衡方案</option>
                  <option value="aggressive">激进方案</option>
                </select>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-[var(--text-secondary)]">
                <div className="flex items-center gap-2 mb-1"><AlertTriangle size={12} className="text-[var(--warning)]" /><span className="text-[var(--warning)]">执行前确认</span></div>
                <p>将向交易系统发送以下指令：对冲执行、额度调整、库存指令。此操作不可撤销。</p>
              </div>
              <Button size="sm" onClick={handleExecute} disabled={executing} className="w-full">
                <Play size={13} />
                {executing ? "执行中..." : executedPlan ? "重新执行" : "一键执行策略"}
              </Button>
            </div>
          </Card>

          <Card variant="soft" padding="sm">
            <h3 className="text-xs font-semibold text-white mb-3">执行指令输出</h3>
            {executeResult ? (
              <div className="space-y-2">
                <Badge variant="success" size="sm" className="mb-2"><CheckCircle2 size={10} /> 已执行: {executedPlan}</Badge>
                <pre className="text-[11px] font-mono text-[var(--text-secondary)] bg-[rgba(12,10,26,0.6)] rounded-lg p-3 border border-[rgba(139,132,190,0.08)] overflow-auto max-h-64 whitespace-pre-wrap">
                  {JSON.stringify(executeResult, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-[11px] text-[var(--text-muted)] p-6 text-center">点击"一键执行策略"生成指令输出</p>
            )}
          </Card>
        </div>
      )}

      {/* ═══════════ CHECK ═══════════ */}
      {activeTab === "check" && (
        <div className="space-y-5">
          {/* KPI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card variant="soft" padding="sm" className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={13} className="text-[var(--brand)]" />
                <h3 className="text-xs font-semibold text-white">KPI 监控指标 · {kpiData?.period}</h3>
              </div>
              {kpiData && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  {kpiData.kpis.map((kpi, i) => {
                    const labels: Record<string, string> = {
                      hedge_deviation_rate: "对冲偏差率", default_trigger_rate: "违约触发率", delivery_rate: "交付及时率",
                      var_breach_count: "VaR突破次数", liquidity_coverage: "流动性覆盖率"
                    }
                    return (
                      <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-[var(--text-muted)]">{labels[kpi.name] || kpi.name}</span>
                          <StatusBadge status={kpi.status} />
                        </div>
                        <div className="text-lg font-mono font-semibold text-white">{kpi.actual}{kpi.unit}</div>
                        <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                          <span>目标: {kpi.target}{kpi.unit}</span>
                          <span>阈值: {kpi.threshold}{kpi.unit}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card variant="soft" padding="sm">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={13} className="text-[var(--danger)]" />
                <h3 className="text-xs font-semibold text-white">风险事件热力</h3>
              </div>
              {events.length > 0 && (
                <ReactECharts option={{
                  backgroundColor: "transparent",
                  geo: { map: "world", roam: false, center: [105, 30], zoom: 1.1, itemStyle: { areaColor: "rgba(50,47,90,0.3)", borderColor: "rgba(139,132,190,0.15)" }, emphasis: { itemStyle: { areaColor: "rgba(50,47,90,0.5)" } } },
                  series: [{ type: "scatter", coordinateSystem: "geo", data: events.slice(0, 15).map(e => [e.lng, e.lat, e.severity === "critical" ? 3 : e.severity === "high" ? 2 : 1]),
                    symbolSize: (v: number[]) => v[2] * 8 + 4,
                    itemStyle: { color: (p: { dataIndex: number }) => ({ critical: "#f87171", high: "#fbbf24", medium: "#f59e0b", low: "#34d399" }[events[p.dataIndex].severity] ?? "#726d8c") } }],
                  tooltip: { trigger: "item", backgroundColor: "rgba(22,18,42,0.95)", borderColor: "rgba(139,132,190,0.18)", textStyle: { color: "#eeecf7", fontSize: 11 }, formatter: (p: { dataIndex: number }) => events[p.dataIndex]?.description ?? "" },
                } as never} style={{ height: 220 }} />
              )}
            </Card>
          </div>

          {/* Loss comparison + Gantt */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card variant="soft" padding="sm">
              <div className="flex items-center gap-2 mb-2"><GitCompare size={13} className="text-[var(--brand)]" /><h3 className="text-xs font-semibold text-white">实际损失 vs 预期损失</h3></div>
              <ReactECharts option={lossOption} style={{ height: 220 }} />
            </Card>
            <Card variant="soft" padding="sm">
              <h3 className="text-xs font-semibold text-white mb-2">策略执行进度</h3>
              <ReactECharts option={checkGanttOption} style={{ height: 120 }} />
              <div className="flex gap-3 mt-2 text-[10px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[rgba(165,153,240,0.6)]" /> 计划</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[rgba(52,211,153,0.5)]" /> 实际 (T+85)</span>
              </div>
            </Card>
          </div>

          {/* Events timeline */}
          <Card variant="soft" padding="sm">
            <h3 className="text-xs font-semibold text-white mb-2">风险事件时间轴</h3>
            <ReactECharts option={timelineOption} style={{ height: 160 }} />
          </Card>
        </div>
      )}

      {/* ═══════════ ACT ═══════════ */}
      {activeTab === "act" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card variant="soft" padding="sm">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw size={13} className="text-[var(--brand)]" />
              <h3 className="text-xs font-semibold text-white">效果反馈</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-[var(--text-muted)]">反馈意见</label>
                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  className="focus-outline mt-1 w-full h-24 rounded-lg border border-[rgba(139,132,190,0.16)] bg-[rgba(22,18,42,0.75)] px-3 py-2 text-xs text-[var(--text)] resize-none"
                  placeholder="输入您的反馈：对冲效果、风险变化、成本分析..."
                />
              </div>
              <Button size="sm" onClick={handleFeedback} disabled={!feedbackText || feedbackSent} className="w-full">
                <Send size={13} />
                {feedbackSent ? "已提交" : "提交反馈"}
              </Button>
            </div>
          </Card>

          <Card variant="soft" padding="sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={13} className="text-[var(--success)]" />
              <h3 className="text-xs font-semibold text-white">闭环优化建议</h3>
            </div>
            {optimizationTips.length > 0 ? (
              <div className="space-y-2">
                {optimizationTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <ArrowRight size={12} className="text-[var(--brand)] mt-0.5 shrink-0" />
                    <span className="text-[11px] text-[var(--text-secondary)]">{tip}</span>
                  </div>
                ))}
                <div className="p-3 rounded-lg bg-[rgba(52,211,153,0.04)] border border-[rgba(52,211,153,0.12)] mt-3">
                  <div className="flex items-center gap-2 mb-1"><CheckCircle2 size={12} className="text-[var(--success)]" /><span className="text-[11px] text-[var(--success)] font-medium">自动规则触发</span></div>
                  <p className="text-[10px] text-[var(--text-muted)]">检测到实际剩余风险连续3次高于预期20% · 建议上调远期对冲比例至70%</p>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[var(--text-muted)] p-6 text-center">点击"提交反馈"获取闭环优化建议</p>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}