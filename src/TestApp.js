import React, { useState } from 'react';
import './App.css';

const TestApp = () => {
  const [test, setTest] = useState('Hello World');
  
  return (
    <div className="container">
      <h1>KPI Dashboard Test</h1>
      <p>Application is loading successfully!</p>
      <p>Test state: {test}</p>
      <button onClick={() => setTest('Button clicked!')}>
        Test Button
      </button>
    </div>
  );
};

export default TestApp;
