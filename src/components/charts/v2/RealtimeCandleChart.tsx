import { useEffect, useRef } from "react"
import { CandlestickSeries, createChart, type ISeriesApi, type UTCTimestamp } from "lightweight-charts"

type Candle = { time: string; price: number }

export function RealtimeCandleChart({
  rows,
  onTick,
}: {
  rows: Candle[]
  onTick?: (callback: (price: number) => void) => () => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const lastTsRef = useRef<number>(0)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 280,
      layout: {
        background: { color: "transparent" },
        textColor: "#a1a1aa",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 0,
        vertLine: { color: "rgba(129,140,248,0.3)", style: 2, width: 1, labelBackgroundColor: "rgba(20,20,35,0.9)" },
        horzLine: { color: "rgba(129,140,248,0.3)", style: 2, width: 1, labelBackgroundColor: "rgba(20,20,35,0.9)" },
      },
    })
    chartRef.current = chart

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#34d399",
      wickDownColor: "#f87171",
    })
    seriesRef.current = series

    const resize = () => {
      if (!containerRef.current) return
      chart.resize(containerRef.current.clientWidth, 280)
    }
    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener("resize", resize)
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  useEffect(() => {
    const series = seriesRef.current
    if (!series) return
    if (!rows.length) return
    const candleRows = rows.slice(-50).map((row) => {
      const t = Math.floor(new Date(row.time).getTime() / 1000) as UTCTimestamp
      const base = row.price
      // Create realistic OHLC from price data
      const volatility = base * 0.008
      const open = base + (Math.random() - 0.5) * volatility
      const close = base + (Math.random() - 0.45) * volatility * 1.2
      const high = Math.max(open, close) + Math.random() * volatility * 0.6
      const low = Math.min(open, close) - Math.random() * volatility * 0.6
      lastTsRef.current = Number(t)
      return { time: t, open: Number(open.toFixed(2)), high: Number(high.toFixed(2)), low: Number(low.toFixed(2)), close: Number(close.toFixed(2)) }
    })
    series.setData(candleRows)
  }, [rows])

  useEffect(() => {
    if (!onTick || !seriesRef.current) return
    return onTick((price) => {
      const ts = (Math.floor(Date.now() / 1000) as UTCTimestamp) || ((lastTsRef.current + 60) as UTCTimestamp)
      const volatility = price * 0.006
      const open = Number((price - volatility * 0.3).toFixed(2))
      const close = Number((price + (Math.random() - 0.45) * volatility).toFixed(2))
      const high = Number((Math.max(open, close) + Math.random() * volatility * 0.5).toFixed(2))
      const low = Number((Math.min(open, close) - Math.random() * volatility * 0.5).toFixed(2))
      seriesRef.current?.update({ time: ts, open, high, low, close })
      lastTsRef.current = Number(ts)
    })
  }, [onTick])

  return <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
}
