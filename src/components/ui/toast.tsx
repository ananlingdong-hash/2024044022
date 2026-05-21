import { CheckCircle, Info, AlertTriangle, X, XCircle } from "lucide-react"
import { useToastStore } from "@/lib/stores/toastStore"
import type { ToastType } from "@/lib/stores/toastStore"

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const borderMap: Record<ToastType, string> = {
  success: "border-emerald-400/30",
  error: "border-rose-400/30",
  warning: "border-amber-400/30",
  info: "border-sky-400/30",
}

const iconColorMap: Record<ToastType, string> = {
  success: "text-emerald-300",
  error: "text-rose-300",
  warning: "text-amber-300",
  info: "text-sky-300",
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const remove = useToastStore((s) => s.removeToast)

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-20 right-5 z-[60] flex flex-col-reverse gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = iconMap[t.type]
        return (
          <div
            key={t.id}
            className={`animate-toast-in pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-xl min-w-[280px] max-w-[400px] ${borderMap[t.type]}`}
            style={{ background: "rgba(14,14,22,0.92)" }}
          >
            <Icon size={15} className={`shrink-0 mt-0.5 ${iconColorMap[t.type]}`} />
            <span className="flex-1 text-sm text-[var(--text)]">{t.message}</span>
            <button onClick={() => remove(t.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity text-[var(--text-muted)]">
              <X size={13} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
