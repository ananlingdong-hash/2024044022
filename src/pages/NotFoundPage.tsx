import { Link } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center animate-spring-in">
      <Card className="max-w-sm text-center" variant="glass" padding="lg">
        <p className="mono-metric text-6xl font-semibold text-indigo-200/40 mb-3">404</p>
        <h2 className="text-lg font-semibold tracking-[-0.02em] mb-1">页面不存在</h2>
        <p className="text-sm text-[var(--text-muted)] mb-5">请返回核心导航继续操作</p>
        <Link to="/dashboard">
          <Button variant="default">
            <Home size={14} className="mr-1.5" />
            返回 Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  )
}
