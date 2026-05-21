export interface AuthUser {
  userId: string
  email: string
  nickname: string
}

const TOKEN_KEY = "astra_token"
const USER_KEY = "astra_user"

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getAuthUser() {
  const text = localStorage.getItem(USER_KEY)
  if (!text) return null
  try {
    return JSON.parse(text) as AuthUser
  } catch {
    return null
  }
}

export function saveAuthSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
