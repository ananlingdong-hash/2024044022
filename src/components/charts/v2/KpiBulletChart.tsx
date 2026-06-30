import ReactECharts from "echarts-for-react"
import type { KpiBullet } from "@/types/v2"
import { CHART_COLORS } from "@/lib/chart-theme"

const { chrome, info, infoLight } = CHART_COLORS

export function KpiBulletChart({ rows }: { rows: KpiBullet[] }) {
  return (
    <ReactECharts
      style={{ height: 240 }}
      option={{
        backgroundColor: "transparent",
        grid: { left: 90, right: 30, top: 20, bottom: 20 },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          borderColor: chrome.tooltipBorder,
          backgroundColor: chrome.tooltipBg,
          textStyle: { fontSize: 11, color: chrome.tooltipText },
        },
        xAxis: {
          type: "value",
          max: 100,
          axisLabel: { color: chrome.textMuted, fontSize: 10, formatter: "{value}%" },
          splitLine: { lineStyle: { color: chrome.gridLight, type: "dashed" } },
        },
        yAxis: {
          type: "category",
          data: rows.map((x) => x.name),
          axisLabel: { color: "#d4d4d8", fontSize: 11 },
          axisLine: { show: false },
          axisTick: { show: false },
        },
        series: [
          {
            type: "bar",
            barWidth: 18,
            data: rows.map((x) => x.threshold),
            itemStyle: { color: "rgba(245,158,11,0.18)", borderRadius: [0, 9, 9, 0] },
            z: 1,
            emphasis: { itemStyle: { color: "rgba(245,158,11,0.3)" } },
            name: "阈值",
          },
          {
            type: "bar",
            barWidth: 12,
            data: rows.map((x) => x.target),
            itemStyle: { color: "rgba(129,140,248,0.30)", borderRadius: [0, 9, 9, 0] },
            z: 2,
            emphasis: { itemStyle: { color: "rgba(129,140,248,0.45)" } },
            name: "目标",
          },
          {
            type: "bar",
            barWidth: 6,
            data: rows.map((x) => x.actual),
            itemStyle: { color: info, borderRadius: [0, 9, 9, 0] },
            z: 3,
            emphasis: { itemStyle: { color: infoLight } },
            name: "实际",
            label: {
              show: true,
              position: "right",
              color: chrome.tooltipText,
              fontSize: 10,
              fontWeight: "bold",
              formatter: (params: { value: number }) => `${params.value}%`,
            },
            animationDuration: 1000,
            animationEasing: "cubicOut",
          },
        ],
      }}
    />
  )
}
