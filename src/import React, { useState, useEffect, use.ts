import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const App = () => {
  // State Management
  const [properties, setProperties] = useState(() => JSON.parse(localStorage.getItem('properties') || '[]'));
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('expenses') || '[]'));
  const [hours, setHours] = useState(() => JSON.parse(localStorage.getItem('hours') || '[]'));
  const [showings, setShowings] = useState(() => JSON.parse(localStorage.getItem('showings') || '[]'));
  const [offers, setOffers] = useState(() => JSON.parse(localStorage.getItem('offers') || '[]'));
  const [listings, setListings] = useState(() => JSON.parse(localStorage.getItem('listings') || '[]'));
  const [buyers, setBuyers] = useState(() => JSON.parse(localStorage.getItem('buyers') || '[]'));
  const [lostDeals, setLostDeals] = useState(() => JSON.parse(localStorage.getItem('lostDeals') || '[]'));
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('transactions') || '[]'));
  const storedLeads = JSON.parse(localStorage.getItem('leads') || '{}');
  const [leads, setLeads] = useState(storedLeads && 'sources' in storedLeads ? storedLeads : { total: 0, sources: { 'Social Media': 0, SOI: 0, Zillow: 0, OpCity: 0, Referral: 0, UpNest: 0, Homelight: 0, 'Offers Written': 0, OneSuite: 0, 'Direct Mail': 0, Realtor: 0 } });
  const [calls, setCalls] = useState(() => JSON.parse(localStorage.getItem('calls') || '{}') || { made: 0, answered: 0 });
  const [marketingExpenses, setMarketingExpenses] = useState(() => JSON.parse(localStorage.getItem('marketingExpenses') || '[]'));
  const [gciData, setGciData] = useState(() => JSON.parse(localStorage.getItem('gciData') || JSON.stringify({ gciGoal: 215000, avgSale: 325090, avgCommission: 0.025 })));
  const [dailyInputs, setDailyInputs] = useState(() => JSON.parse(localStorage.getItem('dailyInputs') || '{}'));
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('properties');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [newProperty, setNewProperty] = useState({ address: '', client: '', type: 'Seller', price: 0, commission: 0, month: 'January', timestamp: '', status: 'in progress' });
  const [newExpense, setNewExpense] = useState({ propertyClient: '', category: 'Marketing & Advertising', amount: 0, month: 'January', timestamp: '' });
  const [newHour, setNewHour] = useState({ propertyClient: '', dayOfWeek: 'Monday', hours: 0, month: 'January', timestamp: '' });
  const [newShowing, setNewShowing] = useState({ property: '', client: '', expenses: 0, month: 'January', timestamp: '' });
  const [newOffer, setNewOffer] = useState({ property: '', client: '', amount: 0, accepted: false, closed: false, month: 'January', timestamp: '' });
  const [newListing, setNewListing] = useState({ address: '', taken: false, sold: false, month: 'January', timestamp: '', status: 'in progress' });
  const [newBuyer, setNewBuyer] = useState({ name: '', showings: 0, sold: false, month: 'January', timestamp: '', status: 'in progress' });
  const [newLostDeal, setNewLostDeal] = useState({ property: '', client: '', amount: 0, commission: 0, month: 'January', timestamp: '' });
  const [newTransaction, setNewTransaction] = useState({ property: '', client: '', expenses: 0, hours: 0, month: 'January', timestamp: '' });
  const [newLead, setNewLead] = useState({ total: 0, source: 'Social Media', count: 0, month: 'January', timestamp: '' });
  const [newMarketingExpense, setNewMarketingExpense] = useState({ propertyClient: '', category: 'Marketing & Advertising', amount: 0, month: 'January', timestamp: '' });
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [chartData, setChartData] = useState({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [{ label: 'GCI ($)', data: Array(12).fill(0), backgroundColor: 'rgba(74, 144, 226, 0.2)', borderColor: '#4A90E2', borderWidth: 1 }]
  });
  const chartRef = useRef(null);

  // Computed Values
  const totalHours = hours.reduce((sum, h) => sum + (h.hours || 0), 0);
  const gciPerDeal = gciData.avgSale * gciData.avgCommission;
  const totalDeals = gciData.gciGoal / gciPerDeal;
  const totalClosedCommission = [...properties, ...listings].reduce((sum, p) => p.status === 'closed' ? (sum + (p.commission || 0)) : sum, 0);
  const totalListingsApptsTaken = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.listingsApptsTaken || 0), 0);
  const totalListingsSold = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.listingsSold || 0), 0);
  const totalBuyerAppts = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.buyerAppts || 0), 0);
  const totalBuyersSold = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.buyersSold || 0), 0);
  const totalCallsMade = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.callsMade || 0), 0);
  const totalCallsAnswered = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.callsAnswered || 0), 0);
  const listingsRatio = totalListingsApptsTaken > 0 ? (totalListingsSold / totalListingsApptsTaken) : 0;
  const buyersRatio = totalBuyerAppts > 0 ? (totalBuyersSold / totalBuyerAppts) : 0;
  const callsRatio = totalCallsMade > 0 ? (totalCallsAnswered / totalCallsMade) : 0;

  // Utility Functions
  const getPropertyAddresses = () => [...properties, ...listings, ...buyers].map(item => item.address || item.name).filter(Boolean);

  Date.prototype.getWeek = function() {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const summarizeExpensesByMonth = (propertyAddress) => {
    const propertyExpenses = expenses.filter(e => e.propertyClient?.split(' - ')[0] === propertyAddress);
    const summary = {};
    propertyExpenses.forEach(exp => {
      if (!summary[exp.month]) summary[exp.month] = { total: 0, details: [] };
      summary[exp.month].total += (exp.amount || 0);
      summary[exp.month].details.push(exp);
    });
    return summary;
  };

  const summarizeHoursByWeek = (propertyAddress) => {
    const propertyHours = hours.filter(h => h.propertyClient?.split(' - ')[0] === propertyAddress);
    const summary = {};
    propertyHours.forEach(h => {
      const week = new Date(h.timestamp).getWeek();
      if (!summary[week]) summary[week] = { total: 0, details: [] };
      summary[week].total += (h.hours || 0);
      summary[week].details.push(h);
    });
    return summary;
  };

  const calculateGciProgress = () => {
    const totalCommission = [...properties, ...listings].reduce((sum, p) => sum + (p.commission || 0), 0);
    const goal = gciData.gciGoal || 1;
    return (totalCommission / goal) * 100 || 0;
  };

  const calculateAverageROI = () => {
    const totalProperties = [...properties, ...listings];
    if (totalProperties.length === 0) return 0;
    const avgCommission = gciData.avgCommission || 0;
    return totalProperties.reduce((sum, p) => {
      const address = p.address || '';
      const totalCost = (p.totalCost || 0) + (expenses.filter(e => e.propertyClient?.split(' - ')[0] === address).reduce((sum, e) => sum + (e.amount || 0), 0) || 0);
      const commission = p.commission || (p.type === 'Seller' ? (p.price || 0) * (avgCommission / 100) : 0);
      const roi = totalCost > 0 ? ((commission - totalCost) / totalCost) * 100 : 0;
      return sum + roi;
    }, 0) / totalProperties.length;
  };

  const updateHourlyRate = () => {
    const totalIncome = [...properties, ...listings].reduce((sum, p) => sum + (p.commission || 0), 0);
    return totalHours > 0 ? totalIncome / totalHours : 0;
  };

  const calculateDealsNeeded = (gciData) => {
    const gciPerDeal = gciData.avgSale * gciData.avgCommission;
    const totalDeals = gciData.gciGoal / gciPerDeal;
    setGciData(prev => ({ ...prev, gciPerDeal, totalDeals: Math.round(totalDeals) }));
  };

  const updatePropertyMetrics = (propertyAddress) => {
    setProperties(prev => prev.map(p => p.address === propertyAddress ? { ...p, totalCost: expenses.filter(e => e.propertyClient?.split(' - ')[0] === propertyAddress).reduce((sum, e) => sum + (e.amount || 0), 0), commission: p.commission || (p.type === 'Seller' ? (p.price || 0) * (gciData.avgCommission / 100) : 0), roi: (p.price || 0) ? (((p.commission || (p.type === 'Seller' ? (p.price || 0) * (gciData.avgCommission / 100) : 0)) - expenses.filter(e => e.propertyClient?.split(' - ')[0] === propertyAddress).reduce((sum, e) => sum + (e.amount || 0), 0)) / expenses.filter(e => e.propertyClient?.split(' - ')[0] === propertyAddress).reduce((sum, e) => sum + (e.amount || 0), 0)) * 100 : 0 } : p));
    setListings(prev => prev.map(l => l.address === propertyAddress ? { ...l, totalCost: expenses.filter(e => e.propertyClient?.split(' - ')[0] === propertyAddress).reduce((sum, e) => sum + (e.amount || 0), 0), commission: l.commission || (l.type === 'Seller' ? (l.price || 0) * (gciData.avgCommission / 100) : 0), roi: (l.price || 0) ? (((l.commission || (l.type === 'Seller' ? (l.price || 0) * (gciData.avgCommission / 100) : 0)) - expenses.filter(e => e.propertyClient?.split(' - ')[0] === propertyAddress).reduce((sum, e) => sum + (e.amount || 0), 0)) / expenses.filter(e => e.propertyClient?.split(' - ')[0] === propertyAddress).reduce((sum, e) => sum + (e.amount || 0), 0)) * 100 : 0 } : l));
  };

  // Event Handlers
  useEffect(() => {
    setNewProperty(prev => ({
      ...prev,
      commission: prev.type === 'Seller' ? prev.price * (gciData.avgCommission / 100) || prev.commission : prev.commission
    }));
    calculateDealsNeeded(gciData);
  }, [gciData.avgCommission, newProperty.type, newProperty.price, gciData.gciGoal, gciData.avgSale]);

  useEffect(() => {
    const monthlyGCI = Array(12).fill(0);
    [...properties, ...listings].forEach(p => {
      if (p.type === 'Seller' && p.commission) {
        const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(p.month);
        if (monthIndex !== -1) monthlyGCI[monthIndex] += p.commission;
      }
    });
    setChartData(prev => ({
      ...prev,
      datasets: [{ ...prev.datasets[0], data: monthlyGCI }]
    }));
  }, [properties, listings]);

  useEffect(() => {
    const ctx = chartRef.current?.getContext('2d');
    if (ctx && !chartRef.current.chart) {
      chartRef.current.chart = new Chart(ctx, { type: 'bar', data: chartData, options: { scales: { y: { beginAtZero: true } } } });
    } else if (chartRef.current?.chart) {
      chartRef.current.chart.data = chartData;
      chartRef.current.chart.update();
    }
  }, [chartData]);

  useEffect(() => {
    localStorage.setItem('dailyInputs', JSON.stringify(dailyInputs));
    localStorage.setItem('properties', JSON.stringify(properties));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('hours', JSON.stringify(hours));
    localStorage.setItem('showings', JSON.stringify(showings));
    localStorage.setItem('offers', JSON.stringify(offers));
    localStorage.setItem('listings', JSON.stringify(listings));
    localStorage.setItem('buyers', JSON.stringify(buyers));
    localStorage.setItem('lostDeals', JSON.stringify(lostDeals));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('leads', JSON.stringify(leads));
    localStorage.setItem('calls', JSON.stringify(calls));
    localStorage.setItem('marketingExpenses', JSON.stringify(marketingExpenses));
    localStorage.setItem('gciData', JSON.stringify(gciData));
  }, [dailyInputs, properties, expenses, hours, showings, offers, listings, buyers, lostDeals, transactions, leads, calls, marketingExpenses, gciData]);

  const handleDailyInputChange = (e) => {
    const { name, value } = e.target;
    setDailyInputs(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [name]: parseInt(value) || 0
      }
    }));
  };

  const handlePropertySubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const commission = newProperty.type === 'Seller' ? newProperty.price * (gciData.avgCommission / 100) || newProperty.commission : newProperty.commission;
    const newProps = [...properties, { ...newProperty, timestamp, commission }];
    setProperties(newProps);
    setNewProperty({ address: '', client: '', type: 'Seller', price: 0, commission: 0, month: 'January', timestamp: '', status: 'in progress' });
  };

  const handlePropertyDelete = (index) => {
    const newProps = properties.filter((_, i) => i !== index);
    setProperties(newProps);
  };

  const updateClient = (index, client) => {
    const newProps = [...properties];
    newProps[index].client = client;
    setProperties(newProps);
  };

  const handleCommissionChange = (index, commission) => {
    const newProps = [...properties];
    newProps[index].commission = parseFloat(commission) || 0;
    setProperties(newProps);
  };

  const handleStatusChange = (index, status) => {
    const newProps = [...properties];
    newProps[index].status = status;
    setProperties(newProps);
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const newExpenses = [...expenses, { ...newExpense, timestamp }];
    setExpenses(newExpenses);
    setNewExpense({ propertyClient: '', category: 'Marketing & Advertising', amount: 0, month: 'January', timestamp: '' });
  };

  const handleExpenseDelete = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleHourSubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const newHours = [...hours, { ...newHour, timestamp }];
    setHours(newHours);
    setNewHour({ propertyClient: '', dayOfWeek: 'Monday', hours: 0, month: 'January', timestamp: '' });
  };

  const handleHourDelete = (index) => {
    setHours(hours.filter((_, i) => i !== index));
  };

  const handleShowingSubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const newShowings = [...showings, { ...newShowing, timestamp }];
    setShowings(newShowings);
    setNewShowing({ property: '', client: '', expenses: 0, month: 'January', timestamp: '' });
  };

  const handleOfferSubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const newOffers = [...offers, { ...newOffer, timestamp }];
    setOffers(newOffers);
    setNewOffer({ property: '', client: '', amount: 0, accepted: false, closed: false, month: 'January', timestamp: '' });
  };

  const handleListingSubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const commission = newListing.type === 'Seller' ? newListing.price * (gciData.avgCommission / 100) || newListing.commission : newListing.commission;
    const newListings = [...listings, { ...newListing, timestamp, commission, status: 'in progress' }];
    setListings(newListings);
    setNewListing({ address: '', taken: false, sold: false, month: 'January', timestamp: '', status: 'in progress' });
  };

  const handleListingDelete = (index) => {
    const newListings = listings.filter((_, i) => i !== index);
    setListings(newListings);
  };

  const handleBuyerSubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const newBuyers = [...buyers, { ...newBuyer, timestamp, status: 'in progress' }];
    setBuyers(newBuyers);
    setNewBuyer({ name: '', showings: 0, sold: false, month: 'January', timestamp: '', status: 'in progress' });
  };

  const handleLostDealSubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const newLostDeals = [...lostDeals, { ...newLostDeal, timestamp }];
    setLostDeals(newLostDeals);
    setNewLostDeal({ property: '', client: '', amount: 0, commission: 0, month: 'January', timestamp: '' });
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const newTransactions = [...transactions, { ...newTransaction, timestamp }];
    setTransactions(newTransactions);
    setNewTransaction({ property: '', client: '', expenses: 0, hours: 0, month: 'January', timestamp: '' });
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const newLeads = { total: leads.total + newLead.count, sources: { ...leads.sources, [newLead.source]: (leads.sources[newLead.source] || 0) + newLead.count } };
    setLeads(newLeads);
    setNewLead({ total: 0, source: 'Social Media', count: 0, month: 'January', timestamp: '' });
  };

  const handleCallUpdate = (e) => {
    e.preventDefault();
    const newCalls = { made: parseInt(e.target.made.value) || 0, answered: parseInt(e.target.answered.value) || 0 };
    setCalls(newCalls);
  };

  const handleMarketingExpenseSubmit = (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const newMarketingExpenses = [...marketingExpenses, { ...newMarketingExpense, timestamp }];
    setMarketingExpenses(newMarketingExpenses);
    setNewMarketingExpense({ propertyClient: '', category: 'Marketing & Advertising', amount: 0, month: 'January', timestamp: '' });
  };

  const handleGciUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newGciData = {
      gciGoal: parseFloat(formData.get('gciGoal')) || 215000,
      avgSale: parseFloat(formData.get('avgSale')) || 325090,
      avgCommission: Math.min(Math.max((parseFloat(formData.get('avgCommission')) || 2.5) / 100, 0), 0.06)
    };
    setGciData(newGciData);
    calculateDealsNeeded(newGciData);
  };

  const handleDropdownChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);
    if (value) {
      const data = properties.find(p => p.address === value) || listings.find(l => l.address === value) || buyers.find(b => b.name === value) || null;
      if (data) {
        const totalCost = expenses.filter(e => e.propertyClient?.split(' - ')[0] === value).reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalHoursWorked = hours.filter(h => h.propertyClient?.split(' - ')[0] === value).reduce((sum, h) => sum + (h.hours || 0), 0);
        const exp = expenses.filter(e => e.propertyClient?.split(' - ')[0] === value).map(e => ({ category: e.category, amount: e.amount, month: e.month, timestamp: e.timestamp }));
        setSelectedData(data ? { ...data, totalCost, totalHours: totalHoursWorked, expenses: exp, roi: data.roi } : null);
      } else {
        setSelectedData(null);
      }
    } else {
      setSelectedData(null);
    }
  };

  const handlePropertyDropdownChange = (e) => {
    const value = e.target.value;
    setSelectedProperty(value ? [...properties, ...listings, ...buyers].find(item => (item.address || item.name) === value) : null);
  };

  const handleRefreshData = () => {
    if (selectedOption) {
      const data = properties.find(p => p.address === selectedOption) || listings.find(l => l.address === selectedOption) || buyers.find(b => b.name === selectedOption) || null;
      if (data) {
        const totalCost = expenses.filter(e => e.propertyClient?.split(' - ')[0] === selectedOption).reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalHoursWorked = hours.filter(h => h.propertyClient?.split(' - ')[0] === selectedOption).reduce((sum, h) => sum + (h.hours || 0), 0);
        const exp = expenses.filter(e => e.propertyClient?.split(' - ')[0] === selectedOption).map(e => ({ category: e.category, amount: e.amount, month: e.month, timestamp: e.timestamp }));
        setSelectedData(data ? { ...data, totalCost, totalHours: totalHoursWorked, expenses: exp, roi: data.roi } : null);
      }
    }
  };

  // Render
  return (
    <div className="container mx-auto p-4 bg-gray-100 text-gray-800 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">Real Estate KPI Dashboard 2025</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-blue-300 mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'properties' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-600'}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'dataInput' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-600'}`}
          onClick={() => setActiveTab('dataInput')}
        >
          Data Input
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'expensesHours' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-600'}`}
          onClick={() => setActiveTab('expensesHours')}
        >
          Expenses/Hours
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'gci' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-600'}`}
          onClick={() => setActiveTab('gci')}
        >
          GCI Overview
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-gray-600'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
      </div>

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-2xl font-semibold mb-2 text-blue-800">Add Property</h2>
          <form onSubmit={handlePropertySubmit} className="space-y-4">
            <div>
              <label className="block">Address</label>
              <input
                type="text"
                value={newProperty.address}
                onChange={e => setNewProperty({ ...newProperty, address: e.target.value })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block">Client</label>
              <input
                type="text"
                value={newProperty.client}
                onChange={e => setNewProperty({ ...newProperty, client: e.target.value })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
              />
            </div>
            <div>
              <label className="block">Type</label>
              <select
                value={newProperty.type}
                onChange={e => setNewProperty({ ...newProperty, type: e.target.value })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
              >
                <option value="Seller">Seller</option>
                <option value="Buyer">Buyer</option>
              </select>
            </div>
            <div>
              <label className="block">Price ($)</label>
              <input
                type="number"
                value={newProperty.price}
                onChange={e => setNewProperty({ ...newProperty, price: parseFloat(e.target.value) || 0 })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block">Commission ($)</label>
              <input
                type="number"
                value={newProperty.commission}
                onChange={e => setNewProperty({ ...newProperty, commission: parseFloat(e.target.value) || 0 })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
              />
            </div>
            <div>
              <label className="block">Month</label>
              <select
                value={newProperty.month}
                onChange={e => setNewProperty({ ...newProperty, month: e.target.value })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Add Property</button>
          </form>
          <table className="table-auto border mt-2 w-full">
            <thead>
              <tr className="bg-blue-200">
                <th className="border p-2 text-blue-800">Address</th>
                <th className="border p-2 text-blue-800">Client</th>
                <th className="border p-2 text-blue-800">Type</th>
                <th className="border p-2 text-blue-800">Price ($)</th>
                <th className="border p-2 text-blue-800">Commission ($)</th>
                <th className="border p-2 text-blue-800">Timestamp</th>
                <th className="border p-2 text-blue-800">Action</th>
                <th className="border p-2 text-blue-800">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...properties, ...listings].map((p, i) => (
                <tr key={i} className="hover:bg-blue-100">
                  <td className="border p-2">{p.address}</td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={p.client || ''}
                      onChange={e => updateClient(i, e.target.value)}
                      className="border border-blue-300 p-1 w-full bg-blue-200 text-gray-800"
                    />
                  </td>
                  <td className="border p-2">{p.type}</td>
                  <td className="border p-2">{p.price}</td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={p.commission || 0}
                      onChange={e => handleCommissionChange(i, e.target.value)}
                      className="border border-blue-300 p-1 w-full bg-blue-200 text-gray-800"
                    />
                  </td>
                  <td className="border p-2">{p.timestamp}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handlePropertyDelete(i)}
                      className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                    >
                      Delete
                    </button>
                  </td>
                  <td className="border p-2">
                    <select
                      value={p.status || 'in progress'}
                      onChange={(e) => handleStatusChange(i, e.target.value)}
                      className="border border-blue-300 p-1 w-full bg-blue-200 text-gray-800"
                    >
                      <option value="in progress">In Progress</option>
                      <option value="searching">Searching</option>
                      <option value="showing homes">Showing Homes</option>
                      <option value="under contract">Under Contract</option>
                      <option value="pending">Pending</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <label className="block mt-4">View Property Details</label>
            <select
              value={selectedProperty ? selectedProperty.address || selectedProperty.name : ''}
              onChange={handlePropertyDropdownChange}
              className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
            >
              <option value="">Select a Property</option>
              {getPropertyAddresses().map(address => (
                <option key={address} value={address}>{address}</option>
              ))}
            </select>
            {selectedProperty && (
              <div className="mt-2 bg-blue-100 p-4 rounded shadow">
                <h3 className="text-blue-800">Property Details for {selectedProperty.address || selectedProperty.name}</h3>
                <table className="table-auto border mt-2 w-full">
                  <thead>
                    <tr className="bg-blue-200">
                      <th className="border p-2 text-blue-800">Field</th>
                      <th className="border p-2 text-blue-800">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border p-2">Address</td><td className="border p-2">{selectedProperty.address || selectedProperty.name || '-'}</td></tr>
                    <tr><td className="border p-2">Client</td><td className="border p-2">{selectedProperty.client || '-'}</td></tr>
                    <tr><td className="border p-2">Type</td><td className="border p-2">{selectedProperty.type || '-'}</td></tr>
                    <tr><td className="border p-2">Price ($)</td><td className="border p-2">{selectedProperty.price || 0}</td></tr>
                    <tr><td className="border p-2">Commission ($)</td><td className="border p-2">{(selectedProperty.commission || 0).toFixed(2)}</td></tr>
                    <tr><td className="border p-2">Total Hours</td><td className="border p-2">{selectedProperty.totalHours?.toFixed(2) || '0.00'}</td></tr>
                    <tr><td className="border p-2">Total Expenses ($)</td><td className="border p-2">{selectedProperty.totalCost?.toFixed(2) || '$0.00'}</td></tr>
                    <tr><td className="border p-2">Timestamp</td><td className="border p-2">{selectedProperty.timestamp || '-'}</td></tr>
                    <tr><td className="border p-2">Status</td><td className="border p-2">{selectedProperty.status || 'in progress'}</td></tr>
                  </tbody>
                </table>
                <button onClick={() => setSelectedProperty(null)} className="bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-600">Close</button>
              </div>
            )}
          </div>
          <div>
            <label className="block mt-4">View Property Data</label>
            <select
              value={selectedOption}
              onChange={handleDropdownChange}
              className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
            >
              <option value="">Select a Property</option>
              {getPropertyAddresses().map(address => (
                <option key={address} value={address}>{address}</option>
              ))}
            </select>
            <button onClick={handleRefreshData} className="bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-600">Refresh Data</button>
          </div>
          {selectedData && (
            <div className="mt-2 bg-blue-100 p-4 rounded shadow">
              <h3 className="text-blue-800">Details for {selectedData.address || selectedData.name}</h3>
              <table className="table-auto border mt-2 w-full">
                <thead>
                  <tr className="bg-blue-200">
                    <th className="border p-2 text-blue-800">Category</th>
                    <th className="border p-2 text-blue-800">Amount ($)</th>
                    <th className="border p-2 text-blue-800">Month</th>
                    <th className="border p-2 text-blue-800">Timestamp</th>
                    <th className="border p-2 text-blue-800">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedData.expenses.map((exp, i) => (
                    <tr key={i} className="hover:bg-blue-100">
                      <td className="border p-2">{exp.category}</td>
                      <td className="border p-2">${exp.amount.toFixed(2)}</td>
                      <td className="border p-2">{exp.month}</td>
                      <td className="border p-2">{exp.timestamp}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => {
                            handleExpenseDelete(expenses.indexOf(expenses.find(e => e.timestamp === exp.timestamp)));
                            setSelectedData(null);
                          }}
                          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 className="text-blue-800 mt-4">Hours Worked by Week</h3>
              <table className="table-auto border mt-2 w-full">
                <thead>
                  <tr className="bg-blue-200">
                    <th className="border p-2 text-blue-800">Week</th>
                    <th className="border p-2 text-blue-800">Hours</th>
                    <th className="border p-2 text-blue-800">Day of Week</th>
                    <th className="border p-2 text-blue-800">Timestamp</th>
                    <th className="border p-2 text-blue-800">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summarizeHoursByWeek(selectedData.address || selectedData.name)).map(([week, data], i) => {
                    const weekHours = hours.filter(h => h.propertyClient?.split(' - ')[0] === (selectedData.address || selectedData.name) && new Date(h.timestamp).getWeek() === parseInt(week));
                    return weekHours.map((h, j) => (
                      <tr key={`${i}-${j}`} className="hover:bg-blue-100">
                        <td className="border p-2">Week {week}</td>
                        <td className="border p-2">{data.total.toFixed(2)}</td>
                        <td className="border p-2">{h.dayOfWeek}</td>
                        <td className="border p-2">{h.timestamp}</td>
                        <td className="border p-2">
                          <button
                            onClick={() => {
                              handleHourDelete(hours.indexOf(h));
                              setSelectedData(null);
                            }}
                            className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
              <button onClick={() => setSelectedData(null)} className="bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-600">Close</button>
            </div>
          )}
        </div>
      )}

      {/* Data Input Tab */}
      {activeTab === 'dataInput' && (
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-2xl font-semibold mb-2 text-blue-800">Data Input</h2>
          <div className="mb-4">
            <label className="block">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border border-blue-300 rounded w-full bg-blue-200 text-gray-800"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block">Listings Appts Taken</label>
              <select
                name="listingsApptsTaken"
                value={dailyInputs[selectedDate]?.listingsApptsTaken || 0}
                onChange={handleDailyInputChange}
                className="p-2 border border-blue-300 rounded w-full bg-blue-200 text-gray-800"
              >
                {Array.from({ length: 101 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block">Listings Sold</label>
              <select
                name="listingsSold"
                value={dailyInputs[selectedDate]?.listingsSold || 0}
                onChange={handleDailyInputChange}
                className="p-2 border border-blue-300 rounded w-full bg-blue-200 text-gray-800"
              >
                {Array.from({ length: 101 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block">Buyer Appts</label>
              <select
                name="buyerAppts"
                value={dailyInputs[selectedDate]?.buyerAppts || 0}
                onChange={handleDailyInputChange}
                className="p-2 border border-blue-300 rounded w-full bg-blue-200 text-gray-800"
              >
                {Array.from({ length: 101 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block">Buyers Sold</label>
              <select
                name="buyersSold"
                value={dailyInputs[selectedDate]?.buyersSold || 0}
                onChange={handleDailyInputChange}
                className="p-2 border border-blue-300 rounded w-full bg-blue-200 text-gray-800"
              >
                {Array.from({ length: 101 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block">Calls Made</label>
              <select
                name="callsMade"
                value={dailyInputs[selectedDate]?.callsMade || 0}
                onChange={handleDailyInputChange}
                className="p-2 border border-blue-300 rounded w-full bg-blue-200 text-gray-800"
              >
                {Array.from({ length: 101 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block">Calls Answered</label>
              <select
                name="callsAnswered"
                value={dailyInputs[selectedDate]?.callsAnswered || 0}
                onChange={handleDailyInputChange}
                className="p-2 border border-blue-300 rounded w-full bg-blue-200 text-gray-800"
              >
                {Array.from({ length: 101 }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Expenses/Hours Tab */}
      {activeTab === 'expensesHours' && (
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-2xl font-semibold mb-2 text-blue-800">Assign Expense</h2>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="block">Property/Client</label>
              <select
                value={newExpense.propertyClient}
                onChange={e => setNewExpense({ ...newExpense, propertyClient: e.target.value })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
              >
                <option value="">Select</option>
                {getPropertyAddresses().map(address => (
                  <option key={address} value={`${address} - N/A`}>{address}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block">Category</label>
              <select
                value={newExpense.category}
                onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
              >
                {['Marketing & Advertising', 'Mileage / Gas', 'Professional Photography', 'Client Meals', 'Equipment Rental', 'Food'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block">Amount ($)</label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={e => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block">Month</label>
              <select
                value={newExpense.month}
                onChange={e => setNewExpense({ ...newExpense, month: e.target.value })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Add Expense</button>
          </form>
          <table className="table-auto border mt-2 w-full">
            <thead>
              <tr className="bg-blue-200">
                <th className="border p-2 text-blue-800">Property</th>
                <th className="border p-2 text-blue-800">Total Amount ($)</th>
                <th className="border p-2 text-blue-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summarizeExpensesByMonth('')).map(([property, data]) => (
                <tr key={property} className="hover:bg-blue-100">
                  <td className="border p-2">{property || 'Unassigned'}</td>
                  <td className="border p-2">{data.total ? `$${data.total.toFixed(2)}` : '$0.00'}</td>
                  <td className="border p-2">
                    <button onClick={() => setSelectedExpense(data.details)} className="bg-blue-300 text-gray-800 p-2 rounded mr-2 hover:bg-blue-400">View Details</button>
                    <button
                      onClick={() => {
                        setExpenses(expenses.filter(e => !data.details.includes(e)));
                      }}
                      className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                    >
                      Delete All
                    </button>
                  </td>
                </tr>
              ))}
              {getPropertyAddresses().map(address => {
                const propertyExpenses = expenses.filter(e => e.propertyClient?.split(' - ')[0] === address);
                if (propertyExpenses.length > 0) {
                  const total = propertyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
                  return (
                    <tr key={address} className="hover:bg-blue-100">
                      <td className="border p-2">{address}</td>
                      <td className="border p-2">{`$${total.toFixed(2)}`}</td>
                      <td className="border p-2">
                        <button onClick={() => setSelectedExpense(propertyExpenses)} className="bg-blue-300 text-gray-800 p-2 rounded mr-2 hover:bg-blue-400">View Details</button>
                        <button
                          onClick={() => {
                            setExpenses(expenses.filter(e => e.propertyClient?.split(' - ')[0] !== address));
                          }}
                          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                        >
                          Delete All
                        </button>
                      </td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
          {selectedExpense && (
            <div className="mt-2 bg-blue-100 p-4 rounded shadow">
              <h3 className="text-blue-800">Expense Details by Month</h3>
              <table className="table-auto border mt-2 w-full">
                <thead>
                  <tr className="bg-blue-200">
                    <th className="border p-2 text-blue-800">Month</th>
                    <th className="border p-2 text-blue-800">Amount ($)</th>
                    <th className="border p-2 text-blue-800">Category</th>
                    <th className="border p-2 text-blue-800">Timestamp</th>
                    <th className="border p-2 text-blue-800">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedExpense.map((exp, i) => (
                    <tr key={i} className="hover:bg-blue-100">
                      <td className="border p-2">{exp.month}</td>
                      <td className="border p-2">${exp.amount.toFixed(2)}</td>
                      <td className="border p-2">{exp.category}</td>
                      <td className="border p-2">{exp.timestamp}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => {
                            handleExpenseDelete(expenses.indexOf(exp));
                            setSelectedExpense(null);
                          }}
                          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setSelectedExpense(null)} className="bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-600">Close</button>
            </div>
          )}
          <h2 className="text-2xl font-semibold mt-4 mb-2 text-blue-800">Assign Hours</h2>
          <form onSubmit={handleHourSubmit} className="space-y-4">
            <div>
              <label className="block">Property/Client</label>
              <select
                value={newHour.propertyClient}
                onChange={e => setNewHour({ ...newHour, propertyClient: e.target.value })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
              >
                <option value="">Select</option>
                {getPropertyAddresses().map(address => (
                  <option key={address} value={`${address} - N/A`}>{address}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block">Day of Week</label>
              <select
                value={newHour.dayOfWeek}
                onChange={e => setNewHour({ ...newHour, dayOfWeek: e.target.value })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block">Hours</label>
              <input
                type="number"
                value={newHour.hours}
                onChange={e => setNewHour({ ...newHour, hours: parseFloat(e.target.value) || 0 })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block">Month</label>
              <select
                value={newHour.month}
                onChange={e => setNewHour({ ...newHour, month: e.target.value })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Add Hours</button>
          </form>
          <table className="table-auto border mt-2 w-full">
            <thead>
              <tr className="bg-blue-200">
                <th className="border p-2 text-blue-800">Property</th>
                <th className="border p-2 text-blue-800">Total Hours</th>
                <th className="border p-2 text-blue-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summarizeHoursByWeek('')).map(([property, data]) => (
                <tr key={property} className="hover:bg-blue-100">
                  <td className="border p-2">{property || 'Unassigned'}</td>
                  <td className="border p-2">{data.total ? data.total.toFixed(2) : '0.00'}</td>
                  <td className="border p-2">
                    <button onClick={() => setSelectedHour(data.details || [])} className="bg-blue-300 text-gray-800 p-2 rounded mr-2 hover:bg-blue-400">View Details</button>
                    <button
                      onClick={() => {
                        setHours(hours.filter(h => !data.details || !data.details.includes(h)));
                      }}
                      className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                    >
                      Delete All
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedHour && (
            <div className="mt-2 bg-blue-100 p-4 rounded shadow">
              <h3 className="text-blue-800">Hour Details by Week</h3>
              <table className="table-auto border mt-2 w-full">
                <thead>
                  <tr className="bg-blue-200">
                    <th className="border p-2 text-blue-800">Week</th>
                    <th className="border p-2 text-blue-800">Hours</th>
                    <th className="border p-2 text-blue-800">Day of Week</th>
                    <th className="border p-2 text-blue-800">Timestamp</th>
                    <th className="border p-2 text-blue-800">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedHour.map((h, i) => (
                    <tr key={i} className="hover:bg-blue-100">
                      <td className="border p-2">Week {new Date(h.timestamp).getWeek()}</td>
                      <td className="border p-2">{h.hours || 0}</td>
                      <td className="border p-2">{h.dayOfWeek}</td>
                      <td className="border p-2">{h.timestamp}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => {
                            handleHourDelete(hours.indexOf(h));
                            setSelectedHour(null);
                          }}
                          className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setSelectedHour(null)} className="bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-600">Close</button>
            </div>
          )}
          <p className="mt-2 text-blue-800">Total Hours Worked: {totalHours.toFixed(2)}</p>
          <p className="text-blue-800">Hourly Rate: ${updateHourlyRate().toFixed(2)}</p>
        </div>
      )}

      {/* GCI Overview Tab */}
      {activeTab === 'gci' && (
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-2xl font-semibold mb-2 text-blue-800">GCI Overview</h2>
          <form onSubmit={handleGciUpdate} className="space-y-4">
            <div>
              <label className="block">GCI Goal ($)</label>
              <input
                type="number"
                name="gciGoal"
                value={gciData.gciGoal}
                onChange={e => setGciData({ ...gciData, gciGoal: parseFloat(e.target.value) || 215000 })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
              />
            </div>
            <div>
              <label className="block">Average Sale ($)</label>
              <input
                type="number"
                name="avgSale"
                value={gciData.avgSale}
                onChange={e => setGciData({ ...gciData, avgSale: parseFloat(e.target.value) || 325090 })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
              />
            </div>
            <div>
              <label className="block">GCI % (0-6%)</label>
              <input
                type="number"
                name="avgCommission"
                value={gciData.avgCommission * 100}
                onChange={e => setGciData({ ...gciData, avgCommission: Math.min(Math.max((parseFloat(e.target.value) || 2.5) / 100, 0), 0.06) })}
                className="border border-blue-300 p-2 w-full bg-blue-200 text-gray-800"
                min="0"
                max="6"
                step="0.1"
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Update GCI Data</button>
          </form>
          <table className="border-collapse mt-4 w-full">
            <tbody>
              <tr>
                <td className="pr-4 text-blue-800">GCI Goal</td>
                <td className="text-gray-800">${gciData.gciGoal.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="pr-4 text-blue-800">Average Sale</td>
                <td className="text-gray-800">${gciData.avgSale.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="pr-4 text-blue-800">GCI %</td>
                <td className="text-gray-800">{(gciData.avgCommission * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="pr-4 text-blue-800">GCI/Deal</td>
                <td className="text-gray-800">${gciPerDeal.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="pr-4 text-blue-800">Total Deals</td>
                <td className="text-gray-800">{Math.round(totalDeals)}</td>
              </tr>
            </tbody>
          </table>
          <h2 className="text-2xl font-semibold mb-2 mt-4 text-blue-800">GCI Trend 2025</h2>
          <div className="bg-blue-200 p-4 rounded shadow">
            <canvas ref={chartRef} className="w-full h-64"></canvas>
          </div>
          <h2 className="text-2xl font-semibold mb-2 mt-4 text-blue-800">Tax Deductions</h2>
          <table className="table-auto border mt-2 w-full">
            <thead>
              <tr className="bg-blue-200">
                <th className="border p-2 text-blue-800">Tax Rate</th>
                <th className="border p-2 text-blue-800">Deduction ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border p-2">10% Tax Deduction</td><td className="border p-2">${(totalClosedCommission * 0.10).toFixed(2)}</td></tr>
              <tr><td className="border p-2">12% Tax Deduction</td><td className="border p-2">${(totalClosedCommission * 0.12).toFixed(2)}</td></tr>
              <tr><td className="border p-2">22% Tax Deduction</td><td className="border p-2">${(totalClosedCommission * 0.22).toFixed(2)}</td></tr>
              <tr><td className="border p-2">24% Tax Deduction</td><td className="border p-2">${(totalClosedCommission * 0.24).toFixed(2)}</td></tr>
              <tr><td className="border p-2">32% Tax Deduction</td><td className="border p-2">${(totalClosedCommission * 0.32).toFixed(2)}</td></tr>
              <tr><td className="border p-2">35% Tax Deduction</td><td className="border p-2">${(totalClosedCommission * 0.35).toFixed(2)}</td></tr>
              <tr><td className="border p-2">37% Tax Deduction</td><td className="border p-2">${(totalClosedCommission * 0.37).toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="bg-blue-100 p-4 rounded shadow relative">
          <h2 className="text-2xl font-semibold mb-4 text-blue-800">Dashboard</h2>
          <div className="relative">
            {/* Central Summary Tile */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-200 p-6 rounded-full shadow-lg w-48 h-48 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-blue-800 font-medium">Summary</h3>
                <p className="text-gray-800">Total Properties: {properties.length + listings.length}</p>
                <p className="text-gray-800">Total Closed Commission: ${totalClosedCommission.toFixed(2)}</p>
              </div>
            </div>

            {/* Radial KPI Tiles */}
            <div className="flex flex-wrap justify-center mt-24">
              {[
                { label: 'Total Listings Appts Taken', value: totalListingsApptsTaken },
                { label: 'Total Listings Sold', value: totalListingsSold },
                { label: 'Total Buyer Appts', value: totalBuyerAppts },
                { label: 'Total Buyers Sold', value: totalBuyersSold },
                { label: 'Total Calls Made', value: totalCallsMade },
                { label: 'Total Calls Answered', value: totalCallsAnswered },
                { label: 'Listings Ratio', value: listingsRatio.toFixed(2) },
                { label: 'Buyers Ratio', value: buyersRatio.toFixed(2) },
                { label: 'Calls Ratio', value: callsRatio.toFixed(2) },
                { label: 'Total Expenses ($)', value: `$${expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)}` },
                { label: 'Total Hours Worked', value: totalHours.toFixed(2) },
                { label: 'Average ROI (%)', value: calculateAverageROI().toFixed(2) },
                { label: 'GCI Goal Progress (%)', value: calculateGciProgress().toFixed(2) }
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-blue-200 p-4 rounded shadow-lg m-2 transform rotate-45 origin-center"
                  style={{
                    position: 'absolute',
                    top: `${50 + 20 * Math.cos((index * 30 - 90) * (Math.PI / 180))}vh`,
                    left: `${50 + 20 * Math.sin((index * 30 - 90) * (Math.PI / 180))}vw`,
                    width: '120px',
                    height: '120px',
                    transform: 'rotate(-45deg)'
                  }}
                >
                  <h3 className="text-blue-800 font-medium text-sm">{item.label}</h3>
                  <p className="text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;