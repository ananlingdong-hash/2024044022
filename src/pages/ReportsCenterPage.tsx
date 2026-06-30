import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { FileText, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchSentimentHistory } from "@/api/sentiment"
import type { SentimentReport } from "@/types/domain"

dayjs.extend(utc)

const demoReports: SentimentReport[] = [
  {
    id: "demo-tencent-risk-20260628",
    generatedAt: "2026-06-28 20:30:00",
    symbols: ["Tencent", "WeChat", "EU DSA", "AI Compute", "USD/CNY"],
    marketSentiment: 68,
    summary: "系统识别腾讯控股当前主要压力来自海外监管、AI 算力供应和全球化收入敞口。建议采用平衡响应方案，在合规投入、算力替代与业务连续性之间取得最优展示效果。",
    stockScores: [
      { symbol: "Tencent", score: 68 },
      { symbol: "WeChat", score: 74 },
      { symbol: "EU DSA", score: 71 },
      { symbol: "AI Compute", score: 66 },
      { symbol: "USD/CNY", score: 58 },
    ],
    suggestion: "推荐执行平衡响应：美国 CMC黑名单 合规预案进入 48 小时复核，游戏版号 风险进入专项台账，AI 算力供应切换至双供应池，并将剩余风险纳入 PDCA 监控。",
    reportTitle: "腾讯控股风险监管决策报告 · 演示版",
    eventHighlights: [
      "CMC黑名单监管不确定性仍是最高权重风险因子。",
      "游戏版号 对算法透明、未成年人保护和内容治理提出持续合规压力。",
      "AI 模型训练和推荐系统依赖高性能算力，出口管制与 GPU 成本上行带来供应约束。",
    ],
    recommendationBullets: [
      "采用平衡响应方案，优先处理高确定性的合规动作。",
      "建立 AI 算力替代池，降低单一 GPU/云资源依赖。",
      "将 Tencent FinTech、广告主信用和美元收入敞口纳入月度监控。",
    ],
    reportBody: [
      "执行摘要",
      "AstraQuant 风险哨兵 Agent 已完成腾讯控股企业风险案例的端到端分析。系统从监管合规、AI 算力、全球化经营、广告与电商信用四类信号出发，识别当前综合风险评分为 68.2，处于中高关注区间。",
      "",
      "一、数据口径说明",
      "腾讯控股为非上市公司，没有公开年报。本报告采用公开官方资料、监管机构公告与权威媒体估算。财务、估值和业务规模相关数字均标注为估算口径，适合课堂演示但不等同于审计财报。",
      "",
      "二、风险识别",
      "1. 监管合规风险：美国 CMC黑名单 剥离/禁令相关法律、游戏版号 调查与多地数据本地化要求，是当前最核心的监管压力。",
      "2. AI 算力风险：推荐系统、混元大模型、广告投放模型和内容安全模型对高性能 GPU、云资源和数据中心依赖较高。",
      "3. 全球化经营风险：微信广告、Tencent FinTech 和海外业务带来美元、欧元、英镑、日元等多币种敞口。",
      "4. 商业信用风险：广告主预算变化、跨境商家结算和平台补贴周期会影响回款稳定性。",
      "",
      "三、智能评估",
      "蒙特卡洛模拟与 VaR 结果显示，监管合规因子贡献约 45.8%，AI 算力因子贡献约 30.7%，全球化经营与汇率因子贡献约 23.5%。风险不是单一财务波动，而是监管事件、技术资源和商业化节奏的耦合。",
      "",
      "四、策略建议",
      "系统推荐平衡响应方案：保持重点市场合规投入，建立美国与欧盟监管动作台账；对 AI 算力建立 GPU、国产替代、云资源三层保障；对 Tencent FinTech 和广告业务设置回款与政策阈值。",
      "",
      "五、执行闭环",
      "建议进入 PDCA 流程：Plan 阶段确认监管与算力优先级，Do 阶段生成合规、采购与舆情动作，Check 阶段监控 KPI，Act 阶段根据监管进展和模型成本自动复盘。",
    ].join("\n"),
  },
]

export function ReportsCenterPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["reports-center-history"],
    queryFn: fetchSentimentHistory,
    staleTime: 30_000,
  })

  const [activeId, setActiveId] = useState<string | null>(demoReports[0].id)
  const reports = data.length ? data : demoReports
  const active = reports.find((r) => r.id === activeId) ?? reports[0]

  const sentimentColor = (v: number) =>
    v >= 70 ? "text-emerald-300" : v >= 45 ? "text-amber-300" : "text-rose-300"

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1" padding="lg">
        <div className="mb-4 flex items-center gap-2">
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
            {reports.slice(0, 12).map((item) => (
              <div
                key={item.id}
                className={`cursor-pointer rounded-lg border px-3 py-2.5 text-xs transition ${
                  activeId === item.id ? "border-indigo-300/25 bg-indigo-500/8" : "border-white/[0.05] bg-white/[0.02] hover:border-white/[0.10] hover:bg-white/[0.04]"
                }`}
                onClick={() => setActiveId(item.id)}
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="text-[13px] font-medium tracking-[-0.01em] text-[var(--text)]">{item.reportTitle || `报告#${item.id}`}</p>
                  <Badge size="sm" variant={item.marketSentiment >= 70 ? "success" : item.marketSentiment >= 45 ? "warning" : "danger"}>
                    {item.marketSentiment}
                  </Badge>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {dayjs.utc(item.generatedAt).local().format("YYYY-MM-DD HH:mm")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="lg:col-span-2" variant="elevated" padding="lg">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-300/15">
            <TrendingUp size={13} className="text-emerald-300/80" />
          </div>
          <h2 className="text-sm font-semibold tracking-[-0.01em]">报告详情预览</h2>
        </div>
        {active ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold tracking-[-0.02em]">{active.reportTitle}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {dayjs.utc(active.generatedAt).local().format("YYYY-MM-DD HH:mm:ss")} · {active.symbols.length} 个监控对象
                </p>
              </div>
              <div className="text-center">
                <p className={`mono-metric text-3xl font-semibold ${sentimentColor(active.marketSentiment)}`}>
                  {active.marketSentiment}
                </p>
                <p className="text-[10px] text-[var(--text-muted)]">风险指数</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {active.symbols.map((s) => (
                <Badge key={s} size="sm" variant="brand">{s}</Badge>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{active.summary}</p>
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
              <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap text-xs leading-6 text-[var(--text-muted)]">
                {active.reportBody || "暂无正文"}
              </pre>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={24} /></div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">暂无历史报告</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">前往舆情雷达页生成第一份报告</p>
          </div>
        )}
      </Card>
    </section>
  )
}
