import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface TickerItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

const tickers: TickerItem[] = [
  { symbol: "0700.HK", name: "腾讯控股", price: 385.2, change: 2.8, changePercent: 0.73 },
  { symbol: "WECHAT", name: "微信生态活跃度", price: 141.8, change: 1.3, changePercent: 0.93 },
  { symbol: "TENCLOUD", name: "腾讯云景气度", price: 72.6, change: 2.1, changePercent: 2.98 },
  { symbol: "INTL-GAME", name: "国际游戏收入热度", price: 88.4, change: 1.9, changePercent: 2.20 },
  { symbol: "FINTECH", name: "金融科技回款", price: 79.2, change: -0.6, changePercent: -0.75 },
  { symbol: "HUNYUAN", name: "混元算力成本", price: 68.5, change: 1.5, changePercent: 2.24 },
  { symbol: "USD/CNY", name: "美元兑人民币", price: 7.18, change: 0.03, changePercent: 0.42 },
  { symbol: "CONTENT", name: "内容安全水位", price: 96.3, change: 0.4, changePercent: 0.42 },
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
