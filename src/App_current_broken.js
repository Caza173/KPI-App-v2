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
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');  
  const [emailSettings, setEmailSettings] = useState(() => safeJSONParse(localStorage.getItem('emailSettings'), {
    reportEmail: '',
    autoReports: true,
    reportFrequency: 'daily',
    reportTime: '23:59'
  }));
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
  };  // Enhanced Email report functions
  const sendCustomReport = async (reportType) => {
    // Use nhcazateam@gmail.com as default, then user email, then settings email
    const targetEmail = 'nhcazateam@gmail.com'; // Default to your business email
    
    let reportData = {
      reportType: reportType,
      date: new Date().toLocaleDateString(),
      recipientEmail: targetEmail,
      appName: appName
    };

    // Generate different report types
    switch (reportType) {
      case 'daily':
        reportData = {
          ...reportData,
          title: 'Daily Real Estate KPI Report',
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
          }
        };
        break;
      
      case 'weekly':
        reportData = {
          ...reportData,
          title: 'Weekly Real Estate KPI Report',
          weeklyGoals: goals.weekly,
          weeklyProgress: {
            // Calculate weekly progress here
            calls: Object.values(dailyInputs).filter(day => isThisWeek(new Date(day.date))).reduce((sum, day) => sum + (day.callsMade || 0), 0),
            hours: Object.values(dailyInputs).filter(day => isThisWeek(new Date(day.date))).reduce((sum, day) => sum + (day.hoursWorked || 0), 0)
          }
        };
        break;
      
      case 'monthly':
        reportData = {
          ...reportData,
          title: 'Monthly Real Estate KPI Report',
          monthlyData: monthlyData[currentMonth],
          monthlyGoals: goals.monthly,
          conversionRates: {
            buyerContractToClosing: buyerContractToClosingRate,
            listingAgreementToClosing: listingAgreementToClosingRate,
            buyerApptToContract: buyerApptToContractRate,
            listingApptToAgreement: listingApptToAgreementRate
          }
        };
        break;
      
      case 'properties':
        reportData = {
          ...reportData,
          title: 'Property Analysis Report',
          totalProperties: properties.length,
          propertiesByStatus: properties.reduce((acc, prop) => {
            acc[prop.status || 'In Progress'] = (acc[prop.status || 'In Progress'] || 0) + 1;
            return acc;
          }, {}),
          totalExpenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
          totalHours: hours.reduce((sum, hr) => sum + hr.hours, 0),
          properties: properties.map(prop => ({
            address: prop.address,
            client: prop.client,
            type: prop.type,
            price: prop.price,
            commission: prop.commission,
            status: prop.status,
            expenses: expenses.filter(exp => exp.propertyClient === `${prop.address} - ${prop.client}`).reduce((sum, exp) => sum + exp.amount, 0),
            hours: hours.filter(hr => hr.propertyClient === `${prop.address} - ${prop.client}`).reduce((sum, hr) => sum + hr.hours, 0)
          }))
        };
        break;
      
      default:
        reportData = { ...reportData, title: 'General KPI Report' };
    }

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: targetEmail,
          subject: `${reportData.title} - ${new Date().toLocaleDateString()}`,
          body: generateEmailHTML(reportData)
        })
      });
      
      if (response.ok) {
        alert(`${reportData.title} sent successfully to ${targetEmail}!`);
      } else {
        throw new Error('Failed to send report');
      }
    } catch (error) {
      console.error('Error sending report:', error);
      // Fallback: Download as file
      downloadReport(reportData, reportType);
    }
  };

  // SMS Report Functions
  const sendSMSReport = async (reportType) => {
    try {
      const smsMessage = generateSMSText(reportType);
      
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: smsMessage
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`SMS ${reportType} report sent successfully to ${result.recipients.length} recipient(s)!`);
      } else {
        throw new Error(result.error || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS report:', error);
      alert(`Failed to send SMS report: ${error.message}`);
    }
  };

  // Generate SMS text content (limited to 160 characters for single SMS)
  const generateSMSText = (reportType) => {
    const today = new Date().toLocaleDateString();
    
    switch (reportType) {
      case 'daily':
        return `Daily KPI Report ${today}:
Calls: ${todayData.callsMade || 0}/${goals.daily.calls}
Hours: ${todayData.hoursWorked || 0}/${goals.daily.hours}
Appts: ${(todayData.listingsApptsTaken || 0) + (todayData.buyerAppts || 0)}/${goals.daily.appointments}
Offers: ${todayData.offersWritten || 0}/${goals.daily.offersWritten}
Contracts: ${(todayData.listingAgreements || 0) + (todayData.buyerContracts || 0)}/${goals.daily.listingAgreements + goals.daily.buyerContracts}`;
      
      case 'weekly':
        const weeklyProgress = Object.values(dailyInputs).filter(day => isThisWeek(new Date(day.date)));
        const weeklyCalls = weeklyProgress.reduce((sum, day) => sum + (day.callsMade || 0), 0);
        const weeklyHours = weeklyProgress.reduce((sum, day) => sum + (day.hoursWorked || 0), 0);
        return `Weekly KPI Report ${today}:
Calls: ${weeklyCalls}/${goals.weekly.calls}
Hours: ${weeklyHours}/${goals.weekly.hours}
Progress: ${((weeklyCalls/goals.weekly.calls)*100).toFixed(0)}% calls, ${((weeklyHours/goals.weekly.hours)*100).toFixed(0)}% hours`;
      
      case 'monthly':
        return `Monthly KPI Report ${today}:
Commission: $${totalClosedCommission.toFixed(0)}
Closed Deals: ${closedDeals.length}
Total Hours: ${totalWorkHours.toFixed(0)}
Hourly Rate: $${hourlyRate.toFixed(0)}/hr
Conversion Rates:
Buyer: ${buyerContractToClosingRate.toFixed(0)}%
Seller: ${listingAgreementToClosingRate.toFixed(0)}%`;
      
      case 'summary':
        return `KPI Summary ${today}:
Properties: ${properties.length}
Closed: ${closedDeals.length}
Commission: $${totalClosedCommission.toFixed(0)}
Hours: ${totalWorkHours.toFixed(0)}
Rate: $${hourlyRate.toFixed(0)}/hr`;
      
      default:
        return `KPI Report ${today}: ${properties.length} properties, ${closedDeals.length} closed deals, $${totalClosedCommission.toFixed(0)} commission`;
    }
  };

  // Test SMS functionality
  const testSMS = async () => {
    try {
      const response = await fetch('/api/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Test SMS sent successfully to ${result.recipients.length} recipient(s)!`);
      } else {
        alert(`SMS test failed: ${result.message || result.error}`);
      }
    } catch (error) {
      console.error('Error testing SMS:', error);
      alert(`SMS test failed: ${error.message}`);
    }
  };

  // Helper function to check if date is this week
  const isThisWeek = (date) => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return date >= startOfWeek && date <= endOfWeek;
  };

  // Generate HTML email content
  const generateEmailHTML = (data) => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #C5A95E; border-bottom: 3px solid #C5A95E; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
            .tile { background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #C5A95E; }
            .tile h3 { margin: 0 0 10px 0; color: #333; font-size: 14px; }
            .tile p { margin: 0; font-size: 18px; font-weight: bold; color: #C5A95E; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #C5A95E; color: white; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.title}</h1>
              <p>Generated on ${data.date} from ${data.appName}</p>
            </div>
            
            ${data.todaysProgress ? `
              <div class="section">
                <h2>Today's Progress</h2>
                <div class="grid">
                  <div class="tile"><h3>Calls</h3><p>${data.todaysProgress.calls}</p></div>
                  <div class="tile"><h3>Hours</h3><p>${data.todaysProgress.hours}</p></div>
                  <div class="tile"><h3>Appointments</h3><p>${data.todaysProgress.appointments}</p></div>
                  <div class="tile"><h3>Offers Written</h3><p>${data.todaysProgress.offersWritten}</p></div>
                  <div class="tile"><h3>Listing Agreements</h3><p>${data.todaysProgress.listingAgreements}</p></div>
                  <div class="tile"><h3>Buyer Contracts</h3><p>${data.todaysProgress.buyerContracts}</p></div>
                </div>
              </div>
            ` : ''}
            
            ${data.properties !== undefined ? `
              <div class="section">
                <h2>Key Metrics</h2>
                <div class="grid">
                  <div class="tile"><h3>Total Properties</h3><p>${data.properties}</p></div>
                  <div class="tile"><h3>Closed Deals</h3><p>${data.closedDeals}</p></div>
                  <div class="tile"><h3>Total Commission</h3><p>$${data.totalCommission?.toFixed(2) || '0.00'}</p></div>
                  <div class="tile"><h3>Total Hours</h3><p>${data.totalHours?.toFixed(1) || '0.0'}</p></div>
                  <div class="tile"><h3>Hourly Rate</h3><p>$${data.hourlyRate?.toFixed(2) || '0.00'}</p></div>
                </div>
              </div>
            ` : ''}
            
            <div class="footer">
              <p>This report was automatically generated by ${data.appName}</p>
              <p>Real Estate KPI Dashboard - Tracking your success, one metric at a time.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Download report as fallback
  const downloadReport = (reportData, reportType) => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert(`Report downloaded as JSON file (email service unavailable). Check your Downloads folder.`);
  };
  // Legacy function for backward compatibility
  const sendDailyReport = () => sendCustomReport('daily');

  // Simple email backup function using mailto
  const sendSimpleEmailReport = () => {
    const reportData = {
      date: new Date().toLocaleDateString(),
      properties: properties.length,
      closedDeals: closedDeals.length,
      totalCommission: totalClosedCommission.toFixed(2),
      totalHours: totalWorkHours.toFixed(1),
      hourlyRate: hourlyRate.toFixed(2),
      callsToday: todayData.callsMade || 0,
      callsGoal: goals.daily.calls,
      hoursToday: todayData.hoursWorked || 0,
      hoursGoal: goals.daily.hours
    };

    const emailSubject = `Daily Real Estate KPI Report - ${reportData.date}`;
    const emailBody = `
Daily Real Estate KPI Report
Date: ${reportData.date}

=== TODAY'S PROGRESS ===
Calls: ${reportData.callsToday}/${reportData.callsGoal} (${((reportData.callsToday / reportData.callsGoal) * 100).toFixed(1)}%)
Hours: ${reportData.hoursToday}/${reportData.hoursGoal} (${((reportData.hoursToday / reportData.hoursGoal) * 100).toFixed(1)}%)

=== KEY METRICS ===
Total Properties: ${reportData.properties}
Closed Deals: ${reportData.closedDeals}
Total Commission Earned: $${reportData.totalCommission}
Total Hours Worked: ${reportData.totalHours}
Average Hourly Rate: $${reportData.hourlyRate}/hr

=== MONTHLY PROGRESS ===
Monthly Calls: ${currentMonthData.calls}/${goals.monthly.calls} (${monthlyProgress.calls.toFixed(1)}%)
Monthly Hours: ${currentMonthData.hours}/${goals.monthly.hours} (${monthlyProgress.hours.toFixed(1)}%)

Generated by: ${appName}
    `.trim();

    // Create mailto link
    const mailtoLink = `mailto:nhcazateam@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open default email client
    window.location.href = mailtoLink;
      alert('Opening your default email client with the report. Please send the email from there.');
  };

  // Test email function
  const testEmailConnection = async () => {
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ Email test successful!\n\nTest email sent to nhcazateam@gmail.com\nMessage ID: ${result.messageId}\n\nCheck your inbox!`);
      } else {
        alert(`❌ Email test failed!\n\nError: ${result.error}\nDetails: ${result.details}\n\nEmail Config:\n- User: ${result.emailConfig?.user}\n- Has Password: ${result.emailConfig?.hasPassword ? 'Yes' : 'No - Please set EMAIL_PASS in .env file'}`);
      }
    } catch (error) {
      alert(`❌ Email test failed!\n\nError: Could not connect to email server.\nMake sure the backend server is running on port 3001.\n\nTechnical details: ${error.message}`);
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
    };  }, [chartData]);
  
  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('properties', JSON.stringify(properties));
      localStorage.setItem('dailyInputs', JSON.stringify(dailyInputs));
      localStorage.setItem('goals', JSON.stringify(goals));
      localStorage.setItem('closedDeals', JSON.stringify(closedDeals));
      localStorage.setItem('appName', appName);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
      localStorage.setItem('expenses', JSON.stringify(expenses));
      localStorage.setItem('hours', JSON.stringify(hours));
      localStorage.setItem('contractTransactions', JSON.stringify(contractTransactions));
      localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
      localStorage.setItem('gciData', JSON.stringify(gciData));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [properties, dailyInputs, goals, closedDeals, appName, userEmail, emailSettings, expenses, hours, contractTransactions, calendarEvents, gciData]);

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
      </div>      {/* Tabs */}
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          Goals
        </div>        <div 
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
        </div>        <div 
          className={`tab ${activeTab === 'closedDeals' ? 'active' : ''}`}
          onClick={() => setActiveTab('closedDeals')}
        >
          Closed Deals
        </div>
        <div 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </div>
      </div>

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="section">          <h2>Goals & Progress Tracking</h2>
          
          <div className="section">
            <h3>Set Daily Goals</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newGoals = {
                ...goals,
                daily: {
                  calls: parseInt(formData.get('dailyCalls')) || 0,
                  hours: parseInt(formData.get('dailyHours')) || 0,
                  appointments: parseInt(formData.get('dailyAppointments')) || 0,
                  offersWritten: parseInt(formData.get('dailyOffersWritten')) || 0,
                  listingAgreements: parseInt(formData.get('dailyListingAgreements')) || 0,
                  buyerContracts: parseInt(formData.get('dailyBuyerContracts')) || 0
                }
              };
              setGoals(newGoals);
              localStorage.setItem('goals', JSON.stringify(newGoals));
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
              <button type="submit" style={{padding: '0.4rem 0.8rem', fontSize: '0.9rem'}}>Update Daily Goals</button>
            </form>
          </div>

          <div className="section">
            <h3>Set Weekly Goals</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newGoals = {
                ...goals,
                weekly: {
                  calls: parseInt(formData.get('weeklyCalls')) || 0,
                  hours: parseInt(formData.get('weeklyHours')) || 0,
                  appointments: parseInt(formData.get('weeklyAppointments')) || 0,
                  offersWritten: parseInt(formData.get('weeklyOffersWritten')) || 0,
                  listingAgreements: parseInt(formData.get('weeklyListingAgreements')) || 0,
                  buyerContracts: parseInt(formData.get('weeklyBuyerContracts')) || 0
                }
              };
              setGoals(newGoals);
              localStorage.setItem('goals', JSON.stringify(newGoals));
            }}>
              <div>
                <label>Weekly Calls</label>
                <input type="number" name="weeklyCalls" defaultValue={goals.weekly.calls} />
              </div>
              <div>
                <label>Weekly Hours</label>
                <input type="number" name="weeklyHours" defaultValue={goals.weekly.hours} />
              </div>
              <div>
                <label>Weekly Appointments</label>
                <input type="number" name="weeklyAppointments" defaultValue={goals.weekly.appointments} />
              </div>
              <div>
                <label>Weekly Offers Written</label>
                <input type="number" name="weeklyOffersWritten" defaultValue={goals.weekly.offersWritten} />
              </div>
              <div>
                <label>Weekly Listing Agreements</label>
                <input type="number" name="weeklyListingAgreements" defaultValue={goals.weekly.listingAgreements} />
              </div>
              <div>
                <label>Weekly Buyer Contracts</label>
                <input type="number" name="weeklyBuyerContracts" defaultValue={goals.weekly.buyerContracts} />
              </div>
              <button type="submit" style={{padding: '0.4rem 0.8rem', fontSize: '0.9rem'}}>Update Weekly Goals</button>
            </form>
          </div>

          <div className="section">
            <h3>Set Monthly Goals</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newGoals = {
                ...goals,
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
              localStorage.setItem('goals', JSON.stringify(newGoals));
            }}>
              <div>
                <label>Monthly Calls</label>
                <input type="number" name="monthlyCalls" defaultValue={goals.monthly.calls} />
              </div>
              <div>
                <label>Monthly Hours</label>
                <input type="number" name="monthlyHours" defaultValue={goals.monthly.hours} />
              </div>
              <div>
                <label>Monthly Appointments</label>
                <input type="number" name="monthlyAppointments" defaultValue={goals.monthly.appointments} />
              </div>
              <div>
                <label>Monthly Offers Written</label>
                <input type="number" name="monthlyOffersWritten" defaultValue={goals.monthly.offersWritten} />
              </div>
              <div>
                <label>Monthly Listing Agreements</label>
                <input type="number" name="monthlyListingAgreements" defaultValue={goals.monthly.listingAgreements} />
              </div>
              <div>
                <label>Monthly Buyer Contracts</label>
                <input type="number" name="monthlyBuyerContracts" defaultValue={goals.monthly.buyerContracts} />
              </div>
              <button type="submit" style={{padding: '0.4rem 0.8rem', fontSize: '0.9rem'}}>Update Monthly Goals</button>
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
                </tr>              ))}
            </tbody>
          </table>

          <div className="section" style={{marginTop: '2rem', borderTop: '2px solid #C5A95E', paddingTop: '1rem'}}>
            <h2>Property Details</h2>
            
            <div className="section">
              <h3>Select Property for Detailed View</h3>
              <select
                value={selectedProperty}
                onChange={e => setSelectedProperty(e.target.value)}
                style={{padding: '0.5rem', fontSize: '1rem', marginBottom: '1rem'}}
              >
                <option value="">Select a Property</option>
                {properties.map((property, index) => (
                  <option key={index} value={`${property.address} - ${property.client}`}>
                    {property.address} - {property.client}
                  </option>
                ))}
              </select>
            </div>

            {selectedProperty && (
              <>
                <div className="section">
                  <h3>Property Information</h3>
                  {(() => {
                    const property = properties.find(p => `${p.address} - ${p.client}` === selectedProperty);
                    return property ? (
                      <div className="grid">
                        <div className="tile">
                          <h3>Address</h3>
                          <p>{property.address}</p>
                        </div>
                        <div className="tile">
                          <h3>Client</h3>
                          <p>{property.client || 'N/A'}</p>
                        </div>
                        <div className="tile">
                          <h3>Type</h3>
                          <p>{property.type}</p>
                        </div>
                        <div className="tile">
                          <h3>Price</h3>
                          <p>${property.price?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="tile">
                          <h3>Commission Rate</h3>
                          <p>{property.commissionPercent || 2.5}%</p>
                        </div>
                        <div className="tile">
                          <h3>Expected Commission</h3>
                          <p>${property.commission?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="tile">
                          <h3>Status</h3>
                          <p>{property.status || 'In Progress'}</p>
                        </div>
                        <div className="tile">
                          <h3>Lead Source</h3>
                          <p>{property.leadSource || 'N/A'}</p>
                        </div>
                      </div>
                    ) : (
                      <p>Property not found</p>
                    );
                  })()}
                </div>

                <div className="section">
                  <h3>Property Expenses</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Month</th>
                        <th>Date Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses
                        .filter(expense => expense.propertyClient === selectedProperty)
                        .map((expense, index) => (
                          <tr key={index}>
                            <td>{expense.category}</td>
                            <td>${expense.amount.toFixed(2)}</td>
                            <td>{expense.month}</td>
                            <td>{expense.timestamp ? new Date(expense.timestamp).toLocaleDateString() : '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {expenses.filter(expense => expense.propertyClient === selectedProperty).length === 0 && (
                    <p style={{textAlign: 'center', color: '#666', fontStyle: 'italic', margin: '1rem 0'}}>
                      No expenses recorded for this property yet.
                    </p>
                  )}
                  <div style={{marginTop: '1rem', fontWeight: 'bold'}}>
                    Total Expenses: ${expenses
                      .filter(expense => expense.propertyClient === selectedProperty)
                      .reduce((sum, expense) => sum + expense.amount, 0)
                      .toFixed(2)}
                  </div>
                </div>

                <div className="section">
                  <h3>Property Hours</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Day of Week</th>
                        <th>Hours</th>
                        <th>Month</th>
                        <th>Date Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hours
                        .filter(hour => hour.propertyClient === selectedProperty)
                        .map((hour, index) => (
                          <tr key={index}>
                            <td>{hour.dayOfWeek}</td>
                            <td>{hour.hours}</td>
                            <td>{hour.month}</td>
                            <td>{hour.timestamp ? new Date(hour.timestamp).toLocaleDateString() : '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {hours.filter(hour => hour.propertyClient === selectedProperty).length === 0 && (
                    <p style={{textAlign: 'center', color: '#666', fontStyle: 'italic', margin: '1rem 0'}}>
                      No hours recorded for this property yet.
                    </p>
                  )}
                  <div style={{marginTop: '1rem', fontWeight: 'bold'}}>
                    Total Hours: {hours
                      .filter(hour => hour.propertyClient === selectedProperty)
                      .reduce((sum, hour) => sum + hour.hours, 0)
                      .toFixed(1)} hours
                  </div>
                </div>

                <div className="section">
                  <h3>Property Summary</h3>
                  <div className="grid">
                    <div className="tile">
                      <h3>Total Expenses</h3>
                      <p>${expenses
                        .filter(expense => expense.propertyClient === selectedProperty)
                        .reduce((sum, expense) => sum + expense.amount, 0)
                        .toFixed(2)}</p>
                    </div>
                    <div className="tile">
                      <h3>Total Hours</h3>
                      <p>{hours
                        .filter(hour => hour.propertyClient === selectedProperty)
                        .reduce((sum, hour) => sum + hour.hours, 0)
                        .toFixed(1)}</p>
                    </div>
                    <div className="tile">
                      <h3>Cost Per Hour</h3>
                      <p>${(() => {
                        const totalExpenses = expenses
                          .filter(expense => expense.propertyClient === selectedProperty)
                          .reduce((sum, expense) => sum + expense.amount, 0);
                        const totalHours = hours
                          .filter(hour => hour.propertyClient === selectedProperty)
                          .reduce((sum, hour) => sum + hour.hours, 0);
                        return totalHours > 0 ? (totalExpenses / totalHours).toFixed(2) : '0.00';
                      })()}</p>
                    </div>
                    <div className="tile">
                      <h3>ROI Potential</h3>
                      <p>{(() => {
                        const property = properties.find(p => `${p.address} - ${p.client}` === selectedProperty);
                        const totalExpenses = expenses
                          .filter(expense => expense.propertyClient === selectedProperty)
                          .reduce((sum, expense) => sum + expense.amount, 0);
                        const expectedCommission = property?.commission || 0;
                        const roi = expectedCommission > 0 ? (((expectedCommission - totalExpenses) / expectedCommission) * 100) : 0;
                        return roi.toFixed(1) + '%';
                      })()}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>      )}

      {/* Transactions Tab */}
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
        <div className="section">          <h2>KPI Dashboard</h2>          <div style={{marginBottom: '1rem'}}>
            <div style={{marginBottom: '0.5rem'}}>
              <strong>📧 Email Reports:</strong>
            </div>
            <button onClick={sendDailyReport} style={{marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#C5A95E', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}>
              📧 Send Report via Server
            </button>
            <button onClick={sendSimpleEmailReport} style={{marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}>
              📬 Send Report via Email Client
            </button>
            
            <div style={{marginTop: '1rem', marginBottom: '0.5rem'}}>
              <strong>📱 SMS Reports:</strong>
            </div>
            <button onClick={() => sendSMSReport('daily')} style={{marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#FF6B35', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}>
              📱 Daily SMS
            </button>
            <button onClick={() => sendSMSReport('weekly')} style={{marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#9B59B6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}>
              📱 Weekly SMS
            </button>
            <button onClick={() => sendSMSReport('monthly')} style={{marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#E74C3C', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}>
              � Monthly SMS
            </button>
            <button onClick={() => sendSMSReport('summary')} style={{marginRight: '1rem', padding: '0.5rem 1rem', backgroundColor: '#17A2B8', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}>
              📱 Quick Summary
            </button>
            
            <div style={{fontSize: '0.9rem', color: '#C5A95E', marginTop: '0.5rem'}}>
              📧 Email reports sent to: nhcazateam@gmail.com & corey@nhomeatlast.net<br/>
              � SMS reports sent to configured phone numbers (see Settings tab for setup)
            </div>
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
                    opacity: dayData?.isCurrentMonth ? 1 : 0.5,
                    minHeight: dayData?.hasData ? '80px' : '40px',
                    padding: '4px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {dayData ? (
                    <>
                      <div style={{fontWeight: 'bold', marginBottom: '2px'}}>{dayData.day}</div>
                      {getEventsForDate(dayData.dateStr).slice(0, dayData?.hasData ? 5 : 2).map((event, eventIndex) => (
                        <div key={eventIndex} className="calendar-event" style={{
                          fontSize: '0.6rem', 
                          marginTop: '1px',
                          padding: '1px 2px',
                          backgroundColor: 'rgba(197, 169, 94, 0.2)',
                          borderRadius: '2px',
                          lineHeight: '1.2'
                        }}>
                          {event.length > 15 ? event.substring(0, 15) + '...' : event}
                        </div>
                      ))}
                      {getEventsForDate(dayData.dateStr).length > (dayData?.hasData ? 5 : 2) && (
                        <div style={{fontSize: '0.6rem', color: '#666', fontStyle: 'italic'}}>
                          +{getEventsForDate(dayData.dateStr).length - (dayData?.hasData ? 5 : 2)} more
                        </div>
                      )}
                    </>
                  ) : ''}
                </div>
              ))}
            </div>
              {selectedCalendarDate && getEventsForDate(selectedCalendarDate).length > 0 && (
              <div className="section" style={{marginTop: '1rem', border: '2px solid #C5A95E', borderRadius: '8px', padding: '1rem'}}>
                <h3 style={{color: '#C5A95E'}}>Expanded View - {new Date(selectedCalendarDate).toLocaleDateString()}</h3>
                <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
                  {getEventsForDate(selectedCalendarDate).map((event, index) => (
                    <div key={index} style={{
                      padding: '0.75rem', 
                      margin: '0.25rem', 
                      border: '1px solid #C5A95E', 
                      borderRadius: '0.5rem',
                      backgroundColor: '#F9F9F9',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      fontSize: '0.9rem'
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
            </div>          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="section">
          <h2>Settings & Configuration</h2>
          
          <div className="section">
            <h3>Email Configuration</h3>
            <div className="grid" style={{gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start'}}>
              {/* Left Column - Form */}
              <div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const newEmailSettings = {
                    reportEmail: formData.get('reportEmail') || '',
                    autoReports: formData.get('autoReports') === 'on',
                    reportFrequency: formData.get('reportFrequency') || 'daily',
                    reportTime: formData.get('reportTime') || '23:59'
                  };
                  setEmailSettings(newEmailSettings);
                  setUserEmail(formData.get('reportEmail') || '');
                  alert('Email settings saved successfully!');
                }}>
                  <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Your Email Address for Reports</label>
                    <input
                      type="email"
                      name="reportEmail"
                      defaultValue={emailSettings.reportEmail}
                      placeholder="Enter your email address"
                      style={{width: '100%', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #ddd'}}
                    />
                  </div>
                  
                  <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'flex', alignItems: 'center', fontWeight: 'bold'}}>
                      <input
                        type="checkbox"
                        name="autoReports"
                        defaultChecked={emailSettings.autoReports}
                        style={{marginRight: '0.5rem', transform: 'scale(1.2)'}}
                      />
                      Enable Automatic Daily Reports
                    </label>
                  </div>
                  
                  <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Report Frequency</label>
                    <select
                      name="reportFrequency"
                      defaultValue={emailSettings.reportFrequency}
                      style={{width: '100%', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #ddd'}}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Report Time (24-hour format)</label>
                    <input
                      type="time"
                      name="reportTime"
                      defaultValue={emailSettings.reportTime}
                      style={{width: '100%', padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid #ddd'}}
                    />
                  </div>
                  
                  <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                    <button type="submit" style={{flex: '1', minWidth: '200px', padding: '0.75rem', fontSize: '1rem', backgroundColor: '#C5A95E', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer'}}>
                      Save Email Settings
                    </button>
                    <button type="button" onClick={testEmailConnection} style={{flex: '1', minWidth: '200px', padding: '0.75rem', fontSize: '1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer'}}>
                      🧪 Test Email Connection
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Right Column - Instructions */}
              <div>
                <div style={{padding: '1.5rem', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '0.5rem', height: 'fit-content'}}>
                  <h4 style={{margin: '0 0 1rem 0', color: '#856404'}}>📧 Email Setup Instructions:</h4>
                  <ol style={{margin: 0, paddingLeft: '1.5rem', color: '#856404', lineHeight: '1.6'}}>
                    <li>Make sure your backend server is running (npm start)</li>
                    <li>Set up Gmail App Password in .env file (see instructions in .env)</li>
                    <li>Click "Test Email Connection" to verify setup</li>
                    <li>If test fails, check console logs in your terminal</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
            <h3>SMS Configuration</h3>
            <div style={{marginBottom: '1rem', padding: '1rem', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '0.5rem'}}>
              <h4 style={{margin: '0 0 0.5rem 0', color: '#856404'}}>📱 SMS Setup Instructions:</h4>
              <ol style={{margin: 0, paddingLeft: '1.5rem', color: '#856404'}}>
                <li>Sign up for a Twilio account at <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer">twilio.com</a></li>
                <li>Get your Account SID, Auth Token, and phone number from Twilio Console</li>
                <li>Add these to your .env file:
                  <ul style={{marginTop: '0.5rem'}}>
                    <li>TWILIO_ACCOUNT_SID=your_account_sid</li>
                    <li>TWILIO_AUTH_TOKEN=your_auth_token</li>
                    <li>TWILIO_PHONE_NUMBER=+1234567890</li>
                    <li>DEFAULT_SMS_RECIPIENTS=+1234567890,+0987654321</li>
                  </ul>
                </li>
                <li>Restart your server (npm start)</li>
                <li>Test SMS functionality with the button below</li>
              </ol>
            </div>
            
            <div style={{marginBottom: '1rem'}}>
              <button type="button" onClick={testSMS} style={{padding: '0.75rem 1.5rem', fontSize: '1rem', backgroundColor: '#FF6B35', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', marginRight: '1rem'}}>
                🧪 Test SMS Connection
              </button>
              <span style={{fontSize: '0.9rem', color: '#666'}}>
                Sends a test SMS to all configured phone numbers
              </span>
            </div>
            
            <div style={{padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '0.5rem', border: '1px solid #b3d9ff'}}>
              <h4 style={{margin: '0 0 0.5rem 0', color: '#0066cc'}}>💡 SMS Features:</h4>
              <ul style={{margin: 0, paddingLeft: '1.5rem', color: '#0066cc'}}>
                <li>Daily KPI summaries sent via SMS</li>
                <li>Weekly and monthly progress updates</li>
                <li>Quick summary reports for on-the-go updates</li>
                <li>Automatic delivery to multiple phone numbers</li>
                <li>Works alongside email reports</li>
              </ul>
            </div>
          </div>

          <div className="section">
            <h3>Manual Report Export</h3>
            <div className="grid">
              <div className="tile">
                <h3>Daily Report</h3>
                <p>Export today's activities and progress</p>
                <button 
                  onClick={() => sendCustomReport('daily')}
                  style={{padding: '0.5rem 1rem', backgroundColor: '#C5A95E', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}
                >
                  Send Daily Report
                </button>
              </div>
              
              <div className="tile">
                <h3>Weekly Report</h3>
                <p>Export this week's summary</p>
                <button 
                  onClick={() => sendCustomReport('weekly')}
                  style={{padding: '0.5rem 1rem', backgroundColor: '#C5A95E', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}
                >
                  Send Weekly Report
                </button>
              </div>
              
              <div className="tile">
                <h3>Monthly Report</h3>
                <p>Export this month's comprehensive report</p>
                <button 
                  onClick={() => sendCustomReport('monthly')}
                  style={{padding: '0.5rem 1rem', backgroundColor: '#C5A95E', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}
                >
                  Send Monthly Report
                </button>
              </div>
              
              <div className="tile">
                <h3>Property Report</h3>
                <p>Export detailed property analysis</p>
                <button 
                  onClick={() => sendCustomReport('properties')}
                  style={{padding: '0.5rem 1rem', backgroundColor: '#C5A95E', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer'}}
                >
                  Send Property Report
                </button>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Cloud Hosting Preparation</h3>
            <div style={{padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '0.5rem', border: '1px solid #C5A95E'}}>
              <h4 style={{color: '#C5A95E', marginTop: 0}}>🚀 Ready for AWS/Azure/Cloud Deployment!</h4>
              <p><strong>Current Configuration:</strong></p>
              <ul style={{textAlign: 'left', marginBottom: '1rem'}}>
                <li>✅ React frontend with optimized build process (npm run build)</li>
                <li>✅ Node.js/Express backend server with CORS configured</li>
                <li>✅ Email service using Nodemailer with Gmail integration</li>
                <li>✅ Environment variables support (.env file)</li>
                <li>✅ Production-ready webpack configuration</li>
              </ul>
              
              <p><strong>For Cloud Deployment:</strong></p>
              <ul style={{textAlign: 'left'}}>
                <li>📦 <strong>Frontend:</strong> Deploy build folder to S3 + CloudFront or Azure Static Web Apps</li>
                <li>🖥️ <strong>Backend:</strong> Deploy to EC2, Azure App Service, or AWS Lambda</li>
                <li>📧 <strong>Email:</strong> Configure SMTP settings with cloud email service</li>
                <li>🗄️ <strong>Data:</strong> Replace localStorage with cloud database (MongoDB Atlas, AWS RDS)</li>
                <li>🔒 <strong>Security:</strong> Add authentication and HTTPS certificates</li>
              </ul>
            </div>
          </div>

          <div className="section">
            <h3>Application Information</h3>
            <div className="grid">
              <div className="tile">
                <h3>Version</h3>
                <p>1.0.0</p>
              </div>
              
              <div className="tile">
                <h3>Last Updated</h3>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="tile">
                <h3>Data Storage</h3>
                <p>Browser LocalStorage</p>
                <small>(Ready for cloud database migration)</small>
              </div>
                <div className="tile">
                <h3>Current Email</h3>
                <p>{emailSettings.reportEmail || 'Not configured'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;