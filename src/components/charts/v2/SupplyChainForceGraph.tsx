import ReactECharts from "echarts-for-react"
import type { SupplyLink, SupplyNode } from "@/types/v2"

export function SupplyChainForceGraph({ nodes, links }: { nodes: SupplyNode[]; links: SupplyLink[] }) {
  return (
    <ReactECharts
      style={{ height: 320 }}
      option={{
        tooltip: {},
        series: [
          {
            type: "graph",
            layout: "force",
            roam: true,
            draggable: true,
            force: { repulsion: 180, edgeLength: 90, gravity: 0.08 },
            label: { show: true, color: "#e4e4e7", fontSize: 11 },
            edgeSymbol: ["none", "arrow"],
            edgeSymbolSize: [4, 8],
            lineStyle: { color: "rgba(148,163,184,0.55)", width: 1.3, curveness: 0.16 },
            data: nodes.map((node) => ({
              name: node.id,
              value: node.risk,
              symbolSize: 18 + node.risk * 0.24,
              itemStyle: {
                color:
                  node.category === "核心企业" ? "#818cf8" : node.category === "一级供应商" ? "#22d3ee" : "#f59e0b",
              },
            })),
            links: links.map((l) => ({ source: l.source, target: l.target, value: l.weight })),
          },
        ],
      }}
    />
  )
}
