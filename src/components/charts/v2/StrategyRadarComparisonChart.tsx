import ReactECharts from "echarts-for-react"
import type { StrategyRadarMetric } from "@/types/v2"
import { CHART_COLORS } from "@/lib/chart-theme"

const { chrome, conservative, balanced, aggressive } = CHART_COLORS

export function StrategyRadarComparisonChart({ metrics }: { metrics: StrategyRadarMetric[] }) {
  return (
    <ReactECharts
      style={{ height: 340 }}
      option={{
        backgroundColor: "transparent",
        tooltip: {
          borderColor: chrome.tooltipBorder,
          backgroundColor: chrome.tooltipBg,
          textStyle: { fontSize: 11, color: chrome.tooltipText },
        },
        legend: {
          top: 0,
          textStyle: { color: chrome.text, fontSize: 10 },
          itemWidth: 12,
          itemHeight: 6,
        },
        radar: {
          radius: "58%",
          center: ["50%", "48%"],
          indicator: metrics.map((m) => ({ name: m.name, max: 100 })),
          splitArea: {
            areaStyle: { color: ["rgba(255,255,255,0.02)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"] },
          },
          axisName: { color: chrome.text, fontSize: 10 },
          splitLine: { lineStyle: { color: chrome.grid } },
          axisLine: { lineStyle: { color: chrome.border } },
        },
        series: [
          {
            type: "radar",
            animationDuration: 1200,
            animationEasing: "elasticOut",
            data: [
              {
                value: metrics.map((m) => m.conservative),
                name: "保守",
                lineStyle: { color: conservative, width: 1.5 },
                areaStyle: { color: "rgba(52,211,153,0.12)" },
                itemStyle: { color: conservative },
                symbol: "circle",
                symbolSize: 4,
              },
              {
                value: metrics.map((m) => m.balanced),
                name: "平衡",
                lineStyle: { color: CHART_COLORS.accent.indigo, width: 2 },
                areaStyle: { color: "rgba(129,140,248,0.15)" },
                itemStyle: { color: CHART_COLORS.accent.indigo },
                symbol: "circle",
                symbolSize: 5,
              },
              {
                value: metrics.map((m) => m.aggressive),
                name: "激进",
                lineStyle: { color: CHART_COLORS.accent.rose, width: 1.5 },
                areaStyle: { color: "rgba(251,113,133,0.10)" },
                itemStyle: { color: CHART_COLORS.accent.rose },
                symbol: "circle",
                symbolSize: 4,
              },
            ],
          },
        ],
      }}
    />
  )
}
