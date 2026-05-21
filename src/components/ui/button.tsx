import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type Variant = "default" | "outline" | "ghost" | "danger" | "success" | "brand" | "subtle"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: "xs" | "sm" | "default" | "lg"
}

const variants: Record<Variant, string> = {
  default:
    "bg-[linear-gradient(135deg,#a599f0,#8b7cf0)] text-white shadow-[0_0_22px_rgba(165,153,240,0.22)] hover:shadow-[0_0_34px_rgba(165,153,240,0.35)] hover:brightness-110 active:scale-[0.97]",
  outline:
    "border border-[rgba(139,132,190,0.18)] bg-[rgba(139,132,190,0.08)] text-[var(--text)] hover:bg-[rgba(139,132,190,0.16)] hover:border-[rgba(139,132,190,0.28)] active:scale-[0.97]",
  ghost:
    "bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[rgba(139,132,190,0.10)] active:scale-[0.97]",
  subtle:
    "bg-[rgba(139,132,190,0.08)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[rgba(139,132,190,0.14)] active:scale-[0.97]",
  danger:
    "bg-[linear-gradient(135deg,#f87171,#ef4444)] text-white shadow-[0_0_22px_rgba(248,113,113,0.18)] hover:shadow-[0_0_32px_rgba(248,113,113,0.30)] hover:brightness-110 active:scale-[0.97]",
  success:
    "bg-[linear-gradient(135deg,#34d399,#22c55e)] text-white shadow-[0_0_22px_rgba(52,211,153,0.18)] hover:shadow-[0_0_32px_rgba(52,211,153,0.30)] hover:brightness-110 active:scale-[0.97]",
  brand:
    "bg-[#a599f0] text-white shadow-[0_0_20px_rgba(165,153,240,0.24)] hover:shadow-[0_0_32px_rgba(165,153,240,0.40)] hover:brightness-110 active:scale-[0.97]",
}

const sizes: Record<string, string> = {
  xs: "h-7 px-2.5 text-[11px] gap-1 rounded-md",
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  default: "h-10 px-4 text-sm gap-1.5 rounded-lg",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-xl",
}

export function Button({ className, variant = "default", size = "default", disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-outline inline-flex items-center justify-center font-medium tracking-[-0.01em] transition-all duration-200",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100 disabled:brightness-100",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  )
}
