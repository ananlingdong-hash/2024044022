type TickPayload = { symbol: string; price: number; ts: number }

export function createMarketSocket(onMessage: (payload: TickPayload) => void) {
  const wsUrl = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000/ws/market"
  const ws = new WebSocket(wsUrl)
  ws.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data) as TickPayload
      onMessage(payload)
    } catch {
      // Ignore malformed payload.
    }
  }
  return ws
}
