import { useMemo } from "react"

export function useVirtualRows<T>(items: T[], rowHeight: number, viewportHeight: number, scrollTop: number) {
  return useMemo(() => {
    const visibleCount = Math.ceil(viewportHeight / rowHeight) + 4
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - 2)
    const end = Math.min(items.length, start + visibleCount)
    return {
      start,
      end,
      offsetY: start * rowHeight,
      rows: items.slice(start, end),
      totalHeight: items.length * rowHeight,
    }
  }, [items, rowHeight, viewportHeight, scrollTop])
}
