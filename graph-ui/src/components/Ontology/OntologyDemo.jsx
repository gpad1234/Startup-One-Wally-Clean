import React, { useState, useEffect } from 'react';
import ClassEditor from './ClassEditor';
import InstanceEditor from './InstanceEditor';
import InheritanceTree from './InheritanceTree';
import GraphView from './GraphView';
import { getAllClasses } from '../../services/ontologyApi';
import { mockClasses, mockInstances } from './mockOntologyData';
import './OntologyDemo.css';

/**
 * OntologyDemo - Demonstration page for Phase 1 inheritance features
 * 
 * Shows all three main components:
 * 1. InheritanceTree - Visual hierarchy
 * 2. ClassEditor - View class with inherited properties
 * 3. InstanceEditor - Create instances with validation
 */
const OntologyDemo = () => {
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [showInstanceEditor, setShowInstanceEditor] = useState(false);
  const [view, setView] = useState('tree'); // 'tree', 'class', 'instance', 'graph'
  const [classes, setClasses] = useState([]);
  const [instances, setInstances] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Load all classes and instances for graph view
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        // Use mock data for now until backend issues resolved
        setClasses(mockClasses);
        setInstances(mockInstances);
        
        /* Backend integration (uncomment when API is fixed):
        const classesResponse = await getAllClasses();
        const classesData = classesResponse.data.data || [];
        
        // Get full class info for each class
        const fullClasses = await Promise.all(
          classesData.map(async (cls) => {
            try {
              const fullResponse = await import('../../services/ontologyApi').then(api => 
                api.getClassFull(cls.id)
              );
              return fullResponse.data.data;
            } catch (error) {
              console.warn(`Failed to load full class data for ${cls.id}:`, error);
              return cls;
            }
          })
        );
        
        setClasses(fullClasses);
        setInstances([]); // Instances endpoint doesn't exist yet
        */
      } catch (error) {
        console.error('Failed to load ontology data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleClassSelect = (classId) => {
    setSelectedClassId(classId);
    setView('class');
  };

  const handleCreateInstance = () => {
    if (!selectedClassId) {
      alert('Please select a class first');
      return;
    }
    setShowInstanceEditor(true);
    setView('instance');
  };

  const handleInstanceSaved = (instance) => {
    console.log('Instance saved:', insgraph' ? 'active' : ''}`}
          onClick={() => setView('graph')}
        >
          🌐 Knowledge Graph
        </button>
        <button 
          className={`tab ${view === 'tance);
    alert(`Instance "${instance.label}" created successfully!`);
    setShowInstanceEditor(false);
    setView('class');
  };

  const handleCancel = () => {
    setShowInstanceEditor(false);
    setView(selectedClassId ? 'class' : 'tree');
  };

  return (
    <div className="ontology-demo">
      <div className="demo-header">
        <h1>🧬 Ontology Editor - Phase 1 Inheritance Demo</h1>
        <p className="demo-subtitle">
          Explore automatic property inheritance from parent classes to subclasses
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="demo-tabs">
        <button 
          className={`tab ${view === 'tree' ? 'active' : ''}`}
          onClick={() => setView('tree')}
        >
          📊 Hierarchy Tree
        </button>
        <button 
          className={`tab ${view === 'class' ? 'active' : ''}`}
          onClick={() => setView('class')}
          disabled={!selectedClassId}
        >
          📝 Class Editor
          {selectedClassId && <span className="tab-info">({selectedClassId})</span>}
        </button>
        <button 
          className={`tab ${view === 'instance' ? 'active' : ''}`}
          onClick={handleCreateInstance}
          disabled={!selectedClassId}
        >
          ➕ Knowledge Graph View */}
        {view === 'graph' && (
          <div className="view-container">
            <div className="view-instructions">
              <h3>🌐 Knowledge Graph Visualization</h3>
              <p>
                Interactive visualization of your ontology showing classes, instances, 
                properties, and their relationships. Pan, zoom, and click to explore.
              </p>
              <ul>
                <li>Blue rectangles = Classes</li>
                <li>Green circles = Instances</li>
                <li>Purple boxes = Properties</li>
                <li>Arrows show relationships (subClassOf, instanceOf, hasProperty)</li>
              </ul>
            </div>
            
            {loadingData ? (
              <div className="loading-message">Loading graph data...</div>
            ) : (
              <GraphView classes={classes} instances={instances} />
            )}
          </div>
        )}

        {/* Create Instance
        </button>
      </div>

      {/* Main Content Area */}
      <div className="demo-content">
        {/* Hierarchy Tree View */}
        {view === 'tree' && (
          <div className="view-container">
            <div className="view-instructions">
              <h3>👋 Welcome to the Inheritance Demo!</h3>
              <p>
                Click on any class in the tree below to view its properties 
                (both direct and inherited from parent classes).
              </p>
              <ul>
                <li>▼ Classes with children can be expanded</li>
                <li>○ Leaf classes have no subclasses</li>
                <li><span className="inline-badge">3</span> Number shows instance count</li>
                <li><span className="inline-level">L2</span> Level in hierarchy</li>
              </ul>
            </div>
            
            <InheritanceTree 
              rootClassId="owl:Thing"
              onClassSelect={handleClassSelect}
            />
          </div>
        )}

        {/* Class Editor View */}
        {view === 'class' && selectedClassId && (
          <div className="view-container">
            <div className="view-actions">
              <button className="action-btn back" onClick={() => setView('tree')}>
                ← Back to Tree
              </button>
              <button className="action-btn create" onClick={handleCreateInstance}>
                + Create Instance of This Class
              </button>
            </div>
            
            <ClassEditor 
              classId={selectedClassId}
              onClose={() => {
                setSelectedClassId(null);
                setView('tree');
              }}
            />
          </div>
        )}

        {/* Instance Editor View */}
        {view === 'instance' && selectedClassId && (
          <div className="view-container">
            <div className="view-instructions">
              <h3>Creating Instance</h3>
              <p>
                Fill in all required properties (marked with *) including those 
                inherited from parent classes. The form will validate your input 
                before allowing submission.
              </p>
            </div>
            
            <InstanceEditor
              classId={selectedClassId}
              onSave={handleInstanceSaved}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>

      {/* Feature Highlights */}
      <div className="demo-footer">
        <div className="feature-card">
          <h4>✨ Phase 1 Features</h4>
          <ul>
            <li>Automatic property inheritance from parent classes</li>
            <li>Visual distinction between direct and inherited properties</li>
            <li>Source tracking for each inherited property</li>
            <li>Validation of required properties (including inherited)</li>
            <li>Multi-level inheritance support (grandparents, etc.)</li>
            <li>Circular inheritance prevention</li>
          </ul>
        </div>

        <div className="feature-card">
          <h4>📝 Example Hierarchy</h4>
          <pre className="example-code">
{`Person (root)
  ├─ properties: name*, email*
  └─ Professor (extends Person)
      ├─ properties: department*
      └─ inherits: name*, email*
          (3 total properties)

Student (extends Person)
  ├─ properties: student_id*, gpa
  └─ inherits: name*, email*
      (4 total properties)`}
          </pre>
        </div>

        <div className="feature-card">
          <h4>🔍 Try It Out</h4>
          <ol>
            <li>View the hierarchy tree to see your ontology structure</li>
            <li>Click on a class like "Professor" to see inherited properties</li>
            <li>Create an instance - notice validation requires inherited properties</li>
            <li>Try missing a required field to see validation errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default OntologyDemo;
