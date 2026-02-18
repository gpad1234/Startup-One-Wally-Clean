import React, { useState, useEffect } from 'react';

/**
 * PaginationTest - Visual test component for pagination API endpoints
 * 
 * Tests:
 * - GET /api/ontology/graph/nodes (paginated list)
 * - POST /api/ontology/graph/viewport (fish-eye)
 * - GET /api/ontology/graph/neighbors/<id> (neighbors)
 */
const PaginationTest = () => {
  const [activeTest, setActiveTest] = useState('nodes');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Test 1: Paginated Nodes
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  
  // Test 2: Viewport
  const [centerNode, setCenterNode] = useState('demo:Person');
  const [radius, setRadius] = useState(2);
  
  // Test 3: Neighbors
  const [nodeId, setNodeId] = useState('demo:Person');

  const testPaginatedNodes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/ontology/graph/nodes?skip=${skip}&limit=${limit}`
      );
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testViewport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ontology/graph/viewport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          center_node: centerNode,
          radius: radius,
          limit: 50
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testNeighbors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/ontology/graph/neighbors/${encodeURIComponent(nodeId)}?depth=1`
      );
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🧪 Pagination API Test</h1>
      
      {/* Test Selection */}
      <div style={styles.buttonGroup}>
        <button
          style={activeTest === 'nodes' ? styles.buttonActive : styles.button}
          onClick={() => setActiveTest('nodes')}
        >
          📄 Paginated Nodes
        </button>
        <button
          style={activeTest === 'viewport' ? styles.buttonActive : styles.button}
          onClick={() => setActiveTest('viewport')}
        >
          🎯 Fish-Eye Viewport
        </button>
        <button
          style={activeTest === 'neighbors' ? styles.buttonActive : styles.button}
          onClick={() => setActiveTest('neighbors')}
        >
          🔗 Neighbors
        </button>
      </div>

      {/* Test Controls */}
      <div style={styles.controls}>
        {activeTest === 'nodes' && (
          <div style={styles.controlGroup}>
            <h3>Paginated Nodes Test</h3>
            <p>GET /api/ontology/graph/nodes</p>
            <div style={styles.inputGroup}>
              <label>Skip:
                <input
                  type="number"
                  value={skip}
                  onChange={(e) => setSkip(parseInt(e.target.value))}
                  style={styles.input}
                />
              </label>
              <label>Limit:
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  style={styles.input}
                />
              </label>
            </div>
            <button onClick={testPaginatedNodes} style={styles.testButton} disabled={loading}>
              {loading ? 'Testing...' : 'Run Test'}
            </button>
          </div>
        )}

        {activeTest === 'viewport' && (
          <div style={styles.controlGroup}>
            <h3>Fish-Eye Viewport Test</h3>
            <p>POST /api/ontology/graph/viewport</p>
            <div style={styles.inputGroup}>
              <label>Center Node:
                <input
                  type="text"
                  value={centerNode}
                  onChange={(e) => setCenterNode(e.target.value)}
                  style={styles.input}
                  placeholder="demo:Person"
                />
              </label>
              <label>Radius (hops):
                <input
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  style={styles.input}
                  min="1"
                  max="5"
                />
              </label>
            </div>
            <button onClick={testViewport} style={styles.testButton} disabled={loading}>
              {loading ? 'Testing...' : 'Run Test'}
            </button>
          </div>
        )}

        {activeTest === 'neighbors' && (
          <div style={styles.controlGroup}>
            <h3>Neighbors Test</h3>
            <p>GET /api/ontology/graph/neighbors/&lt;id&gt;</p>
            <div style={styles.inputGroup}>
              <label>Node ID:
                <input
                  type="text"
                  value={nodeId}
                  onChange={(e) => setNodeId(e.target.value)}
                  style={styles.input}
                  placeholder="demo:Person"
                />
              </label>
            </div>
            <button onClick={testNeighbors} style={styles.testButton} disabled={loading}>
              {loading ? 'Testing...' : 'Run Test'}
            </button>
          </div>
        )}
      </div>

      {/* Results Display */}
      {error && (
        <div style={styles.error}>
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div style={styles.results}>
          <div style={styles.resultsHeader}>
            <h3>Results</h3>
            {result.success && <span style={styles.badge}>✅ Success</span>}
          </div>
          
          {/* Summary Stats */}
          {result.data && (
            <div style={styles.stats}>
              {result.data.nodes && (
                <div style={styles.stat}>
                  <strong>Nodes:</strong> {result.data.nodes.length}
                </div>
              )}
              {result.data.edges && (
                <div style={styles.stat}>
                  <strong>Edges:</strong> {result.data.edges.length}
                </div>
              )}
              {result.data.total !== undefined && (
                <div style={styles.stat}>
                  <strong>Total:</strong> {result.data.total}
                </div>
              )}
              {result.data.has_more !== undefined && (
                <div style={styles.stat}>
                  <strong>Has More:</strong> {result.data.has_more ? 'Yes' : 'No'}
                </div>
              )}
              {result.data.levels && (
                <div style={styles.stat}>
                  <strong>Levels:</strong> {JSON.stringify(result.data.levels)}
                </div>
              )}
            </div>
          )}

          {/* Raw JSON */}
          <details style={styles.details}>
            <summary style={styles.summary}>View Raw JSON</summary>
            <pre style={styles.json}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>

          {/* Node List */}
          {result.data?.nodes && (
            <div style={styles.nodeList}>
              <h4>Nodes ({result.data.nodes.length})</h4>
              {result.data.nodes.map((node, idx) => (
                <div key={idx} style={styles.nodeCard}>
                  <div style={styles.nodeHeader}>
                    <strong>{node.id}</strong>
                    <span style={styles.nodeType}>{node.type}</span>
                  </div>
                  <div style={styles.nodeLabel}>{node.label}</div>
                  {node.distance_from_center !== undefined && (
                    <div style={styles.distance}>
                      Distance: {node.distance_from_center} hops
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Neighbors List */}
          {result.data?.neighbors && (
            <div style={styles.nodeList}>
              <h4>Neighbors ({result.data.neighbors.length})</h4>
              {result.data.neighbors.map((node, idx) => (
                <div key={idx} style={styles.nodeCard}>
                  <div style={styles.nodeHeader}>
                    <strong>{node.id}</strong>
                    <span style={styles.nodeType}>{node.type}</span>
                  </div>
                  <div style={styles.nodeLabel}>{node.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  title: {
    color: '#2c3e50',
    marginBottom: '20px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  button: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    background: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  buttonActive: {
    padding: '10px 20px',
    border: '1px solid #3498db',
    background: '#3498db',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  controls: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  controlGroup: {
    maxWidth: '600px'
  },
  inputGroup: {
    display: 'flex',
    gap: '20px',
    margin: '15px 0'
  },
  input: {
    marginLeft: '10px',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    width: '200px'
  },
  testButton: {
    padding: '12px 30px',
    background: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  error: {
    background: '#fee',
    border: '1px solid #fcc',
    padding: '15px',
    borderRadius: '6px',
    color: '#c33',
    marginBottom: '20px'
  },
  results: {
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px'
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  badge: {
    background: '#d4edda',
    color: '#155724',
    padding: '5px 12px',
    borderRadius: '12px',
    fontSize: '14px'
  },
  stats: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '20px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '6px'
  },
  stat: {
    fontSize: '14px'
  },
  details: {
    marginBottom: '20px'
  },
  summary: {
    cursor: 'pointer',
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '4px',
    fontWeight: 'bold'
  },
  json: {
    background: '#2d2d2d',
    color: '#f8f8f2',
    padding: '15px',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '400px',
    fontSize: '12px'
  },
  nodeList: {
    marginTop: '20px'
  },
  nodeCard: {
    background: '#f8f9fa',
    padding: '12px',
    marginBottom: '10px',
    borderRadius: '6px',
    border: '1px solid #e9ecef'
  },
  nodeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px'
  },
  nodeType: {
    background: '#e9ecef',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#6c757d'
  },
  nodeLabel: {
    color: '#6c757d',
    fontSize: '14px'
  },
  distance: {
    marginTop: '5px',
    fontSize: '12px',
    color: '#3498db',
    fontWeight: 'bold'
  }
};

export default PaginationTest;
