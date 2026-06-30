import { Link } from "react-router-dom"
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  GitBranch,
  Play,
  Radar,
  ShieldAlert,
  Target,
  Zap,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { activeCompanyProfile, companyRiskProfiles } from "@/data/companyRiskProfiles"

const decisionSteps = [
  { label: "风险信号接入", desc: "接入监管政策、国际业务、平台经营与技术资源信号", icon: Radar, color: "text-cyan-300", route: "/scenarios" },
  { label: "智能风险评估", desc: "用 VaR、压力测试、因子贡献与爆发窗口解释风险", icon: Brain, color: "text-amber-300", route: "/risk-response" },
  { label: "策略优化推荐", desc: "生成稳健、平衡、增长三套可执行应对方案", icon: GitBranch, color: "text-indigo-300", route: "/strategy-optimizer" },
  { label: "PDCA 执行闭环", desc: "把审批、执行、KPI 检查与复盘串成完整展示链路", icon: ClipboardList, color: "text-emerald-300", route: "/pdca" },
]

function toneClass(tone: string) {
  const map: Record<string, string> = {
    cyan: "border-cyan-300/20 bg-cyan-400/[0.04] text-cyan-200",
    violet: "border-indigo-300/20 bg-indigo-400/[0.05] text-indigo-200",
    amber: "border-amber-300/20 bg-amber-400/[0.05] text-amber-200",
    rose: "border-rose-300/20 bg-rose-400/[0.05] text-rose-200",
    emerald: "border-emerald-300/20 bg-emerald-400/[0.05] text-emerald-200",
  }
  return map[tone] ?? map.violet
}

export function DemoCommandPage() {
  const company = activeCompanyProfile

  const demoScript = [
    `先展示公司选择器：本次课堂演示锁定 ${company.name}。`,
    "切入风险场景中心：从监管合规、国际业务敞口、商业信用与 AI 算力开始讲。",
    "触发智能评估：解释综合评分、因子贡献、VaR 和风险爆发窗口。",
    "进入策略优化：对比三套方案，强调系统为什么推荐平衡响应。",
    "最后进入报告中心：输出一份可汇报、可追溯、带数据来源说明的结论报告。",
  ]

  return (
    <section className="mx-auto max-w-[1500px] space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Card variant="cyber" padding="lg" className="min-h-[330px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-400/[0.06] px-3 py-1 text-[11px] text-emerald-200">
                <span className="status-dot online" />
                课堂展示模式已就绪
              </div>
              <h1 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-white">企业风险监管决策平台</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                围绕 {company.nameEn} 的监管合规、云与 AI 算力、全球化经营与商业信用风险，
                把公开信息与建模参数转化为可解释评估、策略方案和 PDCA 执行闭环。
              </p>
            </div>
            <Badge variant="brand" size="sm">AstraQuant Demo</Badge>
          </div>

          <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white">
              <Database size={14} className="text-indigo-300" />
              公司画像
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px_1fr]">
              <select
                value={company.id}
                className="h-11 rounded-xl border border-indigo-300/18 bg-[#141127] px-3 text-sm text-white outline-none"
                aria-label="选择公司"
                disabled
              >
                {companyRiskProfiles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.nameEn})
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                {company.metrics.map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/[0.05] bg-black/15 px-3 py-2">
                    <div className="text-[10px] text-[var(--text-muted)]">{item.label}</div>
                    <div className="mt-1 font-mono text-lg font-semibold text-white">{item.value}</div>
                    <div className="mt-0.5 text-[10px] text-white/40">{item.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {company.risks.map((item) => (
              <div key={item.label} className={cn("rounded-xl border px-4 py-3", toneClass(item.tone))}>
                <div className="text-[10px] text-white/45">{item.label}</div>
                <div className="mt-1 font-mono text-2xl font-semibold tracking-[-0.03em]">{item.value}</div>
                <div className="mt-1 text-[11px] leading-5 text-white/55">{item.detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/scenarios" className="focus-outline inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#34d399,#22c55e)] px-5 text-sm font-medium text-white shadow-[0_0_28px_rgba(52,211,153,0.22)] transition hover:brightness-110">
              <Play size={15} />
              启动风险监管演示
            </Link>
            <Link to="/dashboard" className="focus-outline inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white">
              <BarChart3 size={15} />
              查看总览指挥台
            </Link>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 ring-1 ring-rose-300/15">
              <ShieldAlert size={15} className="text-rose-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-[-0.01em]">今日核心风险主题</h2>
              <p className="text-[10px] text-[var(--text-muted)]">适合课堂开场的冲突点</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-rose-300/14 bg-rose-400/[0.04] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-rose-100">监管合规与 AI 投入压力同步抬升</span>
              <span className="rounded-full bg-rose-400/12 px-2 py-0.5 text-[10px] text-rose-200">高关注</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">
              当前更适合把故事讲成“平台型科技企业如何在监管、增长和算力投入之间做平衡”，这样比单一财务评分更高级，也更像真实管理决策。
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["当前公司", company.name, company.status],
              ["综合风险", "68.2", "监管与算力因子权重较高"],
              ["推荐策略", "平衡响应", "合规专项 + 算力保障 + 分区域阈值"],
            ].map(([label, value, detail]) => (
              <div key={label} className="flex items-center justify-between border-b border-white/[0.05] pb-3 last:border-b-0">
                <div>
                  <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
                  <div className="mt-0.5 text-sm font-semibold text-white">{value}</div>
                </div>
                <div className="max-w-[160px] text-right text-[10px] leading-4 text-[var(--text-muted)]">{detail}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card variant="cyber" padding="lg">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-[-0.01em]">端到端展示路径</h2>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">按这个顺序展示，老师会看到一个完整的 AI 风险监管闭环。</p>
          </div>
          <div className="hidden items-center gap-1.5 text-[10px] text-[var(--text-muted)] md:flex">
            <Activity size={12} className="text-emerald-300/70" />
            全流程约 4-6 分钟
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          {decisionSteps.map((step, index) => (
            <Link key={step.label} to={step.route} className="group rounded-xl border border-white/[0.06] bg-white/[0.025] p-4 transition hover:border-white/[0.14] hover:bg-white/[0.045]">
              <div className="flex items-center justify-between">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06]", step.color)}>
                  <step.icon size={16} />
                </div>
                <span className="font-mono text-[11px] text-white/35">0{index + 1}</span>
              </div>
              <div className="mt-4 text-sm font-semibold text-white">{step.label}</div>
              <p className="mt-1 min-h-10 text-[11px] leading-5 text-[var(--text-muted)]">{step.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-[11px] text-[var(--brand)] opacity-80 transition group-hover:gap-2 group-hover:opacity-100">
                进入页面 <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.62fr_0.38fr]">
        <Card variant="soft" padding="lg">
          <div className="mb-4 flex items-center gap-2">
            <FileText size={15} className="text-indigo-300" />
            <h2 className="text-sm font-semibold tracking-[-0.01em]">课堂讲解脚本</h2>
          </div>
          <div className="space-y-3">
            {demoScript.map((line, index) => (
              <div key={line} className="flex items-start gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-400/10 font-mono text-[10px] text-indigo-200">{index + 1}</span>
                <span className="text-xs leading-5 text-[var(--text-secondary)]">{line}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="soft" padding="lg">
          <div className="mb-4 flex items-center gap-2">
            <Target size={15} className="text-emerald-300" />
            <h2 className="text-sm font-semibold tracking-[-0.01em]">展示亮点</h2>
          </div>
          <div className="space-y-3">
            {[
              "不是单点预测，而是监管、经营、算力、信用的完整决策链路。",
              "明确区分官方披露数据和课堂建模参数，可信度更高。",
              "每一步都有图表、解释和可执行动作，展示感很强。",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-xs leading-5 text-[var(--text-secondary)]">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-300/80" />
                {item}
              </div>
            ))}
          </div>
          <Link to="/reports" className="focus-outline mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs font-medium text-[var(--text-secondary)] transition hover:border-white/[0.16] hover:text-white">
            <Zap size={13} />
            最后展示报告中心
          </Link>
        </Card>
      </div>
    </section>
  )
}
