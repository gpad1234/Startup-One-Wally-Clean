import React, { useState, useEffect, useRef } from 'react';
import GraphView from './GraphView';
import { getAllClasses, importOntology, exportOntology } from '../../services/ontologyApi';
import { mockClasses, mockInstances } from './mockOntologyData';
import './OntologyDemo.css';

/**
 * OntologyDemo - Knowledge Graph Visualization with RDF/OWL Import/Export
 * 
 * Features:
 * - Interactive knowledge graph visualization
 * - Import RDF/OWL files
 * - Export ontology to RDF/OWL formats
 */
const PAGE_SIZE = 10;

const OntologyDemo = () => {
  const [classes, setClasses] = useState([]);
  const [instances, setInstances] = useState([]);
  const [page, setPage] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef(null);

  // Load classes + instances from the medical ontology TTL via Flask API
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const res = await fetch('/api/ontology/medical/graph');
        const json = await res.json();
        if (json.data) {
          setClasses(json.data.classes || mockClasses);
          setInstances(json.data.instances || mockInstances);
          console.log('[OntologyDemo] Loaded from API:',
            json.data.summary?.class_count, 'classes,',
            json.data.summary?.instance_count, 'instances');
        } else {
          // API returned unexpected shape — fall back
          setClasses(mockClasses);
          setInstances(mockInstances);
        }
      } catch (error) {
        console.warn('[OntologyDemo] API unavailable, using mock data:', error.message);
        setClasses(mockClasses);
        setInstances(mockInstances);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const response = await importOntology(file);
      const counts = response.data.data;

      alert(
        `Import successful!\n\n` +
        `Classes: ${counts.classes}\n` +
        `Properties: ${counts.properties}\n` +
        `Instances: ${counts.instances}\n` +
        `${counts.errors > 0 ? `Errors: ${counts.errors}` : ''}`
      );

      // Reload data
      const classesResponse = await getAllClasses();
      setClasses(classesResponse.data.data || []);
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Import failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = async (format = 'xml') => {
    setExporting(true);
    try {
      const response = await exportOntology(format);

      // Create download
      const blob = new Blob([response.data], { type: 'application/rdf+xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ontology.${format === 'turtle' ? 'ttl' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="ontology-demo">
      <div className="demo-header">
        <div className="header-content">
          <div className="header-text">
            <h1>🧬 Ontology Knowledge Graph</h1>
            <p className="demo-subtitle">
              Interactive visualization with RDF/OWL import/export capabilities
            </p>
          </div>
          <div className="header-actions">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".owl,.rdf,.xml,.ttl,.turtle,.n3,.nt"
              style={{ display: 'none' }}
            />
            <button
              className="action-btn import"
              onClick={handleImportClick}
              disabled={importing}
              title="Import ontology from RDF/OWL file"
            >
              {importing ? '⏳ Importing...' : '📥 Import RDF/OWL'}
            </button>
            <button
              className="action-btn export"
              onClick={() => handleExport('xml')}
              disabled={exporting}
              title="Export ontology as RDF/OWL XML"
            >
              {exporting ? '⏳ Exporting...' : '📤 Export RDF/OWL'}
            </button>
          </div>
        </div>
      </div>

      {/* Knowledge Graph View */}
      <div className="demo-content">
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
            <>
              <GraphView
                classes={classes}
                instances={instances.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
              />
              {instances.length > PAGE_SIZE && (
                <div className="pagination-bar">
                  <button
                    className="page-btn"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >← Prev</button>
                  <span className="page-info">
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, instances.length)} of {instances.length} instances
                  </span>
                  <button
                    className="page-btn"
                    onClick={() => setPage(p => Math.min(Math.ceil(instances.length / PAGE_SIZE) - 1, p + 1))}
                    disabled={(page + 1) * PAGE_SIZE >= instances.length}
                  >Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OntologyDemo;
