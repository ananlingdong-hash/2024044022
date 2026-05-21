import { useState } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface TickerItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

const defaultTickers: TickerItem[] = [
  { symbol: "AAPL", name: "Apple", price: 187.32, change: 2.15, changePercent: 1.16 },
  { symbol: "NVDA", name: "NVIDIA", price: 892.45, change: 18.70, changePercent: 2.14 },
  { symbol: "GOOGL", name: "Alphabet", price: 176.88, change: -0.92, changePercent: -0.52 },
  { symbol: "MSFT", name: "Microsoft", price: 426.53, change: 5.21, changePercent: 1.24 },
  { symbol: "TSLA", name: "Tesla", price: 218.67, change: -3.45, changePercent: -1.55 },
  { symbol: "000001.SZ", name: "平安银行", price: 11.82, change: 0.36, changePercent: 3.14 },
  { symbol: "600519.SS", name: "贵州茅台", price: 1645.00, change: -12.50, changePercent: -0.75 },
  { symbol: "000858.SZ", name: "五粮液", price: 137.60, change: 2.80, changePercent: 2.08 },
  { symbol: "META", name: "Meta", price: 512.34, change: 8.67, changePercent: 1.72 },
  { symbol: "AMZN", name: "Amazon", price: 198.76, change: 1.23, changePercent: 0.62 },
]

export function MarketTicker() {
  const [tickers] = useState<TickerItem[]>(defaultTickers)

  // Double the array for seamless scroll
  const doubled = [...tickers, ...tickers]

  return (
    <div className="ticker-container border-b border-white/[0.04] bg-[rgba(10,10,18,0.55)] py-1.5">
      <div className="ticker-track">
        {doubled.map((item, idx) => (
          <div key={`${item.symbol}-${idx}`} className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-medium text-[var(--text)] tracking-[-0.01em]">{item.symbol}</span>
            <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">{item.name}</span>
            <span className="mono-metric text-[10px] text-[var(--text-secondary)] tabular-nums">{item.price.toFixed(2)}</span>
            <span className={cn(
              "flex items-center gap-0.5 text-[10px] tabular-nums",
              item.change >= 0 ? "text-emerald-300/90" : "text-rose-300/90"
            )}>
              {item.change >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)} ({item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%)
            </span>
            <span className="text-white/[0.08] text-[10px]">|</span>
          </div>
        ))}
      </div>
    </div>
  )
}
