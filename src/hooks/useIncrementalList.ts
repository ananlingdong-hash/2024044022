import { useEffect, useState } from "react"

export function useIncrementalList<T>(source: T[], chunkSize = 20, stepMs = 32) {
  const [visible, setVisible] = useState<T[]>(() => source.slice(0, chunkSize))

  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      setVisible(source.slice(0, chunkSize))
    }, 0)
    let index = chunkSize
    if (index >= source.length) return

    const timer = window.setInterval(() => {
      index += chunkSize
      setVisible(source.slice(0, index))
      if (index >= source.length) window.clearInterval(timer)
    }, stepMs)

    return () => {
      window.clearTimeout(resetTimer)
      window.clearInterval(timer)
    }
  }, [source, chunkSize, stepMs])

  return visible
}
