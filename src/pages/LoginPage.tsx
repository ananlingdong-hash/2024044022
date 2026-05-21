import { useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { login, register } from "@/api/auth"
import { getAuthToken, saveAuthSession } from "@/lib/auth"
import { BarChart3, Sparkles, TrendingUp, Zap } from "lucide-react"

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const loggedIn = useMemo(() => Boolean(getAuthToken()), [])
  if (loggedIn) return <Navigate to="/quant" replace />

  const submit = async () => {
    try {
      setLoading(true)
      setMessage("")
      const payload = mode === "login" ? await login({ email, password }) : await register({ email, password, nickname })
      saveAuthSession(payload.token, { userId: payload.userId, email: payload.email, nickname: payload.nickname })
      window.location.href = "/quant"
    } catch {
      setMessage("认证失败，请检查输入信息。")
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: BarChart3, label: "AI 情绪分析", desc: "实时舆情雷达与市场情绪指数" },
    { icon: TrendingUp, label: "量化回测", desc: "多因子策略回测与优化引擎" },
    { icon: Sparkles, label: "智能助手", desc: "MiniMax 驱动的投研对话" },
  ]

  return (
    <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center px-6 py-10 lg:grid-cols-2 gap-12">
      {/* Left - Branding */}
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-500/10 px-3 py-1">
            <Zap size={12} className="text-indigo-300" />
            <span className="text-[11px] tracking-[0.15em] uppercase text-indigo-200/80">AstraQuant Terminal</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-[-0.03em] leading-tight">
            AI 驱动的<br />
            <span className="text-[var(--brand)]">量化交易</span>工作台
          </h1>
          <p className="max-w-md text-[15px] text-[var(--text-muted)] leading-relaxed">
            Bloomberg 级别的数据终端体验，集成舆情雷达、量化策略工坊、AI 投研助手与实时市场透视。
          </p>
        </div>
        <div className="space-y-3">
          {features.map((f) => (
            <div key={f.label} className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition hover:border-white/[0.10]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-300/15">
                <f.icon size={14} className="text-indigo-300/70" />
              </div>
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Auth card */}
      <Card className="w-full max-w-md mx-auto" variant="elevated" padding="lg">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] mb-1">
          {mode === "login" ? "登录终端" : "创建账户"}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          {mode === "login" ? "欢迎回来，请登录你的账户" : "注册新账户以开始使用"}
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">邮箱</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">密码</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="不少于6位" />
          </div>
          {mode === "register" ? (
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">昵称</label>
              <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="你的昵称" />
            </div>
          ) : null}
          <Button className="w-full" size="lg" onClick={submit} disabled={loading}>
            {loading ? "处理中..." : mode === "login" ? "登录" : "注册并登录"}
          </Button>
          <Button className="w-full" variant="ghost" onClick={() => setMode(mode === "login" ? "register" : "login")} disabled={loading}>
            {mode === "login" ? "没有账号？去注册" : "已有账号？去登录"}
          </Button>
          {message ? <p className="text-xs text-rose-300 text-center">{message}</p> : null}
        </div>
      </Card>
    </section>
  )
}
