import { z } from "zod"
import { http } from "@/api/http"
import type { AIPromptPayload } from "@/types/domain"

const aiResponseSchema = z.object({
  content: z.string(),
  model: z.string(),
  latencyMs: z.number(),
  diagnostic: z.string().nullable().optional(),
})

export async function generateResearchReport(payload: AIPromptPayload) {
  const result = await http.post("/ai/research", { ...payload, model: "minimax-m2.7" })
  return aiResponseSchema.parse(result.data)
}

export async function switchModelAndChat(payload: AIPromptPayload) {
  const result = await http.post("/ai/chat", { ...payload, model: "minimax-m2.7" })
  return aiResponseSchema.parse(result.data)
}

export function getMiniMaxTemplate(input: { question: string }) {
  return {
    model: "MiniMax-M2.7",
    messages: [
      { role: "system", content: "你是AI量化分析股票基金助手，回答简洁、可执行。" },
      { role: "user", content: input.question },
    ],
  }
}
