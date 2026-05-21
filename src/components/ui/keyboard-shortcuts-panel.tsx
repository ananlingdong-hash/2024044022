import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

const shortcuts = [
  { keys: ["Alt", "1"], desc: "舆情雷达" },
  { keys: ["Alt", "2"], desc: "实盘透视" },
  { keys: ["Alt", "3"], desc: "量化工坊" },
  { keys: ["Alt", "4"], desc: "AI 投研助手" },
  { keys: ["Alt", "5"], desc: "个人中心" },
  { keys: ["?"], desc: "快捷键面板" },
]

export function KeyboardShortcutsPanel() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape" && open) setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-[420px] max-w-[90vw] rounded-2xl border border-white/12 bg-[rgba(16,16,26,0.94)] p-6 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">键盘快捷键</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-white/10 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1.5">
              {shortcuts.map((s) => (
                <div key={s.desc} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors">
                  <span className="text-sm text-[var(--text)]">{s.desc}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, i) => (
                      <span key={k}>
                        <kbd className="inline-flex items-center rounded-md border border-white/15 bg-white/8 px-2 py-0.5 text-xs mono-metric text-[var(--text-secondary)]">
                          {k}
                        </kbd>
                        {i < s.keys.length - 1 && <span className="text-white/20 mx-0.5 text-xs">+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-[var(--text-muted)] text-center">
              按 <kbd className="inline-flex items-center rounded border border-white/12 bg-white/6 px-1.5 py-px text-[10px] mono-metric">?</kbd> 打开此面板 · <kbd className="inline-flex items-center rounded border border-white/12 bg-white/6 px-1.5 py-px text-[10px] mono-metric">Esc</kbd> 关闭
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
