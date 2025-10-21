import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import ForceGraph2D from "react-force-graph-2d";

interface NetworkNode {
  id: string;
  label: string;
  year?: number;
  citationCount?: number;
  isCenter?: boolean;
}

interface NetworkEdge {
  from: string;
  to: string;
}

interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  centerNodeId: string;
  getNodeColor?: (year?: number) => string;
  onNodeClick?: (nodeId: string) => void;
}

export function NetworkGraph({ nodes, edges, centerNodeId, getNodeColor, onNodeClick }: NetworkGraphProps) {
  const [, setLocation] = useLocation();
  const [graphData, setGraphData] = useState<any>(null);

  useEffect(() => {
    console.log("NetworkGraph rendering with:", { 
      nodeCount: nodes.length, 
      edgeCount: edges.length,
      centerNodeId 
    });

    if (nodes.length === 0) {
      console.warn("No nodes to display");
      return;
    }

    // Calculate node sizes based on citation count
    const citationCounts = nodes.map(n => n.citationCount || 0);
    const maxCitations = Math.max(...citationCounts, 1);
    const minCitations = Math.min(...citationCounts);

    // Transform data for Force Graph
    const data = {
      nodes: nodes.map((node) => {
        const isCenter = node.id === centerNodeId;
        const citations = node.citationCount || 0;
        
        // Calculate node size based on citations
        let nodeSize;
        if (isCenter) {
          nodeSize = 15; // Center node is largest
        } else if (maxCitations > 0) {
          // Scale from 4 to 10 based on citations
          const normalized = (citations - minCitations) / (maxCitations - minCitations || 1);
          nodeSize = 4 + normalized * 6;
        } else {
          nodeSize = 5;
        }

        return {
          id: node.id,
          name: node.label,
          year: node.year,
          citationCount: node.citationCount,
          isCenter,
          color: isCenter ? "#a855f7" : (getNodeColor ? getNodeColor(node.year) : "#6366f1"),
          val: nodeSize,
        };
      }),
      links: edges.map((edge) => ({
        source: edge.from,
        target: edge.to,
      })),
    };

    console.log("Graph data prepared:", {
      nodes: data.nodes.length,
      links: data.links.length,
      sampleNode: data.nodes[0],
      sampleLink: data.links[0],
    });

    setGraphData(data);
  }, [nodes, edges, centerNodeId, getNodeColor]);

  if (!graphData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">グラフを準備中...</p>
      </div>
    );
  }

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeLabel={(node: any) => {
        return `${node.name}\n${node.year ? `発行年: ${node.year}` : ""}\n${
          node.citationCount !== undefined ? `被引用数: ${node.citationCount}` : ""
        }`;
      }}
      nodeColor={(node: any) => node.color || "#6366f1"}
      nodeVal={(node: any) => node.val || 5}
      nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.name;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        
        // Draw node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        // Draw label if node is large enough or is center
        if (node.val > 6 || node.isCenter) {
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y - bckgDimensions[1] / 2,
            bckgDimensions[0],
            bckgDimensions[1]
          );
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#000';
          ctx.fillText(label, node.x, node.y);
        }
      }}
      linkColor={() => "#94a3b8"}
      linkWidth={1}
      linkDirectionalArrowLength={3}
      linkDirectionalArrowRelPos={1}
      backgroundColor="transparent"
      onNodeClick={(node: any) => {
        console.log("Node clicked:", node);
        if (onNodeClick) {
          onNodeClick(node.id);
        }
      }}
      onNodeRightClick={(node: any) => {
        console.log("Node right-clicked:", node);
        if (node.id !== centerNodeId) {
          setLocation(`/paper/${node.id}`);
        }
      }}
      cooldownTicks={100}
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.3}
    />
  );
}

