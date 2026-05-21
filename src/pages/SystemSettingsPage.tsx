import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Database, Server, Shield, Wifi } from "lucide-react"

const dataSources = [
  { name: "行情主源", status: "online" as const, icon: Activity, desc: "Yahoo Finance REST API" },
  { name: "新闻主源", status: "degraded" as const, icon: Wifi, desc: "Google News RSS" },
  { name: "AI 引擎", status: "online" as const, icon: Database, desc: "MiniMax M2.7" },
  { name: "实时推送", status: "online" as const, icon: Server, desc: "WebSocket 主备" },
]

const statusBadge = (s: string) => {
  switch (s) {
    case "online": return <Badge variant="success" dot size="sm">在线</Badge>
    case "degraded": return <Badge variant="warning" dot size="sm">降级</Badge>
    default: return <Badge variant="danger" dot size="sm">离线</Badge>
  }
}

export function SystemSettingsPage() {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <Card className="xl:col-span-7" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-300/15">
            <Shield size={13} className="text-indigo-300/80" />
          </div>
          <h2 className="text-sm font-semibold tracking-[-0.01em]">系统配置</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: "数据策略", value: "主源 + 备源 + fallback 三层机制" },
            { label: "重试策略", value: "指数退避，最多 3 次" },
            { label: "超时策略", value: "普通 API 15-30s，报告 API 90-120s" },
            { label: "实时连接", value: "WebSocket 自动重连 + 心跳检测" },
            { label: "缓存策略", value: "IndexedDB 本地持久化 + localStorage" },
            { label: "安全", value: "Web Crypto API AES-GCM 密钥加密" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">
              <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
              <span className="text-sm font-medium text-[var(--text)] text-right max-w-[60%]">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="xl:col-span-5" variant="elevated" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-300/15">
            <Activity size={13} className="text-emerald-300/80" />
          </div>
          <h2 className="text-sm font-semibold tracking-[-0.01em]">数据源状态</h2>
        </div>
        <div className="space-y-2">
          {dataSources.map((ds) => (
            <div key={ds.name} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3 transition hover:border-white/[0.10]">
              <div className="flex items-center gap-3">
                <ds.icon size={15} className="text-[var(--text-muted)]" />
                <div>
                  <p className="text-sm font-medium">{ds.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{ds.desc}</p>
                </div>
              </div>
              {statusBadge(ds.status)}
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
