import ReactECharts from "echarts-for-react"
import type { StrategyRadarMetric } from "@/types/v2"

export function StrategyRadarComparisonChart({ metrics }: { metrics: StrategyRadarMetric[] }) {
  return (
    <ReactECharts
      style={{ height: 280 }}
      option={{
        backgroundColor: "transparent",
        tooltip: {
          borderColor: "rgba(255,255,255,0.10)",
          backgroundColor: "rgba(20,20,35,0.96)",
          textStyle: { fontSize: 11, color: "#e4e4e7" },
        },
        legend: {
          top: 0,
          textStyle: { color: "#a1a1aa", fontSize: 10 },
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
          axisName: { color: "#a1a1aa", fontSize: 10 },
          splitLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
          axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
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
                lineStyle: { color: "#34d399", width: 1.5 },
                areaStyle: { color: "rgba(52,211,153,0.12)" },
                itemStyle: { color: "#34d399" },
                symbol: "circle",
                symbolSize: 4,
              },
              {
                value: metrics.map((m) => m.balanced),
                name: "平衡",
                lineStyle: { color: "#818cf8", width: 2 },
                areaStyle: { color: "rgba(129,140,248,0.15)" },
                itemStyle: { color: "#818cf8" },
                symbol: "circle",
                symbolSize: 5,
              },
              {
                value: metrics.map((m) => m.aggressive),
                name: "激进",
                lineStyle: { color: "#fb7185", width: 1.5 },
                areaStyle: { color: "rgba(251,113,133,0.10)" },
                itemStyle: { color: "#fb7185" },
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
