import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface TickerItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

/** Tencent ecosystem: investees, suppliers, competitors */
const tickers: TickerItem[] = [
  { symbol: "0700.HK", name: "腾讯控股", price: 385.20, change: 2.80, changePercent: 0.73 },
  { symbol: "NVDA", name: "NVIDIA(GPU供应商)", price: 892.45, change: 18.70, changePercent: 2.14 },
  { symbol: "PDD", name: "拼多多(联营投资)", price: 142.30, change: -3.20, changePercent: -2.20 },
  { symbol: "NTES", name: "网易(游戏竞对)", price: 98.50, change: 1.65, changePercent: 1.70 },
  { symbol: "1024.HK", name: "快手(社交竞对)", price: 58.35, change: 1.45, changePercent: 2.55 },
  { symbol: "BIDU", name: "百度(AI竞对)", price: 112.50, change: -0.85, changePercent: -0.75 },
  { symbol: "9888.HK", name: "百度集团", price: 118.60, change: -1.20, changePercent: -1.00 },
  { symbol: "META", name: "Meta(全球竞对)", price: 512.34, change: 8.67, changePercent: 1.72 },
  { symbol: "3690.HK", name: "美团(投资/竞对)", price: 168.20, change: -1.50, changePercent: -0.88 },
  { symbol: "1810.HK", name: "小米(生态竞对)", price: 32.45, change: 0.88, changePercent: 2.79 },
]

export function MarketTicker() {
  const doubled = useMemo(() => [...tickers, ...tickers], [])

  return (
    <div className="relative overflow-hidden border-b border-white/[0.03] bg-[rgba(8,6,20,0.72)] py-1.5 backdrop-blur-xl">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      <div className="ticker-track flex gap-6">
        {doubled.map((item, idx) => {
          const isUp = item.change >= 0
          const glowStyle = isUp
            ? { textShadow: "0 0 8px rgba(248,113,113,0.40)" }
            : { textShadow: "0 0 8px rgba(52,211,153,0.40)" }
          return (
            <div key={`${item.symbol}-${idx}`} className="flex shrink-0 items-center gap-2">
              <span className="text-[10px] font-semibold tracking-[-0.01em] text-white/80">{item.symbol}</span>
              <span className="hidden text-[9px] text-[var(--text-muted)] opacity-60 sm:inline">{item.name}</span>
              <span className="mono-metric text-[10px] tabular-nums text-white/60">{item.price.toFixed(2)}</span>
              <span
                className={cn("mono-metric text-[10px] font-medium tabular-nums", isUp ? "text-rose-300" : "text-emerald-300")}
                style={glowStyle}
              >
                {isUp ? "+" : ""}{item.change.toFixed(2)}
                <span className="ml-0.5 opacity-60">{isUp ? "+" : ""}{item.changePercent.toFixed(2)}%</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
