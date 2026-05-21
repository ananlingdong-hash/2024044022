import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchSentimentHistory } from "@/api/sentiment"
import { FileText, TrendingUp } from "lucide-react"

dayjs.extend(utc)

export function ReportsCenterPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["reports-center-history"],
    queryFn: fetchSentimentHistory,
    staleTime: 30_000,
  })

  const active = data[0]

  const sentimentColor = (v: number) =>
    v >= 70 ? "text-emerald-300" : v >= 45 ? "text-amber-300" : "text-rose-300"

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      {/* Report list */}
      <Card className="xl:col-span-4" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-300/15">
            <FileText size={13} className="text-indigo-300/80" />
          </div>
          <h2 className="text-sm font-semibold tracking-[-0.01em]">报告中心</h2>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {data.slice(0, 12).map((item) => (
              <div key={item.id} className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 text-xs transition hover:border-white/[0.10] hover:bg-white/[0.04] cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-[var(--text)] text-[13px] tracking-[-0.01em]">{item.reportTitle || `报告#${item.id}`}</p>
                  <Badge size="sm" variant={item.marketSentiment >= 70 ? "success" : item.marketSentiment >= 45 ? "warning" : "danger"}>
                    {item.marketSentiment}
                  </Badge>
                </div>
                <p className="text-[var(--text-muted)] text-[11px]">
                  {dayjs.utc(item.generatedAt).local().format("YYYY-MM-DD HH:mm")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Report detail */}
      <Card className="xl:col-span-8" variant="elevated" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-300/15">
            <TrendingUp size={13} className="text-emerald-300/80" />
          </div>
          <h2 className="text-sm font-semibold tracking-[-0.01em]">报告详情预览</h2>
        </div>
        {active ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold tracking-[-0.02em]">{active.reportTitle}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {dayjs.utc(active.generatedAt).local().format("YYYY-MM-DD HH:mm:ss")} · {active.symbols.length} 个标的
                </p>
              </div>
              <div className="text-center">
                <p className={`mono-metric text-3xl font-semibold ${sentimentColor(active.marketSentiment)}`}>
                  {active.marketSentiment}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">情绪指数</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {active.symbols.map((s) => (
                <Badge key={s} size="sm" variant="brand">{s}</Badge>
              ))}
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{active.summary}</p>
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap text-xs text-[var(--text-muted)] leading-6">
                {active.reportBody || "暂无正文"}
              </pre>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={24} /></div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">暂无历史报告</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">前往舆情雷达页生成第一份报告</p>
          </div>
        )}
      </Card>
    </section>
  )
}
