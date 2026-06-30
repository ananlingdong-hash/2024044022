import { useEffect, useMemo, useRef, useState } from "react"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchSentimentHistory, generateSentimentReport } from "@/api/sentiment"
import { createMonitorTask, fetchMonitorTasks } from "@/api/tasks"
import { saveReport } from "@/lib/db"
import type { SentimentReport } from "@/types/domain"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchUniverse, fetchUserWatchlist, saveUserWatchlist } from "@/api/watchlist"
import { getAuthUser } from "@/lib/auth"
import { BarChart3, Clock3, History, Plus, Radar, RefreshCw, Search, Sparkles, Target, TrendingUp } from "lucide-react"
import axios from "axios"
import ReactECharts from "echarts-for-react"

dayjs.extend(utc)

const REPORT_ETA_SECONDS = 90
const sampleReport: SentimentReport = {
  id: "20260507-1430",
  generatedAt: "2026-05-07 14:30",
  symbols: ["Tencent", "Tencent-Ads", "Tencent-Cloud", "Tencent-Games"],
  marketSentiment: 62,
  summary: "科技板块风险偏好抬升，机构净流入集中在高景气成长股，白酒板块情绪修复偏慢。",
  stockScores: [
    { symbol: "Tencent", score: 68 },
    { symbol: "Tencent-Ads", score: 74 },
    { symbol: "Tencent-Cloud", score: 71 },
    { symbol: "Tencent-Games", score: 66 },
  ],
  suggestion: "关注 CMC黑名单监管、游戏版号 调查与 AI 算力成本上行，建议启动平衡响应方案。",
  reportTitle: "舆情分析报告 #20260507-1430",
  eventHighlights: ["微信: 美国监管窗口仍未完全消除，需保持合规预案。", "游戏版号: 算法透明、未成年人保护和内容治理压力持续。"],
  recommendationBullets: ["优先跟踪 CMC黑名单监管事件进展。", "若 AI 算力成本继续上行，切换至算力替代池方案。"],
  reportBody:
    "Agent智能风险应对决策支持报告。执行摘要：已完成智能评估、策略优化和PDCA闭环设计。智能评估覆盖蒙特卡洛、VaR与行业对标。策略优化提供保守、平衡、激进三套组合。实际应用场景覆盖汇率风险、信用风险、供应链风险。",
}

const REPORT_CACHE_PREFIX = "astraquant:latest-sentiment:"
const REPORT_JOB_PREFIX = "astraquant:sentiment-job:"
const reportCacheKey = () => `${REPORT_CACHE_PREFIX}${getAuthUser()?.userId ?? "guest"}`
const reportJobKey = () => `${REPORT_JOB_PREFIX}${getAuthUser()?.userId ?? "guest"}`

const readCachedReport = () => {
  try {
    const raw = window.localStorage.getItem(reportCacheKey())
    if (!raw) return sampleReport
    const parsed = JSON.parse(raw) as SentimentReport
    if (!parsed?.id || !parsed?.generatedAt || !Array.isArray(parsed?.stockScores)) return sampleReport
    return parsed
  } catch { return sampleReport }
}

const formatReportTime = (value: string) => dayjs.utc(value).local().format("YYYY-MM-DD HH:mm:ss")

// Simulated price data generator
function generatePriceData(seed: number, points: number) {
  let price = 100 + seed * 20
  const data: number[] = []
  for (let i = 0; i < points; i++) {
    price += (Math.random() - 0.48) * 3
    price = Math.max(70, Math.min(180, price))
    data.push(Number(price.toFixed(2)))
  }
  return data
}

// Simulated volume data
function generateVolumeData(points: number) {
  return Array.from({ length: points }, () => Math.floor(Math.random() * 8000 + 2000))
}

export function SentimentRadarPage() {
  const [report, setReport] = useState<SentimentReport>(readCachedReport)
  const [history, setHistory] = useState<SentimentReport[]>([])
  const [taskHint, setTaskHint] = useState("")
  const [loading, setLoading] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [universe, setUniverse] = useState<Array<{ symbol: string; name: string }>>([])
  const [watchKeywords, setWatchKeywords] = useState("")
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(readCachedReport().symbols)
  const [savingWatchlist, setSavingWatchlist] = useState(false)
  const [reportPhase, setReportPhase] = useState<"idle" | "thinking" | "typing">("idle")
  const [renderedReportBody, setRenderedReportBody] = useState(sampleReport.reportBody ?? "")
  const [etaSeconds, setEtaSeconds] = useState(REPORT_ETA_SECONDS)
  const reportTypingTimerRef = useRef<number | null>(null)
  const reportStartTsRef = useRef<number | null>(null)
  const isMountedRef = useRef(false)
  const [cronMinute, setCronMinute] = useState("0")
  const [cronHour, setCronHour] = useState("*/2")
  const [cronDay, setCronDay] = useState("*")
  const [cronMonth, setCronMonth] = useState("*")
  const [cronWeek, setCronWeek] = useState("1-5")

  // Live simulated chart data
  const [priceData] = useState(() => ({
    aapl: generatePriceData(3, 50),
    nvda: generatePriceData(5, 50),
    mt: generatePriceData(1, 50),
    ndsd: generatePriceData(2, 50),
  }))
  const [volumeData] = useState(() => generateVolumeData(50))

  const reloadHistory = async () => {
    const rows = await fetchSentimentHistory()
    setHistory(rows)
    if (rows.length > 0) {
      const latest = rows[0]
      setSelectedSymbols(latest.symbols)
      setReport((prev) => ({
        ...prev, ...latest,
        stockScores: latest.stockScores?.length ? latest.stockScores : prev.stockScores,
        eventHighlights: latest.eventHighlights?.length ? latest.eventHighlights : prev.eventHighlights,
        recommendationBullets: latest.recommendationBullets?.length ? latest.recommendationBullets : prev.recommendationBullets,
        reportBody: latest.reportBody?.trim() ? latest.reportBody : prev.reportBody,
      }))
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      reloadHistory().catch(() => setErrorMessage("历史报告加载失败，请稍后重试。")).finally(() => setHistoryLoading(false))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const [universeError, setUniverseError] = useState(false)
  const [watchlistError, setWatchlistError] = useState(false)

  useEffect(() => {
    fetchUniverse().then(setUniverse).catch(() => setUniverseError(true))
    fetchUserWatchlist().then((result) => {
      setSelectedSymbols(result.symbols)
      setReport((prev) => ({ ...prev, symbols: result.symbols }))
    }).catch(() => setWatchlistError(true))
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false; if (reportTypingTimerRef.current) window.clearTimeout(reportTypingTimerRef.current) }
  }, [])

  useEffect(() => {
    if (!loading) { setEtaSeconds(REPORT_ETA_SECONDS); return }
    if (!reportStartTsRef.current) reportStartTsRef.current = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - (reportStartTsRef.current ?? Date.now())) / 1000)
      setEtaSeconds(Math.max(0, REPORT_ETA_SECONDS - elapsed))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [loading])

  useEffect(() => { if (reportPhase === "idle") setRenderedReportBody(sanitizeReportBody(report.reportBody || fallbackReportBody(report))) }, [report.id])
  useEffect(() => { try { window.localStorage.setItem(reportCacheKey(), JSON.stringify(report)) } catch {} }, [report])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(reportJobKey())
      if (raw) {
        const job = JSON.parse(raw) as { startedAt?: number; status?: string }
        if (job?.status === "running" && job.startedAt) {
          reportStartTsRef.current = job.startedAt
          setLoading(true); setReportPhase("thinking")
          setTaskHint("报告正在后台生成中，切页不会中断。")
        }
      }
    } catch {}
  }, [])

  const sanitizeReportBody = (text: string) => text.replace(/\r/g, "").replace(/[|#*]/g, "").replace(/^\s*-\s*/gm, "").replace(/\n{3,}/g, "\n\n").trim()
  const fallbackReportBody = (input: SentimentReport) => {
    const events = input.eventHighlights.slice(0, 3).map((x) => `- ${x}`).join("\n")
    const recs = input.recommendationBullets.slice(0, 3).map((x) => `- ${x}`).join("\n")
    return [
      input.reportTitle, `生成时间：${formatReportTime(input.generatedAt)}`, `监控标的：${input.symbols.join("、")}`,
      `执行摘要：${input.summary}`,
      "智能评估：系统已结合蒙特卡洛模拟、VaR、行业对标，输出风险概率、损失分布与时间敏感度。",
      "策略优化：已按风险偏好、预算约束、时间窗口输出保守、平衡、激进三套策略组合。",
      "全周期管理：已覆盖方案设计、成本核算、项目执行、KPI监控、效果反馈，形成PDCA闭环。",
      `关键事件：\n${events}`, `建议动作：\n${recs}`,
    ].join("\n\n")
  }

  const streamReportBody = async (text: string) => {
    const normalized = sanitizeReportBody(text) || "暂无报告正文。"
    const chars = Array.from(normalized)
    let cursor = 0
    setRenderedReportBody("")
    await new Promise<void>((resolve) => {
      const tick = () => {
        const remain = chars.length - cursor
        const chunk = remain > 800 ? 16 : remain > 320 ? 8 : remain > 120 ? 4 : 2
        cursor = Math.min(chars.length, cursor + chunk)
        setRenderedReportBody(chars.slice(0, cursor).join(""))
        if (cursor < chars.length) reportTypingTimerRef.current = window.setTimeout(tick, 18)
        else { reportTypingTimerRef.current = null; resolve() }
      }
      tick()
    })
  }

  const generate = async () => {
    try {
      reportStartTsRef.current = Date.now(); setEtaSeconds(REPORT_ETA_SECONDS); setLoading(true); setReportPhase("thinking"); setErrorMessage("")
      window.localStorage.setItem(reportJobKey(), JSON.stringify({ status: "running", startedAt: reportStartTsRef.current, symbols: selectedSymbols }))
      const generated = await generateSentimentReport(selectedSymbols)
      try { window.localStorage.setItem(reportCacheKey(), JSON.stringify(generated)) } catch {}
      if (isMountedRef.current) {
        setReport(generated); setReportPhase("typing")
        await streamReportBody(generated.reportBody || fallbackReportBody(generated))
        setTaskHint("报告生成成功。")
      }
      try { await saveReport(generated) } catch { if (isMountedRef.current) setTaskHint("报告已生成，但本地缓存写入失败。") }
      try { if (isMountedRef.current) { await reloadHistory(); setTaskHint("报告已更新并写入历史库。") } } catch { if (isMountedRef.current) setTaskHint("报告已生成，但历史列表刷新失败。") }
      if (!isMountedRef.current) window.localStorage.setItem(reportJobKey(), JSON.stringify({ status: "completed", completedAt: Date.now(), reportId: generated.id }))
      else window.localStorage.removeItem(reportJobKey())
    } catch (err) {
      window.localStorage.setItem(reportJobKey(), JSON.stringify({ status: "failed", failedAt: Date.now(), reason: String((err as Error)?.message ?? "unknown") }))
      if (isMountedRef.current) {
        if (axios.isAxiosError(err)) {
          const detail = (typeof err.response?.data?.detail === "string" && err.response.data.detail) || (typeof err.response?.data?.content === "string" && err.response.data.content) || err.message
          setErrorMessage(`报告生成失败：${detail}`)
        } else if (err instanceof Error) setErrorMessage(`报告生成失败：${err.message}`)
        else setErrorMessage("报告生成失败，请检查后端服务和登录状态。")
      }
    } finally {
      if (isMountedRef.current) {
        reportStartTsRef.current = null; setReportPhase("idle"); setLoading(false)
        const job = window.localStorage.getItem(reportJobKey())
        if (job && job.includes("\"status\":\"running\"")) window.localStorage.removeItem(reportJobKey())
      }
    }
  }

  const createTask = async () => {
    try {
      setScheduling(true); setErrorMessage("")
      const cronExpr = `${cronMinute} ${cronHour} ${cronDay} ${cronMonth} ${cronWeek}`
      const task = await createMonitorTask("舆情雷达定时抓取", cronExpr)
      const tasks = await fetchMonitorTasks()
      setTaskHint(`任务已创建: ${task.id.slice(0, 8)}，当前任务数: ${tasks.length}`)
    } catch { setErrorMessage("创建任务失败，请检查 Cron 表达式。") }
    finally { setScheduling(false) }
  }

  const saveWatchlist = async () => {
    try { setSavingWatchlist(true); const result = await saveUserWatchlist(selectedSymbols); setTaskHint(`监控池已保存，共 ${result.symbols.length} 个标的。`) }
    catch { setErrorMessage("监控池保存失败，请稍后重试。") }
    finally { setSavingWatchlist(false) }
  }

  const filteredUniverse = useMemo(() => universe.filter((item) => {
    const kw = watchKeywords.trim().toLowerCase()
    if (!kw) return true
    return item.symbol.toLowerCase().includes(kw) || item.name.toLowerCase().includes(kw)
  }), [universe, watchKeywords])

  const sentimentColor = report.marketSentiment >= 70 ? "text-emerald-300" : report.marketSentiment >= 45 ? "text-amber-300" : "text-rose-300"
  const gaugeColor = report.marketSentiment >= 70 ? "#34d399" : report.marketSentiment >= 45 ? "#fbbf24" : "#fb7185"

  // ECharts: volume bar chart
  const volumeOption = useMemo(() => ({
    backgroundColor: "transparent",
    grid: { left: 0, right: 0, top: 4, bottom: 0 },
    xAxis: { show: false, data: volumeData.map((_, i) => i) },
    yAxis: { show: false },
    series: [
      { type: "bar", data: volumeData.slice(-30), itemStyle: { color: "rgba(129,140,248,0.35)", borderRadius: [2, 2, 0, 0] } },
    ],
  }), [volumeData])

  // ECharts: multi-stock comparison line chart
  const compareOption = useMemo(() => ({
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", borderColor: "rgba(255,255,255,0.10)", backgroundColor: "rgba(16,16,30,0.95)", textStyle: { fontSize: 10 } },
    legend: { bottom: 0, textStyle: { color: "#a1a1aa", fontSize: 9 }, itemWidth: 12, itemHeight: 6 },
    grid: { left: 4, right: 8, top: 4, bottom: 28 },
    xAxis: { show: false, data: Array.from({ length: 50 }, (_, i) => i) },
    yAxis: { show: true, axisLabel: { color: "#71717a", fontSize: 9 }, splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)" } } },
    series: [
      { name: "Tencent", type: "line", data: priceData.aapl, smooth: true, showSymbol: false, lineStyle: { width: 1.2, color: "#818cf8" } },
      { name: "Tencent-Ads", type: "line", data: priceData.nvda, smooth: true, showSymbol: false, lineStyle: { width: 1.2, color: "#34d399" } },
      { name: "Tencent-Cloud", type: "line", data: priceData.mt, smooth: true, showSymbol: false, lineStyle: { width: 1.2, color: "#fbbf24" } },
      { name: "Tencent-Games", type: "line", data: priceData.ndsd, smooth: true, showSymbol: false, lineStyle: { width: 1.2, color: "#38bdf8" } },
    ],
  }), [priceData])

  return (
    <section className="space-y-6 max-w-6xl mx-auto">
      {/* Hero banner with generate CTA */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(99,102,241,0.35),rgba(79,84,221,0.18))] border border-indigo-300/20 shadow-[0_0_24px_rgba(99,102,241,0.15)]">
              <Radar size={20} className="text-indigo-200" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-[-0.02em]">舆情风险分析</h1>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">AI 驱动的市场情绪雷达 · 实时监控 · 智能报告</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {reportPhase === "thinking" ? (
              <div className="flex items-center gap-2 rounded-lg border border-indigo-300/25 bg-indigo-500/10 px-4 py-2 text-xs text-indigo-100">
                <span>AI 分析中</span>
                <span className="flex items-center gap-1"><span className="thinking-dot" /><span className="thinking-dot" /><span className="thinking-dot" /></span>
              </div>
            ) : null}
            <Button onClick={generate} disabled={loading} size="lg" className="shadow-[0_0_28px_rgba(99,102,241,0.25)]">
              <RefreshCw size={15} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} />
              {loading ? "生成中..." : "生成最新舆情报告"}
            </Button>
          </div>
        </div>
        {errorMessage ? <p className="mt-3 text-xs text-rose-300">{errorMessage}</p> : null}
        {taskHint ? <p className="mt-2 text-[11px] text-[var(--brand)]">{taskHint}</p> : null}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main report area */}
        <Card padding="lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[190px_1fr]">
            {/* Gauge + sentiment — CSS radar globe */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#0d0d1a] p-4 relative overflow-hidden">
              {/* Radar background rings */}
              <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
                <div className="rounded-full border border-[rgba(165,153,240,0.3)]" style={{ width: 180, height: 180, animation: "radar-pulse 3s ease-out infinite" }} />
                <div className="absolute rounded-full border border-[rgba(165,153,240,0.2)]" style={{ width: 180, height: 180, animation: "radar-pulse 3s ease-out 0.6s infinite" }} />
                <div className="absolute rounded-full border border-[rgba(56,189,248,0.15)]" style={{ width: 180, height: 180, animation: "radar-pulse 3s ease-out 1.2s infinite" }} />
              </div>
              {/* Scan line */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(165,153,240,0.04) 3deg, transparent 10deg)", animation: "radar-spin 6s linear infinite" }} />
              <div className="relative flex h-32 w-32 items-center justify-center z-10">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <defs>
                    <filter id="glow-ring">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <circle cx="60" cy="60" r="46" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
                  <circle cx="60" cy="60" r="46" stroke={gaugeColor} strokeWidth="8" fill="none" strokeLinecap="round"
                    strokeDasharray={`${(report.marketSentiment / 100) * 289} 289`}
                    filter="url(#glow-ring)"
                    style={{ transition: "stroke-dasharray 0.8s ease, stroke 0.8s ease" }} />
                </svg>
                <div className="absolute text-center">
                  <p className={`mono-metric text-4xl font-bold tracking-tighter ${sentimentColor}`}
                    style={{ filter: `drop-shadow(0 0 12px ${gaugeColor}66)` }}
                  >{report.marketSentiment}</p>
                  <p className="text-[9px] text-[var(--text-muted)] tracking-widest uppercase mt-0.5">sentiment</p>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-1.5 mt-2">
                <span className="h-1 w-1 rounded-full" style={{ background: gaugeColor, boxShadow: `0 0 6px ${gaugeColor}` }} />
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">市场情绪指数</p>
                <span className="h-1 w-1 rounded-full" style={{ background: gaugeColor, boxShadow: `0 0 6px ${gaugeColor}` }} />
              </div>
              <Badge variant={report.marketSentiment >= 70 ? "success" : report.marketSentiment >= 45 ? "warning" : "danger"} size="sm" className="mt-1 relative z-10">
                {report.marketSentiment >= 70 ? "偏乐观" : report.marketSentiment >= 45 ? "中性" : "偏悲观"}
              </Badge>
            </div>

            {/* Report info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-indigo-200">{report.reportTitle}</p>
                <Badge variant="brand" size="sm">AI 生成</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Clock3 size={11} /> {formatReportTime(report.generatedAt)}
                <span className="text-white/[0.10]">|</span>
                <span>{report.symbols.length} 个标的</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {report.symbols.map((s) => <Badge key={s} size="sm" variant="brand">{s}</Badge>)}
              </div>
              <p className="text-[var(--text-secondary)] text-xs leading-relaxed">{report.summary}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/[0.08] bg-[#16162a] p-3">
                  <p className="mb-1.5 text-[11px] font-medium text-white/80 flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-emerald-300/70" />关键事件
                  </p>
                  <ul className="space-y-1 text-[11px] text-[var(--text-muted)]">
                    {report.eventHighlights.slice(0, 4).map((item) => (
                      <li key={item} className="flex items-start gap-1.5"><span className="text-indigo-300/50 mt-0.5">•</span>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-[#16162a] p-3">
                  <p className="mb-1.5 text-[11px] font-medium text-white/80 flex items-center gap-1.5">
                    <Target size={12} className="text-amber-300/70" />执行建议
                  </p>
                  <ul className="space-y-1 text-[11px] text-[var(--text-muted)]">
                    {report.recommendationBullets.slice(0, 3).map((item) => (
                      <li key={item} className="flex items-start gap-1.5"><span className="text-emerald-300/50 mt-0.5">→</span>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.08] bg-[#0d0d1a] p-3">
                <p className="mb-1.5 text-[11px] font-medium text-white/80 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-indigo-300/70" />智能风险应对报告
                </p>
                <div className="max-h-44 overflow-auto whitespace-pre-wrap text-[11px] leading-6 text-[var(--text-muted)]">
                  {renderedReportBody || sanitizeReportBody(report.reportBody || fallbackReportBody(report))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Side: charts + controls */}
        <div className="space-y-4">
          {/* Multi-stock comparison chart */}
          <Card padding="default">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 ring-1 ring-indigo-300/15">
                <TrendingUp size={11} className="text-indigo-300/80" />
              </div>
              <h3 className="text-sm font-semibold tracking-[-0.01em]">标的价格走势对比</h3>
            </div>
            <ReactECharts option={compareOption} style={{ height: 180 }} />
          </Card>

          {/* Stock scores with mini sparklines */}
          <Card padding="default">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 ring-1 ring-emerald-300/15">
                <BarChart3 size={11} className="text-emerald-300/80" />
              </div>
              <h3 className="text-sm font-semibold tracking-[-0.01em]">个股舆情评分</h3>
            </div>
            <div className="space-y-3">
              {report.stockScores.map((item, i) => {
                const barColor = item.score >= 75 ? "bg-gradient-to-r from-emerald-500/80 to-emerald-400/40" : item.score >= 60 ? "bg-gradient-to-r from-amber-400/80 to-amber-300/40" : "bg-gradient-to-r from-rose-500/80 to-rose-400/40"
                const glowColor = item.score >= 75 ? "#34d399" : item.score >= 60 ? "#fbbf24" : "#f87171"
                return (
                  <div key={item.symbol} className="space-y-1 group">
                    <div className="flex items-center justify-between">
                      <span className="mono-metric text-[11px] font-medium group-hover:text-white transition-colors">{item.symbol}</span>
                      <span className={`mono-metric text-xs font-semibold ${item.score >= 75 ? "text-emerald-300" : item.score >= 60 ? "text-amber-300" : "text-rose-300"}`}>
                        {item.score}分
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-white/[0.06] via-white/[0.12] to-white/[0.06]"
                        style={{
                          width: `${item.score}%`,
                          backgroundSize: "200% 100%",
                          animation: `bar-shimmer 2.5s ease-in-out ${i * 0.2}s infinite`,
                          transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          boxShadow: `0 0 8px ${glowColor}33, inset 0 1px 0 rgba(255,255,255,0.06)`,
                          borderRight: `2px solid ${glowColor}66`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Volume / activity chart */}
          <Card padding="default">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 ring-1 ring-amber-300/15">
                <BarChart3 size={11} className="text-amber-300/80" />
              </div>
              <h3 className="text-sm font-semibold tracking-[-0.01em]">市场活跃度</h3>
            </div>
            <ReactECharts option={volumeOption} style={{ height: 100 }} />
            <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--text-muted)]">
              <span>成交量模拟</span>
              <span className="mono-metric">日均: {Math.floor(volumeData.reduce((a, b) => a + b, 0) / volumeData.length).toLocaleString()}</span>
            </div>
          </Card>

          {/* History */}
          <Card padding="default">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/10 ring-1 ring-sky-300/15">
                <History size={11} className="text-sky-300/80" />
              </div>
              <h3 className="text-sm font-semibold tracking-[-0.01em]">报告历史库</h3>
            </div>
            {historyLoading ? (
              <div className="space-y-1.5">
                {Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} className="h-6 w-full" />)}
              </div>
            ) : (
              <div className="space-y-1 text-xs text-[var(--text-muted)] max-h-32 overflow-auto">
                {history.slice(0, 8).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-white/[0.04] cursor-pointer transition">
                    <div className="flex items-center gap-2">
                      <span className="mono-metric text-[11px]">#{item.id}</span>
                      <Badge size="sm" variant={item.marketSentiment >= 70 ? "success" : item.marketSentiment >= 45 ? "warning" : "danger"}>
                        {item.marketSentiment}
                      </Badge>
                    </div>
                    <span className="text-[10px]">{dayjs.utc(item.generatedAt).local().format("MM-DD HH:mm")}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom row: scheduler + watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="default">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 ring-1 ring-amber-300/15">
              <Clock3 size={11} className="text-amber-300/80" />
            </div>
            <h3 className="text-sm font-semibold tracking-[-0.01em]">定时任务调度</h3>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "分钟", value: cronMinute, set: setCronMinute, ph: "0" },
              { label: "小时", value: cronHour, set: setCronHour, ph: "*/2" },
              { label: "日", value: cronDay, set: setCronDay, ph: "*" },
              { label: "月", value: cronMonth, set: setCronMonth, ph: "*" },
              { label: "周", value: cronWeek, set: setCronWeek, ph: "1-5" },
            ].map((f) => (
              <div key={f.label}>
                <label className="mb-1 block text-[10px] text-[var(--text-muted)]">{f.label}</label>
                <Input size="sm" value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-[var(--text-muted)] mono-metric">Cron: {cronMinute} {cronHour} {cronDay} {cronMonth} {cronWeek}</p>
          <Button className="mt-3 w-full" variant="outline" size="sm" onClick={createTask} disabled={scheduling}>
            <Plus size={12} className="mr-1" />{scheduling ? "创建中..." : "创建调度任务"}
          </Button>
        </Card>

        <Card padding="default">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 ring-1 ring-emerald-300/15">
              <Target size={11} className="text-emerald-300/80" />
            </div>
            <h3 className="text-sm font-semibold tracking-[-0.01em]">监控池管理</h3>
          </div>
          <div className="relative mb-2">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input size="sm" className="pl-7" value={watchKeywords} onChange={(e) => setWatchKeywords(e.target.value)} placeholder="搜索代码或公司名..." />
          </div>
          <div className="h-[180px] overflow-auto space-y-0.5 rounded-lg border border-white/[0.08] p-1.5 bg-[#0d0d1a]">
            {filteredUniverse.slice(0, 60).map((item) => {
              const checked = selectedSymbols.includes(item.symbol)
              return (
                <button key={item.symbol} type="button"
                  onClick={() => setSelectedSymbols((prev) => checked ? prev.filter((x) => x !== item.symbol) : prev.length >= 30 ? prev : [...prev, item.symbol])}
                  className={`focus-outline flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] transition ${
                    checked ? "bg-indigo-500/20 text-indigo-100 border border-indigo-300/15" : "text-[var(--text-muted)] hover:bg-white/[0.04]"
                  }`}>
                  <span className="mono-metric">{item.symbol}</span>
                  <span className="truncate pl-2 text-[10px] text-[var(--text-disabled)]">{item.name}</span>
                </button>
              )
            })}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] text-[var(--text-muted)]">已选 {selectedSymbols.length}/30</p>
            <Button size="xs" variant="outline" onClick={saveWatchlist} disabled={savingWatchlist}>
              {savingWatchlist ? "保存中..." : "保存监控池"}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}
