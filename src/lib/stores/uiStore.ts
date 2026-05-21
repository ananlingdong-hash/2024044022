import { create } from "zustand"
import type { SuggestionCard } from "@/types/v2"

type UIState = {
  assistantOpen: boolean
  suggestionCards: SuggestionCard[]
  openAssistant: () => void
  closeAssistant: () => void
  toggleAssistant: () => void
  upsertSuggestionCards: (cards: SuggestionCard[]) => void
  dismissSuggestionCard: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  assistantOpen: false,
  suggestionCards: [],
  openAssistant: () => set({ assistantOpen: true }),
  closeAssistant: () => set({ assistantOpen: false }),
  toggleAssistant: () => set((s) => ({ assistantOpen: !s.assistantOpen })),
  upsertSuggestionCards: (cards) =>
    set((state) => {
      const merged = [...state.suggestionCards]
      for (const card of cards) {
        const idx = merged.findIndex((x) => x.id === card.id)
        if (idx >= 0) merged[idx] = card
        else merged.unshift(card)
      }
      return { suggestionCards: merged.slice(0, 6) }
    }),
  dismissSuggestionCard: (id) => set((s) => ({ suggestionCards: s.suggestionCards.filter((x) => x.id !== id) })),
}))
