import { create } from "zustand"

export type Theme = "dark" | "light" | "auto"

function resolveTheme(t: Theme): "dark" | "light" {
  if (t === "auto") {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
  }
  return t
}

function applyTheme(resolved: "dark" | "light") {
  document.documentElement.setAttribute("data-theme", resolved)
}

type ThemeState = {
  theme: Theme
  resolved: "dark" | "light"
  setTheme: (t: Theme) => void
}

export const useThemeStore = create<ThemeState>((set) => {
  const stored = (localStorage.getItem("astra-theme") as Theme) || "dark"
  const resolved = resolveTheme(stored)
  applyTheme(resolved)

  if (stored === "auto") {
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    mq.addEventListener("change", () => {
      const r = resolveTheme("auto")
      applyTheme(r)
      set({ resolved: r })
    })
  }

  return {
    theme: stored,
    resolved,
    setTheme: (t) => {
      localStorage.setItem("astra-theme", t)
      const r = resolveTheme(t)
      applyTheme(r)
      set({ theme: t, resolved: r })
    },
  }
})
