import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { switchModelAndChat } from "@/api/ai"
import axios from "axios"
import { Bot, Send, Sparkles, Trash2, UserRound } from "lucide-react"

const CHAT_STORAGE_KEY = "astraquant:research-chat-v1"
const DRAFT_STORAGE_KEY = "astraquant:research-chat-draft-v1"
const DEFAULT_ASSISTANT_MESSAGE = {
  id: "welcome",
  role: "assistant" as const,
  text: "你好，我是 AI 量化分析股票基金助手。你可以问我个股、基金、策略和风控问题。",
}

function readCachedMessages() {
  try {
    const savedMessages = window.localStorage.getItem(CHAT_STORAGE_KEY)
    if (!savedMessages) return [DEFAULT_ASSISTANT_MESSAGE]
    const parsed = JSON.parse(savedMessages) as Array<{ id: string; role: "user" | "assistant"; text: string }>
    const valid = parsed.filter((item) => item?.id && (item.role === "user" || item.role === "assistant") && item.text)
    return valid.length > 0 ? valid : [DEFAULT_ASSISTANT_MESSAGE]
  } catch { return [DEFAULT_ASSISTANT_MESSAGE] }
}

function readCachedDraft() {
  try { return window.localStorage.getItem(DRAFT_STORAGE_KEY) ?? "" }
  catch { return "" }
}

export function ResearchAssistantPage() {
  const model = "minimax-m2.7" as const
  const [question, setQuestion] = useState(readCachedDraft)
  const [messages, setMessages] = useState<Array<{ id: string; role: "user" | "assistant"; text: string }>>(readCachedMessages)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [diagnostic, setDiagnostic] = useState("")
  const [assistantPhase, setAssistantPhase] = useState<"idle" | "thinking" | "typing">("idle")
  const typingTimerRef = useRef<number | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-80))) }, [messages])
  useEffect(() => { window.localStorage.setItem(DRAFT_STORAGE_KEY, question) }, [question])
  useEffect(() => { return () => { if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current) } }, [])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, assistantPhase])

  const cleanNoise = (text: string) => text.replace(/\r/g, "").replace(/[|#*]/g, "").replace(/^\s*-\s*/gm, "").replace(/\s{2,}/g, " ").trim()
  const normalizeReply = (text: string) => cleanNoise(text) || "暂无有效回复，请稍后再试。"

  const streamAssistantText = async (fullText: string) => {
    const text = normalizeReply(fullText)
    const assistantId = `assistant-${Date.now()}`
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", text: "" }])
    const chars = Array.from(text)
    let cursor = 0
    await new Promise<void>((resolve) => {
      const tick = () => {
        const remain = chars.length - cursor
        const chunk = remain > 360 ? 10 : remain > 180 ? 6 : remain > 80 ? 4 : 2
        cursor = Math.min(chars.length, cursor + chunk)
        setMessages((prev) => prev.map((msg) => (msg.id === assistantId ? { ...msg, text: chars.slice(0, cursor).join("") } : msg)))
        if (cursor < chars.length) typingTimerRef.current = window.setTimeout(tick, 20)
        else { typingTimerRef.current = null; resolve() }
      }
      tick()
    })
  }

  const runModel = async () => {
    if (!question.trim()) return
    try {
      setLoading(true); setAssistantPhase("thinking"); setError(""); setDiagnostic("")
      const userQuestion = cleanNoise(question)
      if (!userQuestion) { setError("请输入有效问题。"); return }
      setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: "user", text: userQuestion }])
      const payload = { task: userQuestion, context: "标的: NVDA，关注未来一季度", model }
      const result = await switchModelAndChat(payload)
      setAssistantPhase("typing")
      await streamAssistantText(result.content)
      setDiagnostic(`${result.model} / ${result.latencyMs}ms / ${result.diagnostic ?? "ok"}`)
      setQuestion("")
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = (typeof err.response?.data?.detail === "string" && err.response.data.detail) || (typeof err.response?.data?.content === "string" && err.response.data.content) || err.message
        setError(`生成失败：${detail}`)
      } else if (err instanceof Error) setError(`生成失败：${err.message}`)
      else setError("生成失败，请检查网络或认证状态。")
    } finally { setAssistantPhase("idle"); setLoading(false) }
  }

  const clearChat = () => {
    setMessages([DEFAULT_ASSISTANT_MESSAGE])
    window.localStorage.removeItem(CHAT_STORAGE_KEY)
  }

  return (
    <section className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-300/15">
              <Sparkles size={13} className="text-indigo-300/80" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-[-0.01em]">AI 投研助手</h2>
              <p className="text-[10px] text-[var(--text-muted)]">MiniMax M2.7 · 量化分析 · 多轮对话</p>
            </div>
          </div>
          <Button variant="ghost" size="xs" onClick={clearChat} title="清空对话">
            <Trash2 size={12} />
          </Button>
        </div>

        {/* Chat area */}
        <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4 h-[420px] overflow-auto mb-4">
          <div className="space-y-3">
            {messages.map((item) => (
              <div key={item.id} className={`flex items-end gap-2 ${item.role === "assistant" ? "" : "justify-end"}`}>
                {item.role === "assistant" ? (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-indigo-300/25 bg-indigo-500/15 text-indigo-100">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                ) : null}
                <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  item.role === "assistant"
                    ? "bg-indigo-500/10 border border-indigo-300/10 text-[var(--text)]"
                    : "bg-white/[0.06] border border-white/[0.06] text-[var(--text-secondary)]"
                }`}>
                  {item.text}
                </div>
                {item.role === "user" ? (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.05] text-white">
                    <UserRound className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </div>
            ))}
            {assistantPhase === "thinking" ? (
              <div className="flex items-end gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-indigo-300/25 bg-indigo-500/15 text-indigo-100">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <div className="rounded-2xl bg-indigo-500/10 border border-indigo-300/10 px-3.5 py-2.5">
                  <div className="flex items-center gap-2 text-[13px] text-indigo-200/80">
                    <span>思考中</span>
                    <span className="flex items-center gap-1"><span className="thinking-dot" /><span className="thinking-dot" /><span className="thinking-dot" /></span>
                  </div>
                </div>
              </div>
            ) : null}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="输入你要分析的股票/基金/策略问题..."
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runModel() } }}
          />
          <Button onClick={runModel} disabled={loading} className="shrink-0">
            <Send size={14} className="mr-1.5" />
            {loading ? "思考中" : "发送"}
          </Button>
        </div>

        {diagnostic ? (
          <p className="mt-2 text-[10px] text-[var(--text-muted)] mono-metric">调用状态: {diagnostic}</p>
        ) : null}
        {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
      </Card>
    </section>
  )
}
