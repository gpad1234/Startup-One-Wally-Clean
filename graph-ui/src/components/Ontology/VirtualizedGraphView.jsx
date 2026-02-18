import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  MarkerType,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

/**
 * VirtualizedGraphView - Fish-eye visualization for large ontologies
 * 
 * Features:
 * - Viewport-based loading (loads only visible nodes)
 * - Fish-eye zoom: nodes scale by distance from center
 * - Progressive detail: labels fade at distance
 * - Click to recenter: dynamic viewport updates
 * - Beautiful gradients and animations
 */
const VirtualizedGraphViewInner = ({ initialCenter = 'owl:Thing', initialRadius = 2 }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [centerNode, setCenterNode] = useState(initialCenter);
  const [radius, setRadius] = useState(initialRadius);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewportInfo, setViewportInfo] = useState(null);

  // Load viewport from API
  const loadViewport = useCallback(async (center, rad) => {
    setLoading(true);
    setError(null);
    
    console.log('🔍 Loading viewport:', { center, radius: rad });
    
    try {
      const response = await fetch('http://127.0.0.1:5002/api/ontology/graph/viewport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          center_node: center,
          radius: rad,
          limit: 50
        })
      });
      
      const result = await response.json();
      console.log('📦 API Response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load viewport');
      }
      
      const data = result.data;
      console.log('✅ Viewport data:', {
        nodes: data.nodes.length,
        edges: data.edges.length,
        levels: data.levels
      });
      setViewportInfo(data);
      
      // Convert to React Flow format with fish-eye styling
      const flowNodes = data.nodes.map((node, index) => {
        const distance = node.distance_from_center || 0;
        const style = getNodeStyle(distance, node.type);
        const position = calculatePosition(index, data.nodes.length, distance, data.nodes);
        
        return {
          id: node.id,
          type: 'custom',
          data: {
            label: node.label || node.id,
            fullData: node,
            distance,
            isCenter: distance === 0,
            nodeType: node.type,
            nodeStyle: style
          },
          position,
          draggable: true
        };
      });
      
      const flowEdges = data.edges.map((edge, index) => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: false,
        style: getEdgeStyle(edge),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        }
      }));
      
      console.log('🎨 Created React Flow nodes:', flowNodes.length);
      console.log('🎨 Created React Flow edges:', flowEdges.length);
      console.log('Sample positions:', flowNodes.slice(0, 3).map(n => ({ id: n.id, pos: n.position })));
      
      setNodes(flowNodes);
      setEdges(flowEdges);
      
    } catch (err) {
      console.error('Error loading viewport:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  // Initial load
  useEffect(() => {
    loadViewport(centerNode, radius);
  }, [centerNode, radius, loadViewport]);

  // Fit view when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      // Wait a bit for nodes to render, then fit view
      setTimeout(() => {
        const reactFlowWrapper = document.querySelector('.react-flow');
        if (reactFlowWrapper) {
          console.log('📐 Fitting view to', nodes.length, 'nodes');
          // Trigger a window resize event to force ReactFlow to recalculate
          window.dispatchEvent(new Event('resize'));
        }
      }, 100);
    }
  }, [nodes.length]);

  // Fish-eye node styling based on distance
  const getNodeStyle = (distance, nodeType) => {
    // Scale: 1.8x for center, 1.3x at distance 1, 1.0x at distance 2, 0.6x at distance 3+
    const scales = [1.8, 1.3, 1.0, 0.7, 0.5];
    const scale = scales[Math.min(distance, 4)];
    
    // Opacity: full for center/near, fade for distant
    const opacities = [1, 0.95, 0.85, 0.7, 0.5];
    const opacity = opacities[Math.min(distance, 4)];
    
    // Colors by node type with fish-eye glow
    const typeColors = {
      'owl:Class': { bg: '#3b82f6', border: '#1d4ed8', text: '#fff' },
      'owl:Property': { bg: '#10b981', border: '#047857', text: '#fff' },
      'owl:Individual': { bg: '#f59e0b', border: '#d97706', text: '#fff' },
      'default': { bg: '#6366f1', border: '#4338ca', text: '#fff' }
    };
    
    const colors = typeColors[nodeType] || typeColors.default;
    
    // Center node gets special treatment
    const boxShadow = distance === 0 
      ? `0 0 30px ${colors.bg}, 0 0 60px ${colors.bg}40`
      : distance === 1
      ? `0 0 15px ${colors.bg}60`
      : 'none';
    
    return {
      background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.border} 100%)`,
      color: colors.text,
      border: `2px solid ${colors.border}`,
      borderRadius: '12px',
      padding: `${8 * scale}px ${12 * scale}px`,
      fontSize: `${12 * scale}px`,
      fontWeight: distance === 0 ? 'bold' : distance === 1 ? '600' : 'normal',
      opacity,
      transform: `scale(${scale})`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow,
      cursor: 'pointer',
      minWidth: `${60 * scale}px`,
      textAlign: 'center',
      whiteSpace: distance > 2 ? 'nowrap' : 'normal',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    };
  };

  // Edge styling
  const getEdgeStyle = (edge) => ({
    stroke: '#94a3b8',
    strokeWidth: 2,
    opacity: 0.6
  });

  // Calculate circular layout positions based on distance
  const calculatePosition = (index, total, distance, allNodes) => {
    if (distance === 0) {
      return { x: 400, y: 300 }; // Center
    }
    
    // Group nodes by distance level
    const nodesAtDistance = allNodes.filter(n => n.distance_from_center === distance);
    const indexAtLevel = nodesAtDistance.findIndex(n => allNodes[index].id === n.id);
    const countAtLevel = nodesAtDistance.length;
    
    // Arrange nodes in concentric circles by distance
    const angleStep = (2 * Math.PI) / Math.max(countAtLevel, 3); // At least 3 positions for good spacing
    const angle = indexAtLevel * angleStep - (Math.PI / 2); // Start from top
    const radiusMultiplier = 180 + (distance * 150); // Increase radius with distance
    
    return {
      x: 400 + Math.cos(angle) * radiusMultiplier,
      y: 300 + Math.sin(angle) * radiusMultiplier
    };
  };

  // Handle node click to recenter
  const onNodeClick = useCallback((event, node) => {
    console.log('Recentering on:', node.id);
    setCenterNode(node.id);
  }, []);

  // Custom node component with fish-eye effects
  const CustomNode = ({ data }) => {
    const distance = data.distance || 0;
    const showFullLabel = distance <= 2;
    const nodeStyle = data.nodeStyle || {};
    
    return (
      <div 
        style={{
          ...nodeStyle,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Connection handles */}
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#555', opacity: 0, pointerEvents: 'none' }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#555', opacity: 0, pointerEvents: 'none' }}
        />
        
        {data.isCenter && (
          <div style={{
            position: 'absolute',
            top: '-25px',
            fontSize: '20px',
            animation: 'pulse 2s infinite',
            pointerEvents: 'none'
          }}>
            🎯
          </div>
        )}
        <div style={{ pointerEvents: 'none' }}>
          {showFullLabel ? data.label : data.label.substring(0, 15) + '...'}
        </div>
        {distance === 0 && (
          <div style={{
            fontSize: '10px',
            opacity: 0.8,
            marginTop: '4px',
            pointerEvents: 'none'
          }}>
            (center)
          </div>
        )}
      </div>
    );
  };

  const nodeTypes = useMemo(() => ({
    custom: CustomNode
  }), []);

  return (
    <div style={styles.container}>
      {/* Controls Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>🔍 Fish-Eye Graph View</h2>
          <div style={styles.info}>
            {viewportInfo && (
              <>
                <span style={styles.badge}>
                  📍 {nodes.length} nodes
                </span>
                <span style={styles.badge}>
                  🔗 {edges.length} edges
                </span>
                <span style={styles.badge}>
                  🎯 Center: {centerNode}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div style={styles.controls}>
          <label style={styles.label}>
            Radius (hops):
            <input
              type="range"
              min="1"
              max="5"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.value}>{radius}</span>
          </label>
        </div>
      </div>

      {/* Graph Visualization */}
      <div style={styles.graphContainer}>
        {loading && (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Loading viewport...</p>
          </div>
        )}
        
        {error && (
          <div style={styles.error}>
            ❌ {error}
          </div>
        )}
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ 
            padding: 0.3,
            includeHiddenNodes: false,
            minZoom: 0.5,
            maxZoom: 1.5
          }}
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          key={`flow-${centerNode}-${radius}-${nodes.length}`}
        >
          <Background color="#e2e8f0" gap={20} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const distance = node.data.distance || 0;
              return distance === 0 ? '#ef4444' : '#3b82f6';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Styles
const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#f8fafc'
  },
  header: {
    background: 'white',
    padding: '20px',
    borderBottom: '2px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  title: {
    margin: 0,
    color: '#1e293b',
    fontSize: '24px'
  },
  info: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  badge: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500'
  },
  controls: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#64748b'
  },
  slider: {
    width: '150px',
    accentColor: '#3b82f6'
  },
  value: {
    fontWeight: 'bold',
    color: '#1e293b',
    minWidth: '20px'
  },
  graphContainer: {
    flex: 1,
    position: 'relative',
    background: 'white'
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 15px'
  },
  error: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    padding: '15px 25px',
    borderRadius: '8px',
    zIndex: 1000,
    fontWeight: '500'
  }
};

// Wrapper component with ReactFlowProvider
const VirtualizedGraphView = (props) => {
  return (
    <ReactFlowProvider>
      <VirtualizedGraphViewInner {...props} />
    </ReactFlowProvider>
  );
};

export default VirtualizedGraphView;
