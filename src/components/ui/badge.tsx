import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "brand" | "success" | "danger" | "warning" | "info"
type BadgeSize = "sm" | "default"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
  size?: BadgeSize
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-white/[0.08] bg-white/[0.05] text-[var(--text-secondary)]",
  brand: "badge-brand",
  success: "badge-success",
  danger: "badge-danger",
  warning: "badge-warning",
  info: "badge-info",
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  default: "px-2.5 py-0.5 text-xs gap-1.5",
}

export function Badge({ className, variant = "default", dot = false, size = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium tracking-[-0.01em] transition-all duration-200",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("status-dot", variant === "success" ? "online" : variant === "danger" ? "offline" : variant === "warning" ? "degraded" : "online")} />}
      {children}
    </span>
  )
}
