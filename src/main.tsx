import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from "./App"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

// Initialize theme attribute before first paint to prevent flash
const stored = localStorage.getItem("astra-theme") || "dark"
document.documentElement.setAttribute("data-theme",
  stored === "auto"
    ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
    : stored
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
