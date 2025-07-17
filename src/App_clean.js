import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('properties');
  const [appName, setAppName] = useState('Real Estate KPI Dashboard');
  
  // State for properties
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState({
    address: '',
    client: '',
    type: 'Seller',
    price: 0,
    commissionPercent: 2.5,
    commission: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  // State for transactions
  const [contractTransactions, setContractTransactions] = useState([]);
  const [closedDeals, setClosedDeals] = useState([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProperties = localStorage.getItem('properties');
    const savedContractTransactions = localStorage.getItem('contractTransactions');
    const savedClosedDeals = localStorage.getItem('closedDeals');
    const savedAppName = localStorage.getItem('appName');
    
    if (savedProperties) {
      setProperties(JSON.parse(savedProperties));
    }
    if (savedContractTransactions) {
      setContractTransactions(JSON.parse(savedContractTransactions));
    }
    if (savedClosedDeals) {
      setClosedDeals(JSON.parse(savedClosedDeals));
    }
    if (savedAppName) {
      setAppName(savedAppName);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('properties', JSON.stringify(properties));
    localStorage.setItem('contractTransactions', JSON.stringify(contractTransactions));
    localStorage.setItem('closedDeals', JSON.stringify(closedDeals));
    localStorage.setItem('appName', appName);
  }, [properties, contractTransactions, closedDeals, appName]);

  const handlePropertySubmit = (e) => {
    e.preventDefault();
    if (newProperty.address) {
      const newPropertyWithId = {
        ...newProperty,
        id: Date.now() + Math.random()
      };
      setProperties([...properties, newPropertyWithId]);
      
      // Also add to contract transactions if it's a new property
      const newTransaction = {
        ...newPropertyWithId,
        status: 'Under Contract',
        addedDate: new Date().toISOString().split('T')[0]
      };
      setContractTransactions([...contractTransactions, newTransaction]);
      
      setNewProperty({
        address: '',
        client: '',
        type: 'Seller',
        price: 0,
        commissionPercent: 2.5,
        commission: 0,
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  };

  const updateTransactionStatus = (transaction, newStatus) => {
    const updatedTransactions = [...contractTransactions];
    const transactionIndex = contractTransactions.indexOf(transaction);
    
    if (newStatus === 'Closed') {
      const closedDeal = {
        ...transaction,
        status: newStatus,
        closedDate: new Date().toISOString().split('T')[0]
      };
      setClosedDeals([...closedDeals, closedDeal]);
      setContractTransactions(contractTransactions.filter(t => t !== transaction));
    } else {
      updatedTransactions[transactionIndex] = { ...transaction, status: newStatus };
      setContractTransactions(updatedTransactions);
    }
  };

  const deleteTransaction = (transaction) => {
    if (window.confirm(`Are you sure you want to delete the transaction for "${transaction.address}"?`)) {
      setContractTransactions(contractTransactions.filter(t => t !== transaction));
    }
  };

  const renderTransactionTable = (status, showCommission = true) => {
    const transactions = contractTransactions.filter(t => t.status === status);
    
    return (
      <div className="section">
        <h3>{status}</h3>
        <table>
          <thead>
            <tr>
              <th>Address</th>
              <th>Client</th>
              <th>Type</th>
              {showCommission && <th>Price ($)</th>}
              {showCommission && <th>Commission ($)</th>}
              <th>Date</th>
              {status === 'Fired Client' && <th>Note</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, i) => (
              <tr key={i}>
                <td>{transaction.address}</td>
                <td>{transaction.client || '-'}</td>
                <td>{transaction.type}</td>
                {showCommission && <td>${transaction.price?.toLocaleString() || 0}</td>}
                {showCommission && <td>${(transaction.commission || (transaction.price * 0.025)).toFixed(2)}</td>}
                <td>{transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}</td>
                {status === 'Fired Client' && (
                  <td>
                    <input
                      type="text"
                      value={transaction.firedClientNote || ''}
                      onChange={(e) => {
                        const updatedTransactions = [...contractTransactions];
                        const transactionIndex = contractTransactions.indexOf(transaction);
                        updatedTransactions[transactionIndex] = { 
                          ...transaction, 
                          firedClientNote: e.target.value 
                        };
                        setContractTransactions(updatedTransactions);
                      }}
                      placeholder="Why fired?"
                      style={{
                        width: '120px',
                        padding: '0.25rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}
                    />
                  </td>
                )}
                <td style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                  {(status === 'Under Contract' || status === 'Pending') && (
                    <select
                      value={transaction.status}
                      onChange={(e) => updateTransactionStatus(transaction, e.target.value)}
                      style={{
                        padding: '0.25rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      <option value="Under Contract">Under Contract</option>
                      <option value="Pending">Pending</option>
                      <option value="Closed">Closed</option>
                      <option value="Withdrawn">Withdrawn</option>
                      <option value="Expired">Expired</option>
                      <option value="Terminated">Terminated</option>
                      <option value="Fired Client">Fired Client</option>
                    </select>
                  )}
                  <button 
                    onClick={() => deleteTransaction(transaction)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
      
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </div>
        <div 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </div>
        <div 
          className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          Goals
        </div>
        <div 
          className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'properties' && (
          <div>
            <h2>Properties Management</h2>
            
            <div className="form-section">
              <h3>Add New Property</h3>
              <form onSubmit={handlePropertySubmit}>
                <div className="form-group">
                  <label htmlFor="address">Address:</label>
                  <input
                    id="address"
                    type="text"
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="client">Client:</label>
                  <input
                    id="client"
                    type="text"
                    value={newProperty.client}
                    onChange={(e) => setNewProperty({...newProperty, client: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type">Type:</label>
                  <select
                    id="type"
                    value={newProperty.type}
                    onChange={(e) => setNewProperty({...newProperty, type: e.target.value})}
                  >
                    <option value="Seller">Seller</option>
                    <option value="Buyer">Buyer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="price">Price ($):</label>
                  <input
                    id="price"
                    type="number"
                    value={newProperty.price}
                    onChange={(e) => setNewProperty({...newProperty, price: parseFloat(e.target.value) || 0})}
                    placeholder="450000"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="commissionPercent">Commission %:</label>
                  <input
                    id="commissionPercent"
                    type="number"
                    value={newProperty.commissionPercent}
                    onChange={(e) => setNewProperty({...newProperty, commissionPercent: parseFloat(e.target.value) || 2.5})}
                    placeholder="2.5"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="date">Date:</label>
                  <input
                    id="date"
                    type="date"
                    value={newProperty.date}
                    onChange={(e) => setNewProperty({...newProperty, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Notes:</label>
                  <textarea
                    id="notes"
                    value={newProperty.notes}
                    onChange={(e) => setNewProperty({...newProperty, notes: e.target.value})}
                    placeholder="Additional notes..."
                    rows="3"
                  />
                </div>
                <button type="submit" className="btn btn-primary">Add Property</button>
              </form>
            </div>
            
            <div className="transactions-section">
              <h3>Transaction Management</h3>
              {renderTransactionTable('Under Contract')}
              {renderTransactionTable('Pending')}
              
              <div className="section">
                <h3>Closed Deals</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Address</th>
                      <th>Client</th>
                      <th>Type</th>
                      <th>Price ($)</th>
                      <th>Commission ($)</th>
                      <th>Closed Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedDeals.map((deal, i) => (
                      <tr key={i}>
                        <td>{deal.address}</td>
                        <td>{deal.client || '-'}</td>
                        <td>{deal.type}</td>
                        <td>${deal.price?.toLocaleString() || 0}</td>
                        <td>${(deal.commission || (deal.price * 0.025)).toFixed(2)}</td>
                        <td>{deal.closedDate ? new Date(deal.closedDate).toLocaleDateString() : '-'}</td>
                        <td>
                          <button 
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete the closed deal for "${deal.address}"?`)) {
                                setClosedDeals(closedDeals.filter(d => d !== deal));
                              }
                            }}
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {renderTransactionTable('Withdrawn', false)}
              {renderTransactionTable('Expired', false)}
              {renderTransactionTable('Terminated', false)}
              {renderTransactionTable('Fired Client', false)}
            </div>
          </div>
        )}
        
        {activeTab === 'dashboard' && (
          <div>
            <h3>Dashboard Tab Content</h3>
            <p>Dashboard functionality will be here.</p>
          </div>
        )}
        
        {activeTab === 'goals' && (
          <div>
            <h3>Goals Tab Content</h3>
            <p>Goals functionality will be here.</p>
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

export default App;
