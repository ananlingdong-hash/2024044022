import { Outlet, useLocation } from "react-router-dom"

const scenarioTitles: Record<string, string> = {
  "/phishing/scenario-4": "活动抢票",
  "/phishing/scenario-5": "校园通知",
  "/phishing/scenario-6": "教务通知",
  "/phishing/scenario-7": "文档共享",
}

export function PhishingLayout() {
  const location = useLocation()
  const title = scenarioTitles[location.pathname] || ""

  return (
    <div className="phishing-app">
      {/* Minimal breadcrumb hint — NOT part of the phishing page itself
          This is the educational wrapper showing which scenario you're in */}
      <div className="phishing-wrapper-hint">
        <a href="/phishing" style={{ color: "inherit", textDecoration: "none" }}>🎣 反钓鱼实训</a>
        {title && <span> / {title}</span>}
      </div>
      <Outlet />
    </div>
  )
}
