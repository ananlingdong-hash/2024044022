import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { saveEncryptedApiKey } from "@/api/profile"
import { encryptApiKey } from "@/lib/security"
import { Key, Lock, Shield, TrendingUp } from "lucide-react"

export function ProfileCenterPage() {
  const [apiKey, setApiKey] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [encryptedPreview, setEncryptedPreview] = useState("")
  const [saveMessage, setSaveMessage] = useState("")
  const [saving, setSaving] = useState(false)

  const handleEncrypt = async () => {
    if (!apiKey || !passphrase) {
      setSaveMessage("请先输入 API Key 与口令。")
      return
    }
    try {
      setSaving(true)
      const encrypted = await encryptApiKey(apiKey, passphrase)
      setEncryptedPreview(encrypted.slice(0, 120) + "...")
      const result = await saveEncryptedApiKey("minimax-m2.7", encrypted)
      setSaveMessage(result.saved ? `已入库，记录ID: ${result.id.slice(0, 8)}` : "保存失败")
    } catch {
      setSaveMessage("保存失败，请检查网络。")
    } finally {
      setSaving(false)
    }
  }

  const stats = [
    { icon: TrendingUp, label: "收益统计", value: "+12.4%", color: "text-emerald-300" },
    { icon: Shield, label: "AI 采纳率", value: "67%", color: "text-indigo-300" },
    { icon: Lock, label: "监控任务", value: "8", color: "text-amber-300" },
  ]

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {/* Stats row */}
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label} variant="flat" padding="default">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06]">
                <s.icon size={15} className={s.color} />
              </div>
              <div>
                <p className="text-[11px] text-[var(--text-muted)]">{s.label}</p>
                <p className={`mono-metric text-xl font-semibold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="md:col-span-2" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-300/15">
            <Key size={13} className="text-indigo-300/80" />
          </div>
          <h2 className="text-sm font-semibold tracking-[-0.01em]">API Key 管理</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          API Key 使用 Web Crypto AES-GCM 加密存储；后端代理调用真实数据接口，前端不直连第三方密钥。
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">API Key</label>
            <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="输入 API Key" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">加密口令</label>
            <Input value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="输入加密口令" type="password" />
          </div>
          <Button onClick={handleEncrypt} disabled={saving}>
            {saving ? "保存中..." : "加密并预览"}
          </Button>
        </div>
      </Card>

      <Card className="md:col-span-1" variant="elevated" padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-300/15">
            <Shield size={13} className="text-emerald-300/80" />
          </div>
          <h2 className="text-sm font-semibold tracking-[-0.01em]">安全状态</h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="status-dot online" />
            <span className="text-[var(--text-secondary)]">加密状态: </span>
            <Badge variant="success" size="sm">已加密</Badge>
          </div>
          {encryptedPreview ? (
            <div className="rounded-lg border border-white/[0.06] bg-black/10 p-3">
              <p className="text-xs text-[var(--text-muted)] font-mono break-all">{encryptedPreview}</p>
            </div>
          ) : null}
          {saveMessage ? <p className="mt-2 text-xs text-[var(--brand)]">{saveMessage}</p> : null}
        </div>
      </Card>
    </section>
  )
}
