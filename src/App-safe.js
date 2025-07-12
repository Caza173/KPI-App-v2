import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Lazy load Chart.js to avoid initial load issues
let Chart = null;
const loadChart = async () => {
  if (!Chart) {
    try {
      const chartModule = await import('chart.js/auto');
      Chart = chartModule.default;
    } catch (error) {
      console.warn('Failed to load Chart.js:', error);
    }
  }
  return Chart;
};

// Safe JSON parsing function
const safeJSONParse = (str, defaultValue) => {
  try {
    return JSON.parse(str) || defaultValue;
  } catch (e) {
    console.warn('Error parsing JSON:', e);
    return defaultValue;
  }
};

const App = () => {
  // State Management with safe initialization
  const [properties, setProperties] = useState(() => safeJSONParse(localStorage.getItem('properties'), []));
  const [expenses, setExpenses] = useState(() => safeJSONParse(localStorage.getItem('expenses'), []));
  const [hours, setHours] = useState(() => safeJSONParse(localStorage.getItem('hours'), []));
  const [showings, setShowings] = useState(() => safeJSONParse(localStorage.getItem('showings'), []));
  const [offers, setOffers] = useState(() => safeJSONParse(localStorage.getItem('offers'), []));
  const [listings, setListings] = useState(() => safeJSONParse(localStorage.getItem('listings'), []));
  const [buyers, setBuyers] = useState(() => safeJSONParse(localStorage.getItem('buyers'), []));
  const [lostDeals, setLostDeals] = useState(() => safeJSONParse(localStorage.getItem('lostDeals'), []));
  const [transactions, setTransactions] = useState(() => safeJSONParse(localStorage.getItem('transactions'), []));
  
  const storedLeads = safeJSONParse(localStorage.getItem('leads'), {});
  const [leads, setLeads] = useState(storedLeads && 'sources' in storedLeads ? storedLeads : { 
    total: 0, 
    sources: { 'Social Media': 0, SOI: 0, Zillow: 0, OpCity: 0, Referral: 0, UpNest: 0, Homelight: 0, OneSuite: 0, 'Direct Mail': 0, Realtor: 0 } 
  });
  
  const [calls, setCalls] = useState(() => safeJSONParse(localStorage.getItem('calls'), { made: 0, answered: 0 }));
  const [marketingExpenses, setMarketingExpenses] = useState(() => safeJSONParse(localStorage.getItem('marketingExpenses'), []));
  const [gciData, setGciData] = useState(() => safeJSONParse(localStorage.getItem('gciData'), { gciGoal: 215000, avgSale: 325090, avgCommission: 0.025 }));
  const [dailyInputs, setDailyInputs] = useState(() => safeJSONParse(localStorage.getItem('dailyInputs'), {}));
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('goals');
  
  const [newProperty, setNewProperty] = useState({ 
    address: '', client: '', type: 'Seller', price: 0, commission: 0, commissionPercent: 2.5, 
    month: 'January', timestamp: '', status: 'In Progress', leadSource: 'Social Media' 
  });
  
  const [goals, setGoals] = useState(() => safeJSONParse(localStorage.getItem('goals'), { 
    daily: { calls: 10, hours: 8, appointments: 2, offersWritten: 5, listingAgreements: 2, buyerContracts: 3 }, 
    weekly: { calls: 70, hours: 40, appointments: 10, offersWritten: 25, listingAgreements: 10, buyerContracts: 15 }, 
    monthly: { calls: 300, hours: 160, appointments: 40, offersWritten: 100, listingAgreements: 40, buyerContracts: 60 } 
  }));
  
  const [closedDeals, setClosedDeals] = useState(() => safeJSONParse(localStorage.getItem('closedDeals'), []));
  const [appName, setAppName] = useState(() => localStorage.getItem('appName') || 'Real Estate KPI Dashboard');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [newExpense, setNewExpense] = useState({ propertyClient: '', category: 'Marketing & Advertising', amount: 0, month: 'January', timestamp: '' });
  const [newHour, setNewHour] = useState({ propertyClient: '', dayOfWeek: 'Monday', hours: 0, month: 'January', timestamp: '' });
  const [newTransaction, setNewTransaction] = useState({ address: '', client: '', price: 0, status: 'Under Contract', date: new Date().toISOString().split('T')[0] });  const [contractTransactions, setContractTransactions] = useState(() => safeJSONParse(localStorage.getItem('contractTransactions'), []));
  const [calendarEvents, setCalendarEvents] = useState(() => safeJSONParse(localStorage.getItem('calendarEvents'), {}));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    datasets: [{ 
      label: 'GCI ($)', 
      data: Array(12).fill(0), 
      backgroundColor: 'rgba(197, 169, 94, 0.2)', 
      borderColor: '#C5A95E', 
      borderWidth: 1 
    }]
  });

  // Update chart data when monthly data changes
  useEffect(() => {
    const newChartData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      datasets: [{ 
        label: 'GCI ($)', 
        data: monthlyData.map(month => month.commission), 
        backgroundColor: 'rgba(197, 169, 94, 0.2)', 
        borderColor: '#C5A95E', 
        borderWidth: 1 
      }]
    };
    setChartData(newChartData);
  }, [monthlyData]);
  // Computed Values
  const totalClosedCommission = closedDeals.reduce((sum, deal) => sum + (deal.commission || 0), 0);
  const totalWorkHours = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.hoursWorked || 0), 0);
  const hourlyRate = totalWorkHours > 0 ? totalClosedCommission / totalWorkHours : 0;
  
  // Conversion rate calculations
  const totalBuyerDeals = closedDeals.filter(deal => deal.type === 'Buyer').length;
  const totalSellerDeals = closedDeals.filter(deal => deal.type === 'Seller').length;
  const totalBuyerContracts = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.buyerContracts || 0), 0);
  const totalListingAgreements = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.listingAgreements || 0), 0);
  const totalBuyerAppts = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.buyerAppts || 0), 0);
  const totalListingAppts = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.listingsApptsTaken || 0), 0);
  
  // Conversion rates
  const buyerContractToClosingRate = totalBuyerContracts > 0 ? (totalBuyerDeals / totalBuyerContracts) * 100 : 0;
  const listingAgreementToClosingRate = totalListingAgreements > 0 ? (totalSellerDeals / totalListingAgreements) * 100 : 0;
  const buyerApptToContractRate = totalBuyerAppts > 0 ? (totalBuyerContracts / totalBuyerAppts) * 100 : 0;
  const listingApptToAgreementRate = totalListingAppts > 0 ? (totalListingAgreements / totalListingAppts) * 100 : 0;
  
  // Volume calculations
  const volumeUnderContract = contractTransactions.filter(t => t.status === 'Under Contract').reduce((sum, t) => sum + (t.price || 0), 0);
  const volumePending = contractTransactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + (t.price || 0), 0);
  
  // Monthly calculations
  const currentMonth = new Date().getMonth();
  const monthlyData = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][monthIndex];
    const monthlyInputs = Object.values(dailyInputs).filter(day => {
      if (!day.date) return false;
      const dayMonth = new Date(day.date).getMonth();
      return dayMonth === monthIndex;
    });
    
    return {
      name: monthName,
      hours: monthlyInputs.reduce((sum, day) => sum + (day.hoursWorked || 0), 0),
      calls: monthlyInputs.reduce((sum, day) => sum + (day.callsMade || 0), 0),
      listingAppts: monthlyInputs.reduce((sum, day) => sum + (day.listingsApptsTaken || 0), 0),
      buyerAppts: monthlyInputs.reduce((sum, day) => sum + (day.buyerAppts || 0), 0),
      offersWritten: monthlyInputs.reduce((sum, day) => sum + (day.offersWritten || 0), 0),
      listingAgreements: monthlyInputs.reduce((sum, day) => sum + (day.listingAgreements || 0), 0),
      buyerContracts: monthlyInputs.reduce((sum, day) => sum + (day.buyerContracts || 0), 0),
      commission: closedDeals.filter(deal => deal.month === monthName).reduce((sum, deal) => sum + (deal.commission || 0), 0)
    };
  });
  
  // Monthly progress calculations
  const currentMonthData = monthlyData[currentMonth];
  const monthlyProgress = {
    calls: goals.monthly.calls > 0 ? (currentMonthData.calls / goals.monthly.calls) * 100 : 0,
    hours: goals.monthly.hours > 0 ? (currentMonthData.hours / goals.monthly.hours) * 100 : 0,
    appointments: goals.monthly.appointments > 0 ? ((currentMonthData.listingAppts + currentMonthData.buyerAppts) / goals.monthly.appointments) * 100 : 0,
    offersWritten: goals.monthly.offersWritten > 0 ? (currentMonthData.offersWritten / goals.monthly.offersWritten) * 100 : 0,
    listingAgreements: goals.monthly.listingAgreements > 0 ? (currentMonthData.listingAgreements / goals.monthly.listingAgreements) * 100 : 0,
    buyerContracts: goals.monthly.buyerContracts > 0 ? (currentMonthData.buyerContracts / goals.monthly.buyerContracts) * 100 : 0
  };
  
  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayData = dailyInputs[today] || {};
  
  // Calculate daily progress
  const dailyProgress = {
    calls: goals.daily.calls > 0 ? ((todayData.callsMade || 0) / goals.daily.calls) * 100 : 0,
    hours: goals.daily.hours > 0 ? ((todayData.hoursWorked || 0) / goals.daily.hours) * 100 : 0,
    appointments: goals.daily.appointments > 0 ? (((todayData.listingsApptsTaken || 0) + (todayData.buyerAppts || 0)) / goals.daily.appointments) * 100 : 0,
    offersWritten: goals.daily.offersWritten > 0 ? ((todayData.offersWritten || 0) / goals.daily.offersWritten) * 100 : 0,
    listingAgreements: goals.daily.listingAgreements > 0 ? ((todayData.listingAgreements || 0) / goals.daily.listingAgreements) * 100 : 0,
    buyerContracts: goals.daily.buyerContracts > 0 ? ((todayData.buyerContracts || 0) / goals.daily.buyerContracts) * 100 : 0
  };
  // Event handlers
  const handlePropertySubmit = (e) => {
    e.preventDefault();
    const property = {
      ...newProperty,
      timestamp: new Date().toLocaleString(),
      commission: newProperty.type === 'Seller' ? 
        (newProperty.price * (newProperty.commissionPercent / 100)) : newProperty.commission
    };
    setProperties([...properties, property]);
    setNewProperty({ 
      address: '', client: '', type: 'Seller', price: 0, commission: 0, commissionPercent: 2.5, 
      month: 'January', timestamp: '', status: 'In Progress', leadSource: 'Social Media' 
    });
  };
  const handleStatusChange = (index, newStatus) => {
    const property = properties[index];
    
    if (newStatus === 'Closed') {
      if (window.confirm(`Are you sure you want to close "${property.address}"? This will move it to closed deals.`)) {
        const closedProperty = {
          ...property,
          status: 'Closed',
          closedDate: new Date().toISOString().split('T')[0]
        };
        setClosedDeals([...closedDeals, closedProperty]);
        setProperties(properties.filter((_, i) => i !== index));
      }
    } else if (newStatus === 'Under Contract' || newStatus === 'Pending') {
      // Auto-move to transactions
      const transaction = {
        address: property.address,
        client: property.client,
        price: property.price,
        status: newStatus,
        date: new Date().toISOString().split('T')[0],
        commission: property.commission,
        timestamp: new Date().toLocaleString()
      };
      setContractTransactions([...contractTransactions, transaction]);
      setProperties(properties.filter((_, i) => i !== index));
    } else {
      const updatedProperties = [...properties];
      updatedProperties[index] = { ...updatedProperties[index], status: newStatus };
      setProperties(updatedProperties);
    }
  };
  const handleDailyInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseInt(value) || 0;
    
    // Get previous value for hours worked to calculate difference
    const prevHours = dailyInputs[selectedDate]?.hoursWorked || 0;
    const newHours = name === 'hoursWorked' ? newValue : prevHours;
    
    setDailyInputs(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        [name]: newValue,
        date: selectedDate
      }
    }));

    // Auto-calculate hourly rate expense when hours change and hourly rate exists
    if (name === 'hoursWorked' && hourlyRate > 0 && newValue !== prevHours) {
      const hoursDifference = newValue - prevHours;
      if (hoursDifference > 0) {
        const expenseAmount = hoursDifference * hourlyRate;
        const autoExpense = {
          propertyClient: 'General Business',
          category: 'Labor Cost',
          amount: expenseAmount,
          month: new Date(selectedDate).toLocaleDateString('en-US', { month: 'long' }),
          timestamp: new Date().toLocaleString(),
          auto: true,
          date: selectedDate,
          description: `Auto-calculated: ${hoursDifference} hours × $${hourlyRate.toFixed(2)}/hr`
        };
        setExpenses(prev => [...prev, autoExpense]);
      }
    }
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    const transaction = {
      ...newTransaction,
      timestamp: new Date().toLocaleString()
    };
    setContractTransactions([...contractTransactions, transaction]);
    setNewTransaction({ address: '', client: '', price: 0, status: 'Under Contract', date: new Date().toISOString().split('T')[0] });
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    const expense = {
      ...newExpense,
      timestamp: new Date().toLocaleString()
    };
    setExpenses([...expenses, expense]);
    setNewExpense({ propertyClient: '', category: 'Marketing & Advertising', amount: 0, month: 'January', timestamp: '' });
  };

  const handleHourSubmit = (e) => {
    e.preventDefault();
    const hour = {
      ...newHour,
      timestamp: new Date().toLocaleString()
    };
    setHours([...hours, hour]);
    setNewHour({ propertyClient: '', dayOfWeek: 'Monday', hours: 0, month: 'January', timestamp: '' });
  };
  const getPropertyAddresses = () => {
    return [...properties, ...closedDeals].map(p => p.address).filter(Boolean);
  };

  // Email report function
  const sendDailyReport = async () => {
    const reportData = {
      date: new Date().toLocaleDateString(),
      properties: properties.length,
      closedDeals: closedDeals.length,
      totalCommission: totalClosedCommission,
      totalHours: totalWorkHours,
      hourlyRate: hourlyRate,
      todaysProgress: {
        calls: `${todayData.callsMade || 0}/${goals.daily.calls} (${dailyProgress.calls.toFixed(1)}%)`,
        hours: `${todayData.hoursWorked || 0}/${goals.daily.hours} (${dailyProgress.hours.toFixed(1)}%)`,
        appointments: `${(todayData.listingsApptsTaken || 0) + (todayData.buyerAppts || 0)}/${goals.daily.appointments} (${dailyProgress.appointments.toFixed(1)}%)`,
        offersWritten: `${todayData.offersWritten || 0}/${goals.daily.offersWritten} (${dailyProgress.offersWritten.toFixed(1)}%)`,
        listingAgreements: `${todayData.listingAgreements || 0}/${goals.daily.listingAgreements} (${dailyProgress.listingAgreements.toFixed(1)}%)`,
        buyerContracts: `${todayData.buyerContracts || 0}/${goals.daily.buyerContracts} (${dailyProgress.buyerContracts.toFixed(1)}%)`
      },
      volumeUnderContract: volumeUnderContract,
      volumePending: volumePending,
      monthlyProgress: {
        calls: `${currentMonthData.calls}/${goals.monthly.calls} (${monthlyProgress.calls.toFixed(1)}%)`,
        hours: `${currentMonthData.hours}/${goals.monthly.hours} (${monthlyProgress.hours.toFixed(1)}%)`,
        appointments: `${currentMonthData.listingAppts + currentMonthData.buyerAppts}/${goals.monthly.appointments} (${monthlyProgress.appointments.toFixed(1)}%)`
      }
    };

    try {
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });
      
      if (response.ok) {
        alert('Daily report sent successfully!');
      } else {
        throw new Error('Failed to send report');
      }
    } catch (error) {
      console.error('Error sending report:', error);
      // Fallback: Download as JSON file
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `daily-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      alert('Report downloaded as JSON file (email service unavailable)');
    }
  };
  // Calendar functions
  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Check if we have data in other months to determine range
    const dataMonths = new Set();
    Object.keys(dailyInputs).forEach(dateStr => {
      const date = new Date(dateStr);
      if (!isNaN(date)) {
        dataMonths.add(`${date.getFullYear()}-${date.getMonth()}`);
      }
    });
    
    // If we have data in other months, show a wider range
    const showExtended = dataMonths.size > 1 || Array.from(dataMonths).some(month => month !== `${currentYear}-${currentMonth}`);
    
    let startMonth = currentMonth;
    let endMonth = currentMonth;
    let startYear = currentYear;
    let endYear = currentYear;
    
    if (showExtended) {
      // Show 3 months: previous, current, next
      startMonth = currentMonth - 1;
      endMonth = currentMonth + 1;
      
      if (startMonth < 0) {
        startMonth = 11;
        startYear = currentYear - 1;
      }
      if (endMonth > 11) {
        endMonth = 0;
        endYear = currentYear + 1;
      }
    }
    
    const allDays = [];
    
    // Generate days for the range
    for (let year = startYear; year <= endYear; year++) {
      const monthStart = year === startYear ? startMonth : 0;
      const monthEnd = year === endYear ? endMonth : 11;
      
      for (let month = monthStart; month <= monthEnd; month++) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const monthDays = [];
        const currentDate = new Date(startDate);
        
        // Add month header
        if (allDays.length > 0) {
          allDays.push({
            isMonthHeader: true,
            monthName: new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          });
        }
        
        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
          const dateStr = currentDate.toISOString().split('T')[0];
          const dayData = dailyInputs[dateStr];
          const isCurrentMonth = currentDate.getMonth() === month;
          
          monthDays.push({
            date: new Date(currentDate),
            dateStr: dateStr,
            day: currentDate.getDate(),
            isCurrentMonth: isCurrentMonth,
            hasData: !!dayData,
            data: dayData,
            month: month,
            year: year
          });
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        allDays.push(...monthDays);
      }
    }
    
    return allDays;
  };

  const getEventsForDate = (dateStr) => {
    const dayData = dailyInputs[dateStr];
    if (!dayData) return [];
    
    const events = [];
    if (dayData.hoursWorked > 0) events.push(`${dayData.hoursWorked} hours worked`);
    if (dayData.callsMade > 0) events.push(`${dayData.callsMade} calls made`);
    if (dayData.listingsApptsTaken > 0) events.push(`${dayData.listingsApptsTaken} listing appts`);
    if (dayData.buyerAppts > 0) events.push(`${dayData.buyerAppts} buyer appts`);
    if (dayData.offersWritten > 0) events.push(`${dayData.offersWritten} offers written`);
    if (dayData.listingAgreements > 0) events.push(`${dayData.listingAgreements} listing agreements`);
    if (dayData.buyerContracts > 0) events.push(`${dayData.buyerContracts} buyer contracts`);
    
    return events;
  };
  // Chart initialization with error handling
  useEffect(() => {
    const initChart = async () => {
      if (chartRef.current) {
        const ChartJS = await loadChart();
        if (!ChartJS) return;
        
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;
        
        try {
          // Destroy existing chart
          if (chartRef.current.chart) {
            chartRef.current.chart.destroy();
          }
          
          // Create new chart
          chartRef.current.chart = new ChartJS(ctx, { 
            type: 'bar', 
            data: chartData, 
            options: { 
              responsive: true,
              maintainAspectRatio: false,
              scales: { 
                y: { 
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toLocaleString();
                    }
                  }
                } 
              },
              plugins: {
                legend: {
                  labels: {
                    color: '#C5A95E'
                  }
                }
              }
            } 
          });
        } catch (error) {
          console.warn('Error creating chart:', error);
        }
      }
    };
    
    initChart();
    
    return () => {
      if (chartRef.current?.chart) {
        try {
          chartRef.current.chart.destroy();
        } catch (error) {
          console.warn('Error destroying chart:', error);
        }
      }
    };
  }, [chartData]);
  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('properties', JSON.stringify(properties));
      localStorage.setItem('dailyInputs', JSON.stringify(dailyInputs));
      localStorage.setItem('goals', JSON.stringify(goals));
      localStorage.setItem('closedDeals', JSON.stringify(closedDeals));
      localStorage.setItem('appName', appName);
      localStorage.setItem('expenses', JSON.stringify(expenses));
      localStorage.setItem('hours', JSON.stringify(hours));
      localStorage.setItem('contractTransactions', JSON.stringify(contractTransactions));
      localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
      localStorage.setItem('gciData', JSON.stringify(gciData));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [properties, dailyInputs, goals, closedDeals, appName, expenses, hours, contractTransactions, calendarEvents, gciData]);

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
        <span style={{color: '#C5A95E', fontSize: '1.875rem', fontWeight: 'bold', marginLeft: '0.5rem'}}>
          - {new Date().toLocaleString()}
        </span>
      </div>      {/* Tabs */}
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          Goals
        </div>
        <div 
          className={`tab ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </div>
        <div 
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </div>
        <div 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </div>
        <div 
          className={`tab ${activeTab === 'dataInput' ? 'active' : ''}`}
          onClick={() => setActiveTab('dataInput')}
        >
          Daily Data Input
        </div>
        <div 
          className={`tab ${activeTab === 'expensesHours' ? 'active' : ''}`}
          onClick={() => setActiveTab('expensesHours')}
        >
          Expenses/Hours
        </div>
        <div 
          className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </div>
        <div 
          className={`tab ${activeTab === 'gci' ? 'active' : ''}`}
          onClick={() => setActiveTab('gci')}
        >
          GCI Calculator
        </div>
        <div 
          className={`tab ${activeTab === 'closedDeals' ? 'active' : ''}`}
          onClick={() => setActiveTab('closedDeals')}
        >
          Closed Deals
        </div>
      </div>

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="section">
          <h2>Goals & Progress Tracking</h2>
          
          <div className="section">
            <h3>Set Goals</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newGoals = {
                daily: {
                  calls: parseInt(formData.get('dailyCalls')) || 0,
                  hours: parseInt(formData.get('dailyHours')) || 0,
                  appointments: parseInt(formData.get('dailyAppointments')) || 0,
                  offersWritten: parseInt(formData.get('dailyOffersWritten')) || 0,
                  listingAgreements: parseInt(formData.get('dailyListingAgreements')) || 0,
                  buyerContracts: parseInt(formData.get('dailyBuyerContracts')) || 0
                },
                weekly: {
                  calls: parseInt(formData.get('weeklyCalls')) || 0,
                  hours: parseInt(formData.get('weeklyHours')) || 0,
                  appointments: parseInt(formData.get('weeklyAppointments')) || 0,
                  offersWritten: parseInt(formData.get('weeklyOffersWritten')) || 0,
                  listingAgreements: parseInt(formData.get('weeklyListingAgreements')) || 0,
                  buyerContracts: parseInt(formData.get('weeklyBuyerContracts')) || 0
                },
                monthly: {
                  calls: parseInt(formData.get('monthlyCalls')) || 0,
                  hours: parseInt(formData.get('monthlyHours')) || 0,
                  appointments: parseInt(formData.get('monthlyAppointments')) || 0,
                  offersWritten: parseInt(formData.get('monthlyOffersWritten')) || 0,
                  listingAgreements: parseInt(formData.get('monthlyListingAgreements')) || 0,
                  buyerContracts: parseInt(formData.get('monthlyBuyerContracts')) || 0
                }
              };
              setGoals(newGoals);
            }}>
              <div>
                <label>Daily Calls</label>
                <input type="number" name="dailyCalls" defaultValue={goals.daily.calls} />
              </div>
              <div>
                <label>Daily Hours</label>
                <input type="number" name="dailyHours" defaultValue={goals.daily.hours} />
              </div>
              <div>
                <label>Daily Appointments</label>
                <input type="number" name="dailyAppointments" defaultValue={goals.daily.appointments} />
              </div>
              <div>
                <label>Daily Offers Written</label>
                <input type="number" name="dailyOffersWritten" defaultValue={goals.daily.offersWritten} />
              </div>
              <div>
                <label>Daily Listing Agreements</label>
                <input type="number" name="dailyListingAgreements" defaultValue={goals.daily.listingAgreements} />
              </div>
              <div>
                <label>Daily Buyer Contracts</label>
                <input type="number" name="dailyBuyerContracts" defaultValue={goals.daily.buyerContracts} />
              </div>
              <button type="submit" style={{padding: '0.4rem 0.8rem', fontSize: '0.9rem'}}>Update Goals</button>
            </form>
          </div>
          
          <div className="section">
            <h3>Today's Progress</h3>
            <div className="grid">
              <div className="tile">
                <h3>Daily Calls</h3>
                <p>{dailyProgress.calls.toFixed(1)}%</p>
                <small>{todayData.callsMade || 0} / {goals.daily.calls}</small>
              </div>
              <div className="tile">
                <h3>Daily Hours</h3>
                <p>{dailyProgress.hours.toFixed(1)}%</p>
                <small>{todayData.hoursWorked || 0} / {goals.daily.hours}</small>
              </div>
              <div className="tile">
                <h3>Daily Appointments</h3>
                <p>{dailyProgress.appointments.toFixed(1)}%</p>
                <small>{(todayData.listingsApptsTaken || 0) + (todayData.buyerAppts || 0)} / {goals.daily.appointments}</small>
              </div>
              <div className="tile">
                <h3>Daily Offers Written</h3>
                <p>{dailyProgress.offersWritten.toFixed(1)}%</p>
                <small>{todayData.offersWritten || 0} / {goals.daily.offersWritten}</small>
              </div>
              <div className="tile">
                <h3>Daily Listing Agreements</h3>
                <p>{dailyProgress.listingAgreements.toFixed(1)}%</p>
                <small>{todayData.listingAgreements || 0} / {goals.daily.listingAgreements}</small>
              </div>
              <div className="tile">
                <h3>Daily Buyer Contracts</h3>
                <p>{dailyProgress.buyerContracts.toFixed(1)}%</p>
                <small>{todayData.buyerContracts || 0} / {goals.daily.buyerContracts}</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="section">
          <h2>Add Property</h2>
          <form onSubmit={handlePropertySubmit}>
            <div>
              <label>Address</label>
              <input
                type="text"
                value={newProperty.address}
                onChange={e => setNewProperty({ ...newProperty, address: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Client</label>
              <input
                type="text"
                value={newProperty.client}
                onChange={e => setNewProperty({ ...newProperty, client: e.target.value })}
              />
            </div>
            <div>
              <label>Type</label>
              <select
                value={newProperty.type}
                onChange={e => setNewProperty({ ...newProperty, type: e.target.value })}
              >
                <option value="Seller">Seller</option>
                <option value="Buyer">Buyer</option>
              </select>
            </div>
            <div>
              <label>Price ($)</label>
              <input
                type="number"
                value={newProperty.price}
                onChange={e => {
                  const price = parseFloat(e.target.value) || 0;
                  const calculatedCommission = newProperty.type === 'Seller' ? 
                    (price * (newProperty.commissionPercent / 100)) : newProperty.commission;
                  setNewProperty({ 
                    ...newProperty, 
                    price: price,
                    commission: calculatedCommission
                  });
                }}
                required
              />
            </div>
            <div>
              <label>Commission (%)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="6"
                value={newProperty.commissionPercent}
                onChange={e => {
                  const percent = parseFloat(e.target.value) || 2.5;
                  const calculatedCommission = newProperty.type === 'Seller' ? 
                    (newProperty.price * (percent / 100)) : newProperty.commission;
                  setNewProperty({ 
                    ...newProperty, 
                    commissionPercent: percent,
                    commission: calculatedCommission
                  });
                }}
              />
              {newProperty.type === 'Seller' && (
                <small style={{color: '#666', fontSize: '0.8rem'}}>
                  Calculated: ${(newProperty.price * (newProperty.commissionPercent / 100)).toFixed(2)}
                </small>
              )}
            </div>
            <button type="submit">Add Property</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>Client</th>
                <th>Type</th>
                <th>Price ($)</th>
                <th>Commission (%)</th>
                <th>Commission ($)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p, i) => (
                <tr key={i}>
                  <td>{p.address}</td>
                  <td>{p.client || '-'}</td>
                  <td>{p.type}</td>
                  <td>${p.price?.toLocaleString() || 0}</td>
                  <td>{p.commissionPercent || 2.5}%</td>
                  <td>${p.commission?.toFixed(2) || 0}</td>
                  <td>
                    <select
                      value={p.status || 'In Progress'}
                      onChange={(e) => handleStatusChange(i, e.target.value)}
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Active">Active</option>
                      <option value="Under Contract">Under Contract</option>
                      <option value="Pending">Pending</option>
                      <option value="Closed">Closed</option>
                      <option value="Searching">Searching</option>
                      <option value="Withdrawn">Withdrawn</option>
                      <option value="Expired">Expired</option>
                      <option value="Terminated">Terminated</option>
                      <option value="Fired Client">Fired Client</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => {
                      setProperties(properties.filter((_, index) => index !== i));
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="section">
          <h2>Add Transaction</h2>
          <form onSubmit={handleTransactionSubmit}>
            <div>
              <label>Address</label>
              <input
                type="text"
                value={newTransaction.address}
                onChange={e => setNewTransaction({ ...newTransaction, address: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Client</label>
              <input
                type="text"
                value={newTransaction.client}
                onChange={e => setNewTransaction({ ...newTransaction, client: e.target.value })}
              />
            </div>
            <div>
              <label>Price ($)</label>
              <input
                type="number"
                value={newTransaction.price}
                onChange={e => setNewTransaction({ ...newTransaction, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label>Status</label>
              <select
                value={newTransaction.status}
                onChange={e => setNewTransaction({ ...newTransaction, status: e.target.value })}
              >
                <option value="Under Contract">Under Contract</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label>Date</label>
              <input
                type="date"
                value={newTransaction.date}
                onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
              />
            </div>
            <button type="submit">Add Transaction</button>
          </form>

          <div className="section">
            <h3>Under Contract</h3>
            <table>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Client</th>
                  <th>Price ($)</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {contractTransactions.filter(t => t.status === 'Under Contract').map((transaction, i) => (
                  <tr key={i}>
                    <td>{transaction.address}</td>
                    <td>{transaction.client || '-'}</td>
                    <td>${transaction.price?.toLocaleString() || 0}</td>
                    <td>{transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}</td>
                    <td>
                      <button onClick={() => {
                        const updatedTransactions = [...contractTransactions];
                        const transactionIndex = contractTransactions.indexOf(transaction);
                        updatedTransactions[transactionIndex] = { ...transaction, status: 'Pending' };
                        setContractTransactions(updatedTransactions);
                      }}>
                        Move to Pending
                      </button>
                      <button onClick={() => {
                        setContractTransactions(contractTransactions.filter(t => t !== transaction));
                      }} style={{marginLeft: '0.5rem'}}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section">
            <h3>Pending</h3>
            <table>
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Client</th>
                  <th>Price ($)</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {contractTransactions.filter(t => t.status === 'Pending').map((transaction, i) => (
                  <tr key={i}>
                    <td>{transaction.address}</td>
                    <td>{transaction.client || '-'}</td>
                    <td>${transaction.price?.toLocaleString() || 0}</td>
                    <td>{transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}</td>
                    <td>
                      <button onClick={() => {
                        if (window.confirm(`Close "${transaction.address}"? This will move it to closed deals.`)) {
                          const closedDeal = {
                            ...transaction,
                            status: 'Closed',
                            closedDate: new Date().toISOString().split('T')[0],
                            commission: transaction.commission || 0
                          };
                          setClosedDeals([...closedDeals, closedDeal]);
                          setContractTransactions(contractTransactions.filter(t => t !== transaction));
                        }
                      }}>
                        Close Deal
                      </button>
                      <button onClick={() => {
                        setContractTransactions(contractTransactions.filter(t => t !== transaction));
                      }} style={{marginLeft: '0.5rem'}}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="section">
            <h3>Volume Summary</h3>
            <div className="grid">
              <div className="tile">
                <h3>Total Transactions</h3>
                <p>{contractTransactions.length}</p>
              </div>
              <div className="tile">
                <h3>Volume Under Contract</h3>
                <p>${volumeUnderContract.toLocaleString()}</p>
              </div>
              <div className="tile">
                <h3>Volume Pending</h3>
                <p>${volumePending.toLocaleString()}</p>
              </div>
              <div className="tile">
                <h3>Total Volume</h3>
                <p>${(volumeUnderContract + volumePending).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}{/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="section">
          <h2>KPI Dashboard</h2>
          <div style={{marginBottom: '1rem'}}>
            <button onClick={sendDailyReport} style={{marginRight: '1rem'}}>
              Export Daily Report to Email
            </button>
            <span style={{fontSize: '0.9rem', color: '#C5A95E'}}>
              (Reports are automatically sent daily at 11:59 PM to nhcazateam@gmail.com)
            </span>
          </div>
          <div className="grid">
            <div className="tile">
              <h3>Total Properties</h3>
              <p>{properties.length}</p>
            </div>
            <div className="tile">
              <h3>Total Commissions Earned</h3>
              <p>${totalClosedCommission.toFixed(2)}</p>
            </div>
            <div className="tile">
              <h3>Total Hours</h3>
              <p>{totalWorkHours.toFixed(2)}</p>
            </div>
            <div className="tile">
              <h3>Hourly Rate</h3>
              <p>${hourlyRate.toFixed(2)}/hr</p>
            </div>
            <div className="tile">
              <h3>Monthly Calls Progress</h3>
              <p>{monthlyProgress.calls.toFixed(1)}%</p>
              <small>{currentMonthData.calls} / {goals.monthly.calls}</small>
            </div>
            <div className="tile">
              <h3>Monthly Hours Progress</h3>
              <p>{monthlyProgress.hours.toFixed(1)}%</p>
              <small>{currentMonthData.hours} / {goals.monthly.hours}</small>
            </div>
            <div className="tile">
              <h3>Monthly Appointments Progress</h3>
              <p>{monthlyProgress.appointments.toFixed(1)}%</p>
              <small>{currentMonthData.listingAppts + currentMonthData.buyerAppts} / {goals.monthly.appointments}</small>
            </div>
            <div className="tile">
              <h3>Monthly Offers Written Progress</h3>
              <p>{monthlyProgress.offersWritten.toFixed(1)}%</p>
              <small>{currentMonthData.offersWritten} / {goals.monthly.offersWritten}</small>
            </div>
            <div className="tile">
              <h3>Monthly Listing Agreements Progress</h3>
              <p>{monthlyProgress.listingAgreements.toFixed(1)}%</p>
              <small>{currentMonthData.listingAgreements} / {goals.monthly.listingAgreements}</small>
            </div>            <div className="tile">
              <h3>Monthly Buyer Contracts Progress</h3>
              <p>{monthlyProgress.buyerContracts.toFixed(1)}%</p>
              <small>{currentMonthData.buyerContracts} / {goals.monthly.buyerContracts}</small>
            </div>
          </div>
          
          <div className="section">
            <h3>Conversion Rates</h3>
            <div className="grid">
              <div className="tile">
                <h3>Buyer Contract to Closing</h3>
                <p>{buyerContractToClosingRate.toFixed(1)}%</p>
                <small>{totalBuyerDeals} closed / {totalBuyerContracts} contracts</small>
              </div>
              <div className="tile">
                <h3>Listing Agreement to Closing</h3>
                <p>{listingAgreementToClosingRate.toFixed(1)}%</p>
                <small>{totalSellerDeals} closed / {totalListingAgreements} agreements</small>
              </div>
              <div className="tile">
                <h3>Buyer Appt to Contract</h3>
                <p>{buyerApptToContractRate.toFixed(1)}%</p>
                <small>{totalBuyerContracts} contracts / {totalBuyerAppts} appointments</small>
              </div>
              <div className="tile">
                <h3>Listing Appt to Agreement</h3>
                <p>{listingApptToAgreementRate.toFixed(1)}%</p>
                <small>{totalListingAgreements} agreements / {totalListingAppts} appointments</small>
              </div>
              <div className="tile">
                <h3>Total Buyer Closings</h3>
                <p>{totalBuyerDeals}</p>
                <small>Buyer transactions closed</small>
              </div>
              <div className="tile">
                <h3>Total Seller Closings</h3>
                <p>{totalSellerDeals}</p>
                <small>Seller transactions closed</small>
              </div>
            </div>
          </div>
          
          <div className="section">
            <h3>Monthly Breakdown</h3>
            <div className="grid">
              {monthlyData.map((month, index) => (
                <div key={index} className="tile">
                  <h3>{month.name}</h3>
                  <div style={{fontSize: '0.8rem', textAlign: 'left'}}>
                    <div>Hours: {month.hours}</div>
                    <div>Calls: {month.calls}</div>
                    <div>Listing Appts: {month.listingAppts}</div>
                    <div>Buyer Appts: {month.buyerAppts}</div>
                    <div>Offers Written: {month.offersWritten}</div>
                    <div>Listing Agreements: {month.listingAgreements}</div>
                    <div>Buyer Contracts: {month.buyerContracts}</div>
                    <div>Commission: ${month.commission.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="section">
            <h3>Monthly GCI Chart</h3>
            <canvas ref={chartRef} style={{width: '100%', height: '400px'}}></canvas>
          </div>
        </div>
      )}

      {/* Expenses/Hours Tab */}
      {activeTab === 'expensesHours' && (
        <div className="section">
          <h2>Add Expense</h2>
          <form onSubmit={handleExpenseSubmit}>
            <div>
              <label>Property/Client</label>
              <select
                value={newExpense.propertyClient}
                onChange={e => setNewExpense({ ...newExpense, propertyClient: e.target.value })}
              >
                <option value="">Select Property/Client</option>
                {getPropertyAddresses().map(address => (
                  <option key={address} value={address}>{address}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Category</label>
              <select
                value={newExpense.category}
                onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
              >
                <option value="Marketing & Advertising">Marketing & Advertising</option>
                <option value="Travel">Travel</option>
                <option value="Client Entertainment">Client Entertainment</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label>Amount ($)</label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={e => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <button type="submit">Add Expense</button>
          </form>

          <h2>Add Hours</h2>
          <form onSubmit={handleHourSubmit}>
            <div>
              <label>Property/Client</label>
              <select
                value={newHour.propertyClient}
                onChange={e => setNewHour({ ...newHour, propertyClient: e.target.value })}
              >
                <option value="">Select Property/Client</option>
                {getPropertyAddresses().map(address => (
                  <option key={address} value={address}>{address}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Day of Week</label>
              <select
                value={newHour.dayOfWeek}
                onChange={e => setNewHour({ ...newHour, dayOfWeek: e.target.value })}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Hours</label>
              <input
                type="number"
                step="0.5"
                value={newHour.hours}
                onChange={e => setNewHour({ ...newHour, hours: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <button type="submit">Add Hours</button>
          </form>
        </div>
      )}

      {/* Daily Data Input Tab */}
      {activeTab === 'dataInput' && (
        <div className="section">
          <h2>Daily Data Input</h2>
          <div style={{marginBottom: '1rem'}}>
            <label>Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="grid">
            <div>
              <label>Hours Worked</label>
              <input
                type="number"
                name="hoursWorked"
                value={dailyInputs[selectedDate]?.hoursWorked || 0}
                onChange={handleDailyInputChange}
              />
            </div>
            <div>
              <label>Calls Made</label>
              <input
                type="number"
                name="callsMade"
                value={dailyInputs[selectedDate]?.callsMade || 0}
                onChange={handleDailyInputChange}
              />
            </div>
            <div>
              <label>Listing Appointments</label>
              <input
                type="number"
                name="listingsApptsTaken"
                value={dailyInputs[selectedDate]?.listingsApptsTaken || 0}
                onChange={handleDailyInputChange}
              />
            </div>
            <div>
              <label>Buyer Appointments</label>
              <input
                type="number"
                name="buyerAppts"
                value={dailyInputs[selectedDate]?.buyerAppts || 0}
                onChange={handleDailyInputChange}
              />
            </div>
            <div>
              <label>Offers Written</label>
              <input
                type="number"
                name="offersWritten"
                value={dailyInputs[selectedDate]?.offersWritten || 0}
                onChange={handleDailyInputChange}
              />
            </div>
            <div>
              <label>Listing Agreements</label>
              <input
                type="number"
                name="listingAgreements"
                value={dailyInputs[selectedDate]?.listingAgreements || 0}
                onChange={handleDailyInputChange}
              />
            </div>
            <div>
              <label>Buyer Contracts</label>
              <input
                type="number"
                name="buyerContracts"
                value={dailyInputs[selectedDate]?.buyerContracts || 0}
                onChange={handleDailyInputChange}
              />
            </div>
          </div>
        </div>
      )}      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="section">
          <h2>Calendar - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <p>Events are automatically populated from your daily data input.</p>
          
          <div className="section">
            <h3>Calendar View</h3>
            <div className="calendar-grid">
              <div className="calendar-day" style={{fontWeight: 'bold', backgroundColor: '#C5A95E', color: '#000'}}>Sun</div>
              <div className="calendar-day" style={{fontWeight: 'bold', backgroundColor: '#C5A95E', color: '#000'}}>Mon</div>
              <div className="calendar-day" style={{fontWeight: 'bold', backgroundColor: '#C5A95E', color: '#000'}}>Tue</div>
              <div className="calendar-day" style={{fontWeight: 'bold', backgroundColor: '#C5A95E', color: '#000'}}>Wed</div>
              <div className="calendar-day" style={{fontWeight: 'bold', backgroundColor: '#C5A95E', color: '#000'}}>Thu</div>
              <div className="calendar-day" style={{fontWeight: 'bold', backgroundColor: '#C5A95E', color: '#000'}}>Fri</div>
              <div className="calendar-day" style={{fontWeight: 'bold', backgroundColor: '#C5A95E', color: '#000'}}>Sat</div>
              
              {generateCalendarDays().map((dayData, index) => (
                <div 
                  key={index} 
                  className={`calendar-day ${dayData?.dateStr === selectedCalendarDate ? 'selected' : ''} ${!dayData?.isCurrentMonth ? 'other-month' : ''}`}
                  onClick={() => dayData && setSelectedCalendarDate(dayData.dateStr)}
                  style={{ 
                    cursor: dayData ? 'pointer' : 'default',
                    backgroundColor: dayData?.hasData ? '#F0F8FF' : '#FFFFFF',
                    opacity: dayData?.isCurrentMonth ? 1 : 0.5
                  }}
                >
                  {dayData ? (
                    <>
                      <div style={{fontWeight: 'bold'}}>{dayData.day}</div>
                      {getEventsForDate(dayData.dateStr).slice(0, 3).map((event, eventIndex) => (
                        <div key={eventIndex} className="calendar-event" style={{fontSize: '0.7rem', marginTop: '2px'}}>
                          {event}
                        </div>
                      ))}
                      {getEventsForDate(dayData.dateStr).length > 3 && (
                        <div style={{fontSize: '0.6rem', color: '#666'}}>+{getEventsForDate(dayData.dateStr).length - 3} more</div>
                      )}
                    </>
                  ) : ''}
                </div>
              ))}
            </div>
            
            {selectedCalendarDate && getEventsForDate(selectedCalendarDate).length > 0 && (
              <div className="section" style={{marginTop: '1rem'}}>
                <h3>Events for {new Date(selectedCalendarDate).toLocaleDateString()}</h3>
                <div className="grid">
                  {getEventsForDate(selectedCalendarDate).map((event, index) => (
                    <div key={index} style={{
                      padding: '0.5rem', 
                      margin: '0.25rem', 
                      border: '1px solid #C5A95E', 
                      borderRadius: '0.25rem',
                      backgroundColor: '#F9F9F9'
                    }}>
                      {event}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="section">
            <h3>Today's Goal Performance</h3>
            <div className="grid">
              <div className="tile">
                <h3>Today's Calls Progress</h3>
                <p>{dailyProgress.calls.toFixed(1)}%</p>
                <small>{todayData.callsMade || 0} / {goals.daily.calls}</small>
              </div>
              <div className="tile">
                <h3>Today's Hours Progress</h3>
                <p>{dailyProgress.hours.toFixed(1)}%</p>
                <small>{todayData.hoursWorked || 0} / {goals.daily.hours}</small>
              </div>
              <div className="tile">
                <h3>Today's Appointments Progress</h3>
                <p>{dailyProgress.appointments.toFixed(1)}%</p>
                <small>{(todayData.listingsApptsTaken || 0) + (todayData.buyerAppts || 0)} / {goals.daily.appointments}</small>
              </div>
              <div className="tile">
                <h3>Today's Offers Progress</h3>
                <p>{dailyProgress.offersWritten.toFixed(1)}%</p>
                <small>{todayData.offersWritten || 0} / {goals.daily.offersWritten}</small>
              </div>
              <div className="tile">
                <h3>Today's Agreements Progress</h3>
                <p>{dailyProgress.listingAgreements.toFixed(1)}%</p>
                <small>{todayData.listingAgreements || 0} / {goals.daily.listingAgreements}</small>
              </div>
              <div className="tile">
                <h3>Today's Buyer Contracts Progress</h3>
                <p>{dailyProgress.buyerContracts.toFixed(1)}%</p>
                <small>{todayData.buyerContracts || 0} / {goals.daily.buyerContracts}</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GCI Calculator Tab */}
      {activeTab === 'gci' && (
        <div className="section">
          <h2>GCI Calculator</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const newGciData = {
              gciGoal: parseFloat(formData.get('gciGoal')) || 215000,
              avgSale: parseFloat(formData.get('avgSale')) || 325090,
              avgCommission: Math.min(Math.max((parseFloat(formData.get('avgCommission')) || 2.5) / 100, 0), 0.06)
            };
            setGciData(newGciData);
          }}>
            <div>
              <label>GCI Goal ($)</label>
              <input
                type="number"
                name="gciGoal"
                defaultValue={gciData.gciGoal}
                required
              />
            </div>
            <div>
              <label>Average Sale Price ($)</label>
              <input
                type="number"
                name="avgSale"
                defaultValue={gciData.avgSale}
                required
              />
            </div>
            <div>
              <label>Average Commission (%)</label>
              <input
                type="number"
                step="0.1"
                name="avgCommission"
                defaultValue={gciData.avgCommission * 100}
                required
              />
            </div>
            <button type="submit">Update GCI Settings</button>
          </form>
          
          <div className="grid">
            <div className="tile">
              <h3>GCI Goal</h3>
              <p>${gciData.gciGoal.toLocaleString()}</p>
            </div>
            <div className="tile">
              <h3>Average Sale</h3>
              <p>${gciData.avgSale.toLocaleString()}</p>
            </div>
            <div className="tile">
              <h3>Average Commission</h3>
              <p>{(gciData.avgCommission * 100).toFixed(1)}%</p>
            </div>
            <div className="tile">
              <h3>Deals Needed</h3>
              <p>{Math.ceil(gciData.gciGoal / (gciData.avgSale * gciData.avgCommission))}</p>
            </div>
            <div className="tile">
              <h3>Current Progress</h3>
              <p>{totalClosedCommission > 0 ? ((totalClosedCommission / gciData.gciGoal) * 100).toFixed(1) : '0'}%</p>
            </div>
            <div className="tile">
              <h3>Remaining to Goal</h3>
              <p>${Math.max(0, gciData.gciGoal - totalClosedCommission).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Closed Deals Tab */}
      {activeTab === 'closedDeals' && (
        <div className="section">
          <h2>Closed Deals</h2>
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>Client</th>
                <th>Type</th>
                <th>Price ($)</th>
                <th>Commission ($)</th>
                <th>Closed Date</th>
              </tr>
            </thead>
            <tbody>
              {closedDeals.map((deal, i) => (
                <tr key={i}>
                  <td>{deal.address}</td>
                  <td>{deal.client || '-'}</td>
                  <td>{deal.type}</td>
                  <td>${deal.price?.toLocaleString() || 0}</td>
                  <td>${deal.commission?.toFixed(2) || 0}</td>
                  <td>{deal.closedDate ? new Date(deal.closedDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="section">
            <h3>Summary</h3>
            <div className="grid">
              <div className="tile">
                <h3>Total Closed Deals</h3>
                <p>{closedDeals.length}</p>
              </div>
              <div className="tile">
                <h3>Total Commission Earned</h3>
                <p>${totalClosedCommission.toFixed(2)}</p>
              </div>
              <div className="tile">
                <h3>Average Commission</h3>
                <p>${closedDeals.length > 0 ? (totalClosedCommission / closedDeals.length).toFixed(2) : '0.00'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
