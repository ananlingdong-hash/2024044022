import { http } from "@/api/http"

export async function fetchUniverse() {
  const result = await http.get("/market/universe")
  return result.data as Array<{ symbol: string; name: string }>
}

export async function fetchUserWatchlist() {
  const result = await http.get("/profile/watchlist")
  return result.data as { symbols: string[] }
}

export async function saveUserWatchlist(symbols: string[]) {
  const result = await http.put("/profile/watchlist", { symbols })
  return result.data as { saved: boolean; symbols: string[] }
}
