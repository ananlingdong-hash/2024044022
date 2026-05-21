import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) return
      if (event.key === "1") navigate("/sentiment")
      if (event.key === "2") navigate("/live")
      if (event.key === "3") navigate("/quant")
      if (event.key === "4") navigate("/assistant")
      if (event.key === "5") navigate("/profile")
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [navigate])
}
