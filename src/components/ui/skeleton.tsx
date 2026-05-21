import { cn } from "@/lib/utils"

type SkeletonVariant = "default" | "text" | "heading" | "circle" | "card" | "stat"

interface SkeletonProps {
  className?: string
  variant?: SkeletonVariant
  lines?: number
}

const variantClasses: Record<SkeletonVariant, string> = {
  default: "skeleton-v2 rounded-md",
  text: "skeleton-v2 skeleton-text rounded",
  heading: "skeleton-v2 skeleton-heading rounded",
  circle: "skeleton-v2 skeleton-circle",
  card: "skeleton-v2 skeleton-card",
  stat: "skeleton-v2 rounded-lg h-[80px]",
}

export function Skeleton({ className, variant = "default", lines }: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton-v2 rounded"
            style={{ height: 13, width: i === lines - 1 ? "60%" : "100%" }}
          />
        ))}
      </div>
    )
  }

  return <div className={cn(variantClasses[variant], className)} />
}
