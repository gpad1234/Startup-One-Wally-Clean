
import React, { useState } from 'react';
import OntologyDemo from './components/Ontology/OntologyDemo';
import VirtualizedGraphView from './components/Ontology/VirtualizedGraphView';
import MedicalDiagnosisAI from './components/Ontology/MedicalDiagnosisAI';
import './App.css';


function App() {
  const [activeTab, setActiveTab] = useState('fisheye');

  return (
    <div className="app">
      <div className="main-content">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'fisheye' ? 'active' : ''}`}
            onClick={() => setActiveTab('fisheye')}
          >
            🔍 Fish-Eye Graph
          </button>
          <button 
            className={`tab ${activeTab === 'ontology' ? 'active' : ''}`}
            onClick={() => setActiveTab('ontology')}
          >
            🧬 Ontology Editor
          </button>
          <button 
            className={`tab ${activeTab === 'medical' ? 'active' : ''}`}
            onClick={() => setActiveTab('medical')}
          >
            🏥 Medical AI Reasoner
          </button>
        </div>
        <div className="ontology-section">
          {activeTab === 'fisheye' && <VirtualizedGraphView />}
          {activeTab === 'ontology' && <OntologyDemo />}
          {activeTab === 'medical' && <MedicalDiagnosisAI />}
        </div>
      </div>
    </div>
  );
}

export default App;
