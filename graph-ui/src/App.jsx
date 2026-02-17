
import React, { useEffect } from 'react';
import OntologyDemo from './components/Ontology/OntologyDemo';
import './App.css';


function App() {

  return (
    <div className="app">
      <div className="main-content">
        <div className="tabs">
          <button className="tab active">
            🧬 Ontology Editor
          </button>
        </div>
        <div className="ontology-section">
          <OntologyDemo />
        </div>
      </div>
    </div>
  );
}

export default App;
