import { useCallback, useEffect, useMemo, useState } from "react"
import ReactECharts from "echarts-for-react"
import {
  Activity,
  AlertTriangle,
  Brain,
  CreditCard,
  Database,
  DollarSign,
  MapPin,
  Radio,
  Shield,
  Sparkles,
  Target,
  Truck,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getScenarioCredit, getScenarioFx, getScenarioSupply } from "@/api/risk-response"
import type { ScenarioCreditResponse, ScenarioFxResponse, ScenarioSupplyResponse } from "@/types/risk-response"

type ScenarioTab = "fx" | "credit" | "supply"

function formatCurrency(value: number) {
  if (value >= 1e8) return `${(value / 1e8).toFixed(0)} 亿`
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`
  return `${value}`
}

function SectionTitle({ icon: Icon, title, tag }: { icon: typeof Radio; title: string; tag?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-300/15">
        <Icon size={12} className="text-indigo-300" />
      </div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white">{title}</h3>
      {tag ? <span className="ml-1 rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-[var(--text-muted)]">{tag}</span> : null}
    </div>
  )
}

function FxScenario({ data }: { data: ScenarioFxResponse }) {
  const exposureOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(22,18,42,0.95)",
        borderColor: "rgba(139,132,190,0.18)",
        textStyle: { color: "#eeecf7", fontSize: 11 },
      },
      grid: { top: 24, right: 16, bottom: 28, left: 50 },
      xAxis: {
        type: "category",
        data: data.exposures.map((item) => item.currency),
        axisLabel: { color: "#9b96b7", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#9b96b7", formatter: (v: number) => `${(v / 1e8).toFixed(0)} 亿` },
        splitLine: { lineStyle: { color: "rgba(139,132,190,0.08)" } },
      },
      series: [
        {
          name: "总敞口",
          type: "bar",
          data: data.exposures.map((item) => item.exposure),
          itemStyle: { color: "#38bdf8", borderRadius: [6, 6, 0, 0] },
        },
        {
          name: "已对冲",
          type: "bar",
          data: data.exposures.map((item) => item.exposure * item.hedge_ratio),
          itemStyle: { color: "#34d399", borderRadius: [6, 6, 0, 0] },
        },
      ],
    }),
    [data.exposures],
  )

  return (
    <div className="space-y-5">
      <SectionTitle icon={Radio} title="信息接收 · 全球化经营敞口" tag="腾讯控股 Tencent" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["总敞口", formatCurrency(data.total_exposure)],
          ["对冲覆盖", `${(data.coverage_ratio * 100).toFixed(0)}%`],
          ["监测币种", `${data.exposures.length}`],
          ["预警信号", `${data.alerts.length}`],
        ].map(([label, value]) => (
          <Card key={label} variant="elevated" padding="sm" className="text-center">
            <div className="mb-1 text-[10px] text-[var(--text-muted)]">{label}</div>
            <div className="font-mono text-2xl font-bold text-white">{value}</div>
          </Card>
        ))}
      </div>

      <Card variant="soft" padding="sm">
        <h4 className="mb-2 text-xs font-semibold text-white">国际业务币种敞口</h4>
        <ReactECharts option={exposureOption} style={{ height: 260 }} />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {data.exposures.map((item) => (
          <Card key={item.currency} variant="soft" padding="sm">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">{item.currency}</h4>
              <Badge size="sm" variant={item.hedge_ratio >= 0.55 ? "success" : "warning"}>
                {(item.hedge_ratio * 100).toFixed(0)}% 覆盖
              </Badge>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">敞口规模</span>
                <span className="font-mono text-white">{formatCurrency(item.exposure)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">30天到期</span>
                <span className="font-mono text-white">{formatCurrency(item.period_30d)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">隐含波动</span>
                <span className="font-mono text-amber-300">{item.implied_vol?.toFixed(1) ?? "-"}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card variant="soft" padding="sm">
        <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold text-white">
          <AlertTriangle size={12} className="text-[var(--warning)]" />
          实时预警
        </h4>
        <div className="space-y-2">
          {data.alerts.map((item) => (
            <div
              key={item}
              className="rounded-lg border border-amber-300/10 bg-amber-400/[0.04] p-2.5 text-[11px] leading-5 text-[var(--text-secondary)]"
            >
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function CreditScenario({ data }: { data: ScenarioCreditResponse }) {
  const option = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(22,18,42,0.95)",
        borderColor: "rgba(139,132,190,0.18)",
        textStyle: { color: "#eeecf7", fontSize: 11 },
      },
      grid: { top: 20, right: 20, bottom: 28, left: 80 },
      xAxis: {
        type: "value",
        axisLabel: { color: "#9b96b7", formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
        splitLine: { lineStyle: { color: "rgba(139,132,190,0.08)" } },
      },
      yAxis: {
        type: "category",
        data: data.pd_lgd_table.map((row) => row.borrower),
        axisLabel: { color: "#b0acc6", fontSize: 10 },
      },
      series: [
        {
          name: "PD",
          type: "bar",
          data: data.pd_lgd_table.map((row) => row.pd),
          itemStyle: { color: "#a599f0", borderRadius: [0, 4, 4, 0] },
        },
        {
          name: "Cox调整PD",
          type: "bar",
          data: data.pd_lgd_table.map((row) => row.cox_pd ?? row.pd),
          itemStyle: { color: "#fb7185", borderRadius: [0, 4, 4, 0] },
        },
      ],
    }),
    [data.pd_lgd_table],
  )

  return (
    <div className="space-y-5">
      <SectionTitle icon={CreditCard} title="信用风险 · 广告主与商家回款" tag="广告 / 商家 / 企业服务" />

      <Card variant="soft" padding="sm">
        <h4 className="mb-2 text-xs font-semibold text-white">PD / LGD 与舆情调整</h4>
        <ReactECharts option={option} style={{ height: 300 }} />
      </Card>

      <Card variant="soft" padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-[var(--text-muted)]">
                <th className="py-2 text-left font-medium">对象</th>
                <th className="py-2 text-right font-medium">评级</th>
                <th className="py-2 text-right font-medium">PD</th>
                <th className="py-2 text-right font-medium">LGD</th>
                <th className="py-2 text-right font-medium">EAD</th>
                <th className="py-2 text-right font-medium">RAROC</th>
              </tr>
            </thead>
            <tbody>
              {data.pd_lgd_table.map((row) => (
                <tr key={row.borrower} className="border-b border-white/[0.04]">
                  <td className="py-2 font-medium text-white">{row.borrower}</td>
                  <td className="py-2 text-right text-[var(--text-secondary)]">{row.rating}</td>
                  <td className="py-2 text-right font-mono text-rose-300">{(row.pd * 100).toFixed(1)}%</td>
                  <td className="py-2 text-right font-mono text-[var(--text-secondary)]">{(row.lgd * 100).toFixed(0)}%</td>
                  <td className="py-2 text-right font-mono text-[var(--text-secondary)]">{formatCurrency(row.ead)}</td>
                  <td className="py-2 text-right font-mono text-emerald-300">{(row.raroc * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card variant="soft" padding="sm">
        <h4 className="mb-3 text-xs font-semibold text-white">组合优化建议</h4>
        <div className="space-y-2">
          {data.optimization_suggestions.map((item) => (
            <div key={item} className="rounded-lg border border-white/[0.05] bg-white/[0.025] p-2.5 text-[11px] leading-5 text-[var(--text-secondary)]">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SupplyScenario({ data }: { data: ScenarioSupplyResponse }) {
  const option = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(22,18,42,0.95)",
        borderColor: "rgba(139,132,190,0.18)",
        textStyle: { color: "#eeecf7", fontSize: 11 },
      },
      grid: { top: 18, right: 20, bottom: 28, left: 45 },
      xAxis: {
        type: "category",
        data: data.disruption_forecast.map((item) => `D${item.day}`),
        axisLabel: { color: "#9b96b7", fontSize: 9, interval: 9 },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#9b96b7", formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
        splitLine: { lineStyle: { color: "rgba(139,132,190,0.08)" } },
      },
      series: [
        {
          type: "line",
          data: data.disruption_forecast.map((item) => item.probability),
          smooth: true,
          symbol: "none",
          lineStyle: { color: "#fb7185", width: 2 },
          areaStyle: { color: "rgba(251,113,133,0.10)" },
        },
      ],
    }),
    [data.disruption_forecast],
  )

  return (
    <div className="space-y-5">
      <SectionTitle icon={Truck} title="供应风险 · AI算力与数字基础设施" tag="平台型企业供应网络" />

      <Card variant="soft" padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-[var(--text-muted)]">
                <th className="py-2 text-left font-medium">节点</th>
                <th className="py-2 text-left font-medium">类别</th>
                <th className="py-2 text-right font-medium">中断概率</th>
                <th className="py-2 text-right font-medium">前置时间</th>
                <th className="py-2 text-left font-medium">区域</th>
                <th className="py-2 text-right font-medium">综合评分</th>
              </tr>
            </thead>
            <tbody>
              {data.suppliers.map((item) => (
                <tr key={item.id} className="border-b border-white/[0.04]">
                  <td className="py-2 font-medium text-white">{item.name}</td>
                  <td className="py-2 text-[var(--text-secondary)]">{item.category}</td>
                  <td className="py-2 text-right font-mono text-rose-300">{(item.disruption_prob * 100).toFixed(1)}%</td>
                  <td className="py-2 text-right font-mono text-[var(--text-secondary)]">{item.lead_time_days}天</td>
                  <td className="flex items-center gap-1 py-2 text-[var(--text-secondary)]">
                    <MapPin size={9} />
                    {item.geo_region}
                  </td>
                  <td className="py-2 text-right font-mono text-emerald-300">{item.composite_score?.toFixed(0) ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card variant="soft" padding="sm">
          <h4 className="mb-2 text-xs font-semibold text-white">未来 60 天中断概率</h4>
          <ReactECharts option={option} style={{ height: 220 }} />
        </Card>
        <Card variant="soft" padding="sm">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold text-white">
            <Shield size={12} className="text-emerald-300" />
            应对建议
          </h4>
          <div className="space-y-2">
            {data.suggestions.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-emerald-300/10 bg-emerald-400/[0.04] p-2.5 text-[11px] leading-5 text-[var(--text-secondary)]"
              >
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export function ScenarioViewer() {
  const [activeTab, setActiveTab] = useState<ScenarioTab>("fx")
  const [fxData, setFxData] = useState<ScenarioFxResponse | null>(null)
  const [creditData, setCreditData] = useState<ScenarioCreditResponse | null>(null)
  const [supplyData, setSupplyData] = useState<ScenarioSupplyResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(
    async (tab: ScenarioTab) => {
      setLoading(true)
      try {
        if (tab === "fx" && !fxData) setFxData(await getScenarioFx())
        if (tab === "credit" && !creditData) setCreditData(await getScenarioCredit())
        if (tab === "supply" && !supplyData) setSupplyData(await getScenarioSupply())
      } finally {
        setLoading(false)
      }
    },
    [creditData, fxData, supplyData],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData(activeTab)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [activeTab, loadData])

  const tabs: { key: ScenarioTab; icon: typeof DollarSign; label: string; desc: string }[] = [
    { key: "fx", icon: DollarSign, label: "全球化经营", desc: "币种敞口 / 现金流 / 对冲覆盖" },
    { key: "credit", icon: CreditCard, label: "商业信用", desc: "广告主 / 商家 / 企业服务回款" },
    { key: "supply", icon: Truck, label: "AI算力供应", desc: "GPU / 云资源 / 数据中心" },
  ]

  const activeContext =
    activeTab === "fx" ? fxData?.company_context : activeTab === "credit" ? creditData?.company_context : supplyData?.company_context

  const activeRecommendation =
    activeTab === "fx"
      ? "AI建议优先检查国际游戏、跨境支付与企业服务收入的美元敞口，对高波动币种提高短周期对冲覆盖。"
      : activeTab === "credit"
        ? "AI建议把中小广告主与跨境商家设为重点监测池，联动回款节奏、舆情和经营景气度动态调整额度。"
        : "AI建议建立 GPU、国产替代、腾讯云与自建数据中心的三层算力保障池，避免监管窗口与流量高峰叠加。"

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-white">腾讯控股风险场景中心</h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            公司选择：腾讯控股 Tencent · 公开资料 / 估算参数 · 信息接收 → 风险评估 → 策略响应
          </p>
        </div>
        {activeContext ? (
          <div className="flex items-center gap-2 rounded-full border border-indigo-500/15 bg-indigo-500/10 px-3 py-1.5 text-[11px] text-indigo-300">
            <Database size={12} />
            <span className="font-medium">{activeContext.company}</span>
            <span className="text-indigo-400/50">·</span>
            <span>{activeContext.ticker}</span>
          </div>
        ) : null}
      </div>

      <div className="flex gap-1 border-b border-[rgba(139,132,190,0.08)] pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`-mb-[1px] flex items-center gap-2 rounded-t-lg border-b-2 px-5 py-3 text-xs font-medium transition-all ${
              activeTab === tab.key
                ? "border-[var(--brand)] bg-[rgba(165,153,240,0.06)] text-white"
                : "border-transparent text-[var(--text-muted)] hover:bg-white/[0.02] hover:text-[var(--text-secondary)]"
            }`}
          >
            <tab.icon size={14} />
            <span className="text-left">
              <span className="block">{tab.label}</span>
              <span className="block text-[9px] text-[var(--text-disabled)]">{tab.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <Card variant="cyber" padding="sm" className="border-indigo-300/14">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              { label: "信号接入", icon: Radio, color: "text-indigo-300" },
              { label: "风险识别", icon: Brain, color: "text-amber-300" },
              { label: "策略生成", icon: Target, color: "text-emerald-300" },
              { label: "执行追踪", icon: Activity, color: "text-sky-300" },
            ].map((step, index) => (
              <div key={step.label} className="rounded-lg border border-white/[0.05] bg-white/[0.025] px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <step.icon size={13} className={step.color} />
                  <span className="font-mono text-[10px] text-white/35">0{index + 1}</span>
                </div>
                <div className="mt-2 text-xs font-medium text-white">{step.label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-emerald-300/14 bg-emerald-400/[0.045] px-3 py-2.5">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-100">
              <Sparkles size={12} />
              当前场景 AI 推荐
            </div>
            <p className="text-[11px] leading-5 text-[var(--text-secondary)]">{activeRecommendation}</p>
          </div>
        </div>
      </Card>

      {activeTab === "fx" && fxData ? <FxScenario data={fxData} /> : null}
      {activeTab === "credit" && creditData ? <CreditScenario data={creditData} /> : null}
      {activeTab === "supply" && supplyData ? <SupplyScenario data={supplyData} /> : null}

      {loading && !fxData && !creditData && !supplyData ? (
        <div className="p-12 text-center text-sm text-[var(--text-muted)]">加载腾讯控股风险场景数据...</div>
      ) : null}
    </div>
  )
}
