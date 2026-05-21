import { useRef, type HTMLAttributes, type MouseEvent } from "react"
import { cn } from "@/lib/utils"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "soft" | "elevated" | "glass" | "flat"
  tilt?: boolean
  glow?: boolean
  hoverLift?: boolean
  padding?: "sm" | "default" | "lg"
}

const variantClasses: Record<string, string> = {
  default:
    "bg-[#1b1732] border border-[rgba(139,132,190,0.14)] shadow-[0_4px_24px_rgba(8,6,20,0.35)] hover:border-[rgba(139,132,190,0.22)] hover:shadow-[0_8px_32px_rgba(8,6,20,0.40)]",
  soft:
    "bg-[#1d1936] border border-[rgba(139,132,190,0.10)] shadow-[0_4px_20px_rgba(8,6,20,0.25)] backdrop-blur-sm hover:border-[rgba(139,132,190,0.18)]",
  elevated:
    "bg-[#211c3c] border border-[rgba(139,132,190,0.16)] shadow-[0_8px_36px_rgba(8,6,20,0.40),0_0_0_1px_rgba(165,153,240,0.06)]",
  glass:
    "bg-[rgba(22,18,42,0.78)] border border-[rgba(139,132,190,0.12)] backdrop-blur-xl shadow-[0_4px_24px_rgba(8,6,20,0.30)]",
  flat:
    "bg-[#191532] border border-[rgba(139,132,190,0.08)]",
}

const paddingClasses: Record<string, string> = {
  sm: "p-4",
  default: "p-5",
  lg: "p-6",
}

export function Card({
  className,
  variant = "default",
  tilt = false,
  glow = false,
  hoverLift = false,
  padding = "default",
  onMouseMove,
  onMouseLeave,
  ...props
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!tilt || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    ref.current.style.setProperty("--tilt-x", `${((y - cy) / cy) * -4}deg`)
    ref.current.style.setProperty("--tilt-y", `${((x - cx) / cx) * 4}deg`)
    ref.current.style.setProperty("--glow-x", `${(x / rect.width) * 100}%`)
    ref.current.style.setProperty("--glow-y", `${(y / rect.height) * 100}%`)
    onMouseMove?.(e)
  }

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    if (tilt && ref.current) {
      ref.current.style.setProperty("--tilt-x", "0deg")
      ref.current.style.setProperty("--tilt-y", "0deg")
    }
    onMouseLeave?.(e)
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300",
        variantClasses[variant],
        paddingClasses[padding],
        hoverLift && "hover-lift",
        tilt && "card-tilt",
        glow &&
          "after:absolute after:inset-0 after:rounded-2xl after:pointer-events-none after:opacity-0 after:transition-opacity after:duration-300 after:bg-[radial-gradient(ellipse_at_var(--glow-x,50%)_var(--glow-y,50%),rgba(165,153,240,0.09),transparent_55%)] hover:after:opacity-100",
        className,
      )}
      style={tilt ? { transformStyle: "preserve-3d", perspective: "800px" } : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  )
}
