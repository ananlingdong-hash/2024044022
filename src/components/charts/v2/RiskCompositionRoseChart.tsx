import ReactECharts from "echarts-for-react"
import type { RiskBreakdown } from "@/types/v2"

const colors = ["#38bdf8", "#818cf8", "#f59e0b"]

export function RiskCompositionRoseChart({ data }: { data: RiskBreakdown[] }) {
  return (
    <ReactECharts
      style={{ height: 260 }}
      option={{
        backgroundColor: "transparent",
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c}%",
          borderColor: "rgba(255,255,255,0.10)",
          backgroundColor: "rgba(20,20,35,0.96)",
          textStyle: { fontSize: 11, color: "#e4e4e7" },
        },
        legend: {
          bottom: 0,
          textStyle: { color: "#a1a1aa", fontSize: 10 },
          itemWidth: 10,
          itemHeight: 6,
        },
        series: [
          {
            type: "pie",
            roseType: "radius",
            radius: ["25%", "72%"],
            center: ["50%", "43%"],
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
