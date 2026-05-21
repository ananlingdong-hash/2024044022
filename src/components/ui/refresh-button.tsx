import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export function RefreshButton({ onRefresh, className }: { onRefresh: () => void; className?: string }) {
  const [spinning, setSpinning] = useState(false)

  const handle = () => {
    setSpinning(true)
    onRefresh()
    setTimeout(() => setSpinning(false), 800)
  }

  return (
    <button
      onClick={handle}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-2 py-1.5 text-[11px] text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-[var(--text)] transition-all duration-200",
        className,
      )}
    >
      <RefreshCw size={12} className={cn("transition-transform", spinning && "animate-spin")} />
    </button>
  )
}
