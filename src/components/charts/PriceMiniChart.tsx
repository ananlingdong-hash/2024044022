import { AreaSeries, createChart, type IChartApi } from "lightweight-charts"
import { useEffect, useRef } from "react"

const sample = [
  { time: "2026-05-01", value: 100 },
  { time: "2026-05-02", value: 102 },
  { time: "2026-05-03", value: 101 },
  { time: "2026-05-04", value: 105 },
  { time: "2026-05-05", value: 109 },
]

export function PriceMiniChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 240,
      layout: { background: { color: "#121212" }, textColor: "#ffffff" },
      grid: { vertLines: { color: "#2a2a2a" }, horzLines: { color: "#2a2a2a" } },
    })
    chartRef.current = chart
    const series = chart.addSeries(AreaSeries, {
      lineColor: "#4f9bff",
      topColor: "rgba(79,155,255,0.45)",
      bottomColor: "rgba(79,155,255,0.05)",
    })
    series.setData(sample)

    const onResize = () => {
      if (!containerRef.current) return
      chart.applyOptions({ width: containerRef.current.clientWidth })
    }
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      chart.remove()
    }
  }, [])

  return <div ref={containerRef} className="w-full" />
}
