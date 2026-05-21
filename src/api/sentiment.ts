import { http } from "@/api/http"
import type { SentimentReport } from "@/types/domain"

export async function generateSentimentReport(symbols: string[]) {
  // Report generation may include external realtime fetch + AI synthesis, so allow longer timeout.
  const result = await http.post("/sentiment/generate", { symbols }, { timeout: 120000 })
  return result.data as SentimentReport
}

export async function fetchSentimentHistory() {
  const result = await http.get("/sentiment/history")
  return result.data as SentimentReport[]
}
