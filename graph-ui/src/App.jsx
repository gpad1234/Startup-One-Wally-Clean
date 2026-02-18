
import React, { useState } from 'react';
import OntologyDemo from './components/Ontology/OntologyDemo';
import PaginationTest from './components/Ontology/PaginationTest';
import './App.css';


function App() {
  const [activeTab, setActiveTab] = useState('ontology');

  return (
    <div className="app">
      <div className="main-content">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'ontology' ? 'active' : ''}`}
            onClick={() => setActiveTab('ontology')}
          >
            🧬 Ontology Editor
          </button>
          <button 
            className={`tab ${activeTab === 'pagination' ? 'active' : ''}`}
            onClick={() => setActiveTab('pagination')}
          >
            🧪 Pagination Test
          </button>
        </div>
        <div className="ontology-section">
          {activeTab === 'ontology' && <OntologyDemo />}
          {activeTab === 'pagination' && <PaginationTest />}
        </div>
      </div>
    </div>
  );
}

export default App;
