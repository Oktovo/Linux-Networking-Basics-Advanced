import { NetworkTopology } from '../data/networkTopology';

interface Props {
  topology: NetworkTopology;
}

function getNodeCenter(node: { x: number; y: number; width: number; height: number }) {
  return {
    cx: node.x + node.width / 2,
    cy: node.y + node.height / 2
  };
}

function getEdgePoint(
  node: { x: number; y: number; width: number; height: number },
  targetX: number,
  targetY: number
) {
  const cx = node.x + node.width / 2;
  const cy = node.y + node.height / 2;
  const dx = targetX - cx;
  const dy = targetY - cy;

  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  const hw = node.width / 2;
  const hh = node.height / 2;

  // Find intersection with rectangle edge
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  let scale: number;
  if (absDx * hh > absDy * hw) {
    // Intersects left or right edge
    scale = hw / absDx;
  } else {
    // Intersects top or bottom edge
    scale = hh / absDy;
  }

  return {
    x: cx + dx * scale,
    y: cy + dy * scale
  };
}

function getNodeIcon(type: string) {
  switch (type) {
    case 'namespace': return '📦';
    case 'router': return '🔀';
    case 'bridge': return '🌉';
    case 'cloud': return '☁️';
    case 'host': return '💻';
    case 'switch': return '🔌';
    default: return '⬜';
  }
}

export default function NetworkDiagram({ topology }: Props) {
  const svgWidth = 920;
  const svgHeight = 480;

  const nodesMap = new Map(topology.nodes.map(n => [n.id, n]));

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full min-w-[700px] h-auto"
        style={{ maxHeight: '500px' }}
      >
        {/* Background */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gray-200 dark:text-gray-700" />
          </pattern>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.15" />
          </filter>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
        </defs>
        <rect width={svgWidth} height={svgHeight} fill="url(#grid)" className="opacity-50" />

        {/* Links */}
        {topology.links.map(link => {
          const fromNode = nodesMap.get(link.from);
          const toNode = nodesMap.get(link.to);
          if (!fromNode || !toNode) return null;

          const fromCenter = getNodeCenter(fromNode);
          const toCenter = getNodeCenter(toNode);
          const fromEdge = getEdgePoint(fromNode, toCenter.cx, toCenter.cy);
          const toEdge = getEdgePoint(toNode, fromCenter.cx, fromCenter.cy);

          const midX = (fromEdge.x + toEdge.x) / 2;
          const midY = (fromEdge.y + toEdge.y) / 2;

          return (
            <g key={link.id}>
              <line
                x1={fromEdge.x}
                y1={fromEdge.y}
                x2={toEdge.x}
                y2={toEdge.y}
                stroke={link.color || '#6b7280'}
                strokeWidth="2.5"
                strokeDasharray={link.dashed ? "8,4" : undefined}
                markerEnd="url(#arrowhead)"
                className="transition-all duration-300"
              />
              {link.label && (
                <g>
                  <rect
                    x={midX - 50}
                    y={midY - 10}
                    width="100"
                    height="18"
                    rx="4"
                    fill="white"
                    stroke={link.color || '#6b7280'}
                    strokeWidth="0.5"
                    className="dark:fill-gray-800"
                    opacity="0.95"
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="500"
                    fill={link.color || '#374151'}
                    className="dark:fill-gray-300"
                  >
                    {link.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {topology.nodes.map(node => (
          <g key={node.id} filter="url(#shadow)">
            {/* Node rectangle */}
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              rx="10"
              fill={node.color}
              fillOpacity="0.1"
              stroke={node.color}
              strokeWidth="2"
              className="transition-all duration-300"
            />
            {/* Inner fill */}
            <rect
              x={node.x + 2}
              y={node.y + 2}
              width={node.width - 4}
              height={node.height - 4}
              rx="8"
              fill="white"
              fillOpacity="0.9"
              className="dark:fill-gray-800 dark:fill-opacity-90"
            />
            {/* Color bar at top */}
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height="26"
              rx="10"
              fill={node.color}
            />
            <rect
              x={node.x}
              y={node.y + 16}
              width={node.width}
              height="10"
              fill={node.color}
            />

            {/* Icon + Label */}
            <text
              x={node.x + 12}
              y={node.y + 17}
              fontSize="14"
              fill="white"
            >
              {getNodeIcon(node.type)}
            </text>
            <text
              x={node.x + 30}
              y={node.y + 17}
              fontSize="11"
              fontWeight="700"
              fill="white"
            >
              {node.label}
            </text>

            {/* Details */}
            {node.details?.map((detail, i) => (
              <text
                key={i}
                x={node.x + 10}
                y={node.y + 42 + i * 14}
                fontSize="9"
                fill="#4b5563"
                className="dark:fill-gray-300"
                fontFamily="monospace"
              >
                {detail}
              </text>
            ))}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 px-2">
        {topology.legend.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
