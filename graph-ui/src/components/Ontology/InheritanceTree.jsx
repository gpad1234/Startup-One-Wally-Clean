import React, { useState, useEffect } from 'react';
import { getHierarchy } from '../../services/ontologyApi';
import './InheritanceTree.css';

/**
 * InheritanceTree - Visualize class hierarchy with inheritance relationships
 * 
 * Displays a tree structure showing:
 * - Parent-child relationships (subclass links)
 * - Instance counts per class
 * - Depth indicators
 * - Expandable/collapsible nodes
 */
const InheritanceTree = ({ rootClassId = 'owl:Thing', onClassSelect }) => {
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['owl:Thing']));

  useEffect(() => {
    loadHierarchy();
  }, [rootClassId]);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getHierarchy(rootClassId);
      setHierarchy(response.data.data);
    } catch (err) {
      console.error('Error loading hierarchy:', err);
      setError(err.response?.data?.error || 'Failed to load class hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (classId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  const renderTreeNode = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.class_id);
    const indentStyle = { paddingLeft: `${depth * 24}px` };

    return (
      <div key={node.class_id} className="tree-node-container">
        <div 
          className={`tree-node depth-${depth}`}
          style={indentStyle}
          onClick={() => onClassSelect && onClassSelect(node.class_id)}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button 
              className="expand-button"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.class_id);
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="no-children-spacer">○</span>
          )}

          {/* Class Name */}
          <span className="class-label">{node.label}</span>

          {/* Instance Count Badge */}
          {node.instance_count > 0 && (
            <span className="instance-badge">
              {node.instance_count}
            </span>
          )}

          {/* Depth Indicator */}
          <span className="depth-indicator">L{node.depth}</span>
        </div>

        {/* Child Nodes */}
        {hasChildren && isExpanded && (
          <div className="children">
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="inheritance-tree loading">
        <div className="spinner">Loading hierarchy...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inheritance-tree error">
        <div className="error-message">
          <h4>Error Loading Hierarchy</h4>
          <p>{error}</p>
          <button onClick={loadHierarchy}>Retry</button>
        </div>
      </div>
    );
  }

  if (!hierarchy) {
    return null;
  }

  return (
    <div className="inheritance-tree">
      <div className="tree-header">
        <h3>Class Hierarchy</h3>
        <div className="tree-legend">
          <span className="legend-item">
            <span className="legend-icon">▼/▶</span> Expand/Collapse
          </span>
          <span className="legend-item">
            <span className="legend-badge">3</span> Instances
          </span>
          <span className="legend-item">
            <span className="legend-depth">L2</span> Level
          </span>
        </div>
      </div>

      <div className="tree-container">
        {renderTreeNode(hierarchy)}
      </div>

      <div className="tree-footer">
        <button 
          className="expand-all-button"
          onClick={() => {
            // Recursively collect all class IDs
            const collectIds = (node) => {
              const ids = [node.class_id];
              if (node.children) {
                node.children.forEach(child => {
                  ids.push(...collectIds(child));
                });
              }
              return ids;
            };
            setExpandedNodes(new Set(collectIds(hierarchy)));
          }}
        >
          Expand All
        </button>
        <button 
          className="collapse-all-button"
          onClick={() => setExpandedNodes(new Set([rootClassId]))}
        >
          Collapse All
        </button>
      </div>
    </div>
  );
};

export default InheritanceTree;
