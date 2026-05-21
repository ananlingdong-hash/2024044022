import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, MessageSquare, SendHorizonal, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { switchModelAndChat } from "@/api/ai"
import { useUIStore } from "@/lib/stores/uiStore"

export function AIAssistantDrawer() {
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: "assistant" | "user"; text: string }>>([
    { role: "assistant", text: "我是风险哨兵智能体，可给出可执行风控建议。" },
  ])
  const chatEndRef = useRef<HTMLDivElement>(null)

  const open = useUIStore((s) => s.assistantOpen)
  const toggle = useUIStore((s) => s.toggleAssistant)

  const recent = useMemo(() => messages.slice(-8), [messages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

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
      const result = await switchModelAndChat({ task: q, context: "企业风险决策场景", model: "minimax-m2.7" })
      const text = (result.content || "").replace(/[|#*]/g, "").trim() || "暂无建议"
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
        className="fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-indigo-300/30 bg-indigo-500/75 text-white shadow-[0_0_28px_rgba(99,102,241,0.35)] transition hover:scale-[1.05] hover:shadow-[0_0_36px_rgba(99,102,241,0.45)]"
      >
        <MessageSquare size={17} />
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
                <span className="text-sm font-semibold tracking-[-0.01em]">风险哨兵助手</span>
              </div>
              <button className="rounded-md p-1 text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-white transition" onClick={toggle}>
                <X size={15} />
              </button>
            </div>

            <div className="mb-3 rounded-lg border border-indigo-300/15 bg-indigo-500/8 p-2.5 text-[11px] text-indigo-200/80">
              <Sparkles size={11} className="mr-1 inline" />
              自动识别风险阈值并弹出决策建议卡片
            </div>

            <div className="h-[calc(100vh-180px)] overflow-auto rounded-xl border border-white/[0.05] bg-black/10 p-3">
              {recent.map((msg, idx) => (
                <div key={`${msg.role}-${idx}`} className={`mb-2 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-indigo-500/10 border border-indigo-300/10 text-[var(--text)]"
                      : "bg-white/[0.06] border border-white/[0.06] text-[var(--text-secondary)]"
                  }`}>
                    {msg.text}
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
                placeholder="输入风控问题..."
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
