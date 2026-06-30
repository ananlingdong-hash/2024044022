/**
 * Chart color theme — single source of truth for all chart visualizations.
 * Colors match the CSS custom properties defined in index.css.
 *
 * To read live CSS variable values at runtime, use:
 *   getComputedStyle(document.documentElement).getPropertyValue('--brand-500')
 *
 * The static fallback values below match the default dark theme.
 */

export const CHART_COLORS = {
  // Brand / primary
  brand: "#a599f0",
  brandLight: "#c4b5fd",
  brandDark: "#7c6ff7",

  // Semantic
  success: "#34d399",
  successLight: "#6ee7b7",
  danger: "#f87171",
  dangerLight: "#fca5a5",
  warning: "#fbbf24",
  warningLight: "#fcd34d",
  info: "#38bdf8",
  infoLight: "#7dd3fc",

  // Strategy palette (conservative / balanced / aggressive)
  conservative: "#34d399",
  balanced: "#a599f0",
  aggressive: "#fbbf24",

  // Chart accent palette
  accent: {
    indigo: "#818cf8",
    sky: "#38bdf8",
    emerald: "#34d399",
    amber: "#fbbf24",
    rose: "#fb7185",
    violet: "#a78bfa",
  },

  // Chart chrome (axes, grids, labels)
  chrome: {
    text: "#a1a1aa",
    textMuted: "#71717a",
    grid: "rgba(255,255,255,0.04)",
    gridLight: "rgba(255,255,255,0.025)",
    border: "rgba(255,255,255,0.08)",
    tooltipBg: "rgba(20,20,35,0.96)",
    tooltipBorder: "rgba(255,255,255,0.10)",
    tooltipText: "#e4e4e7",
  },

  // Area fill gradients (opacity variants)
  area: {
    brandStart: "rgba(129,140,248,0.30)",
    brandEnd: "rgba(129,140,248,0.02)",
    successStart: "rgba(52,211,153,0.12)",
    dangerStart: "rgba(248,113,113,0.15)",
    warningStart: "rgba(251,191,36,0.15)",
  },

  // Up/down (A-share convention: red up, green down)
  up: "#ef4444",
  upWick: "#f87171",
  down: "#22c55e",
  downWick: "#34d399",
} as const

/**
 * Get a live CSS variable value at runtime. Falls back to the provided default.
 */
export function cssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}
