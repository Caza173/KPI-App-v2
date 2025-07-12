import React, { useState } from 'react';
import './App.css';

const SimpleApp = () => {
  const [message] = useState('KPI Dashboard - Simple Test');

  return (
    <div className="container">
      <h1 style={{ color: '#C5A95E', textAlign: 'center' }}>
        {message}
      </h1>
      <p style={{ color: 'white', textAlign: 'center' }}>
        If you can see this, React is working properly!
      </p>
      <div style={{ 
        background: '#C5A95E', 
        color: 'black', 
        padding: '20px', 
        margin: '20px auto', 
        maxWidth: '500px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h2>Test Component</h2>
        <p>This is a simplified version to test React functionality.</p>
      </div>
    </div>
  );
};

export default SimpleApp;
