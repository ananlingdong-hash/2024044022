import type { InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type InputSize = "sm" | "default"

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize
}

export function Input({ className, size = "default", ...props }: InputProps) {
  return (
    <input
      className={cn(
        "focus-outline w-full rounded-lg border border-[rgba(139,132,190,0.16)] bg-[rgba(22,18,42,0.75)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] transition-all duration-200",
        "hover:border-[rgba(139,132,190,0.26)] hover:bg-[rgba(26,22,50,0.80)]",
        "focus:border-[rgba(165,153,240,0.50)] focus:bg-[rgba(28,24,54,0.88)] focus:shadow-[0_0_0_3px_rgba(165,153,240,0.14),0_0_18px_rgba(165,153,240,0.08)]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "input-focus-ring",
        size === "sm" ? "h-8 text-xs" : "h-10",
        className,
      )}
      {...props}
    />
  )
}
