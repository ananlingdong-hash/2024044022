import ReactECharts from "echarts-for-react"
import type { RiskBreakdown } from "@/types/v2"
import { CHART_COLORS } from "@/lib/chart-theme"

const { accent, chrome } = CHART_COLORS
const colors = [accent.sky, accent.indigo, accent.amber]

export function RiskCompositionRoseChart({ data }: { data: RiskBreakdown[] }) {
  return (
    <ReactECharts
      style={{ height: 320 }}
      option={{
        backgroundColor: "transparent",
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c}%",
          borderColor: chrome.tooltipBorder,
          backgroundColor: chrome.tooltipBg,
          textStyle: { fontSize: 11, color: chrome.tooltipText },
        },
        legend: {
          bottom: 0,
          textStyle: { color: chrome.text, fontSize: 10 },
          itemWidth: 10,
          itemHeight: 6,
        },
        series: [
          {
            type: "pie",
            roseType: "radius",
            radius: ["25%", "72%"],
            center: ["50%", "45%"],
            animationType: "scale",
            animationEasing: "elasticOut",
            animationDuration: 1000,
            itemStyle: {
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "rgba(20,20,30,1)",
            },
            label: {
              color: "#d4d4d8",
              fontSize: 10,
              formatter: "{b}\n{d}%",
            },
            data: data.map((x, idx) => ({
              ...x,
              itemStyle: { color: colors[idx % colors.length] },
            })),
          },
        ],
      }}
    />
  )
}
