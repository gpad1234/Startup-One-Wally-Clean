import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './GraphView.css';

/**
 * GraphView - Visualizes ontology as a knowledge graph
 * - Classes = blue rectangles
 * - Instances = green circles
 * - Properties = purple diamonds (or edges with labels)
 * - Relationships = labeled edges
 */
export default function GraphView({ classes = [], instances = [] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  // Transform ontology data into React Flow format
  useEffect(() => {
    if (!classes.length) return;

    const newNodes = [];
    const newEdges = [];
    const positions = {}; // Track positions for layout

    // 1. Create nodes for classes
    classes.forEach((cls, index) => {
      const isRoot = cls.id === 'owl:Thing';
      const yPos = isRoot ? 50 : 200 + (index % 3) * 150;
      const xPos = isRoot ? 400 : 100 + (index * 250);

      positions[cls.id] = { x: xPos, y: yPos };

      newNodes.push({
        id: cls.id,
        type: 'default',
        data: {
          label: (
            <div className="node-label">
              <div className="node-title">{cls.label || cls.id}</div>
              {cls.properties?.length > 0 && (
                <div className="node-props">{cls.properties.length} props</div>
              )}
            </div>
          ),
        },
        position: { x: xPos, y: yPos },
        className: 'class-node',
        style: {
          background: isRoot ? '#f0f0f0' : '#3b82f6',
          color: isRoot ? '#333' : 'white',
          border: '2px solid #1e40af',
          borderRadius: '8px',
          padding: '10px',
          minWidth: '120px',
        },
      });

      // 2. Create edges for subClassOf relationships
      cls.parent_classes?.forEach(parentId => {
        if (parentId && parentId !== cls.id) {
          newEdges.push({
            id: `${cls.id}-subClassOf-${parentId}`,
            source: cls.id,
            target: parentId,
            label: 'subClassOf',
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#64748b', strokeWidth: 2 },
            labelStyle: { fill: '#475569', fontWeight: 600, fontSize: 11 },
            labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#64748b',
            },
          });
        }
      });

      // 3. Create property nodes (direct properties only, as small nodes)
      const directProps = cls.direct_properties || cls.properties?.filter(p => !p.inherited) || [];
      directProps.forEach((prop, propIndex) => {

        const propId = `${cls.id}-prop-${prop.id}`;
        const propX = xPos + 150;
        const propY = yPos + (propIndex * 40) - 20;

        newNodes.push({
          id: propId,
          type: 'default',
          data: {
            label: (
              <div className="prop-label">
                {prop.label || prop.id}
                {prop.required && <span className="required">*</span>}
              </div>
            ),
          },
          position: { x: propX, y: propY },
          className: 'property-node',
          style: {
            background: '#a855f7',
            color: 'white',
            border: '2px solid #7e22ce',
            borderRadius: '4px',
            padding: '6px 10px',
            fontSize: '11px',
            minWidth: '80px',
          },
        });

        // Edge from class to property
        newEdges.push({
          id: `${cls.id}-has-${propId}`,
          source: cls.id,
          target: propId,
          label: 'hasProperty',
          type: 'straight',
          style: { stroke: '#a855f7', strokeWidth: 1.5 },
          labelStyle: { fill: '#7e22ce', fontSize: 10 },
          labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
        });
      });
    });

    // 4. Create nodes for instances
    instances.forEach((inst, index) => {
      const classId = inst.classId;
      const classPos = positions[classId] || { x: 400, y: 400 };
      
      const instX = classPos.x + (index % 2 === 0 ? -150 : 150);
      const instY = classPos.y + 200 + Math.floor(index / 2) * 100;

      newNodes.push({
        id: inst.id,
        type: 'default',
        data: {
          label: (
            <div className="instance-label">
              <div className="instance-title">{inst.label || inst.id}</div>
              <div className="instance-type">{classId.split(':')[1]}</div>
            </div>
          ),
        },
        position: { x: instX, y: instY },
        className: 'instance-node',
        style: {
          background: '#22c55e',
          color: 'white',
          border: '2px solid #16a34a',
          borderRadius: '50%',
          padding: '15px',
          width: '110px',
          height: '110px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        },
      });

      // Edge from instance to its class
      newEdges.push({
        id: `${inst.id}-instanceOf-${classId}`,
        source: inst.id,
        target: classId,
        label: 'instanceOf',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '5,5' },
        labelStyle: { fill: '#16a34a', fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#22c55e',
        },
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
    setLoading(false);
  }, [classes, instances, setNodes, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    console.log('Node clicked:', node);
    // Future: Open detail panel for clicked node
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    console.log('Edge clicked:', edge);
  }, []);

  if (loading && classes.length === 0) {
    return (
      <div className="graph-view-loading">
        <p>Loading knowledge graph...</p>
      </div>
    );
  }

  return (
    <div className="graph-view-container">
      <div className="graph-view-header">
        <h3>Knowledge Graph</h3>
        <div className="graph-legend">
          <span className="legend-item">
            <span className="legend-box class-box"></span> Classes
          </span>
          <span className="legend-item">
            <span className="legend-box instance-box"></span> Instances
          </span>
          <span className="legend-item">
            <span className="legend-box property-box"></span> Properties
          </span>
        </div>
      </div>
      <div className="graph-view-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.className === 'class-node') return '#3b82f6';
              if (node.className === 'instance-node') return '#22c55e';
              if (node.className === 'property-node') return '#a855f7';
              return '#gray';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
