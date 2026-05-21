import { http } from "@/api/http"

export async function saveEncryptedApiKey(provider: string, encryptedKey: string) {
  const result = await http.post("/profile/api-keys", { provider, encryptedKey })
  return result.data as { saved: boolean; id: string }
}
