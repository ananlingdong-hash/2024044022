import { useRef } from "react"
import type { EChartsReactProps } from "echarts-for-react"
import ReactECharts from "echarts-for-react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { RiskPoint } from "@/types/v2"

export function RiskTrendAreaChart({ points }: { points: RiskPoint[] }) {
  const ref = useRef<ReactECharts>(null)
  const option: EChartsReactProps["option"] = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      borderColor: "rgba(255,255,255,0.10)",
      backgroundColor: "rgba(20,20,35,0.96)",
      textStyle: { fontSize: 11, color: "#e4e4e7" },
    },
    grid: { left: 32, right: 24, top: 20, bottom: 28, containLabel: false },
    xAxis: {
      type: "category",
      data: points.map((p) => p.ts),
      axisLabel: { color: "#71717a", fontSize: 10, interval: Math.max(1, Math.floor(points.length / 8)) },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLabel: { color: "#71717a", fontSize: 10 },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.04)", type: "dashed" } },
      axisLine: { show: false },
    },
    series: [
      {
        type: "line",
        smooth: 0.4,
        showSymbol: false,
        data: points.map((p) => p.value),
        lineStyle: { color: "#818cf8", width: 2.5 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(129,140,248,0.40)" },
              { offset: 0.5, color: "rgba(129,140,248,0.12)" },
              { offset: 1, color: "rgba(129,140,248,0.01)" },
            ],
          },
        },
        animationDuration: 800,
        animationEasing: "cubicOut",
      },
    ],
  }

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => {
            const chart = ref.current?.getEchartsInstance()
            if (!chart) return
            const href = chart.getDataURL({ pixelRatio: 2, backgroundColor: "#14141e" })
            const a = document.createElement("a")
            a.href = href
            a.download = "risk-trend.png"
            a.click()
          }}
        >
          <Download size={12} className="mr-1" />
          导出PNG
        </Button>
      </div>
      <ReactECharts ref={ref} option={option} style={{ height: 230 }} />
    </div>
  )
}
