import { openDB } from "idb"
import type { SentimentReport } from "@/types/domain"

const DB_NAME = "ai-stock-platform"
const DB_VERSION = 1

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("sentimentReports")) {
      db.createObjectStore("sentimentReports", { keyPath: "id" })
    }
    if (!db.objectStoreNames.contains("userSettings")) {
      db.createObjectStore("userSettings", { keyPath: "key" })
    }
  },
})

export async function saveReport(report: SentimentReport) {
  const db = await dbPromise
  await db.put("sentimentReports", report)
}

export async function getReportHistory() {
  const db = await dbPromise
  const result = await db.getAll("sentimentReports")
  return result as SentimentReport[]
}
