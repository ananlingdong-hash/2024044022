import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useLocation } from "react-router-dom"
import { Bot, SendHorizonal, Sparkles, X, Radar, FileText, Route } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { switchModelAndChat } from "@/api/ai"
import { useUIStore } from "@/lib/stores/uiStore"

const CHAT_STORAGE_KEY = "astraquant:assistant-chat-v1"

function loadMessages(): Array<{ role: "assistant" | "user"; text: string }> {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return [{ role: "assistant", text: "我是风险哨兵智能体，可给出可执行风控建议。" }]
}

function persistMessages(msgs: Array<{ role: "assistant" | "user"; text: string }>) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs.slice(-40)))
  } catch { /* ignore */ }
}

function simpleMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, "<h4 class='text-sm font-semibold mt-2 mb-1'>$1</h4>")
    .replace(/^## (.+)$/gm, "<h3 class='text-sm font-semibold mt-2 mb-1'>$1</h3>")
    .replace(/^# (.+)$/gm, "<h3 class='text-sm font-bold mt-2 mb-1'>$1</h3>")
    .replace(/^- (.+)$/gm, "<li class='ml-3'>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li class='ml-3'>$2</li>")
    .replace(/\n/g, "<br/>")
}

const pageContextMap: Record<string, string> = {
  "/demo": "课堂演示总控页面，展示端到端风险决策路径",
  "/dashboard": "风险仪表盘总览页面，查看综合风险评分和KPI指标",
  "/sentiment": "舆情雷达页面，分析市场情绪和新闻数据",
  "/live": "实盘透视页面，监控实时行情和策略表现",
  "/quant": "量化工作台页面，回测策略和分析因子",
  "/reports": "报告中心页面，浏览历史分析报告",
  "/risk-response": "智能评估页面，评估组合风险并生成策略",
  "/strategy-optimizer": "策略优化页面，多目标优化风险策略",
  "/pdca": "PDCA管理页面，计划-执行-检查-改进循环",
  "/scenarios": "场景分析页面，汇率/信用/供应链风险场景模拟",
  "/settings": "系统设置页面，查看数据源和系统配置",
  "/profile": "个人中心页面，管理API密钥和账户安全",
}

const quickPrompts = [
  { icon: Radar, label: "解释当前风险", prompt: "请用课堂展示语言解释当前页面的核心风险结论。" },
  { icon: Route, label: "推荐下一步", prompt: "根据当前页面，告诉我演示时下一步应该点击哪里，并给一句过渡词。" },
  { icon: FileText, label: "生成讲解词", prompt: "请生成一段30秒课堂汇报讲解词，突出AI风险决策闭环。" },
]

export function AIAssistantDrawer() {
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: "assistant" | "user"; text: string }>>(loadMessages)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const open = useUIStore((s) => s.assistantOpen)
  const toggle = useUIStore((s) => s.toggleAssistant)

  const recent = useMemo(() => messages.slice(-8), [messages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  useEffect(() => {
    persistMessages(messages)
  }, [messages])

  useEffect(() => {
    const handler = () => toggle()
    window.addEventListener("toggle-assistant", handler)
    return () => window.removeEventListener("toggle-assistant", handler)
  }, [toggle])

  const submit = async () => {
    const q = draft.trim()
    if (!q || loading) return
    setLoading(true)
    setMessages((prev) => [...prev, { role: "user", text: q }])
    setDraft("")
    try {
      const pageHint = pageContextMap[location.pathname] || "风险监控平台"
      const fullContext = `企业风险决策场景；用户当前正在"${pageHint}"。请根据页面上下文提供精准建议。`
      const result = await switchModelAndChat({ task: q, context: fullContext, model: "minimax-m2.7" })
      const text = (result.content || "").trim() || "暂无建议"
      setMessages((prev) => [...prev, { role: "assistant", text }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "请求失败，请稍后重试。" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={toggle}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/30 bg-[linear-gradient(135deg,rgba(52,211,153,0.88),rgba(99,102,241,0.82))] text-white shadow-[0_0_32px_rgba(52,211,153,0.24)] transition hover:scale-[1.05] hover:shadow-[0_0_42px_rgba(99,102,241,0.38)]"
        title="风险哨兵 Agent"
      >
        <Radar size={18} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.aside
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed right-0 top-0 z-50 h-screen w-[380px] border-l border-white/[0.06] bg-[rgba(10,10,18,0.95)] p-4 backdrop-blur-2xl shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-300/15">
                  <Bot size={14} className="text-indigo-300" />
                </div>
                <span className="text-sm font-semibold tracking-[-0.01em]">风险哨兵 Agent</span>
              </div>
              <button className="rounded-md p-1 text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-white transition" onClick={toggle}>
                <X size={15} />
              </button>
            </div>

            <div className="mb-3 rounded-lg border border-indigo-300/15 bg-indigo-500/8 p-2.5 text-[11px] text-indigo-200/80">
              <Sparkles size={11} className="mr-1 inline" />
              自动读取当前页面上下文，输出课堂讲解、风险解释和下一步决策动作
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              {quickPrompts.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setDraft(item.prompt)}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-2 text-left text-[10px] text-[var(--text-secondary)] transition hover:border-indigo-300/20 hover:bg-indigo-400/[0.06] hover:text-white"
                >
                  <item.icon size={12} className="mb-1 text-indigo-300" />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="h-[calc(100vh-245px)] overflow-auto rounded-xl border border-white/[0.05] bg-black/10 p-3">
              {recent.map((msg, idx) => (
                <div key={`${msg.role}-${idx}`} className={`mb-2 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-indigo-500/10 border border-indigo-300/10 text-[var(--text)]"
                      : "bg-white/[0.06] border border-white/[0.06] text-[var(--text-secondary)]"
                  }`}
                    dangerouslySetInnerHTML={msg.role === "assistant" ? { __html: simpleMarkdown(msg.text) } : undefined}
                  >
                    {msg.role === "user" ? msg.text : null}
                  </div>
                </div>
              ))}
              {loading ? (
                <div className="flex justify-start mb-2">
                  <div className="rounded-2xl bg-indigo-500/10 border border-indigo-300/10 px-3 py-2">
                    <div className="flex items-center gap-2 text-xs text-indigo-200/80">
                      <span>思考中</span>
                      <span className="flex items-center gap-1"><span className="thinking-dot" /><span className="thinking-dot" /><span className="thinking-dot" /></span>
                    </div>
                  </div>
                </div>
              ) : null}
              <div ref={chatEndRef} />
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="询问风险解释、展示话术、下一步动作..."
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() } }}
              />
              <Button onClick={submit} disabled={loading} size="sm">
                <SendHorizonal size={14} />
              </Button>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  )
}
