import { AnimatePresence, motion } from "framer-motion"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { Bell, Bot, ChevronLeft, ChevronRight, Clock3, FileText, LayoutDashboard, MessageSquare, Radio, Search, Settings, ShieldAlert, TrendingUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { Button } from "@/components/ui/button"
import { clearAuthSession, getAuthUser } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { AIAssistantDrawer } from "@/components/ai/AIAssistantDrawer"
import { AISuggestionCards } from "@/components/ai/AISuggestionCards"
import { MarketTicker } from "@/components/charts/MarketTicker"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { RefreshButton } from "@/components/ui/refresh-button"
import { ToastContainer } from "@/components/ui/toast"
import { KeyboardShortcutsPanel } from "@/components/ui/keyboard-shortcuts-panel"
import { useEffect, useState } from "react"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "1" },
  { to: "/risk", label: "风险详情", icon: ShieldAlert, shortcut: "2" },
  { to: "/monitor", label: "实时监控", icon: TrendingUp, shortcut: "3" },
  { to: "/strategy", label: "策略优化", icon: Bot, shortcut: "4" },
  { to: "/reports", label: "报告中心", icon: FileText, shortcut: "5" },
  { to: "/settings", label: "系统设置", icon: Settings, shortcut: "6" },
]

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard 总览",
  "/risk": "风险详情",
  "/monitor": "实时监控",
  "/strategy": "策略优化",
  "/reports": "报告中心",
  "/settings": "系统设置",
  "/assistant": "AI 投研助手",
  "/profile": "个人中心",
  "/sentiment": "舆情雷达",
  "/live": "实盘透视",
  "/quant": "量化工坊",
}

function Breadcrumbs() {
  const location = useLocation()
  const label = breadcrumbMap[location.pathname] || location.pathname.slice(1) || "首页"

  return (
    <div className="flex items-center gap-2 text-[11px] tracking-[-0.01em]">
      <span className="breadcrumb-item">AstraQuant</span>
      <span className="breadcrumb-separator">/</span>
      <span className="text-[var(--text)] font-medium">{label}</span>
    </div>
  )
}

function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] border border-white/[0.06] rounded-lg px-2.5 py-1.5 bg-white/[0.02]">
      <Clock3 size={11} className="text-indigo-300/60" />
      <span className="mono-metric tabular-nums text-[var(--text-secondary)]">{time.toLocaleTimeString("zh-CN", { hour12: false })}</span>
      <span className="text-white/[0.12]">|</span>
      <span className="mono-metric tabular-nums text-[var(--text-secondary)]">{time.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" })}</span>
    </div>
  )
}

export function AppShell() {
  useKeyboardShortcuts()
  const user = getAuthUser()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className={cn(
        "mx-auto grid min-h-screen w-full max-w-[1600px] transition-all duration-300",
        sidebarOpen ? "grid-cols-[236px_1fr]" : "grid-cols-[56px_1fr]"
      )}>
        {/* ── Sidebar ── */}
        <aside className={cn(
          "glass-panel-v2 relative flex flex-col border-r border-[rgba(139,132,190,0.06)] bg-[rgba(12,10,26,0.78)] transition-all duration-300",
          sidebarOpen ? "px-3 py-4" : "px-2 py-4"
        )}>
          {/* Logo area */}
          <div className={cn("flex items-center mb-6 transition-all", sidebarOpen ? "px-2 justify-between" : "justify-center")}>
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[linear-gradient(135deg,rgba(165,153,240,0.75),rgba(139,124,240,0.45))] shadow-[0_0_16px_rgba(165,153,240,0.28)] ring-1 ring-[rgba(165,153,240,0.25)]">
                    <Zap size={12} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold tracking-[-0.02em] text-white/90">AstraQuant</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-md p-1 text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-white transition"
                >
                  <ChevronLeft size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-md p-1 text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-white transition"
              >
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">



            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "focus-outline group inline-flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] tracking-[-0.01em] transition-all duration-200",
                    isActive
                      ? "bg-[linear-gradient(135deg,rgba(165,153,240,0.20),rgba(139,124,240,0.14))] text-white shadow-[0_0_16px_rgba(165,153,240,0.10)] border border-[rgba(165,153,240,0.16)]"
                      : "text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text-secondary)] border border-transparent",
                  )
                }
              >
                <item.icon size={15} className="shrink-0 transition-colors group-hover:text-[var(--text-secondary)]" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    <span className="text-[10px] text-[var(--text-disabled)] tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                      ⌘{item.shortcut}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* System status card */}
          {sidebarOpen && (
            <div className="mt-auto space-y-3">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-[11px]">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="status-dot online" />
                  <span className="text-white/80 text-xs font-medium tracking-[-0.01em]">系统状态</span>
                </div>
                <div className="space-y-1.5 text-[var(--text-muted)]">
                  <div className="flex items-center justify-between">
                    <span>模式</span>
                    <span className="text-white/60">企业级 V3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>数据源</span>
                    <span className="text-white/60">实时主备</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>延迟</span>
                    <span className="mono-metric text-emerald-300/80">&lt;50ms</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── Main content ── */}
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <header className="glass-panel-v2 sticky top-0 z-20 border-b border-[rgba(139,132,190,0.05)]">
            <div className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="flex items-center gap-4">
                <Breadcrumbs />
              </div>

              <div className="flex items-center gap-3 flex-1 max-w-lg mx-4">
                <div className="relative w-full">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <Input className="pl-8 h-8 text-xs" placeholder="全局搜索：标的、风险事件、报告..." />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <RefreshButton onRefresh={handleRefresh} />
                <ThemeToggle />
                <LiveClock />

                <button className="relative rounded-lg border border-white/[0.07] p-1.5 text-[var(--text-muted)] transition hover:bg-white/[0.06] hover:text-white hover:border-white/[0.14]">
                  <Bell size={13} />
                  <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                  </span>
                </button>

                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("toggle-assistant"))}
                  className="rounded-lg border border-white/[0.07] p-1.5 text-[var(--text-muted)] transition hover:bg-white/[0.06] hover:text-white hover:border-white/[0.14]"
                  title="AI 助手 (Alt+4)"
                >
                  <MessageSquare size={13} />
                </button>

                <div className="ml-1.5 flex items-center gap-2 pl-2 border-l border-white/[0.08]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(165,153,240,0.22)] ring-1 ring-[rgba(165,153,240,0.22)] text-[11px] font-medium text-[rgba(200,190,250,0.90)]">
                    {user?.nickname?.[0] ?? "G"}
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline tracking-[-0.01em]">{user?.nickname ?? "Guest"}</span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      clearAuthSession()
                      window.location.href = "/login"
                    }}
                  >
                    退出
                  </Button>
                </div>
              </div>
            </div>

            {/* Market status bar */}
            <div className="market-status-bar flex items-center gap-4 px-4 py-1.5 text-[10px] text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <Radio size={9} className="text-emerald-400" />
                <span>行情源在线</span>
              </div>
              <span className="text-white/[0.10]">|</span>
              <span>最后更新: <span className="mono-metric tabular-nums text-white/50">{new Date().toLocaleTimeString("zh-CN", { hour12: false })}</span></span>
              <span className="text-white/[0.10]">|</span>
              <span>WS: <span className="text-emerald-400/80">已连接</span></span>
              <span className="text-white/[0.10]">|</span>
              <span className="flex items-center gap-1.5">
                <span className="status-dot online" style={{ width: 5, height: 5 }} />
                系统正常
              </span>
            </div>

            {/* Live market ticker */}
            <MarketTicker />
          </header>

          {/* Page content */}
          <main className="flex-1 px-6 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -4 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          <AISuggestionCards />
          <AIAssistantDrawer />
        </div>
      </div>

      {/* Global overlays */}
      <ToastContainer />
      <KeyboardShortcutsPanel />
    </div>
  )
}
