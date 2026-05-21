import { AlertTriangle, Check, Clock3, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/lib/stores/uiStore"

export function AISuggestionCards() {
  const cards = useUIStore((s) => s.suggestionCards)
  const dismiss = useUIStore((s) => s.dismissSuggestionCard)

  if (!cards.length) return null

  return (
    <div className="fixed bottom-24 right-4 z-40 flex w-[340px] flex-col gap-2">
      {cards.map((card) => (
        <div key={card.id} className="glass-panel-v2 rounded-xl border border-indigo-300/20 p-3.5 shadow-xl animate-fade-in-scale">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-300/15 mt-0.5">
                <AlertTriangle size={13} className="text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[-0.01em]">{card.title}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">影响分值: {card.score}</p>
              </div>
            </div>
            <button className="rounded p-0.5 text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-white transition" onClick={() => dismiss(card.id)}>
              <X size={13} />
            </button>
          </div>
          <p className="mb-3 text-xs text-[var(--text-secondary)] leading-relaxed">{card.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            <Button size="xs">
              <Check size={11} className="mr-1" />采纳
            </Button>
            <Button variant="outline" size="xs">
              <Clock3 size={11} className="mr-1" />稍后
            </Button>
            <Button variant="ghost" size="xs" onClick={() => dismiss(card.id)}>忽略</Button>
          </div>
        </div>
      ))}
    </div>
  )
}
