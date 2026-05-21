import { lazy, Suspense, type ReactElement } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "@/layout/AppShell"
import { getAuthToken } from "@/lib/auth"

const SentimentRadarPage = lazy(() => import("@/pages/SentimentRadarPage").then((m) => ({ default: m.SentimentRadarPage })))
const LiveInsightPage = lazy(() => import("@/pages/LiveInsightPage").then((m) => ({ default: m.LiveInsightPage })))
const QuantWorkbenchPage = lazy(() => import("@/pages/QuantWorkbenchPage").then((m) => ({ default: m.QuantWorkbenchPage })))
const ResearchAssistantPage = lazy(() =>
  import("@/pages/ResearchAssistantPage").then((m) => ({ default: m.ResearchAssistantPage })),
)
const ProfileCenterPage = lazy(() => import("@/pages/ProfileCenterPage").then((m) => ({ default: m.ProfileCenterPage })))
const DashboardPage = lazy(() => import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })))
const RiskDetailPage = lazy(() => import("@/pages/RiskDetailPage").then((m) => ({ default: m.RiskDetailPage })))
const MonitoringPage = lazy(() => import("@/pages/MonitoringPage").then((m) => ({ default: m.MonitoringPage })))
const StrategyPage = lazy(() => import("@/pages/StrategyPage").then((m) => ({ default: m.StrategyPage })))
const ReportsCenterPage = lazy(() => import("@/pages/ReportsCenterPage").then((m) => ({ default: m.ReportsCenterPage })))
const SystemSettingsPage = lazy(() => import("@/pages/SystemSettingsPage").then((m) => ({ default: m.SystemSettingsPage })))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })))
const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })))

function Protected({ children }: { children: ReactElement }) {
  if (!getAuthToken()) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="flex items-center gap-3 text-sm text-[var(--text-muted)]"><span className="flex gap-1"><span className="thinking-dot" /><span className="thinking-dot" /><span className="thinking-dot" /></span>加载中...</div></div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <Protected>
              <AppShell />
            </Protected>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/risk" element={<RiskDetailPage />} />
          <Route path="/monitor" element={<MonitoringPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/reports" element={<ReportsCenterPage />} />
          <Route path="/settings" element={<SystemSettingsPage />} />
          <Route path="/assistant" element={<ResearchAssistantPage />} />
          <Route path="/profile" element={<ProfileCenterPage />} />
          <Route path="/sentiment" element={<SentimentRadarPage />} />
          <Route path="/live" element={<LiveInsightPage />} />
          <Route path="/quant" element={<QuantWorkbenchPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
