import { create } from "zustand"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  type: ToastType
  message: string
}

type ToastState = {
  toasts: Toast[]
  addToast: (t: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (t) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }))
    }, 4200)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))
