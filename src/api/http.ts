import axios from "axios"
import { clearAuthSession, getAuthToken } from "@/lib/auth"

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
  timeout: 45000,
})

http.interceptors.request.use((config) => {
  config.headers = config.headers ?? {}
  config.headers["X-Client-Version"] = "mvp-2026.05"
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthSession()
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)
