import React, { useState } from 'react';
import './App.css';

const MinimalApp = () => {
  const [activeTab, setActiveTab] = useState('properties');
  const [appName, setAppName] = useState('Real Estate KPI Dashboard');

  return (
    <div className="container">
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'}}>
        <input 
          type="text" 
          value={appName} 
          onChange={(e) => setAppName(e.target.value)}
          style={{
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            color: '#C5A95E', 
            background: 'transparent', 
            border: 'none', 
            textAlign: 'center',
            width: 'auto',
            minWidth: '300px'
          }}
        />
      </div>
      
      {/* Tabs */}
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          Add Property
        </div>
        <div 
          className={`tab ${activeTab === 'dailyInputs' ? 'active' : ''}`}
          onClick={() => setActiveTab('dailyInputs')}
        >
          Daily Inputs
        </div>
        <div 
          className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </div>
      </div>

      {/* Content */}
      <div className="section">
        <h2>Active Tab: {activeTab}</h2>
        <p>This is a minimal version to test basic functionality.</p>
        
        {activeTab === 'properties' && (
          <div>
            <h3>Properties Tab Content</h3>
            <p>Properties functionality will be here.</p>
          </div>
        )}
        
        {activeTab === 'dailyInputs' && (
          <div>
            <h3>Daily Inputs Tab Content</h3>
            <p>Daily inputs functionality will be here.</p>
          </div>
        )}
        
        {activeTab === 'performance' && (
          <div>
            <h3>Performance Tab Content</h3>
            <p>Performance metrics will be here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinimalApp;
