import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import type { DataSourceMeta } from "@/types/v2"

dayjs.extend(utc)

export function DataSourceBadge({ meta }: { meta: DataSourceMeta }) {
  const localTs = dayjs.utc(meta.fetchedAt).local().format("MM-DD HH:mm:ss")
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
      <span
        className={`rounded-full border px-2 py-0.5 ${
          meta.isFallback ? "border-amber-300/45 bg-amber-400/10 text-amber-200" : "border-emerald-300/45 bg-emerald-400/10 text-emerald-200"
        }`}
      >
        {meta.isFallback ? "Fallback" : "Realtime"}
      </span>
      <span>source: {meta.source}</span>
      <span>fetchedAt: {localTs}</span>
      <span>latency: {meta.latencyMs}ms</span>
    </div>
  )
}
