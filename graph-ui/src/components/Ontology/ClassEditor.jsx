import React, { useState, useEffect } from 'react';
import { getClassFull } from '../../services/ontologyApi';
import PropertyRow from './PropertyRow';
import './ClassEditor.css';

/**
 * ClassEditor - Display and edit ontology classes with inheritance
 * 
 * Shows:
 * - Class metadata (name, description, parents)
 * - Direct properties
 * - Inherited properties (with source tracking)
 * - Inheritance chain visualization
 */
const ClassEditor = ({ classId, onClose }) => {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInherited, setShowInherited] = useState(true);

  useEffect(() => {
    loadClassData();
  }, [classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getClassFull(classId);
      setClassData(response.data.data);
    } catch (err) {
      console.error('Error loading class:', err);
      setError(err.response?.data?.error || 'Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="class-editor loading">
        <div className="spinner">Loading class information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="class-editor error">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (!classData) {
    return null;
  }

  const { 
    label, 
    description, 
    parent_classes, 
    direct_properties, 
    inherited_properties,
    all_properties 
  } = classData;

  return (
    <div className="class-editor">
      <div className="class-header">
        <div className="class-title-section">
          <h2 className="class-title">{label}</h2>
          {description && <p className="class-description">{description}</p>}
        </div>
        
        {onClose && (
          <button className="close-button" onClick={onClose}>✕</button>
        )}
      </div>

      {/* Parent Classes */}
      {parent_classes && parent_classes.length > 0 && (
        <div className="parent-classes-section">
          <h3>Extends</h3>
          <div className="parent-classes">
            {parent_classes.map(parentId => (
              <span key={parentId} className="parent-class-tag">
                {parentId}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Bar */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">{direct_properties?.length || 0}</span>
          <span className="stat-label">Direct Properties</span>
        </div>
        <div className="stat">
          <span className="stat-value">{inherited_properties?.length || 0}</span>
          <span className="stat-label">Inherited Properties</span>
        </div>
        <div className="stat">
          <span className="stat-value">{all_properties?.length || 0}</span>
          <span className="stat-label">Total Properties</span>
        </div>
      </div>

      {/* Direct Properties */}
      <div className="properties-section">
        <div className="section-header">
          <h3>
            <span className="section-icon direct">●</span>
            Direct Properties
          </h3>
          <span className="count-badge">{direct_properties?.length || 0}</span>
        </div>
        
        {direct_properties && direct_properties.length > 0 ? (
          <div className="properties-list">
            {direct_properties.map(prop => (
              <PropertyRow
                key={prop.id}
                property={prop}
                inherited={false}
                editable={false}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No direct properties defined on this class.</p>
          </div>
        )}
      </div>

      {/* Inherited Properties */}
      <div className="properties-section inherited-section">
        <div className="section-header">
          <h3>
            <span className="section-icon inherited">↓</span>
            Inherited Properties
          </h3>
          <div className="section-controls">
            <span className="count-badge">{inherited_properties?.length || 0}</span>
            <button 
              className="toggle-button"
              onClick={() => setShowInherited(!showInherited)}
            >
              {showInherited ? '▼' : '▶'}
            </button>
          </div>
        </div>
        
        {showInherited && (
          <>
            {inherited_properties && inherited_properties.length > 0 ? (
              <div className="properties-list">
                {inherited_properties.map(prop => (
                  <PropertyRow
                    key={`${prop.source}-${prop.id}`}
                    property={prop}
                    inherited={true}
                    editable={false}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No inherited properties (no parent classes or parents have no properties).</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="info-box">
        <h4>💡 About Property Inheritance</h4>
        <ul>
          <li><strong>Direct properties</strong> are defined specifically on this class</li>
          <li><strong>Inherited properties</strong> come from parent classes automatically</li>
          <li>Instances of this class must satisfy <strong>all properties</strong> (direct + inherited)</li>
          <li>Required inherited properties must be provided when creating instances</li>
        </ul>
      </div>
    </div>
  );
};

export default ClassEditor;
