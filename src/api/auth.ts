import { http } from "@/api/http"
import type { AuthUser } from "@/lib/auth"

type AuthResponse = {
  token: string
  userId: string
  email: string
  nickname: string
}

export async function login(payload: { email: string; password: string }) {
  const result = await http.post("/auth/login", payload)
  return result.data as AuthResponse
}

export async function register(payload: { email: string; password: string; nickname: string }) {
  const result = await http.post("/auth/register", payload)
  return result.data as AuthResponse
}

export async function fetchMe() {
  const result = await http.get("/auth/me")
  return result.data as AuthUser
}
