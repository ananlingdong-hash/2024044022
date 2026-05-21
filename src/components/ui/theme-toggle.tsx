import { Monitor, Moon, Sun } from "lucide-react"
import { useThemeStore } from "@/lib/stores/themeStore"
import type { Theme } from "@/lib/stores/themeStore"

const themes: { key: Theme; icon: typeof Moon; label: string }[] = [
  { key: "dark", icon: Moon, label: "暗色" },
  { key: "light", icon: Sun, label: "亮色" },
  { key: "auto", icon: Monitor, label: "自动" },
]

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const cycle = () => {
    const idx = themes.findIndex((t) => t.key === theme)
    setTheme(themes[(idx + 1) % themes.length].key)
  }

  const CurrentIcon = themes.find((t) => t.key === theme)?.icon ?? Moon

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:bg-white/8 hover:text-[var(--text)] transition-all duration-200"
      title={`主题: ${themes.find((t) => t.key === theme)?.label}`}
    >
      <CurrentIcon size={14} />
    </button>
  )
}
