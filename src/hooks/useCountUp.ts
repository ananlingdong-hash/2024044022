import { useEffect, useRef, useState } from "react"

/**
 * Animate a number from 0 to the target value on mount / when value changes.
 * Uses requestAnimationFrame for smooth 60fps animation.
 */
export function useCountUp(target: number, duration = 1200, enabled = true) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number>(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled || target === 0) {
      setDisplay(target)
      return
    }
    const startVal = 0
    startRef.current = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(startVal + (target - startVal) * eased))
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate)
      }
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration, enabled])

  return display
}

/**
 * Format helpers for common financial display patterns
 */
export function fmtPct(v: number, decimals = 1) {
  return `${v >= 0 ? "+" : ""}${v.toFixed(decimals)}%`
}

export function fmtCurrencyCN(v: number) {
  if (v >= 1e8) return `${(v / 1e8).toFixed(2)}亿`
  if (v >= 1e4) return `${(v / 1e4).toFixed(0)}万`
  return v.toLocaleString("zh-CN")
}
