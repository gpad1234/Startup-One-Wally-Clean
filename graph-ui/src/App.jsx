
import React, { useEffect, useState } from 'react';
import { Graph } from './components/Graph/Graph';
import { Chat } from './components/Chat/Chat';
import { Sidebar } from './components/Sidebar/Sidebar';
import NLP from './components/NLP/NLP';
import OntologyDemo from './components/Ontology/OntologyDemo';
import { useGraphStore } from './store/graphStore';
import './App.css';


function App() {
  const { fetchVisualization, fetchStats } = useGraphStore();
  const [activeTab, setActiveTab] = useState('graph');

  useEffect(() => {
    fetchVisualization();
    fetchStats();
  }, [fetchVisualization, fetchStats]);

  return (
    <div className="app">
      <Sidebar showChat={activeTab === 'graph'} />
      <div className="main-content">
        <div className="tabs">
          <button
            className={activeTab === 'graph' ? 'active' : ''}
            onClick={() => setActiveTab('graph')}
          >
            Graph & Chat
          </button>
          <button
            className={activeTab === 'nlp' ? 'active' : ''}
            onClick={() => setActiveTab('nlp')}
          >
            Search & NLP
          </button>
          <button
            className={activeTab === 'ontology' ? 'active' : ''}
            onClick={() => setActiveTab('ontology')}
          >
            🧬 Ontology Editor
          </button>
        </div>
        {activeTab === 'graph' && (
          <div className="graph-section">
            <Graph />
          </div>
        )}
        {activeTab === 'nlp' && (
          <div className="nlp-section">
            <NLP />
          </div>
        )}
        {activeTab === 'ontology' && (
          <div className="ontology-section">
            <OntologyDemo />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
