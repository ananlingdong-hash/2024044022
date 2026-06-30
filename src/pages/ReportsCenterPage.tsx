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
    id: "demo-tencent-risk-20260630",
    generatedAt: "2026-06-30 16:00:00",
    symbols: ["0700.HK", "Weixin/WeChat", "Tencent Cloud", "International Games", "USD/CNY"],
    marketSentiment: 66,
    summary: "系统识别腾讯当前的主要压力来自监管合规、云与 AI 算力投入、国际化业务波动和广告主回款节奏。建议采用平衡响应方案，在稳住核心业务韧性的同时控制高成本风险敞口。",
    stockScores: [
      { symbol: "0700.HK", score: 66 },
      { symbol: "Weixin/WeChat", score: 74 },
      { symbol: "Tencent Cloud", score: 69 },
      { symbol: "International Games", score: 72 },
      { symbol: "USD/CNY", score: 58 },
    ],
    suggestion: "推荐执行平衡响应：监管事项进入专项台账，云与 AI 算力建立双供应保障，国际游戏与金融科技业务进入季度压力测试，并将剩余风险纳入 PDCA 监控。",
    reportTitle: "腾讯风险监管决策报告 · 演示版",
    eventHighlights: [
      "监管与合规事项仍是腾讯当前最高权重风险因子。",
      "腾讯云与混元大模型建设对算力、数据中心与资本开支提出更高要求。",
      "国际游戏与跨境业务扩张带来汇率、区域政策与结算节奏波动。",
    ],
    recommendationBullets: [
      "采用平衡响应方案，优先处理高确定性的合规动作。",
      "建立云与 AI 算力冗余池，降低单一 GPU/云资源依赖。",
      "将国际游戏收入、广告主信用与美元敞口纳入月度监控。",
    ],
    reportBody: [
      "执行摘要",
      "AstraQuant 风险哨兵 Agent 已完成腾讯案例的端到端分析。系统从监管合规、云与 AI 算力、国际化经营、广告与金融科技信用四类信号出发，识别当前综合风险评分为 66.0，处于中高关注区间。",
      "",
      "一、数据口径说明",
      "腾讯为上市公司。本报告优先采用腾讯控股年度业绩公告、公开运营数据与监管公开信息；其中部分场景参数、压力测试阈值和 PD/LGD 为课堂演示建模参数。",
      "",
      "二、风险识别",
      "1. 监管合规风险：游戏版号、未成年人保护、数据合规与金融科技监管是当前最核心的经营约束。",
      "2. 云与 AI 算力风险：腾讯云、混元大模型、推荐系统和内容安全能力对 GPU、云资源和数据中心依赖度较高。",
      "3. 国际化经营风险：国际游戏、跨境支付和多币种收入带来汇率、区域政策与经营节奏波动。",
      "4. 商业信用风险：广告主预算变化、企业服务客户回款和平台商家结算周期影响现金流稳定性。",
      "",
      "三、智能评估",
      "压力测试与 VaR 结果显示，监管合规因子贡献约 43%，云与 AI 算力因子贡献约 32%，国际化经营因子贡献约 25%。风险并非单一财务波动，而是监管、技术资源和经营节奏的耦合。",
      "",
      "四、策略建议",
      "系统推荐平衡响应方案：维持重点监管事项的专项投入；对腾讯云与 AI 算力建立 GPU、国产替代和数据中心三层保障；对国际游戏、金融科技与广告业务设置分区域风险阈值。",
      "",
      "五、执行闭环",
      "建议进入 PDCA 流程：Plan 阶段确认监管与算力优先级，Do 阶段生成合规、采购与经营动作，Check 阶段监控 KPI，Act 阶段根据经营反馈自动复盘。",
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

  const sentimentColor = (value: number) =>
    value >= 70 ? "text-emerald-300" : value >= 45 ? "text-amber-300" : "text-rose-300"

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
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton h-16 w-full rounded-lg" />
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
                <p className="text-[11px] text-[var(--text-muted)]">{dayjs.utc(item.generatedAt).local().format("YYYY-MM-DD HH:mm")}</p>
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
                <p className={`mono-metric text-3xl font-semibold ${sentimentColor(active.marketSentiment)}`}>{active.marketSentiment}</p>
                <p className="text-[10px] text-[var(--text-muted)]">风险指数</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {active.symbols.map((symbol) => (
                <Badge key={symbol} size="sm" variant="brand">{symbol}</Badge>
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
