"use client";

import "@xyflow/react/dist/style.css";
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { RouteGraph as Graph } from "@/types/platform";

export function RouteGraph({ graph }: { graph?: Graph }) {
  const nodes: Node[] = (graph?.nodes ?? []).map((node, index) => ({
    id: node.id,
    type: "default",
    position: node.position ?? { x: 210 * (index % 4), y: 140 * Math.floor(index / 4) },
    data: { label: `${node.type.toUpperCase()} // ${node.label}` },
    style: {
      borderRadius: 0,
      border: "1px solid rgba(30, 28, 23, 0.75)",
      padding: 13,
      background: index % 3 === 0 ? "#fcd34d" : index % 3 === 1 ? "#5eead4" : "#fed7aa",
      color: "#111827",
      boxShadow: "5px 5px 0 rgba(30, 28, 23, 0.18)",
      fontSize: 12,
      fontFamily: "monospace",
      fontWeight: 900,
      textTransform: "uppercase"
    }
  }));

  const edges: Edge[] = (graph?.edges ?? []).map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: true,
    style: { strokeWidth: 2 }
  }));

  return (
    <div className="h-[680px] overflow-hidden border border-[hsl(var(--line))] bg-[hsl(var(--panel))] shadow-[5px_5px_0_rgba(30,28,23,0.12)]">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <MiniMap pannable zoomable />
        <Controls />
        <Background gap={28} size={1.4} />
      </ReactFlow>
    </div>
  );
}
