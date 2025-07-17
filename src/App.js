import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('properties');
  const [appName, setAppName] = useState('Real Estate KPI Dashboard');
  const [activeTab, setActiveTab] = useState('properties');
  const [selectedReportPeriod, setSelectedReportPeriod] = useState('week');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [newProperty, setNewProperty] = useState({ 
    address: '', client: '', type: 'Seller', price: 0, commission: 0, commissionPercent: 2.5, 
    month: 'January', timestamp: '', status: 'In Progress', leadSource: 'Social Media', 
    offerWritten: false, offerAccepted: false 
  });
  
  const [goals, setGoals] = useState(() => safeJSONParse(localStorage.getItem('goals'), { 
    daily: { calls: 10, hours: 8, appointments: 2, offersWritten: 5, listingAgreements: 2, buyerContracts: 3 }, 
    weekly: { calls: 70, hours: 40, appointments: 10, offersWritten: 25, listingAgreements: 10, buyerContracts: 15 }, 
    monthly: { calls: 300, hours: 160, appointments: 40, offersWritten: 100, listingAgreements: 40, buyerContracts: 60 } 
  }));
  
  // Daily goals tracking
  const [dailyGoals, setDailyGoals] = useState(() => safeJSONParse(localStorage.getItem('dailyGoals'), {
    calls: 10,
    hours: 8,
    appointments: 2,
    offersWritten: 5,
    listingAgreements: 2,
    buyerContracts: 3,
    isLocked: false
  }));
  
  const [closedDeals, setClosedDeals] = useState(() => safeJSONParse(localStorage.getItem('closedDeals'), []));
  const [appName, setAppName] = useState(() => localStorage.getItem('appName') || 'Real Estate KPI Dashboard');
  const [reportEmail, setReportEmail] = useState(() => localStorage.getItem('reportEmail') || '');
  const [reportPhone, setReportPhone] = useState(() => localStorage.getItem('reportPhone') || '');
  const [manualHourlyRate, setManualHourlyRate] = useState(() => parseFloat(localStorage.getItem('manualHourlyRate')) || 0);
  
  // Manual Performance Metrics
  const [manualPerformanceMetrics, setManualPerformanceMetrics] = useState(() => 
    safeJSONParse(localStorage.getItem('manualPerformanceMetrics'), {
      totalProperties: 0,
      totalCommissions: 0,
      totalHours: 0,
      dealsClosedYTD: 0
    })
  );
    // Experience level bonuses (percentages)
  const [experienceLevelBonuses, setExperienceLevelBonuses] = useState(() => 
    safeJSONParse(localStorage.getItem('experienceLevelBonuses'), {
      5: 5, 6: 8, 7: 12, 8: 16, 9: 20, 10: 25
    })
  );
  
  const [stepLevelBonuses, setStepLevelBonuses] = useState(() => 
    safeJSONParse(localStorage.getItem('stepLevelBonuses'), {
      1: 0, 2: 5, 3: 10
    })
  );
  const [emailConfig, setEmailConfig] = useState(() => safeJSONParse(localStorage.getItem('emailConfig'), {
    service: 'gmail',
    user: '',
    password: '',
    host: '',
    port: 587,
    secure: false
  }));
  const [smsConfig, setSmsConfig] = useState(() => safeJSONParse(localStorage.getItem('smsConfig'), {
    accountSid: '',
    authToken: '',
    phoneNumber: ''
  }));
  const [selectedProperty, setSelectedProperty] = useState('');
  const [newExpense, setNewExpense] = useState({ propertyClient: '', category: 'Marketing & Advertising', amount: 0, month: 'January', timestamp: '', mileage: 0, gasPrice: 0 });
  const [newHour, setNewHour] = useState({ propertyClient: '', dayOfWeek: 'Monday', hours: 0, month: 'January', timestamp: '' });
  const [newTransaction, setNewTransaction] = useState({ address: '', client: '', price: 0, commission: 0, commissionPercent: 2.5, status: 'Under Contract', date: new Date().toISOString().split('T')[0] });
  const [contractTransactions, setContractTransactions] = useState(() => safeJSONParse(localStorage.getItem('contractTransactions'), []));
  const [calendarEvents, setCalendarEvents] = useState(() => safeJSONParse(localStorage.getItem('calendarEvents'), {}));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().toISOString().split('T')[0]);
  
  // 2025 Tax Brackets (Single Filer)
  const taxBrackets2025 = [
    { min: 0, max: 11950, rate: 0.10 },
    { min: 11950, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 }
  ];
  
  // Calculate taxes based on 2025 brackets
  const calculateTax = (income) => {
    let tax = 0;
    let remainingIncome = income;
    
    for (const bracket of taxBrackets2025) {
      if (remainingIncome <= 0) break;
      
      const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }
      return tax;
  };
  
  // Get week dates
  const getWeekDates = (year, month, weekNumber) => {
    const firstDay = new Date(year, month - 1, 1);
    const firstWeekDay = firstDay.getDay();
    
    const startDate = new Date(year, month - 1, 1 + (weekNumber - 1) * 7 - firstWeekDay);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return { startDate, endDate };
  };
  
  // Calculate weekly metrics
  const calculateWeeklyMetrics = (year, month, weekNumber) => {
    const { startDate, endDate } = getWeekDates(year, month, weekNumber);
    
    // Filter daily inputs for the week
    const weeklyData = Object.entries(dailyInputs).filter(([date]) => {
      const inputDate = new Date(date);
      return inputDate >= startDate && inputDate <= endDate;
    });
    
    // Calculate totals
    const weeklyTotals = weeklyData.reduce((totals, [date, data]) => {
      return {
        calls: totals.calls + (data.callsMade || 0),
        hours: totals.hours + (data.hoursWorked || 0),
        appointments: totals.appointments + (data.appointments || 0),
        offersWritten: totals.offersWritten + (data.offersWritten || 0),
        listingAgreements: totals.listingAgreements + (data.listingAgreements || 0),
        buyerContracts: totals.buyerContracts + (data.buyerContracts || 0),
        showings: totals.showings + (data.showings || 0),
        leads: totals.leads + (data.leadsGenerated || 0)
      };
    }, {
      calls: 0, hours: 0, appointments: 0, offersWritten: 0,
      listingAgreements: 0, buyerContracts: 0, showings: 0, leads: 0
    });
    
    return { weeklyTotals, weeklyData };
  };

  // Computed Values (use manual values if available, otherwise calculate) - MOVED HERE FOR DEPENDENCY ORDER
  const totalClosedCommission = manualPerformanceMetrics.totalCommissions > 0 ? 
    manualPerformanceMetrics.totalCommissions : 
    closedDeals.reduce((sum, deal) => sum + (deal.commission || 0), 0);
    
  const totalWorkHours = manualPerformanceMetrics.totalHours > 0 ? 
    manualPerformanceMetrics.totalHours : 
    Object.values(dailyInputs).reduce((sum, day) => sum + (day?.hoursWorked || 0), 0);
    
  const calculatedHourlyRate = totalWorkHours > 0 ? totalClosedCommission / totalWorkHours : 0;
  
  // Experience level calculations (use manual deals if available)
  const dealsClosed = manualPerformanceMetrics.dealsClosedYTD > 0 ? 
    manualPerformanceMetrics.dealsClosedYTD : 
    closedDeals.length;
    
  const experienceLevel = dealsClosed >= 50 ? 10 : dealsClosed >= 40 ? 9 : dealsClosed >= 30 ? 8 : 
                         dealsClosed >= 20 ? 7 : dealsClosed >= 15 ? 6 : dealsClosed >= 5 ? 5 : 0;
  
  const stepLevel = dealsClosed >= 20 ? 3 : dealsClosed >= 10 ? 2 : 1;
  
  // Calculate bonused hourly rate
  const baseHourlyRate = manualHourlyRate > 0 ? manualHourlyRate : calculatedHourlyRate;
  const experienceBonus = experienceLevel > 0 ? (experienceLevelBonuses[experienceLevel] || 0) : 0;
  const stepBonus = stepLevelBonuses[stepLevel] || 0;
  const totalBonusPercentage = experienceBonus + stepBonus;
  const hourlyRate = baseHourlyRate * (1 + totalBonusPercentage / 100);

  // Monthly calculations (moved here to be available for useEffect)
  const currentMonth = new Date().getMonth();
  const monthlyData = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][monthIndex];
    const monthlyInputs = Object.values(dailyInputs).filter(day => {
      if (!day.date) return false;
      const dayMonth = new Date(day.date).getMonth();
      return dayMonth === monthIndex;
    });
    
    return {
      month: monthName,
      name: monthName,
      hours: monthlyInputs.reduce((sum, day) => sum + (day.hoursWorked || 0), 0),
      calls: monthlyInputs.reduce((sum, day) => sum + (day.callsMade || 0), 0),
      listingAppts: monthlyInputs.reduce((sum, day) => sum + (day.listingsApptsTaken || 0), 0),
      buyerAppts: monthlyInputs.reduce((sum, day) => sum + (day.buyerAppts || 0), 0),
      offersWritten: monthlyInputs.reduce((sum, day) => sum + (day.offersWritten || 0), 0),
      listingAgreements: monthlyInputs.reduce((sum, day) => sum + (day.listingAgreements || 0), 0),
      buyerContracts: monthlyInputs.reduce((sum, day) => sum + (day.buyerContracts || 0), 0),
      // Commission from deals closed in this month (based on closing date)
      commission: closedDeals.filter(deal => {
        if (!deal.closingDate) return deal.month === monthName; // fallback to old method
        const closingMonth = new Date(deal.closingDate).getMonth();
        return closingMonth === monthIndex;
      }).reduce((sum, deal) => sum + (deal.commission || 0), 0),
      // Total expenses incurred during this month (all property expenses + labor)
      totalExpenses: (() => {
        const monthExpenses = expenses.filter(expense => {
          if (!expense.date) return expense.month === monthName; // fallback
          const expenseMonth = new Date(expense.date).getMonth();
          return expenseMonth === monthIndex;
        }).reduce((sum, e) => sum + (e.amount || 0), 0);
        const monthLaborCost = monthlyInputs.reduce((sum, day) => sum + (day.hoursWorked || 0), 0) * hourlyRate;
        return monthExpenses + monthLaborCost;
      })()
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
  // Performance tab chart initialization
  useEffect(() => {
    const initChart = async () => {
      if (activeTab === 'expensesHours') {
        console.log('Initializing performance chart for expensesHours tab');
        const ChartJS = await loadChart();
        if (!ChartJS) {
          console.error('Failed to load Chart.js');
          return;
        }
        
        const canvas = document.getElementById('performanceChart');
        if (!canvas) {
          console.error('Canvas element not found');
          return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (canvas.chart) {
          canvas.chart.destroy();
        }
        
        console.log('Creating chart with data:', monthlyData.map(m => ({ month: m.month, commission: m.commission, expenses: m.totalExpenses })));
        
        // Create new chart
        canvas.chart = new ChartJS(ctx, {
          type: 'bar',
          data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [{
              label: 'Commission ($)',
              data: monthlyData.map(month => month.commission),
              backgroundColor: 'rgba(197, 169, 94, 0.6)',
              borderColor: '#C5A95E',
              borderWidth: 1
            }, {
              label: 'Total Expenses ($)',
              data: monthlyData.map(month => month.totalExpenses),
              backgroundColor: 'rgba(220, 53, 69, 0.6)',
              borderColor: '#dc3545',
              borderWidth: 1
            }]
          },
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
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                  }
                }
              }
            }
          }
        });
        
        console.log('Chart created successfully');
      }
    };
    
    initChart();
    
    // Cleanup function
    return () => {
      const canvas = document.getElementById('performanceChart');
      if (canvas?.chart) {
        canvas.chart.destroy();
      }
    };
  }, [activeTab, monthlyData, hourlyRate]);
  
  // Helper function to normalize date for consistent grouping
  const normalizeDateKey = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Unknown';
      
      // Get local date components to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.warn('Error parsing date:', timestamp, e);
      return 'Unknown';
    }
  };

  // Helper function to calculate total expenses including labor costs
  const calculateTotalExpensesWithLabor = (propertyAddress, propertyClient) => {
    // Calculate monetary expenses
    const propertyExpenses = expenses.filter(e => 
      e.propertyClient && (
        e.propertyClient.toLowerCase().includes(propertyAddress.toLowerCase()) ||
        e.propertyClient.toLowerCase().includes(propertyClient?.toLowerCase() || '')
      )
    ).reduce((sum, e) => sum + (e.amount || 0), 0);
    
    // Calculate labor costs (hours × hourly rate)
    const propertyHours = hours.filter(h => 
      h.propertyClient && (
        h.propertyClient.toLowerCase().includes(propertyAddress.toLowerCase()) ||
        h.propertyClient.toLowerCase().includes(propertyClient?.toLowerCase() || '')
      )
    ).reduce((sum, h) => sum + (h.hours || 0), 0);
    
    const laborCost = propertyHours * hourlyRate;
    
    return {
      monetaryExpenses: propertyExpenses,
      laborCost: laborCost,
      propertyHours: propertyHours,
      totalExpenses: propertyExpenses + laborCost
    };
  };
    // Conversion rate calculations
  const totalBuyerDeals = closedDeals.filter(deal => deal.type === 'Buyer').length;
  const totalSellerDeals = closedDeals.filter(deal => deal.type === 'Seller').length;
  
  // Also count properties that are marked as "Closed" but haven't been moved to closedDeals yet
  const closedProperties = properties.filter(p => p.status === 'Closed');
  const additionalBuyerDeals = closedProperties.filter(p => p.type === 'Buyer').length;
  const additionalSellerDeals = closedProperties.filter(p => p.type === 'Seller').length;
  
  const totalBuyerDealsComplete = totalBuyerDeals + additionalBuyerDeals;
  const totalSellerDealsComplete = totalSellerDeals + additionalSellerDeals;
  
  const totalBuyerContracts = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.buyerContracts || 0), 0);
  const totalListingAgreements = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.listingAgreements || 0), 0);
  const totalBuyerAppts = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.buyerAppts || 0), 0);
  const totalListingAppts = Object.values(dailyInputs).reduce((sum, day) => sum + (day?.listingsApptsTaken || 0), 0);
  
  // Conversion rates
  const buyerContractToClosingRate = totalBuyerContracts > 0 ? (totalBuyerDealsComplete / totalBuyerContracts) * 100 : 0;
  const listingAgreementToClosingRate = totalListingAgreements > 0 ? (totalSellerDealsComplete / totalListingAgreements) * 100 : 0;
  const buyerApptToContractRate = totalBuyerAppts > 0 ? (totalBuyerContracts / totalBuyerAppts) * 100 : 0;
  const listingApptToAgreementRate = totalListingAppts > 0 ? (totalListingAgreements / totalListingAppts) * 100 : 0;
  
  // Volume calculations
  const volumeUnderContract = contractTransactions.filter(t => t.status === 'Under Contract').reduce((sum, t) => sum + (t.price || 0), 0);
  const volumePending = contractTransactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + (t.price || 0), 0);
  
  // Weekly progress calculations
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth() + 1;
  const firstDayOfMonth = new Date(currentYear, currentMonthNum - 1, 1);
  const currentWeek = Math.ceil((currentDate.getDate() + firstDayOfMonth.getDay()) / 7);
  const { weeklyTotals } = calculateWeeklyMetrics(currentYear, currentMonthNum, currentWeek);
  
  const currentWeekData = {
    calls: weeklyTotals.calls,
    hours: weeklyTotals.hours,
    appointments: weeklyTotals.appointments,
    offersWritten: weeklyTotals.offersWritten,
    listingAgreements: weeklyTotals.listingAgreements,
    buyerContracts: weeklyTotals.buyerContracts
  };
  
  const weeklyProgress = {
    calls: goals.weekly.calls > 0 ? (currentWeekData.calls / goals.weekly.calls) * 100 : 0,
    hours: goals.weekly.hours > 0 ? (currentWeekData.hours / goals.weekly.hours) * 100 : 0,
    appointments: goals.weekly.appointments > 0 ? (currentWeekData.appointments / goals.weekly.appointments) * 100 : 0,
    offersWritten: goals.weekly.offersWritten > 0 ? (currentWeekData.offersWritten / goals.weekly.offersWritten) * 100 : 0,
    listingAgreements: goals.weekly.listingAgreements > 0 ? (currentWeekData.listingAgreements / goals.weekly.listingAgreements) * 100 : 0,
    buyerContracts: goals.weekly.buyerContracts > 0 ? (currentWeekData.buyerContracts / goals.weekly.buyerContracts) * 100 : 0
  };
  
  // Get today's data
  const today = new Date().toISOString().split('T')[0];
  const todayData = dailyInputs[today] || {};
  
  // Calculate daily progress (use dailyGoals if locked, otherwise use goals.daily)
  const activeGoals = dailyGoals.isLocked ? dailyGoals : goals.daily;
  const dailyProgress = {
    calls: activeGoals.calls > 0 ? ((todayData.callsMade || 0) / activeGoals.calls) * 100 : 0,
    hours: activeGoals.hours > 0 ? ((todayData.hoursWorked || 0) / activeGoals.hours) * 100 : 0,
    appointments: activeGoals.appointments > 0 ? (((todayData.listingsApptsTaken || 0) + (todayData.buyerAppts || 0)) / activeGoals.appointments) * 100 : 0,
    offersWritten: activeGoals.offersWritten > 0 ? ((todayData.offersWritten || 0) / activeGoals.offersWritten) * 100 : 0,
    listingAgreements: activeGoals.listingAgreements > 0 ? ((todayData.listingAgreements || 0) / activeGoals.listingAgreements) * 100 : 0,
    buyerContracts: activeGoals.buyerContracts > 0 ? ((todayData.buyerContracts || 0) / activeGoals.buyerContracts) * 100 : 0
  };
  
  // Event handlers
  const handlePropertySubmit = (e) => {
    e.preventDefault();
    const currentDate = new Date().toISOString().split('T')[0];
    
    const property = {
      ...newProperty,
      timestamp: new Date().toLocaleString(),
      commission: newProperty.price * (newProperty.commissionPercent / 100),
      statusDates: {
        listedDate: (newProperty.status === 'Active' || newProperty.status === 'Listed') ? currentDate : null,
        underContractDate: newProperty.status === 'Under Contract' ? currentDate : null,
        pendingDate: newProperty.status === 'Pending' ? currentDate : null,
        closedDate: newProperty.status === 'Closed' ? currentDate : null
      }
    };
    setProperties([...properties, property]);
    
    setNewProperty({ 
      address: '', client: '', type: 'Seller', price: 0, commission: 0, commissionPercent: 2.5, 
      month: 'January', timestamp: '', status: 'In Progress', leadSource: 'Social Media',
      offerWritten: false, offerAccepted: false 
    });
  };
  
  const handleStatusChange = (index, newStatus) => {
    const property = properties[index];
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Initialize status dates if they don't exist
    const statusDates = property.statusDates || {};
      // Update status dates based on new status
    if ((newStatus === 'Active' || newStatus === 'Listed') && !statusDates.listedDate) {
      statusDates.listedDate = currentDate;
    } else if (newStatus === 'Under Contract' && !statusDates.underContractDate) {
      statusDates.underContractDate = currentDate;
    } else if (newStatus === 'Pending' && !statusDates.pendingDate) {
      statusDates.pendingDate = currentDate;
    } else if (newStatus === 'Closed' && !statusDates.closedDate) {
      statusDates.closedDate = currentDate;
    }
    
    if (newStatus === 'Closed') {
      if (window.confirm(`Are you sure you want to close "${property.address}"? This will move it to closed deals.`)) {
        // Get all hours and expenses for this property using the helper function
        const expenseData = calculateTotalExpensesWithLabor(property.address, property.client);
        
        const propertyHours = hours.filter(h => 
          h.propertyClient && (
            h.propertyClient.toLowerCase().includes(property.address.toLowerCase()) ||
            h.propertyClient.toLowerCase().includes(property.client?.toLowerCase() || '')
          )
        );
        
        const propertyExpenses = expenses.filter(e => 
          e.propertyClient && (
            e.propertyClient.toLowerCase().includes(property.address.toLowerCase()) ||
            e.propertyClient.toLowerCase().includes(property.client?.toLowerCase() || '')
          )
        );
        
        const closedProperty = {
          ...property,
          status: 'Closed',
          closedDate: currentDate,
          statusDates: statusDates,
          totalHours: expenseData.propertyHours,
          totalExpenses: expenseData.totalExpenses,
          laborCost: expenseData.laborCost,
          monetaryExpenses: expenseData.monetaryExpenses,
          hoursDetails: propertyHours,
          expensesDetails: propertyExpenses
        };
        setClosedDeals([...closedDeals, closedProperty]);
        
        // Update the property in the properties list instead of removing it
        const updatedProperties = [...properties];
        updatedProperties[index] = {
          ...property,
          status: 'Closed',
          statusDates: statusDates
        };
        setProperties(updatedProperties);
      }
    } else if (newStatus === 'Under Contract' || newStatus === 'Pending') {
      // Check if transaction already exists to avoid duplicates
      const existingTransaction = contractTransactions.find(t => 
        t.address === property.address && t.client === property.client
      );
        if (!existingTransaction) {
        // Get all hours and expenses for this property        // Get all hours and expenses for this property using the helper function
        const expenseData = calculateTotalExpensesWithLabor(property.address, property.client);
        
        const propertyHours = hours.filter(h => 
          h.propertyClient && (
            h.propertyClient.toLowerCase().includes(property.address.toLowerCase()) ||
            h.propertyClient.toLowerCase().includes(property.client?.toLowerCase() || '')
          )
        );
        
        const propertyExpenses = expenses.filter(e => 
          e.propertyClient && (
            e.propertyClient.toLowerCase().includes(property.address.toLowerCase()) ||
            e.propertyClient.toLowerCase().includes(property.client?.toLowerCase() || '')
          )
        );
          // Auto-move to transactions only if not already there
        const transaction = {
          address: property.address,
          client: property.client,
          price: property.price,
          commission: property.commission || (property.price * 0.025),
          commissionPercent: property.commissionPercent || 2.5,
          status: newStatus,
          date: currentDate,
          type: property.type,
          totalHours: expenseData.propertyHours,
          totalExpenses: expenseData.totalExpenses,
          laborCost: expenseData.laborCost,
          monetaryExpenses: expenseData.monetaryExpenses,
          hoursDetails: propertyHours,
          expensesDetails: propertyExpenses,
          statusDates: statusDates
        };setContractTransactions([...contractTransactions, transaction]);
      } else {
        // Update existing transaction status
        const updatedTransactions = contractTransactions.map(t => 
          (t.address === property.address && t.client === property.client) 
            ? { ...t, status: newStatus, date: currentDate, statusDates: statusDates }
            : t
        );
        setContractTransactions(updatedTransactions);
      }
      
      // Remove property from main properties list when it goes under contract
      const updatedProperties = properties.filter((_, propIndex) => propIndex !== index);
      setProperties(updatedProperties);
    } else if (['Terminated', 'Withdrawn', 'Expired', 'Fired Client'].includes(newStatus)) {
      // Handle terminated, withdrawn, expired, and fired client statuses
      const existingTransaction = contractTransactions.find(t => 
        t.address === property.address && t.client === property.client
      );
      
      if (!existingTransaction) {
        // Get all hours and expenses for this property        // Get all hours and expenses for this property using the helper function
        const expenseData = calculateTotalExpensesWithLabor(property.address, property.client);
        
        const propertyHours = hours.filter(h => 
          h.propertyClient && (
            h.propertyClient.toLowerCase().includes(property.address.toLowerCase()) ||
            h.propertyClient.toLowerCase().includes(property.client?.toLowerCase() || '')
          )
        );
        
        const propertyExpenses = expenses.filter(e => 
          e.propertyClient && (
            e.propertyClient.toLowerCase().includes(property.address.toLowerCase()) ||
            e.propertyClient.toLowerCase().includes(property.client?.toLowerCase() || '')
          )
        );
          // Move to transactions with terminated status
        const transaction = {
          address: property.address,
          client: property.client,
          price: property.price,
          commission: 0, // No commission for terminated deals
          commissionPercent: property.commissionPercent || 2.5,
          status: newStatus,
          date: currentDate,
          type: property.type,
          totalHours: expenseData.propertyHours,
          totalExpenses: expenseData.totalExpenses,
          laborCost: expenseData.laborCost,
          monetaryExpenses: expenseData.monetaryExpenses,
          hoursDetails: propertyHours,
          expensesDetails: propertyExpenses,
          statusDates: statusDates,
          firedClientNote: newStatus === 'Fired Client' ? prompt('Why was this client fired? (Optional note):') || '' : ''
        };
        setContractTransactions([...contractTransactions, transaction]);
      } else {        // Update existing transaction status
        const updatedTransactions = contractTransactions.map(t => 
          (t.address === property.address && t.client === property.client) 
            ? { 
                ...t, 
                status: newStatus, 
                date: currentDate, 
                statusDates: statusDates, 
                commission: 0,
                firedClientNote: newStatus === 'Fired Client' ? prompt('Why was this client fired? (Optional note):') || t.firedClientNote || '' : t.firedClientNote
              }
            : t
        );
        setContractTransactions(updatedTransactions);
      }
      
      // Remove property from main properties list
      const updatedProperties = properties.filter((_, propIndex) => propIndex !== index);
      setProperties(updatedProperties);
    } else {
      // Update property status and dates for other status changes
      const updatedProperties = [...properties];
      updatedProperties[index] = {
        ...property,
        status: newStatus,
        statusDates: statusDates
      };      setProperties(updatedProperties);
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
    
    // Calculate total expenses including labor for this transaction
    const expenseData = calculateTotalExpensesWithLabor(newTransaction.address, newTransaction.client);
    
    const transaction = {
      ...newTransaction,
      timestamp: new Date().toLocaleString(),
      totalHours: expenseData.propertyHours,
      totalExpenses: expenseData.totalExpenses,
      laborCost: expenseData.laborCost,
      monetaryExpenses: expenseData.monetaryExpenses
    };
    setContractTransactions([...contractTransactions, transaction]);
    setNewTransaction({ address: '', client: '', price: 0, commission: 0, commissionPercent: 2.5, status: 'Under Contract', date: new Date().toISOString().split('T')[0] });
  };
  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    const expense = {
      ...newExpense,
      timestamp: new Date().toLocaleString()
    };
    const updatedExpenses = [...expenses, expense];
    setExpenses(updatedExpenses);
    
    // Update closed deals with new expense totals
    updateClosedDealsWithExpensesAndHours(updatedExpenses, hours);
    
    setNewExpense({ propertyClient: '', category: 'Marketing & Advertising', amount: 0, month: 'January', timestamp: '', mileage: 0, gasPrice: 0 });
  };

  const handleHourSubmit = (e) => {
    e.preventDefault();
    const hour = {
      ...newHour,
      timestamp: new Date().toLocaleString()
    };
    const updatedHours = [...hours, hour];
    setHours(updatedHours);
    
    // Update closed deals with new hour totals
    updateClosedDealsWithExpensesAndHours(expenses, updatedHours);
    
    setNewHour({ propertyClient: '', dayOfWeek: 'Monday', hours: 0, month: 'January', timestamp: '' });
  };  // Function to update closed deals with current expenses and hours
  const updateClosedDealsWithExpensesAndHours = (currentExpenses, currentHours) => {
    const updatedClosedDeals = closedDeals.map(deal => {
      // Use the helper function to calculate all expenses including labor
      const expenseData = calculateTotalExpensesWithLabor(deal.address, deal.client);
      
      // Find expenses for this deal
      const dealExpenses = currentExpenses.filter(e => 
        e.propertyClient && deal.address && 
        e.propertyClient.toLowerCase().includes(deal.address.toLowerCase())
      );
      
      // Find hours for this deal
      const dealHours = currentHours.filter(h => 
        h.propertyClient && deal.address && 
        h.propertyClient.toLowerCase().includes(deal.address.toLowerCase())
      );
      
      return {
        ...deal,
        totalExpenses: expenseData.totalExpenses,
        totalHours: expenseData.propertyHours,
        laborCost: expenseData.laborCost,
        monetaryExpenses: expenseData.monetaryExpenses,
        expensesDetails: dealExpenses,
        hoursDetails: dealHours
      };
    });
    
    setClosedDeals(updatedClosedDeals);
    
    // Also update contract transactions
    const updatedTransactions = contractTransactions.map(transaction => {
      // Use the helper function to calculate all expenses including labor
      const expenseData = calculateTotalExpensesWithLabor(transaction.address, transaction.client);
      
      // Find expenses for this transaction
      const transactionExpenses = currentExpenses.filter(e => 
        e.propertyClient && transaction.address && 
        e.propertyClient.toLowerCase().includes(transaction.address.toLowerCase())
      );
      
      // Find hours for this transaction
      const transactionHours = currentHours.filter(h => 
        h.propertyClient && transaction.address && 
        h.propertyClient.toLowerCase().includes(transaction.address.toLowerCase())
      );
        return {
        ...transaction,
        totalExpenses: expenseData.totalExpenses,
        totalHours: expenseData.propertyHours,
        laborCost: expenseData.laborCost,
        monetaryExpenses: expenseData.monetaryExpenses,
        expensesDetails: transactionExpenses,
        hoursDetails: transactionHours
      };
    });
    
    setContractTransactions(updatedTransactions);
  };
  
  const getPropertyAddresses = () => {
    // Include properties from all lifecycle stages
    const allProperties = [
      ...properties, // Current properties in main list
      ...contractTransactions, // Under contract, pending, closed, withdrawn, expired, terminated, fired client
      ...closedDeals // Closed deals
    ];
    
    return allProperties
      .map(p => p.address)
      .filter(Boolean)
      .filter((address, index, self) => self.indexOf(address) === index); // Remove duplicates
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
  };  // Chart initialization with error handling
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
          
          // Create chart based on active tab
          if (activeTab === 'insights') {
            // Activity Timeline Chart
            const last30Days = Array.from({length: 30}, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (29 - i));
              return date.toISOString().split('T')[0];
            });
            
            const activityData = last30Days.map(date => {
              const dayData = dailyInputs[date] || {};
              return {
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                calls: dayData.callsMade || 0,
                hours: dayData.hoursWorked || 0,
                appointments: (dayData.listingsApptsTaken || 0) + (dayData.buyerAppts || 0),
                total: (dayData.callsMade || 0) + (dayData.hoursWorked || 0) + ((dayData.listingsApptsTaken || 0) + (dayData.buyerAppts || 0))
              };
            });
            
            chartRef.current.chart = new ChartJS(ctx, {
              type: 'line',
              data: {
                labels: activityData.map(d => d.date),
                datasets: [
                  {
                    label: 'Calls Made',
                    data: activityData.map(d => d.calls),
                    borderColor: '#C5A95E',
                    backgroundColor: 'rgba(197, 169, 94, 0.1)',
                    tension: 0.4
                  },
                  {
                    label: 'Hours Worked',
                    data: activityData.map(d => d.hours),
                    borderColor: '#17a2b8',
                    backgroundColor: 'rgba(23, 162, 184, 0.1)',
                    tension: 0.4
                  },
                  {
                    label: 'Appointments',
                    data: activityData.map(d => d.appointments),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  intersect: false,
                  mode: 'index'
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: '#666'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#666'
                    }
                  }
                },
                plugins: {
                  legend: {
                    labels: {
                      color: '#333'
                    }
                  },
                  title: {
                    display: true,
                    text: 'Daily Activity Trends (Last 30 Days)',
                    color: '#333'
                  }
                }
              }
            });
          } else {
            // Original chart for other tabs
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
          }
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
  }, [chartData, activeTab, dailyInputs]);  // Save to localStorage
  useEffect(() => {
    try {      localStorage.setItem('properties', JSON.stringify(properties));
      localStorage.setItem('dailyInputs', JSON.stringify(dailyInputs));
      localStorage.setItem('goals', JSON.stringify(goals));
      localStorage.setItem('dailyGoals', JSON.stringify(dailyGoals));
      localStorage.setItem('closedDeals', JSON.stringify(closedDeals));
      localStorage.setItem('appName', appName);      localStorage.setItem('reportEmail', reportEmail);
      localStorage.setItem('reportPhone', reportPhone);
      localStorage.setItem('manualHourlyRate', manualHourlyRate.toString());
      localStorage.setItem('manualPerformanceMetrics', JSON.stringify(manualPerformanceMetrics));
      localStorage.setItem('experienceLevelBonuses', JSON.stringify(experienceLevelBonuses));
      localStorage.setItem('stepLevelBonuses', JSON.stringify(stepLevelBonuses));
      localStorage.setItem('emailConfig', JSON.stringify(emailConfig));
      localStorage.setItem('smsConfig', JSON.stringify(smsConfig));
      localStorage.setItem('expenses', JSON.stringify(expenses));
      localStorage.setItem('hours', JSON.stringify(hours));
      localStorage.setItem('contractTransactions', JSON.stringify(contractTransactions));
      localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
      localStorage.setItem('gciData', JSON.stringify(gciData));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [properties, dailyInputs, goals, dailyGoals, closedDeals, appName, reportEmail, reportPhone, manualHourlyRate, manualPerformanceMetrics, experienceLevelBonuses, stepLevelBonuses, emailConfig, smsConfig, expenses, hours, contractTransactions, calendarEvents, gciData]);

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
          Properties
        </div>        <div 
          className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          Goals & Progress
        </div>        <div 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </div>        <div 
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
        </div>        <div 
          className={`tab ${activeTab === 'gci' ? 'active' : ''}`}
          onClick={() => setActiveTab('gci')}
        >
          GCI Calculator
        </div>        <div 
          className={`tab ${activeTab === 'weeklyReports' ? 'active' : ''}`}
          onClick={() => setActiveTab('weeklyReports')}
        >
          Weekly Reports
        </div>        <div 
          className={`tab ${activeTab === 'conversionRates' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversionRates')}
        >          Conversion Rates        </div>
        <div 
          className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </div>
        <div 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </div>
        <div 
          className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          Insights
        </div>
      </div>      {/* Goals Tab */}      {activeTab === 'goals' && (
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
              <div className="grid" style={{gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem'}}>
                <div>
                  <h4>Daily Goals</h4>
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
                </div>
                <div>
                  <h4>Weekly Goals</h4>
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
                </div>
                <div>
                  <h4>Monthly Goals</h4>
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
                </div>              </div>
              <div style={{display: 'flex', justifyContent: 'flex-start', marginTop: '1rem'}}>
                <button type="submit" style={{
                  padding: '0.5rem 1rem', 
                  fontSize: '0.9rem', 
                  backgroundColor: '#C5A95E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  maxWidth: '150px'
                }}>
                  Update Goals
                </button>
              </div>
            </form>
          </div>
          
          {/* Daily Goals with Progress Tracking */}
          <div className="section">
            <h3>Daily Goals Tracker</h3>
            <div style={{
              border: '2px solid #C5A95E',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: dailyGoals.isLocked ? '#f8f9fa' : '#ffffff',
              marginBottom: '1rem'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h4>Set Your Daily Goals</h4>
                {!dailyGoals.isLocked && (
                  <button
                    onClick={() => {
                      // Lock the goals (no unlock option)
                      setDailyGoals(prev => ({ ...prev, isLocked: true }));
                      // Also update the main goals state to match
                      setGoals(prev => ({
                        ...prev,
                        daily: {
                          calls: dailyGoals.calls,
                          hours: dailyGoals.hours,
                          appointments: dailyGoals.appointments,
                          offersWritten: dailyGoals.offersWritten,
                          listingAgreements: dailyGoals.listingAgreements,
                          buyerContracts: dailyGoals.buyerContracts
                        }
                      }));
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🔓 Lock Goals
                  </button>
                )}
              </div>
              
              {dailyGoals.isLocked && (
                <div style={{
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '4px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  color: '#155724'
                }}>
                  <strong>🔒 Goals Locked!</strong> Your daily goals are now set and will auto-calculate your progress. Goals cannot be unlocked once locked.
                </div>
              )}
              
              <div className="grid" style={{gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem'}}>
                <div>
                  <label>Daily Calls Goal</label>
                  <input
                    type="number"
                    value={dailyGoals.calls}
                    onChange={(e) => setDailyGoals(prev => ({ ...prev, calls: parseInt(e.target.value) || 0 }))}
                    disabled={dailyGoals.isLocked}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: dailyGoals.isLocked ? '#e9ecef' : 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: dailyProgress.calls >= 100 ? '#d4edda' : dailyProgress.calls >= 75 ? '#fff3cd' : '#f8d7da',
                    border: `1px solid ${dailyProgress.calls >= 100 ? '#c3e6cb' : dailyProgress.calls >= 75 ? '#ffeaa7' : '#f5c6cb'}`,
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    Progress: {Math.round(dailyProgress.calls)}%
                    <br />
                    <small>{todayData.callsMade || 0} / {dailyGoals.calls}</small>
                  </div>
                </div>
                <div>
                  <label>Daily Hours Goal</label>
                  <input
                    type="number"
                    value={dailyGoals.hours}
                    onChange={(e) => setDailyGoals(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                    disabled={dailyGoals.isLocked}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: dailyGoals.isLocked ? '#e9ecef' : 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: dailyProgress.hours >= 100 ? '#d4edda' : dailyProgress.hours >= 75 ? '#fff3cd' : '#f8d7da',
                    border: `1px solid ${dailyProgress.hours >= 100 ? '#c3e6cb' : dailyProgress.hours >= 75 ? '#ffeaa7' : '#f5c6cb'}`,
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    Progress: {Math.round(dailyProgress.hours)}%
                    <br />
                    <small>{todayData.hoursWorked || 0} / {dailyGoals.hours}</small>
                  </div>
                </div>
                <div>
                  <label>Daily Appointments Goal</label>
                  <input
                    type="number"
                    value={dailyGoals.appointments}
                    onChange={(e) => setDailyGoals(prev => ({ ...prev, appointments: parseInt(e.target.value) || 0 }))}
                    disabled={dailyGoals.isLocked}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: dailyGoals.isLocked ? '#e9ecef' : 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: dailyProgress.appointments >= 100 ? '#d4edda' : dailyProgress.appointments >= 75 ? '#fff3cd' : '#f8d7da',
                    border: `1px solid ${dailyProgress.appointments >= 100 ? '#c3e6cb' : dailyProgress.appointments >= 75 ? '#ffeaa7' : '#f5c6cb'}`,
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    Progress: {Math.round(dailyProgress.appointments)}%
                    <br />
                    <small>{((todayData.listingsApptsTaken || 0) + (todayData.buyerAppts || 0))} / {dailyGoals.appointments}</small>
                  </div>
                </div>
                <div>
                  <label>Daily Offers Written Goal</label>
                  <input
                    type="number"
                    value={dailyGoals.offersWritten}
                    onChange={(e) => setDailyGoals(prev => ({ ...prev, offersWritten: parseInt(e.target.value) || 0 }))}
                    disabled={dailyGoals.isLocked}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: dailyGoals.isLocked ? '#e9ecef' : 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: dailyProgress.offersWritten >= 100 ? '#d4edda' : dailyProgress.offersWritten >= 75 ? '#fff3cd' : '#f8d7da',
                    border: `1px solid ${dailyProgress.offersWritten >= 100 ? '#c3e6cb' : dailyProgress.offersWritten >= 75 ? '#ffeaa7' : '#f5c6cb'}`,
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    Progress: {Math.round(dailyProgress.offersWritten)}%
                    <br />
                    <small>{todayData.offersWritten || 0} / {dailyGoals.offersWritten}</small>
                  </div>
                </div>
                <div>
                  <label>Daily Listing Agreements Goal</label>
                  <input
                    type="number"
                    value={dailyGoals.listingAgreements}
                    onChange={(e) => setDailyGoals(prev => ({ ...prev, listingAgreements: parseInt(e.target.value) || 0 }))}
                    disabled={dailyGoals.isLocked}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: dailyGoals.isLocked ? '#e9ecef' : 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: dailyProgress.listingAgreements >= 100 ? '#d4edda' : dailyProgress.listingAgreements >= 75 ? '#fff3cd' : '#f8d7da',
                    border: `1px solid ${dailyProgress.listingAgreements >= 100 ? '#c3e6cb' : dailyProgress.listingAgreements >= 75 ? '#ffeaa7' : '#f5c6cb'}`,
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    Progress: {Math.round(dailyProgress.listingAgreements)}%
                    <br />
                    <small>{todayData.listingAgreements || 0} / {dailyGoals.listingAgreements}</small>
                  </div>
                </div>
                <div>
                  <label>Daily Buyer Contracts Goal</label>
                  <input
                    type="number"
                    value={dailyGoals.buyerContracts}
                    onChange={(e) => setDailyGoals(prev => ({ ...prev, buyerContracts: parseInt(e.target.value) || 0 }))}
                    disabled={dailyGoals.isLocked}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: dailyGoals.isLocked ? '#e9ecef' : 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: dailyProgress.buyerContracts >= 100 ? '#d4edda' : dailyProgress.buyerContracts >= 75 ? '#fff3cd' : '#f8d7da',
                    border: `1px solid ${dailyProgress.buyerContracts >= 100 ? '#c3e6cb' : dailyProgress.buyerContracts >= 75 ? '#ffeaa7' : '#f5c6cb'}`,
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    Progress: {Math.round(dailyProgress.buyerContracts)}%
                    <br />
                    <small>{todayData.buyerContracts || 0} / {dailyGoals.buyerContracts}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="section">
            <h3>Daily Progress Input</h3>
            <div style={{marginBottom: '1rem'}}>
              <label>Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{marginLeft: '0.5rem', padding: '0.5rem'}}
              />
            </div>
            
            <div className="grid" style={{gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem'}}>
              <div>
                <label>Hours Worked</label>
                <input
                  type="number"
                  name="hoursWorked"
                  value={dailyInputs[selectedDate]?.hoursWorked || 0}
                  onChange={handleDailyInputChange}
                  style={{width: '100%', padding: '0.5rem'}}
                />
              </div>
              <div>
                <label>Calls Made</label>
                <input
                  type="number"
                  name="callsMade"
                  value={dailyInputs[selectedDate]?.callsMade || 0}
                  onChange={handleDailyInputChange}
                  style={{width: '100%', padding: '0.5rem'}}
                />
              </div>
              <div>
                <label>Listing Appointments</label>
                <input
                  type="number"
                  name="listingsApptsTaken"
                  value={dailyInputs[selectedDate]?.listingsApptsTaken || 0}
                  onChange={handleDailyInputChange}
                  style={{width: '100%', padding: '0.5rem'}}
                />
              </div>
              <div>
                <label>Buyer Appointments</label>
                <input
                  type="number"
                  name="buyerAppts"
                  value={dailyInputs[selectedDate]?.buyerAppts || 0}
                  onChange={handleDailyInputChange}
                  style={{width: '100%', padding: '0.5rem'}}
                />
              </div>
              <div>
                <label>Offers Written</label>
                <input
                  type="number"
                  name="offersWritten"
                  value={dailyInputs[selectedDate]?.offersWritten || 0}
                  onChange={handleDailyInputChange}
                  style={{width: '100%', padding: '0.5rem'}}
                />
              </div>
              <div>
                <label>Listing Agreements</label>
                <input
                  type="number"
                  name="listingAgreements"
                  value={dailyInputs[selectedDate]?.listingAgreements || 0}
                  onChange={handleDailyInputChange}
                  style={{width: '100%', padding: '0.5rem'}}
                />
              </div>
              <div>
                <label>Buyer Contracts</label>
                <input
                  type="number"
                  name="buyerContracts"
                  value={dailyInputs[selectedDate]?.buyerContracts || 0}
                  onChange={handleDailyInputChange}
                  style={{width: '100%', padding: '0.5rem'}}
                />
              </div>
            </div>
          </div>
            <div className="section">
            <h3>Today's Progress vs Goals</h3>
            <div className="grid">
              <div className="tile">
                <h3>Daily Calls</h3>
                <p style={{color: dailyProgress.calls >= 100 ? '#28a745' : dailyProgress.calls >= 80 ? '#fd7e14' : '#dc3545'}}>{dailyProgress.calls.toFixed(1)}%</p>
                <small>{todayData.callsMade || 0} / {goals.daily.calls}</small>
              </div>
              <div className="tile">
                <h3>Daily Hours</h3>
                <p style={{color: dailyProgress.hours >= 100 ? '#28a745' : dailyProgress.hours >= 80 ? '#fd7e14' : '#dc3545'}}>{dailyProgress.hours.toFixed(1)}%</p>
                <small>{todayData.hoursWorked || 0} / {goals.daily.hours}</small>
              </div>
              <div className="tile">
                <h3>Daily Appointments</h3>
                <p style={{color: dailyProgress.appointments >= 100 ? '#28a745' : dailyProgress.appointments >= 80 ? '#fd7e14' : '#dc3545'}}>{dailyProgress.appointments.toFixed(1)}%</p>
                <small>{(todayData.listingsApptsTaken || 0) + (todayData.buyerAppts || 0)} / {goals.daily.appointments}</small>
              </div>
              <div className="tile">
                <h3>Daily Offers Written</h3>
                <p style={{color: dailyProgress.offersWritten >= 100 ? '#28a745' : dailyProgress.offersWritten >= 80 ? '#fd7e14' : '#dc3545'}}>{dailyProgress.offersWritten.toFixed(1)}%</p>
                <small>{todayData.offersWritten || 0} / {goals.daily.offersWritten}</small>
              </div>
              <div className="tile">
                <h3>Daily Listing Agreements</h3>
                <p style={{color: dailyProgress.listingAgreements >= 100 ? '#28a745' : dailyProgress.listingAgreements >= 80 ? '#fd7e14' : '#dc3545'}}>{dailyProgress.listingAgreements.toFixed(1)}%</p>
                <small>{todayData.listingAgreements || 0} / {goals.daily.listingAgreements}</small>
              </div>
              <div className="tile">
                <h3>Daily Buyer Contracts</h3>
                <p style={{color: dailyProgress.buyerContracts >= 100 ? '#28a745' : dailyProgress.buyerContracts >= 80 ? '#fd7e14' : '#dc3545'}}>{dailyProgress.buyerContracts.toFixed(1)}%</p>
                <small>{todayData.buyerContracts || 0} / {goals.daily.buyerContracts}</small>
              </div>
            </div>
          </div>
            <div className="section">
            <h3>Weekly Progress vs Goals</h3>
            <div className="grid">
              <div className="tile">
                <h4>Weekly Calls</h4>
                <p style={{color: weeklyProgress.calls >= 100 ? '#28a745' : weeklyProgress.calls >= 80 ? '#fd7e14' : '#dc3545'}}>{weeklyProgress.calls.toFixed(1)}%</p>
                <small>{currentWeekData.calls} / {goals.weekly.calls}</small>
              </div>
              <div className="tile">
                <h4>Weekly Hours</h4>
                <p style={{color: weeklyProgress.hours >= 100 ? '#28a745' : weeklyProgress.hours >= 80 ? '#fd7e14' : '#dc3545'}}>{weeklyProgress.hours.toFixed(1)}%</p>
                <small>{currentWeekData.hours} / {goals.weekly.hours}</small>
              </div>
              <div className="tile">
                <h4>Weekly Appointments</h4>
                <p style={{color: weeklyProgress.appointments >= 100 ? '#28a745' : weeklyProgress.appointments >= 80 ? '#fd7e14' : '#dc3545'}}>{weeklyProgress.appointments.toFixed(1)}%</p>
                <small>{currentWeekData.appointments} / {goals.weekly.appointments}</small>
              </div>
              <div className="tile">
                <h4>Weekly Offers Written</h4>
                <p style={{color: weeklyProgress.offersWritten >= 100 ? '#28a745' : weeklyProgress.offersWritten >= 80 ? '#fd7e14' : '#dc3545'}}>{weeklyProgress.offersWritten.toFixed(1)}%</p>
                <small>{currentWeekData.offersWritten} / {goals.weekly.offersWritten}</small>
              </div>
              <div className="tile">
                <h4>Weekly Listing Agreements</h4>
                <p style={{color: weeklyProgress.listingAgreements >= 100 ? '#28a745' : weeklyProgress.listingAgreements >= 80 ? '#fd7e14' : '#dc3545'}}>{weeklyProgress.listingAgreements.toFixed(1)}%</p>
                <small>{currentWeekData.listingAgreements} / {goals.weekly.listingAgreements}</small>
              </div>
              <div className="tile">
                <h4>Weekly Buyer Contracts</h4>
                <p style={{color: weeklyProgress.buyerContracts >= 100 ? '#28a745' : weeklyProgress.buyerContracts >= 80 ? '#fd7e14' : '#dc3545'}}>{weeklyProgress.buyerContracts.toFixed(1)}%</p>
                <small>{currentWeekData.buyerContracts} / {goals.weekly.buyerContracts}</small>
              </div>
            </div>
          </div>
            <div className="section">
            <h3>Monthly Progress vs Goals</h3>
            <div className="grid">
              <div className="tile">
                <h4>Monthly Calls</h4>
                <p style={{color: monthlyProgress.calls >= 100 ? '#28a745' : monthlyProgress.calls >= 80 ? '#fd7e14' : '#dc3545'}}>{monthlyProgress.calls.toFixed(1)}%</p>
                <small>{currentMonthData.calls} / {goals.monthly.calls}</small>
              </div>
              <div className="tile">
                <h4>Monthly Hours</h4>
                <p style={{color: monthlyProgress.hours >= 100 ? '#28a745' : monthlyProgress.hours >= 80 ? '#fd7e14' : '#dc3545'}}>{monthlyProgress.hours.toFixed(1)}%</p>
                <small>{currentMonthData.hours} / {goals.monthly.hours}</small>
              </div>
              <div className="tile">
                <h4>Monthly Appointments</h4>
                <p style={{color: monthlyProgress.appointments >= 100 ? '#28a745' : monthlyProgress.appointments >= 80 ? '#fd7e14' : '#dc3545'}}>{monthlyProgress.appointments.toFixed(1)}%</p>
                <small>{currentMonthData.listingAppts + currentMonthData.buyerAppts} / {goals.monthly.appointments}</small>
              </div>
              <div className="tile">
                <h4>Monthly Offers Written</h4>
                <p style={{color: monthlyProgress.offersWritten >= 100 ? '#28a745' : monthlyProgress.offersWritten >= 80 ? '#fd7e14' : '#dc3545'}}>{monthlyProgress.offersWritten.toFixed(1)}%</p>
                <small>{currentMonthData.offersWritten} / {goals.monthly.offersWritten}</small>
              </div>
              <div className="tile">
                <h4>Monthly Listing Agreements</h4>
                <p style={{color: monthlyProgress.listingAgreements >= 100 ? '#28a745' : monthlyProgress.listingAgreements >= 80 ? '#fd7e14' : '#dc3545'}}>{monthlyProgress.listingAgreements.toFixed(1)}%</p>
                <small>{currentMonthData.listingAgreements} / {goals.monthly.listingAgreements}</small>
              </div>
              <div className="tile">
                <h4>Monthly Buyer Contracts</h4>
                <p style={{color: monthlyProgress.buyerContracts >= 100 ? '#28a745' : monthlyProgress.buyerContracts >= 80 ? '#fd7e14' : '#dc3545'}}>{monthlyProgress.buyerContracts.toFixed(1)}%</p>
                <small>{currentMonthData.buyerContracts} / {goals.monthly.buyerContracts}</small>
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
              <label>Type</label>              <select
                value={newProperty.type}
                onChange={e => {
                  const newType = e.target.value;
                  const calculatedCommission = newProperty.price * (newProperty.commissionPercent / 100);
                  setNewProperty({ 
                    ...newProperty, 
                    type: newType,
                    commission: calculatedCommission
                  });
                }}
              >
                <option value="Seller">Seller</option>
                <option value="Buyer">Buyer</option>
              </select>
            </div>
            <div>
              <label>Price ($)</label>              <input
                type="number"
                value={newProperty.price}
                onChange={e => {
                  const price = parseFloat(e.target.value) || 0;
                  const calculatedCommission = (price * (newProperty.commissionPercent / 100));
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
                value={newProperty.commissionPercent}                onChange={e => {
                  const percent = parseFloat(e.target.value) || 2.5;
                  const calculatedCommission = (newProperty.price * (percent / 100));
                  setNewProperty({ 
                    ...newProperty, 
                    commissionPercent: percent,
                    commission: calculatedCommission
                  });
                }}
              />              <small style={{color: '#666', fontSize: '0.8rem'}}>
                Calculated: ${(newProperty.price * (newProperty.commissionPercent / 100)).toFixed(2)}
              </small>
            </div>
            <div>
              <label>Commission Override ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newProperty.commission}
                onChange={e => {
                  const manualCommission = parseFloat(e.target.value) || 0;
                  setNewProperty({ 
                    ...newProperty, 
                    commission: manualCommission
                  });
                }}
                placeholder="Leave blank to use calculated amount"
              />              <small style={{color: '#666', fontSize: '0.8rem'}}>
                Override the calculated commission if needed
              </small>
            </div>
            <button type="submit">Add Property</button>
          </form>            <table>
              <thead>
                <tr>                  <th>Address</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Price ($)</th>
                  <th>Commission ($)</th>
                  <th>Total Hours</th>
                  <th>Total Expenses</th>
                  <th>Offer Written</th>
                  <th>Offer Accepted</th>
                  <th>Listed Date</th>
                  <th>Under Contract</th>
                  <th>Pending Date</th>
                  <th>Closed Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
            <tbody>              {properties.map((p, i) => {
                // Use the helper function to calculate all expenses including labor
                const expenseData = calculateTotalExpensesWithLabor(p.address, p.client);
                const propertyHours = expenseData.propertyHours;
                
                return (
                  <>                    <tr key={i}>                      <td>{p.address}</td>
                      <td>{p.client || '-'}</td>
                      <td>{p.type}</td>
                      <td>${p.price?.toLocaleString() || 0}</td>
                      <td>${p.commission?.toFixed(2) || 0}</td>
                      <td style={{color: '#28a745', fontWeight: 'bold'}}>{propertyHours.toFixed(1)}</td>
                      <td style={{color: '#dc3545', fontWeight: 'bold'}}>${expenseData.totalExpenses.toFixed(2)}</td>
                      <td style={{textAlign: 'center'}}>
                        <select
                          value={p.offerWritten ? 'yes' : 'no'}
                          onChange={(e) => {
                            const updatedProperties = [...properties];
                            updatedProperties[i] = { 
                              ...p, 
                              offerWritten: e.target.value === 'yes',
                              offerAccepted: e.target.value === 'no' ? false : p.offerAccepted
                            };
                            setProperties(updatedProperties);
                          }}
                          style={{
                            padding: '0.25rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            backgroundColor: p.offerWritten ? '#d4edda' : '#f8d7da',
                            color: p.offerWritten ? '#155724' : '#721c24'
                          }}
                        >
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </td>
                      <td style={{textAlign: 'center'}}>
                        <select
                          value={p.offerAccepted ? 'yes' : 'no'}
                          onChange={(e) => {
                            const updatedProperties = [...properties];
                            updatedProperties[i] = { 
                              ...p, 
                              offerAccepted: e.target.value === 'yes'
                            };
                            setProperties(updatedProperties);
                          }}
                          disabled={!p.offerWritten}
                          style={{
                            padding: '0.25rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            backgroundColor: !p.offerWritten ? '#f5f5f5' : (p.offerAccepted ? '#d4edda' : '#f8d7da'),
                            color: !p.offerWritten ? '#666' : (p.offerAccepted ? '#155724' : '#721c24'),
                            cursor: !p.offerWritten ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </td>
                      <td style={{fontSize: '0.8rem'}}>{p.statusDates?.listedDate ? new Date(p.statusDates.listedDate).toLocaleDateString() : '-'}</td>
                      <td style={{fontSize: '0.8rem'}}>{p.statusDates?.underContractDate ? new Date(p.statusDates.underContractDate).toLocaleDateString() : '-'}</td>
                      <td style={{fontSize: '0.8rem'}}>{p.statusDates?.pendingDate ? new Date(p.statusDates.pendingDate).toLocaleDateString() : '-'}</td>
                      <td style={{fontSize: '0.8rem'}}>{p.statusDates?.closedDate ? new Date(p.statusDates.closedDate).toLocaleDateString() : '-'}</td>
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
                      </td>                      <td className="action-buttons">
                        <button 
                          onClick={() => {
                            const expandedRow = document.getElementById(`details-${i}`);
                            expandedRow.style.display = expandedRow.style.display === 'none' ? 'table-row' : 'none';
                          }}
                          className="action-button action-button-details"
                        >
                          Details
                        </button>
                        <button 
                          onClick={() => {
                            setProperties(properties.filter((_, index) => index !== i));
                          }} 
                          className="action-button action-button-delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    <tr id={`details-${i}`} style={{display: 'none', backgroundColor: '#f8f9fa'}}>
                      <td colSpan="10">
                        <div style={{padding: '1rem'}}>
                          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>                            <div>
                              <h4 style={{marginBottom: '0.5rem', color: '#28a745'}}>Hours Breakdown</h4>
                              {(() => {                                const propertyHours = hours.filter(h => 
                                  h.propertyClient && (h.propertyClient.toLowerCase().includes(p.address.toLowerCase()) ||
                                  h.propertyClient.toLowerCase().includes(p.client?.toLowerCase() || ''))
                                );
                                
                                // Temporary debug - remove this later
                                if (propertyHours.length > 1 && p.address) {
                                  console.log('=== DEBUG: Multiple hours found for', p.address, '===');
                                  propertyHours.forEach((h, index) => {
                                    console.log(`Hour ${index + 1}:`, {
                                      timestamp: h.timestamp,
                                      dayOfWeek: h.dayOfWeek,
                                      hours: h.hours,
                                      propertyClient: h.propertyClient
                                    });
                                  });
                                }                                // Group hours by date and accumulate them
                                const groupedHours = propertyHours.reduce((acc, h) => {
                                  const dateKey = normalizeDateKey(h.timestamp);
                                  
                                  if (!acc[dateKey]) {
                                    acc[dateKey] = {
                                      date: dateKey,
                                      dayOfWeek: h.dayOfWeek,
                                      totalHours: 0,
                                      entries: [],
                                      originalDate: h.timestamp ? new Date(h.timestamp) : null
                                    };
                                  }
                                  acc[dateKey].totalHours += (h.hours || 0);
                                  acc[dateKey].entries.push(h);
                                  return acc;
                                }, {});
                                
                                const groupedArray = Object.values(groupedHours);
                                
                                // Additional debug info
                                if (propertyHours.length > 1 && p.address) {
                                  console.log('=== GROUPED RESULT for', p.address, '===');
                                  console.log('Original hours:', propertyHours.length);
                                  console.log('Grouped into:', groupedArray.length, 'groups');
                                  groupedArray.forEach((group, index) => {
                                    console.log(`Group ${index + 1}: ${group.date} - ${group.totalHours}h (${group.entries.length} entries)`);
                                  });
                                }
                                
                                return groupedArray.length > 0 ? (
                                  <table style={{width: '100%', fontSize: '0.9rem'}}>
                                    <thead>
                                      <tr style={{backgroundColor: '#e9ecef'}}>
                                        <th style={{padding: '0.25rem', textAlign: 'left'}}>Date</th>
                                        <th style={{padding: '0.25rem', textAlign: 'left'}}>Day</th>
                                        <th style={{padding: '0.25rem', textAlign: 'right'}}>Hours</th>
                                        <th style={{padding: '0.25rem', textAlign: 'right'}}>Value</th>
                                        <th style={{padding: '0.25rem', textAlign: 'center'}}>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>                                      {groupedArray.map((group, gi) => (
                                        <tr key={gi}>
                                          <td style={{padding: '0.25rem'}}>{group.originalDate ? group.originalDate.toLocaleDateString() : 'Unknown'}</td>
                                          <td style={{padding: '0.25rem'}}>{group.dayOfWeek}</td>
                                          <td style={{padding: '0.25rem', textAlign: 'right', color: '#28a745', fontWeight: 'bold'}}>{group.totalHours.toFixed(1)}</td>
                                          <td style={{padding: '0.25rem', textAlign: 'right', color: '#28a745', fontWeight: 'bold'}}>${(group.totalHours * hourlyRate).toFixed(2)}</td>
                                          <td style={{padding: '0.25rem', textAlign: 'center'}}>
                                            <button
                                              onClick={() => {                                                if (window.confirm(`Delete all ${group.totalHours.toFixed(1)} hours for ${group.date}?`)) {
                                                  // Remove all entries for this date
                                                  const updatedHours = hours.filter(h => {
                                                    return !group.entries.includes(h);
                                                  });
                                                  setHours(updatedHours);
                                                }
                                              }}
                                              style={{
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.125rem 0.25rem',
                                                borderRadius: '2px',
                                                fontSize: '0.7rem',
                                                cursor: 'pointer'
                                              }}
                                            >
                                              Delete
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                      <tr style={{backgroundColor: '#e9ecef', fontWeight: 'bold'}}>
                                        <td colSpan="2" style={{padding: '0.25rem'}}>Total</td>
                                        <td style={{padding: '0.25rem', textAlign: 'right', color: '#28a745'}}>{propertyHours.toFixed(1)}</td>
                                        <td style={{padding: '0.25rem', textAlign: 'right', color: '#28a745'}}>${expenseData.laborCost.toFixed(2)}</td>
                                        <td></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                ) : (
                                  <p style={{color: '#6c757d', fontStyle: 'italic'}}>No hours logged for this property</p>
                                );
                              })()}
                            </div>                            <div>
                              <h4 style={{marginBottom: '0.5rem', color: '#dc3545'}}>Expenses Breakdown</h4>
                              {(() => {
                                // Debug: Log expense filtering for this property
                                const filteredExpenses = expenses.filter(e => 
                                  e.propertyClient && (e.propertyClient.toLowerCase().includes(p.address.toLowerCase()) ||
                                  e.propertyClient.toLowerCase().includes(p.client?.toLowerCase() || ''))
                                );
                                
                                // Debug logging
                                if (p.address && expenses.length > 0) {
                                  console.log('=== EXPENSE DEBUG for', p.address, '===');
                                  console.log('Property address:', p.address);
                                  console.log('Property client:', p.client);
                                  console.log('All expenses:', expenses.map(e => ({
                                    category: e.category,
                                    amount: e.amount,
                                    propertyClient: e.propertyClient,
                                    timestamp: e.timestamp
                                  })));
                                  console.log('Filtered expenses for this property:', filteredExpenses);
                                  console.log('ExpenseData calculation:', expenseData);
                                }
                                
                                return (filteredExpenses.length > 0 || expenseData.laborCost > 0) ? (
                                <table style={{width: '100%', fontSize: '0.9rem'}}>
                                  <thead>
                                    <tr style={{backgroundColor: '#e9ecef'}}>
                                      <th style={{padding: '0.25rem', textAlign: 'left'}}>Date</th>
                                      <th style={{padding: '0.25rem', textAlign: 'left'}}>Category</th>
                                      <th style={{padding: '0.25rem', textAlign: 'right'}}>Amount</th>
                                      <th style={{padding: '0.25rem', textAlign: 'center'}}>Actions</th>
                                    </tr>
                                  </thead>                                  <tbody>
                                    {filteredExpenses.map((e, ei) => (
                                      <tr key={ei}>
                                        <td style={{padding: '0.25rem'}}>{e.timestamp ? new Date(e.timestamp).toLocaleDateString() : '-'}</td>
                                        <td style={{padding: '0.25rem'}}>{e.category}</td>
                                        <td style={{padding: '0.25rem', textAlign: 'right', color: '#dc3545', fontWeight: 'bold'}}>${e.amount.toFixed(2)}</td>
                                        <td style={{padding: '0.25rem', textAlign: 'center'}}>
                                          <button
                                            onClick={() => {
                                              if (window.confirm(`Delete expense: ${e.category} - $${e.amount.toFixed(2)}?`)) {
                                                const updatedExpenses = expenses.filter(expense => expense !== e);
                                                setExpenses(updatedExpenses);
                                              }
                                            }}
                                            style={{
                                              backgroundColor: '#dc3545',
                                              color: 'white',
                                              border: 'none',
                                              padding: '0.125rem 0.25rem',
                                              borderRadius: '2px',
                                              fontSize: '0.7rem',
                                              cursor: 'pointer'
                                            }}
                                          >
                                            Delete
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                    {expenseData.laborCost > 0 && (
                                      <tr style={{backgroundColor: '#fff3cd'}}>
                                        <td style={{padding: '0.25rem'}}>-</td>
                                        <td style={{padding: '0.25rem'}}>Labor Cost ({propertyHours.toFixed(1)}h @ ${hourlyRate.toFixed(2)}/hr)</td>
                                        <td style={{padding: '0.25rem', textAlign: 'right', color: '#dc3545', fontWeight: 'bold'}}>${expenseData.laborCost.toFixed(2)}</td>
                                        <td style={{padding: '0.25rem', textAlign: 'center', fontStyle: 'italic', color: '#6c757d'}}>Auto</td>
                                      </tr>
                                    )}
                                    <tr style={{backgroundColor: '#e9ecef', fontWeight: 'bold'}}>
                                      <td colSpan="2" style={{padding: '0.25rem'}}>Total</td>
                                      <td style={{padding: '0.25rem', textAlign: 'right', color: '#dc3545'}}>${expenseData.totalExpenses.toFixed(2)}</td>
                                      <td></td>
                                    </tr>
                                  </tbody>
                                </table>
                                ) : (
                                  <p style={{color: '#6c757d', fontStyle: 'italic'}}>No expenses logged for this property</p>
                                );
                              })()}
                            </div>
                          </div>                          <div style={{marginTop: '1rem', padding: '0.5rem', backgroundColor: '#e9ecef', borderRadius: '4px'}}>
                            <strong>Property ROI Analysis:</strong>
                            <div style={{marginTop: '0.25rem'}}>
                              <span>Commission: ${p.commission?.toFixed(2) || 0} | </span>
                              <span>Total Expenses: ${expenseData.totalExpenses.toFixed(2)} | </span>
                              <span>Net Profit: <span style={{color: (p.commission - expenseData.totalExpenses) >= 0 ? '#28a745' : '#dc3545', fontWeight: 'bold'}}>${((p.commission || 0) - expenseData.totalExpenses).toFixed(2)}</span> | </span>
                              <span>ROI: <span style={{color: expenseData.totalExpenses > 0 ? ((((p.commission || 0) - expenseData.totalExpenses) / expenseData.totalExpenses) >= 0 ? '#28a745' : '#dc3545') : '#6c757d', fontWeight: 'bold'}}>
                                {expenseData.totalExpenses > 0 ? (((((p.commission || 0) - expenseData.totalExpenses) / expenseData.totalExpenses) * 100).toFixed(1) + '%') : 'N/A'}
                              </span> | </span>
                              <span>Hourly Rate: <span style={{color: '#007bff', fontWeight: 'bold'}}>${propertyHours > 0 ? (((p.commission || 0) - expenseData.totalExpenses) / propertyHours).toFixed(2) : '0.00'}/hr</span></span>                            </div>
                          </div>
                          
                          {/* Close Deal Button for Under Contract, Pending properties */}
                          {(p.status === 'Under Contract' || p.status === 'Pending') && (
                            <div style={{marginTop: '1rem', textAlign: 'center'}}>
                              <button
                                onClick={() => {
                                  alert('Close Deal button clicked! Check console for more details.');
                                  console.log('Close Deal button clicked for property:', p.address);
                                  console.log('Property object:', p);
                                  try {
                                    if (window.confirm(`Close "${p.address}"? This will move it to closed deals.`)) {
                                      console.log('User confirmed, proceeding to close deal...');
                                      
                                      // Calculate commission if not set (fallback to 2.5% of price)
                                      const calculatedCommission = p.commission || (p.price * 0.025);
                                      console.log('Calculated commission:', calculatedCommission);
                                      
                                      // Use the helper function to calculate total expenses including labor
                                      console.log('Calculating expenses for:', p.address, p.client);
                                      const expenseData = calculateTotalExpensesWithLabor(p.address, p.client);
                                      console.log('Expense data:', expenseData);
                                      
                                      const closedDeal = {
                                        ...p,
                                        status: 'Closed',
                                        closedDate: new Date().toISOString().split('T')[0],
                                        commission: calculatedCommission,
                                        type: p.type || 'Buyer',
                                        totalHours: expenseData.propertyHours,
                                        totalExpenses: expenseData.totalExpenses,
                                        hoursDetails: hours.filter(h => 
                                          h.propertyClient && (
                                            h.propertyClient.toLowerCase().includes(p.address.toLowerCase()) ||
                                            h.propertyClient.toLowerCase().includes(p.client?.toLowerCase() || '')
                                          )
                                        ),
                                        expensesDetails: expenses.filter(e => 
                                          e.propertyClient && (
                                            e.propertyClient.toLowerCase().includes(p.address.toLowerCase()) ||
                                            e.propertyClient.toLowerCase().includes(p.client?.toLowerCase() || '')
                                          )
                                        )
                                      };
                                      
                                      console.log('Created closed deal:', closedDeal);
                                      console.log('Current closed deals:', closedDeals.length);
                                      setClosedDeals([...closedDeals, closedDeal]);
                                      console.log('Updated closed deals, removing from properties...');
                                      setProperties(properties.filter(prop => prop !== p));
                                      console.log('Deal closure complete');
                                      alert('Deal closed successfully! Check the Closed Deals section.');
                                    } else {
                                      console.log('User cancelled deal closure');
                                    }
                                  } catch (error) {
                                    console.error('Error closing deal:', error);
                                    alert('Error closing deal: ' + error.message);
                                  }
                                }}
                                style={{
                                  backgroundColor: '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                Close Deal
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>Client</th>
                <th>Price ($)</th>
                <th>Commission ($)</th>
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
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={transaction.commission || (transaction.price * 0.025)}
                      onChange={(e) => {
                        const newCommission = parseFloat(e.target.value) || 0;
                        const updatedTransactions = [...contractTransactions];
                        const transactionIndex = contractTransactions.indexOf(transaction);
                        updatedTransactions[transactionIndex] = { ...transaction, commission: newCommission };
                        setContractTransactions(updatedTransactions);
                      }}
                      style={{
                        width: '80px',
                        padding: '0.25rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td>{transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}</td>
                  <td style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                    <button 
                      onClick={() => {
                        // Toggle details view
                        const updatedTransactions = [...contractTransactions];
                        const transactionIndex = contractTransactions.indexOf(transaction);
                        updatedTransactions[transactionIndex] = { 
                          ...transaction, 
                          showDetails: !transaction.showDetails 
                        };
                        setContractTransactions(updatedTransactions);
                      }} 
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        minWidth: '65px'
                      }}
                    >
                      Details
                    </button>
                    <select
                      value={transaction.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        const updatedTransactions = [...contractTransactions];
                        const transactionIndex = contractTransactions.indexOf(transaction);
                        
                        if (newStatus === 'Closed') {
                          // Move to closed deals
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
                      }}
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
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete the transaction for "${transaction.address}"?`)) {
                          setContractTransactions(contractTransactions.filter(t => t !== transaction));
                        }
                      }}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        minWidth: '65px'
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

        <div className="section">
          <h3>Pending</h3>
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>Client</th>
                <th>Price ($)</th>
                <th>Commission ($)</th>
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
                  <td>${(transaction.commission || (transaction.price * 0.025)).toFixed(2)}</td>
                  <td>{transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}</td>
                  <td style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                    <button 
                      onClick={() => {
                        // Toggle details view
                        const updatedTransactions = [...contractTransactions];
                        const transactionIndex = contractTransactions.indexOf(transaction);
                        updatedTransactions[transactionIndex] = { 
                          ...transaction, 
                          showDetails: !transaction.showDetails 
                        };
                        setContractTransactions(updatedTransactions);
                      }} 
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        minWidth: '65px'
                      }}
                    >
                      Details
                    </button>
                    <select
                      value={transaction.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        const updatedTransactions = [...contractTransactions];
                        const transactionIndex = contractTransactions.indexOf(transaction);
                        
                        if (newStatus === 'Closed') {
                          // Move to closed deals
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
                      }}
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
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete the transaction for "${transaction.address}"?`)) {
                          setContractTransactions(contractTransactions.filter(t => t !== transaction));
                        }
                      }}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        minWidth: '65px'
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
                <th>Total Hours</th>
                <th>Total Expenses</th>
                <th>DOM (Days)</th>
                <th>Closed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {closedDeals.map((deal, i) => {
                // Recalculate expenses dynamically to ensure labor costs are included
                const expenseData = calculateTotalExpensesWithLabor(deal.address, deal.client);
                
                return (
                  <tr key={i}>
                    <td>{deal.address}</td>
                    <td>{deal.client || '-'}</td>
                    <td>{deal.type}</td>
                    <td>${deal.price?.toLocaleString() || 0}</td>
                    <td>${deal.commission?.toFixed(2) || 0}</td>
                    <td>{expenseData.propertyHours.toFixed(1)}h</td>
                    <td>${expenseData.totalExpenses.toLocaleString()}</td>
                    <td>
                      {(() => {
                        if (deal.statusDates?.listedDate && deal.closedDate) {
                          const listedDate = new Date(deal.statusDates.listedDate);
                          const closedDate = new Date(deal.closedDate);
                          return Math.ceil((closedDate - listedDate) / (1000 * 60 * 60 * 24));
                        }
                        return '-';
                      })()}
                    </td>
                    <td>{deal.closedDate ? new Date(deal.closedDate).toLocaleDateString() : '-'}</td>
                    <td style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                      <button 
                        onClick={() => {
                          // Toggle details view for closed deals
                          const updatedDeals = [...closedDeals];
                          updatedDeals[i] = { 
                            ...deal, 
                            showDetails: !deal.showDetails 
                          };
                          setClosedDeals(updatedDeals);
                        }} 
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          minWidth: '65px'
                        }}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete the closed deal for "${deal.address}"?`)) {
                            setClosedDeals(closedDeals.filter((_, index) => index !== i));
                          }
                        }}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          minWidth: '65px'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="section">
          <h3>Withdrawn</h3>
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>Client</th>
                <th>Type</th>
                <th>Total Hours</th>
                <th>Total Expenses</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contractTransactions.filter(t => t.status === 'Withdrawn').map((transaction, i) => (
                <tr key={i}>
                  <td>{transaction.address}</td>
                  <td>{transaction.client || '-'}</td>
                  <td>{transaction.type || 'Buyer'}</td>
                  <td>{transaction.totalHours?.toFixed(1) || '0.0'}h</td>
                  <td>${transaction.totalExpenses?.toLocaleString() || 0}</td>
                  <td>{transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}</td>
                  <td style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                    <button 
                      onClick={() => {
                        setContractTransactions(contractTransactions.filter(t => t !== transaction));
                      }} 
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        minWidth: '65px'
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

        <div className="section">
          <h3>Expired</h3>
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>Client</th>
                <th>Type</th>
                <th>Total Hours</th>
                <th>Total Expenses</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contractTransactions.filter(t => t.status === 'Expired').map((transaction, i) => (
                <tr key={i}>
                  <td>{transaction.address}</td>
                  <td>{transaction.client || '-'}</td>
                  <td>{transaction.type || 'Buyer'}</td>
                  <td>{transaction.totalHours?.toFixed(1) || '0.0'}h</td>
                  <td>${transaction.totalExpenses?.toLocaleString() || 0}</td>
                  <td>{transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}</td>
                  <td style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                    <button 
                      onClick={() => {
                        setContractTransactions(contractTransactions.filter(t => t !== transaction));
                      }} 
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        minWidth: '65px'
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

        <div className="section">
          <h3>Terminated</h3>
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>Client</th>
                <th>Type</th>
                <th>Total Hours</th>
                <th>Total Expenses</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contractTransactions.filter(t => t.status === 'Terminated').map((transaction, i) => (
                <tr key={i}>
                  <td>{transaction.address}</td>
                  <td>{transaction.client || '-'}</td>
                  <td>{transaction.type || 'Buyer'}</td>
                  <td>{transaction.totalHours?.toFixed(1) || '0.0'}h</td>
                  <td>${transaction.totalExpenses?.toLocaleString() || 0}</td>
                  <td>{transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}</td>
                  <td style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                    <button 
                      onClick={() => {
                        setContractTransactions(contractTransactions.filter(t => t !== transaction));
                      }} 
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        minWidth: '65px'
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

        <div className="section">
          <h3>Fired Client</h3>
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>Client</th>
                <th>Type</th>
                <th>Total Hours</th>
                <th>Total Expenses</th>
                <th>Date</th>
                <th>Note</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {contractTransactions.filter(t => t.status === 'Fired Client').map((transaction, i) => (
                <tr key={i}>
                  <td>{transaction.address}</td>
                  <td>{transaction.client || '-'}</td>
                  <td>{transaction.type || 'Buyer'}</td>
                  <td>{transaction.totalHours?.toFixed(1) || '0.0'}h</td>
                  <td>${transaction.totalExpenses?.toLocaleString() || 0}</td>
                  <td>{transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}</td>
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
                  <td style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                    <button 
                      onClick={() => {
                        setContractTransactions(contractTransactions.filter(t => t !== transaction));
                      }} 
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        minWidth: '65px'
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

        <div className="section">
          <h3>Volume Summary</h3>
          <div className="grid">
            <div className="tile">
              <h4>Volume Under Contract</h4>
              <p>${volumeUnderContract.toLocaleString()}</p>
            </div>
            <div className="tile">
              <h4>Volume Pending</h4>
              <p>${volumePending.toLocaleString()}</p>
            </div>
            <div className="tile">
              <h4>Closed Volume</h4>
              <p>${closedDeals.reduce((sum, deal) => sum + (deal.price || 0), 0).toLocaleString()}</p>
            </div>
            <div className="tile">
              <h4>Total Volume</h4>
              <p>${(volumeUnderContract + volumePending).toLocaleString()}</p>
            </div>
            <div className="tile">
              <h4>Average Sale Price</h4>
              <p>${closedDeals.length > 0 ? (closedDeals.reduce((sum, deal) => sum + (deal.price || 0), 0) / closedDeals.length).toLocaleString() : '0'}</p>
            </div>
            <div className="tile">
              <h4>Average ROI</h4>
              <p>{(() => {
                const dealsWithExpenses = closedDeals.filter(deal => (deal.totalExpenses || 0) > 0);
                if (dealsWithExpenses.length === 0) return 'N/A';
                const totalROI = dealsWithExpenses.reduce((sum, deal) => {
                  const roi = ((deal.commission || 0) / (deal.totalExpenses || 1)) * 100;
                  return sum + roi;
                }, 0);
                return (totalROI / dealsWithExpenses.length).toFixed(1) + '%';
              })()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="section">
          <h2>Performance Dashboard</h2>
          <div style={{marginBottom: '1rem'}}>
            <button onClick={sendDailyReport} style={{marginRight: '1rem'}}>
              Export Daily Report to Email
            </button>
            <span style={{fontSize: '0.9rem', color: '#C5A95E'}}>
              (Reports are automatically sent daily at 11:59 PM to nhcazateam@gmail.com)
            </span>
          </div>

          {/* Manual Performance Entry */}
          <div className="section" style={{marginBottom: '2rem'}}>
            <h3 style={{color: '#C5A95E', marginBottom: '1rem'}}>Performance Metrics Entry</h3>
            <div className="grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <label style={{color: '#C5A95E', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem'}}>
                  Total Properties
                </label>
                <input
                  type="number"
                  value={manualPerformanceMetrics.totalProperties}
                  onChange={(e) => setManualPerformanceMetrics({
                    ...manualPerformanceMetrics,
                    totalProperties: parseInt(e.target.value) || 0
                  })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #C5A95E',
                    color: '#fff',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <label style={{color: '#C5A95E', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem'}}>
                  Total Commissions ($)
                </label>
                <input
                  type="number"
                  value={manualPerformanceMetrics.totalCommissions}
                  onChange={(e) => setManualPerformanceMetrics({
                    ...manualPerformanceMetrics,
                    totalCommissions: parseFloat(e.target.value) || 0
                  })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #C5A95E',
                    color: '#fff',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <label style={{color: '#C5A95E', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem'}}>
                  Total Hours Worked
                </label>
                <input
                  type="number"
                  value={manualPerformanceMetrics.totalHours}
                  onChange={(e) => setManualPerformanceMetrics({
                    ...manualPerformanceMetrics,
                    totalHours: parseFloat(e.target.value) || 0
                  })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #C5A95E',
                    color: '#fff',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <label style={{color: '#C5A95E', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem'}}>
                  Deals Closed YTD
                </label>
                <input
                  type="number"
                  value={manualPerformanceMetrics.dealsClosedYTD}
                  onChange={(e) => setManualPerformanceMetrics({
                    ...manualPerformanceMetrics,
                    dealsClosedYTD: parseInt(e.target.value) || 0
                  })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #C5A95E',
                    color: '#fff',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Key Performance Metrics */}
          <div className="section">
            <h3 style={{color: '#C5A95E', marginBottom: '1rem'}}>Key Performance Metrics</h3>
            <div className="grid">
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Total Properties</h3>
                <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#28a745'}}>
                  {manualPerformanceMetrics.totalProperties > 0 ? manualPerformanceMetrics.totalProperties : (properties?.length || 0)}
                </p>
                <small style={{color: '#888'}}>
                  {manualPerformanceMetrics.totalProperties > 0 ? 'Manual Entry' : 'Auto Calculated'}
                </small>
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Total Commissions</h3>
                <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#28a745'}}>
                  ${(totalClosedCommission || 0).toFixed(0)}
                </p>
                <small style={{color: '#888'}}>
                  {manualPerformanceMetrics.totalCommissions > 0 ? 'Manual Entry' : 'Auto Calculated'}
                </small>
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Total Hours</h3>
                <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#28a745'}}>
                  {(totalWorkHours || 0).toFixed(0)}
                </p>
                <small style={{color: '#888'}}>
                  {manualPerformanceMetrics.totalHours > 0 ? 'Manual Entry' : 'Auto Calculated'}
                </small>
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Deals Closed</h3>
                <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#28a745'}}>
                  {dealsClosed || 0}
                </p>
                <small style={{color: '#888'}}>
                  {manualPerformanceMetrics.dealsClosedYTD > 0 ? 'Manual Entry' : 'Auto Calculated'}
                </small>
              </div>
            </div>
          </div>

          {/* Advanced Hourly Rate Analysis */}
          <div className="section">
            <h3 style={{color: '#C5A95E', marginBottom: '1rem'}}>Hourly Rate Analysis</h3>
            <div className="grid">
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Base Hourly Rate</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff'}}>
                  ${(baseHourlyRate || 0).toFixed(2)}/hr
                </p>
                <small style={{color: '#888'}}>
                  {(manualHourlyRate || 0) > 0 ? 'Manual Rate' : 'Calculated Rate'}
                </small>
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Experience Level</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745'}}>
                  Level {experienceLevel || 0}
                </p>
                <small style={{color: '#888'}}>
                  +{experienceBonus || 0}% bonus ({dealsClosed || 0} deals)
                </small>
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Step Level</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745'}}>
                  Step {stepLevel || 1}
                </p>
                <small style={{color: '#888'}}>
                  +{stepBonus || 0}% bonus
                </small>
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Final Hourly Rate</h3>
                <p style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#C5A95E'}}>
                  ${(hourlyRate || 0).toFixed(2)}/hr
                </p>
                <small style={{color: '#888'}}>
                  Total Bonus: +{totalBonusPercentage || 0}%
                </small>
              </div>
            </div>
          </div>

          {/* Monthly Performance Table */}
          <div className="section">
            <h3 style={{color: '#C5A95E', marginBottom: '1rem'}}>Monthly Performance Breakdown</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {(monthlyData || []).map((month, index) => (
                <div key={index} className="tile" style={{
                  backgroundColor: '#2d2d2d', 
                  border: '1px solid #C5A95E',
                  padding: '1rem'
                }}>
                  <h3 style={{color: '#C5A95E', marginBottom: '0.5rem'}}>{month?.name || `Month ${index + 1}`}</h3>
                  <div style={{fontSize: '0.9rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem'}}>
                    <div>Hours: <span style={{color: '#28a745', fontWeight: 'bold'}}>{month?.hours || 0}</span></div>
                    <div>Calls: <span style={{color: '#28a745', fontWeight: 'bold'}}>{month?.calls || 0}</span></div>
                    <div>List Appts: <span style={{color: '#28a745', fontWeight: 'bold'}}>{month?.listingAppts || 0}</span></div>
                    <div>Buy Appts: <span style={{color: '#28a745', fontWeight: 'bold'}}>{month?.buyerAppts || 0}</span></div>
                    <div>Offers: <span style={{color: '#28a745', fontWeight: 'bold'}}>{month?.offersWritten || 0}</span></div>
                    <div>Listings: <span style={{color: '#28a745', fontWeight: 'bold'}}>{month?.listingAgreements || 0}</span></div>
                    <div>Contracts: <span style={{color: '#28a745', fontWeight: 'bold'}}>{month?.buyerContracts || 0}</span></div>
                    <div>Comm: <span style={{color: '#C5A95E', fontWeight: 'bold'}}>${(month?.commission || 0).toFixed(0)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Month Progress */}
          <div className="section">
            <h3 style={{color: '#C5A95E', marginBottom: '1rem'}}>Current Month Progress</h3>
            <div className="grid">
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Calls Progress</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: (monthlyProgress?.calls || 0) >= 100 ? '#28a745' : '#ffffff'}}>
                  {(monthlyProgress?.calls || 0).toFixed(1)}%
                </p>
                <small style={{color: '#888'}}>{currentMonthData?.calls || 0} / {goals?.monthly?.calls || 0}</small>
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Hours Progress</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: (monthlyProgress?.hours || 0) >= 100 ? '#28a745' : '#ffffff'}}>
                  {(monthlyProgress?.hours || 0).toFixed(1)}%
                </p>
                <small style={{color: '#888'}}>{currentMonthData?.hours || 0} / {goals?.monthly?.hours || 0}</small>
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Appointments</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: (monthlyProgress?.appointments || 0) >= 100 ? '#28a745' : '#ffffff'}}>
                  {(monthlyProgress?.appointments || 0).toFixed(1)}%
                </p>
                <small style={{color: '#888'}}>{((currentMonthData?.listingAppts || 0) + (currentMonthData?.buyerAppts || 0))} / {goals?.monthly?.appointments || 0}</small>
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Offers Written</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: (monthlyProgress?.offersWritten || 0) >= 100 ? '#28a745' : '#ffffff'}}>
                  {(monthlyProgress?.offersWritten || 0).toFixed(1)}%
                </p>
                <small style={{color: '#888'}}>{currentMonthData?.offersWritten || 0} / {goals?.monthly?.offersWritten || 0}</small>
              </div>
            </div>
          </div>

          {/* Conversion Rates */}
          <div className="section">
            <h3 style={{color: '#C5A95E', marginBottom: '1rem'}}>Conversion Rates</h3>
            <div className="grid">
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Buyer Contract → Close</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745'}}>
                  {(buyerContractToClosingRate || 0).toFixed(1)}%
                </p>
                <small style={{color: '#888'}}>{totalBuyerDealsComplete || 0} / {totalBuyerContracts || 0}</small>
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Listing Agreement → Close</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745'}}>
                  {(listingAgreementToClosingRate || 0).toFixed(1)}%
                </p>
                <small style={{color: '#888'}}>{totalSellerDealsComplete || 0} / {totalListingAgreements || 0}</small>
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Total Deals</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#C5A95E'}}>
                  {(totalBuyerDealsComplete || 0) + (totalSellerDealsComplete || 0)}
                </p>
                <small style={{color: '#888'}}>Buyer: {totalBuyerDealsComplete || 0} | Seller: {totalSellerDealsComplete || 0}</small>
              </div>
              <div className="tile" style={{backgroundColor: '#2d2d2d', border: '1px solid #C5A95E'}}>
                <h3 style={{color: '#C5A95E'}}>Average Commission</h3>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745'}}>
                  ${((totalClosedCommission || 0) / Math.max(1, dealsClosed || 1)).toFixed(0)}
                </p>
                <small style={{color: '#888'}}>Per deal</small>
              </div>
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
                <option value="Professional Photography">Professional Photography</option>
                <option value="Professional Video">Professional Video</option>
                <option value="Meals">Meals</option>
                <option value="Travel">Travel</option>
                <option value="Rental Equipment">Rental Equipment</option>
                <option value="Junk Removal">Junk Removal</option>
                <option value="Client Entertainment">Client Entertainment</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {newExpense.category === 'Travel' && (
              <>
                <div>
                  <label>Mileage</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newExpense.mileage || 0}
                    onChange={e => setNewExpense({ ...newExpense, mileage: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter miles driven"
                  />
                </div>
                <div>
                  <label>Gas Price per Gallon ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.gasPrice || 0}
                    onChange={e => {
                      const gasPrice = parseFloat(e.target.value) || 0;
                      const mileage = newExpense.mileage || 0;
                      // Calculate gas cost: assume 25 MPG average
                      const gasCost = (mileage / 25) * gasPrice;
                      // Add IRS mileage rate (2025: $0.67 per mile) plus gas cost
                      const totalAmount = (mileage * 0.67) + gasCost;
                      setNewExpense({ 
                        ...newExpense, 
                        gasPrice: gasPrice,
                        amount: totalAmount
                      });
                    }}
                    placeholder="Current gas price"
                  />
                </div>
                <div style={{backgroundColor: '#f8f9fa', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem'}}>
                  <strong>Travel Calculation:</strong><br/>
                  Mileage: {newExpense.mileage || 0} miles × $0.67 = ${((newExpense.mileage || 0) * 0.67).toFixed(2)}<br/>
                  Gas: {newExpense.mileage || 0} miles ÷ 25 MPG × ${newExpense.gasPrice || 0} = ${(((newExpense.mileage || 0) / 25) * (newExpense.gasPrice || 0)).toFixed(2)}<br/>
                  <strong>Total: ${(((newExpense.mileage || 0) * 0.67) + (((newExpense.mileage || 0) / 25) * (newExpense.gasPrice || 0))).toFixed(2)}</strong>
                </div>
              </>
            )}
            <div>
              <label>Amount ($)</label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={e => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                required
                readOnly={newExpense.category === 'Travel'}
                style={{backgroundColor: newExpense.category === 'Travel' ? '#f5f5f5' : 'white'}}
              />
              {newExpense.category === 'Travel' && (
                <small style={{color: '#666', fontSize: '0.8rem'}}>
                  Amount is auto-calculated for travel expenses
                </small>
              )}
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

          <div className="section">
            <h2>Performance Chart</h2>
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: 'white',
              minHeight: '400px'
            }}>
              <canvas 
                id="performanceChart"
                style={{
                  width: '100%',
                  height: '350px',
                  backgroundColor: '#f9f9f9'
                }}
              ></canvas>
            </div>
          </div>
        </div>
      )}

      {/* Daily Data Input Tab */}      {/* Calendar Tab */}
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
            )}          </div>
        </div>
      )}

      {/* GCI Calculator Tab */}
      {activeTab === 'gci' && (
        <div className="section">
          <h2>GCI Calculator & 2025 Tax Brackets</h2>
          <div className="grid" style={{marginBottom: '2rem'}}>
            <div>
              <label>GCI Goal ($)</label>
              <input
                type="number"
                value={gciData.gciGoal}
                onChange={(e) => setGciData({...gciData, gciGoal: parseFloat(e.target.value) || 215000})}
                style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc'}}
              />
            </div>
            <div>
              <label>Average Sale Price ($)</label>
              <input
                type="number"
                value={gciData.avgSale}
                onChange={(e) => setGciData({...gciData, avgSale: parseFloat(e.target.value) || 325090})}
                style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc'}}
              />
            </div>
            <div>
              <label>Average Commission (%)</label>
              <input
                type="number"
                step="0.1"
                value={gciData.avgCommission * 100}
                onChange={(e) => setGciData({...gciData, avgCommission: Math.min(Math.max((parseFloat(e.target.value) || 2.5) / 100, 0), 0.06)})}
                style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc'}}
              />
            </div>
          </div>
          
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
            </div>            <div className="tile">
              <h3>Remaining to Goal</h3>
              <p>${Math.max(0, gciData.gciGoal - totalClosedCommission).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="section" style={{marginTop: '2rem'}}>
            <h3>2025 Tax Analysis</h3>
            <div className="grid">
              <div className="tile">
                <h4>Current Year-to-Date Commission</h4>
                <p>${totalClosedCommission.toLocaleString()}</p>
              </div>
              <div className="tile">
                <h4>Estimated Federal Tax (YTD)</h4>
                <p>${calculateTax(totalClosedCommission).toLocaleString()}</p>
              </div>
              <div className="tile">
                <h4>After-Tax Income (YTD)</h4>
                <p>${(totalClosedCommission - calculateTax(totalClosedCommission)).toLocaleString()}</p>
              </div>
              <div className="tile">
                <h4>Projected Tax at Goal</h4>
                <p>${calculateTax(gciData.gciGoal).toLocaleString()}</p>
              </div>
              <div className="tile">
                <h4>Projected After-Tax at Goal</h4>
                <p>${(gciData.gciGoal - calculateTax(gciData.gciGoal)).toLocaleString()}</p>
              </div>
              <div className="tile">
                <h4>Current Tax Rate</h4>
                <p>{totalClosedCommission > 0 ? ((calculateTax(totalClosedCommission) / totalClosedCommission) * 100).toFixed(1) : '0'}%</p>
              </div>
            </div>
          </div>
          
          <div className="section" style={{marginTop: '2rem'}}>
            <h3>2025 Federal Tax Brackets (Single Filer)</h3>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  <th style={{border: '1px solid #ccc', padding: '0.5rem', backgroundColor: '#f5f5f5'}}>Tax Rate</th>
                  <th style={{border: '1px solid #ccc', padding: '0.5rem', backgroundColor: '#f5f5f5'}}>Income Range</th>
                  <th style={{border: '1px solid #ccc', padding: '0.5rem', backgroundColor: '#f5f5f5'}}>Your Status</th>
                </tr>
              </thead>
              <tbody>
                {taxBrackets2025.map((bracket, i) => (
                  <tr key={i} style={{
                    backgroundColor: totalClosedCommission >= bracket.min && totalClosedCommission < bracket.max ? '#e8f5e8' : 'transparent'
                  }}>
                    <td style={{border: '1px solid #ccc', padding: '0.5rem'}}>{(bracket.rate * 100).toFixed(0)}%</td>
                    <td style={{border: '1px solid #ccc', padding: '0.5rem'}}>
                      ${bracket.min.toLocaleString()} - {bracket.max === Infinity ? '∞' : `$${bracket.max.toLocaleString()}`}
                    </td>
                    <td style={{border: '1px solid #ccc', padding: '0.5rem'}}>
                      {totalClosedCommission >= bracket.min && totalClosedCommission < bracket.max ? 
                        '🎯 Current Bracket' : 
                        totalClosedCommission < bracket.min ? 'Future Bracket' : 'Past Bracket'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}      {/* Weekly Reports Tab */}      {activeTab === 'weeklyReports' && (
        <div className="section">
          <h2>Weekly Reports & Analytics</h2>
          
          {/* Current Week Tile */}
          <div className="section">
            <h3>Current Week</h3>
            <div className="grid" style={{gridTemplateColumns: '1fr', maxWidth: '300px', margin: '0 auto 2rem'}}>
              {(() => {
                const currentDate = new Date();
                const weekYear = currentDate.getFullYear();
                const weekMonth = currentDate.getMonth() + 1;
                
                // Calculate current week number within the month
                const firstDayOfMonth = new Date(weekYear, weekMonth - 1, 1);
                const weekNumber = Math.ceil((currentDate.getDate() + firstDayOfMonth.getDay()) / 7);
                
                const { weeklyTotals } = calculateWeeklyMetrics(weekYear, weekMonth, weekNumber);
                const { startDate, endDate } = getWeekDates(weekYear, weekMonth, weekNumber);
                
                return (
                  <div className="tile">
                    <h4 style={{marginBottom: '0.5rem'}}>Week {weekNumber}</h4>
                    <p style={{fontSize: '0.7rem', color: '#666', marginBottom: '0.5rem'}}>
                      {startDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - {endDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                    </p>
                    <div style={{fontSize: '0.8rem', textAlign: 'left'}}>
                      <div>Hours: <span style={{color: '#28a745', fontWeight: 'bold'}}>{weeklyTotals.hours}</span></div>
                      <div>Calls: <span style={{color: '#28a745', fontWeight: 'bold'}}>{weeklyTotals.calls}</span></div>
                      <div>Appointments: <span style={{color: '#28a745', fontWeight: 'bold'}}>{weeklyTotals.appointments}</span></div>
                      <div>Offers: <span style={{color: '#28a745', fontWeight: 'bold'}}>{weeklyTotals.offersWritten}</span></div>
                      <div>Listings: <span style={{color: '#28a745', fontWeight: 'bold'}}>{weeklyTotals.listingAgreements}</span></div>
                      <div>Contracts: <span style={{color: '#28a745', fontWeight: 'bold'}}>{weeklyTotals.buyerContracts}</span></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          
          <div className="section">
            <h3>Report Selection</h3>
            <div className="grid" style={{gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem'}}>
              <div>
                <label>Report Period</label>
                <select 
                  value={selectedReportPeriod}
                  onChange={(e) => setSelectedReportPeriod(e.target.value)}
                  style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc'}}
                >
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                </select>
              </div>
              <div>
                <label>Year</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc'}}
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
              <div>
                <label>Month</label>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc'}}
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map((month, i) => (
                    <option key={i} value={i + 1}>{month}</option>
                  ))}
                </select>
              </div>
              {selectedReportPeriod === 'week' && (
                <div>
                  <label>Week</label>
                  <select 
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    style={{width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc'}}
                  >
                    <option value={1}>Week 1</option>
                    <option value={2}>Week 2</option>
                    <option value={3}>Week 3</option>
                    <option value={4}>Week 4</option>
                    <option value={5}>Week 5</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {selectedReportPeriod === 'week' && (
            <div className="section">
              <h3>Weekly Performance Report</h3>
              {(() => {
                const { weeklyTotals } = calculateWeeklyMetrics(selectedYear, selectedMonth, selectedWeek);
                const { startDate, endDate } = getWeekDates(selectedYear, selectedMonth, selectedWeek);
                
                return (
                  <>
                    <p style={{marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold'}}>
                      Week {selectedWeek} of {['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth - 1]} {selectedYear}
                      <br />
                      <span style={{fontSize: '0.9rem', fontWeight: 'normal'}}>
                        ({startDate.toLocaleDateString()} - {endDate.toLocaleDateString()})
                      </span>
                    </p>
                    
                    <div className="grid">
                      <div className="tile">
                        <h4>Calls Made</h4>
                        <p>{weeklyTotals.calls}</p>
                        <small>Goal: {goals.weekly.calls} | Progress: {((weeklyTotals.calls / goals.weekly.calls) * 100).toFixed(1)}%</small>
                      </div>
                      <div className="tile">
                        <h4>Hours Worked</h4>
                        <p>{weeklyTotals.hours}</p>
                        <small>Goal: {goals.weekly.hours} | Progress: {((weeklyTotals.hours / goals.weekly.hours) * 100).toFixed(1)}%</small>
                      </div>
                      <div className="tile">
                        <h4>Appointments</h4>
                        <p>{weeklyTotals.appointments}</p>
                        <small>Goal: {goals.weekly.appointments} | Progress: {((weeklyTotals.appointments / goals.weekly.appointments) * 100).toFixed(1)}%</small>
                      </div>
                      <div className="tile">
                        <h4>Offers Written</h4>
                        <p>{weeklyTotals.offersWritten}</p>
                        <small>Goal: {goals.weekly.offersWritten} | Progress: {((weeklyTotals.offersWritten / goals.weekly.offersWritten) * 100).toFixed(1)}%</small>
                      </div>
                      <div className="tile">
                        <h4>Listing Agreements</h4>
                        <p>{weeklyTotals.listingAgreements}</p>
                        <small>Goal: {goals.weekly.listingAgreements} | Progress: {((weeklyTotals.listingAgreements / goals.weekly.listingAgreements) * 100).toFixed(1)}%</small>
                      </div>
                      <div className="tile">
                        <h4>Buyer Contracts</h4>
                        <p>{weeklyTotals.buyerContracts}</p>
                        <small>Goal: {goals.weekly.buyerContracts} | Progress: {((weeklyTotals.buyerContracts / goals.weekly.buyerContracts) * 100).toFixed(1)}%</small>
                      </div>
                    </div>
                      <div className="section" style={{marginTop: '2rem'}}>
                      <h4>Weekly Goal Completion</h4>
                      <div className="grid">
                        <div className="tile">
                          <h4>Overall Weekly Progress</h4>
                          <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#C5A95E'}}>
                            {(() => {
                              try {
                                const progressValues = [
                                  goals.weekly.calls > 0 ? Math.min(100, (weeklyTotals.calls / goals.weekly.calls) * 100) : 0,
                                  goals.weekly.hours > 0 ? Math.min(100, (weeklyTotals.hours / goals.weekly.hours) * 100) : 0,
                                  goals.weekly.appointments > 0 ? Math.min(100, (weeklyTotals.appointments / goals.weekly.appointments) * 100) : 0,
                                  goals.weekly.offersWritten > 0 ? Math.min(100, (weeklyTotals.offersWritten / goals.weekly.offersWritten) * 100) : 0,
                                  goals.weekly.listingAgreements > 0 ? Math.min(100, (weeklyTotals.listingAgreements / goals.weekly.listingAgreements) * 100) : 0,
                                  goals.weekly.buyerContracts > 0 ? Math.min(100, (weeklyTotals.buyerContracts / goals.weekly.buyerContracts) * 100) : 0
                                ];
                                
                                const validProgressValues = progressValues.filter(val => 
                                  typeof val === 'number' && !isNaN(val) && isFinite(val)
                                );
                                
                                if (validProgressValues.length === 0) return '0.0';
                                
                                const totalProgress = validProgressValues.reduce((sum, progress) => sum + progress, 0) / validProgressValues.length;
                                
                                return (isNaN(totalProgress) || !isFinite(totalProgress)) ? '0.0' : totalProgress.toFixed(1);
                              } catch (error) {
                                console.error('Error calculating weekly progress:', error);
                                return '0.0';
                              }
                            })()}%
                          </p>
                          <small>Average completion across all goals</small>
                        </div>
                        <div className="tile">
                          <h4>Goals Met</h4>
                          <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#28a745'}}>
                            {[
                              weeklyTotals.calls >= goals.weekly.calls,
                              weeklyTotals.hours >= goals.weekly.hours,
                              weeklyTotals.appointments >= goals.weekly.appointments,
                              weeklyTotals.offersWritten >= goals.weekly.offersWritten,
                              weeklyTotals.listingAgreements >= goals.weekly.listingAgreements,
                              weeklyTotals.buyerContracts >= goals.weekly.buyerContracts
                            ].filter(Boolean).length} / 6
                          </p>                          <small>Number of weekly goals achieved</small>
                        </div>
                      </div>
                    </div>
                    
                    {/* Property Activity Section */}
                    <div className="section" style={{marginTop: '2rem'}}>
                      <h4>Property Activity</h4>
                      {(() => {
                        // Get properties that had activity during this week
                        const weekProperties = properties.filter(property => {
                          const propertyDate = property.timestamp ? new Date(property.timestamp) : null;
                          if (!propertyDate) return false;
                          return propertyDate >= startDate && propertyDate <= endDate;
                        });
                        
                        // Get hours and expenses for this week
                        const weekHours = hours.filter(hour => {
                          const hourDate = hour.timestamp ? new Date(hour.timestamp) : null;
                          if (!hourDate) return false;
                          return hourDate >= startDate && hourDate <= endDate;
                        });
                        
                        const weekExpenses = expenses.filter(expense => {
                          const expenseDate = expense.timestamp ? new Date(expense.timestamp) : null;
                          if (!expenseDate) return false;
                          return expenseDate >= startDate && expenseDate <= endDate;
                        });
                        
                        // Calculate property totals
                        const propertyHours = weekHours.reduce((sum, h) => sum + (h.hours || 0), 0);
                        const propertyExpenses = weekExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
                        
                        return (
                          <>
                            <div className="grid" style={{gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1rem'}}>
                              <div className="tile">
                                <h4>New Properties</h4>
                                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff'}}>
                                  {weekProperties.length}
                                </p>
                                <small>Properties added this week</small>
                              </div>
                              <div className="tile">
                                <h4>Total Hours</h4>
                                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745'}}>
                                  {propertyHours.toFixed(1)}
                                </p>
                                <small>Hours worked on properties</small>
                              </div>
                              <div className="tile">
                                <h4>Total Expenses</h4>
                                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545'}}>
                                  ${propertyExpenses.toLocaleString()}
                                </p>
                                <small>Property-related expenses</small>
                              </div>
                            </div>
                            
                            {weekProperties.length > 0 && (
                              <div>
                                <h5>Properties Added This Week</h5>
                                <div style={{
                                  maxHeight: '300px',
                                  overflowY: 'auto',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  padding: '1rem'
                                }}>
                                  {weekProperties.map((property, index) => (
                                    <div key={index} style={{
                                      padding: '0.5rem',
                                      borderBottom: '1px solid #eee',
                                      marginBottom: '0.5rem'
                                    }}>
                                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <div>
                                          <strong>{property.address}</strong>
                                          <span style={{marginLeft: '1rem', color: '#666'}}>
                                            {property.client} ({property.type})
                                          </span>
                                        </div>
                                        <div style={{textAlign: 'right'}}>
                                          <div style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            backgroundColor: 
                                              property.status === 'Closed' ? '#28a745' :
                                              property.status === 'Pending' ? '#ffc107' :
                                              property.status === 'Under Contract' ? '#17a2b8' :
                                              '#6c757d',
                                            color: 'white'
                                          }}>
                                            {property.status}
                                          </div>
                                          <div style={{fontSize: '0.9rem', color: '#666', marginTop: '0.25rem'}}>
                                            ${property.price ? property.price.toLocaleString() : '0'}
                                          </div>
                                        </div>
                                      </div>
                                      {(property.listingDate || property.contractDate || property.pendingDate || property.closedDate) && (
                                        <div style={{fontSize: '0.8rem', color: '#888', marginTop: '0.25rem'}}>
                                          Status dates: 
                                          {property.listingDate && ` Listed: ${property.listingDate}`}
                                          {property.contractDate && ` | Contract: ${property.contractDate}`}
                                          {property.pendingDate && ` | Pending: ${property.pendingDate}`}
                                          {property.closedDate && ` | Closed: ${property.closedDate}`}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {(weekHours.length > 0 || weekExpenses.length > 0) && (
                              <div style={{marginTop: '1rem'}}>
                                <h5>Weekly Property Activity Details</h5>
                                <div className="grid" style={{gridTemplateColumns: '1fr 1fr'}}>
                                  {weekHours.length > 0 && (
                                    <div>
                                      <h6>Hours Worked</h6>
                                      <div style={{
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        padding: '0.5rem'
                                      }}>
                                        {weekHours.map((hour, index) => (
                                          <div key={index} style={{
                                            padding: '0.25rem',
                                            borderBottom: '1px solid #f0f0f0',
                                            fontSize: '0.9rem'
                                          }}>
                                            <strong>{hour.propertyClient}</strong> - {hour.hours}h
                                            <div style={{color: '#666', fontSize: '0.8rem'}}>
                                              {hour.dayOfWeek} ({new Date(hour.timestamp).toLocaleDateString()})
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {weekExpenses.length > 0 && (
                                    <div>
                                      <h6>Expenses</h6>
                                      <div style={{
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        padding: '0.5rem'
                                      }}>
                                        {weekExpenses.map((expense, index) => (
                                          <div key={index} style={{
                                            padding: '0.25rem',
                                            borderBottom: '1px solid #f0f0f0',
                                            fontSize: '0.9rem'
                                          }}>
                                            <strong>{expense.propertyClient}</strong> - ${expense.amount}
                                            <div style={{color: '#666', fontSize: '0.8rem'}}>
                                              {expense.category} ({new Date(expense.timestamp).toLocaleDateString()})
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {selectedReportPeriod === 'month' && (
            <div className="section">
              <h3>Monthly Performance Report</h3>
              {(() => {
                // Calculate monthly totals by summing all weeks in the month
                const monthlyTotals = { calls: 0, hours: 0, appointments: 0, offersWritten: 0, listingAgreements: 0, buyerContracts: 0, showings: 0, leads: 0 };
                
                for (let week = 1; week <= 5; week++) {
                  const { weeklyTotals } = calculateWeeklyMetrics(selectedYear, selectedMonth, week);
                  Object.keys(monthlyTotals).forEach(key => {
                    monthlyTotals[key] += weeklyTotals[key] || 0;
                  });
                }
                
                return (
                  <>
                    <p style={{marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold'}}>
                      {['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'][selectedMonth - 1]} {selectedYear}
                    </p>
                    
                    <div className="grid">
                      <div className="tile">
                        <h4>Calls Made</h4>
                        <p>{monthlyTotals.calls}</p>
                        <small>Goal: {goals.monthly.calls} | Progress: {((monthlyTotals.calls / goals.monthly.calls) * 100).toFixed(1)}%</small>
                      </div>
                      <div className="tile">
                        <h4>Hours Worked</h4>
                        <p>{monthlyTotals.hours}</p>
                        <small>Goal: {goals.monthly.hours} | Progress: {((monthlyTotals.hours / goals.monthly.hours) * 100).toFixed(1)}%</small>
                      </div>
                      <div className="tile">
                        <h4>Appointments</h4>
                        <p>{monthlyTotals.appointments}</p>
                        <small>Goal: {goals.monthly.appointments} | Progress: {((monthlyTotals.appointments / goals.monthly.appointments) * 100).toFixed(1)}%</small>
                      </div>
                      <div className="tile">
                        <h4>Offers Written</h4>
                        <p>{monthlyTotals.offersWritten}</p>
                        <small>Goal: {goals.monthly.offersWritten} | Progress: {((monthlyTotals.offersWritten / goals.monthly.offersWritten) * 100).toFixed(1)}%</small>
                      </div>
                      <div className="tile">
                        <h4>Listing Agreements</h4>
                        <p>{monthlyTotals.listingAgreements}</p>
                        <small>Goal: {goals.monthly.listingAgreements} | Progress: {((monthlyTotals.listingAgreements / goals.monthly.listingAgreements) * 100).toFixed(1)}%</small>
                      </div>
                      <div className="tile">
                        <h4>Buyer Contracts</h4>
                        <p>{monthlyTotals.buyerContracts}</p>
                        <small>Goal: {goals.monthly.buyerContracts} | Progress: {((monthlyTotals.buyerContracts / goals.monthly.buyerContracts) * 100).toFixed(1)}%</small>
                      </div>
                    </div>
                    
                    <div className="section" style={{marginTop: '2rem'}}>
                      <h4>Monthly Goal Completion</h4>
                      <div className="grid">                        <div className="tile">
                          <h4>Overall Monthly Progress</h4>
                          <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#C5A95E'}}>
                            {(() => {
                              try {
                                const progressValues = [
                                  goals.monthly.calls > 0 ? Math.min(100, (monthlyTotals.calls / goals.monthly.calls) * 100) : 0,
                                  goals.monthly.hours > 0 ? Math.min(100, (monthlyTotals.hours / goals.monthly.hours) * 100) : 0,
                                  goals.monthly.appointments > 0 ? Math.min(100, (monthlyTotals.appointments / goals.monthly.appointments) * 100) : 0,
                                  goals.monthly.offersWritten > 0 ? Math.min(100, (monthlyTotals.offersWritten / goals.monthly.offersWritten) * 100) : 0,
                                  goals.monthly.listingAgreements > 0 ? Math.min(100, (monthlyTotals.listingAgreements / goals.monthly.listingAgreements) * 100) : 0,
                                  goals.monthly.buyerContracts > 0 ? Math.min(100, (monthlyTotals.buyerContracts / goals.monthly.buyerContracts) * 100) : 0
                                ];
                                
                                const validProgressValues = progressValues.filter(val => 
                                  typeof val === 'number' && !isNaN(val) && isFinite(val)
                                );
                                
                                if (validProgressValues.length === 0) return '0.0';
                                
                                const totalProgress = validProgressValues.reduce((sum, progress) => sum + progress, 0) / validProgressValues.length;
                                
                                return (isNaN(totalProgress) || !isFinite(totalProgress)) ? '0.0' : totalProgress.toFixed(1);
                              } catch (error) {
                                console.error('Error calculating monthly progress:', error);
                                return '0.0';
                              }
                            })()}%
                          </p>
                          <small>Average completion across all goals</small>
                        </div>
                        <div className="tile">
                          <h4>Goals Met</h4>
                          <p style={{fontSize: '2rem', fontWeight: 'bold', color: '#28a745'}}>
                            {[
                              monthlyTotals.calls >= goals.monthly.calls,
                              monthlyTotals.hours >= goals.monthly.hours,
                              monthlyTotals.appointments >= goals.monthly.appointments,
                              monthlyTotals.offersWritten >= goals.monthly.offersWritten,
                              monthlyTotals.listingAgreements >= goals.monthly.listingAgreements,
                              monthlyTotals.buyerContracts >= goals.monthly.buyerContracts
                            ].filter(Boolean).length} / 6
                          </p>                          <small>Number of monthly goals achieved</small>
                        </div>
                      </div>
                    </div>
                    
                    {/* Monthly Property Activity Section */}
                    <div className="section" style={{marginTop: '2rem'}}>
                      <h4>Monthly Property Activity</h4>
                      {(() => {
                        // Get properties for the entire month
                        const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
                        const monthEnd = new Date(selectedYear, selectedMonth, 0);
                        
                        const monthProperties = properties.filter(property => {
                          const propertyDate = property.timestamp ? new Date(property.timestamp) : null;
                          if (!propertyDate) return false;
                          return propertyDate >= monthStart && propertyDate <= monthEnd;
                        });
                        
                        // Get monthly hours and expenses
                        const monthHours = hours.filter(hour => {
                          const hourDate = hour.timestamp ? new Date(hour.timestamp) : null;
                          if (!hourDate) return false;
                          return hourDate >= monthStart && hourDate <= monthEnd;
                        });
                        
                        const monthExpenses = expenses.filter(expense => {
                          const expenseDate = expense.timestamp ? new Date(expense.timestamp) : null;
                          if (!expenseDate) return false;
                          return expenseDate >= monthStart && expenseDate <= monthEnd;
                        });
                        
                        // Calculate totals
                        const totalHours = monthHours.reduce((sum, h) => sum + (h.hours || 0), 0);
                        const totalExpenses = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
                        
                        // Group by status
                        const statusGroups = monthProperties.reduce((groups, property) => {
                          const status = property.status || 'In Progress';
                          if (!groups[status]) groups[status] = [];
                          groups[status].push(property);
                          return groups;
                        }, {});
                        
                        return (
                          <>
                            <div className="grid" style={{gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1rem'}}>
                              <div className="tile">
                                <h4>Total Properties</h4>
                                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff'}}>
                                  {monthProperties.length}
                                </p>
                                <small>Properties added this month</small>
                              </div>
                              <div className="tile">
                                <h4>Total Hours</h4>
                                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745'}}>
                                  {totalHours.toFixed(1)}
                                </p>
                                <small>Hours worked this month</small>
                              </div>
                              <div className="tile">
                                <h4>Total Expenses</h4>
                                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545'}}>
                                  ${totalExpenses.toLocaleString()}
                                </p>
                                <small>Property expenses this month</small>
                              </div>
                              <div className="tile">
                                <h4>Closed Deals</h4>
                                <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#C5A95E'}}>
                                  {statusGroups['Closed'] ? statusGroups['Closed'].length : 0}
                                </p>
                                <small>Properties closed this month</small>
                              </div>
                            </div>
                            
                            {Object.keys(statusGroups).length > 0 && (
                              <div>
                                <h5>Properties by Status</h5>
                                {Object.entries(statusGroups).map(([status, props]) => (
                                  <div key={status} style={{marginBottom: '1rem'}}>
                                    <h6 style={{
                                      padding: '0.5rem',
                                      backgroundColor: 
                                        status === 'Closed' ? '#28a745' :
                                        status === 'Pending' ? '#ffc107' :
                                        status === 'Under Contract' ? '#17a2b8' :
                                        '#6c757d',
                                      color: 'white',
                                      borderRadius: '4px',
                                      margin: '0'
                                    }}>
                                      {status} ({props.length})
                                    </h6>
                                    <div style={{
                                      border: '1px solid #ddd',
                                      borderRadius: '0 0 4px 4px',
                                      padding: '0.5rem'
                                    }}>
                                      {props.map((property, index) => (
                                        <div key={index} style={{
                                          padding: '0.25rem',
                                          borderBottom: index < props.length - 1 ? '1px solid #f0f0f0' : 'none',
                                          fontSize: '0.9rem'
                                        }}>
                                          <strong>{property.address}</strong> - {property.client}
                                          <span style={{float: 'right', color: '#666'}}>
                                            ${property.price ? property.price.toLocaleString() : '0'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </>
                );
              })()}
            </div>          )}
        </div>
      )}      {/* Conversion Rates Tab */}
      {activeTab === 'conversionRates' && (
        <div className="section">
          <h2>Conversion Rates</h2>
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
              <h3>Offers Written to Accepted</h3>
              <p>{(() => {
                const offersWritten = properties.filter(p => p.offerWritten).length;
                const offersAccepted = properties.filter(p => p.offerWritten && p.offerAccepted).length;
                return offersWritten > 0 ? ((offersAccepted / offersWritten) * 100).toFixed(1) : '0.0';
              })()}%</p>
              <small>{properties.filter(p => p.offerWritten && p.offerAccepted).length} accepted / {properties.filter(p => p.offerWritten).length} written</small>
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
          </div>        </div>      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="section">
          <h2>Settings</h2>
          <div className="section">
            <h3>Application Settings</h3>
            <div>
              <label>Application Name</label>
              <input 
                type="text" 
                value={appName} 
                onChange={(e) => setAppName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  marginBottom: '1rem'
                }}
              />
            </div>
            <div>
              <label>Report Email Address</label>
              <input 
                type="email" 
                value={reportEmail} 
                onChange={(e) => setReportEmail(e.target.value)}
                placeholder="Enter email for reports"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  marginBottom: '1rem'
                }}
              />
            </div>            <div>
              <label>Report Phone Number</label>
              <input 
                type="tel" 
                value={reportPhone} 
                onChange={(e) => setReportPhone(e.target.value)}
                placeholder="Enter phone number for reports"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  marginBottom: '1rem'
                }}
              />
            </div>
            <div>
              <label>Manual Hourly Rate (leave 0 for auto-calculated)</label>
              <input 
                type="number" 
                value={manualHourlyRate} 
                onChange={(e) => setManualHourlyRate(parseFloat(e.target.value) || 0)}
                placeholder="Enter manual hourly rate"
                step="0.01"
                min="0"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  marginBottom: '1rem'
                }}
              />              <small style={{color: '#666', display: 'block', marginBottom: '1rem'}}>
                Current rate: ${hourlyRate.toFixed(2)}/hr 
                {manualHourlyRate > 0 ? ' (Manual)' : ' (Auto-calculated)'}
                {manualHourlyRate === 0 && (
                  <span> | Calculated: ${calculatedHourlyRate.toFixed(2)}/hr</span>
                )}
              </small>
            </div>
          </div>

          <div className="section">
            <h3>Experience Level Bonuses</h3>
            <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>
              Configure percentage bonuses applied to hourly rate based on experience level and transaction count.
              Current Level: {experienceLevel} (Experience) + {stepLevel} (Step) = {totalBonusPercentage}% total bonus
            </p>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{fontWeight: 'bold', marginBottom: '0.5rem', display: 'block'}}>Experience Level Bonuses (%)</label>
              <div className="grid" style={{gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem'}}>
                {Object.entries(experienceLevelBonuses).map(([level, bonus]) => (
                  <div key={level} style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <label style={{fontSize: '0.9rem', minWidth: '20px'}}>L{level}:</label>
                    <input
                      type="number"
                      value={bonus}
                      onChange={(e) => setExperienceLevelBonuses(prev => ({
                        ...prev,
                        [level]: parseFloat(e.target.value) || 0
                      }))}
                      min="0"
                      step="1"
                      style={{
                        width: '60px',
                        padding: '0.25rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        fontSize: '0.8rem'
                      }}
                    />
                    <span style={{fontSize: '0.8rem'}}>%</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{fontWeight: 'bold', marginBottom: '0.5rem', display: 'block'}}>Step Level Bonuses (%)</label>
              <div className="grid" style={{gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', maxWidth: '300px'}}>
                {Object.entries(stepLevelBonuses).map(([level, bonus]) => (
                  <div key={level} style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    <label style={{fontSize: '0.9rem', minWidth: '35px'}}>Step {level}:</label>
                    <input
                      type="number"
                      value={bonus}
                      onChange={(e) => setStepLevelBonuses(prev => ({
                        ...prev,
                        [level]: parseFloat(e.target.value) || 0
                      }))}
                      min="0"
                      step="1"
                      style={{
                        width: '60px',
                        padding: '0.25rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        fontSize: '0.8rem'
                      }}
                    />
                    <span style={{fontSize: '0.8rem'}}>%</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#e8f5e8',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{color: '#155724', margin: '0 0 0.5rem 0'}}>Current Calculation:</h4>
              <p style={{margin: '0', fontSize: '0.9rem'}}>
                Base Rate: ${baseHourlyRate.toFixed(2)}/hr × (1 + {totalBonusPercentage}%) = 
                <strong style={{color: '#155724'}}> ${hourlyRate.toFixed(2)}/hr</strong>
              </p>
              <p style={{margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#666'}}>
                Experience Level {experienceLevel} (+{experienceLevelBonuses[experienceLevel]}%) + 
                Step Level {stepLevel} (+{stepLevelBonuses[stepLevel]}%) = {totalBonusPercentage}% total bonus
              </p>            </div>

          </div>

          <div className="section">
            <h3>Email Configuration</h3>
            <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>
              Configure your email settings to send automated reports. Leave blank to disable email reports.
            </p>
            <div className="grid" style={{gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
              <div>
                <label>Email Service</label>
                <select 
                  value={emailConfig.service} 
                  onChange={(e) => setEmailConfig({...emailConfig, service: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: '1rem'
                  }}
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook</option>
                  <option value="yahoo">Yahoo</option>
                  <option value="custom">Custom SMTP</option>
                </select>
              </div>
              <div>
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={emailConfig.user} 
                  onChange={(e) => setEmailConfig({...emailConfig, user: e.target.value})}
                  placeholder="your.email@gmail.com"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: '1rem'
                  }}
                />
              </div>
            </div>
            <div className="grid" style={{gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
              <div>
                <label>App Password / Password</label>
                <input 
                  type="password" 
                  value={emailConfig.password} 
                  onChange={(e) => setEmailConfig({...emailConfig, password: e.target.value})}
                  placeholder="App password or account password"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: '1rem'
                  }}
                />
                <small style={{color: '#666', display: 'block'}}>
                  For Gmail, use App Password (not your regular password)
                </small>
              </div>
              <div>
                <button 
                  onClick={async () => {
                    if (!emailConfig.user || !emailConfig.password) {
                      alert('Please enter email and password first');
                      return;
                    }
                    
                    try {
                      const response = await fetch('http://localhost:3001/api/test-email', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          emailConfig,
                          testRecipient: reportEmail || emailConfig.user
                        })
                      });
                      
                      const result = await response.json();
                      if (result.success) {
                        alert('Test email sent successfully!');
                      } else {
                        alert('Test email failed: ' + result.message);
                      }
                    } catch (error) {
                      console.error('Error testing email:', error);
                      alert('Error testing email. Please check your connection.');
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '1.5rem'
                  }}
                >
                  Test Email
                </button>
              </div>
            </div>
            {emailConfig.service === 'custom' && (
              <div className="grid" style={{gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem'}}>
                <div>
                  <label>SMTP Host</label>
                  <input 
                    type="text" 
                    value={emailConfig.host} 
                    onChange={(e) => setEmailConfig({...emailConfig, host: e.target.value})}
                    placeholder="smtp.example.com"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      marginBottom: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label>Port</label>
                  <input 
                    type="number" 
                    value={emailConfig.port} 
                    onChange={(e) => setEmailConfig({...emailConfig, port: parseInt(e.target.value)})}
                    placeholder="587"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      marginBottom: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={emailConfig.secure} 
                      onChange={(e) => setEmailConfig({...emailConfig, secure: e.target.checked})}
                      style={{marginRight: '0.5rem'}}
                    />
                    Use SSL/TLS
                  </label>
                </div>
              </div>
            )}
            <div style={{marginTop: '1rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '0.9rem'}}>
              <strong>📧 Email Setup Instructions:</strong>
              <ul style={{marginTop: '0.5rem', paddingLeft: '1.2rem'}}>
                <li><strong>Gmail:</strong> Enable 2FA, then create an App Password at myaccount.google.com</li>
                <li><strong>Outlook:</strong> Use your Microsoft account email and password</li>
                <li><strong>Yahoo:</strong> Generate an App Password in Account Security settings</li>
                <li><strong>Custom:</strong> Enter your SMTP server details manually</li>
              </ul>
            </div>
          </div>

          <div className="section">
            <h3>SMS Configuration (Twilio)</h3>
            <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>
              Configure Twilio SMS settings to send text message reports. Leave blank to disable SMS reports. 
              <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer" style={{color: '#007bff'}}>Get Twilio credentials</a>
            </p>
            <div className="grid" style={{gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
              <div>
                <label>Account SID</label>
                <input 
                  type="text" 
                  value={smsConfig.accountSid} 
                  onChange={(e) => setSmsConfig({...smsConfig, accountSid: e.target.value})}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: '1rem'
                  }}
                />
              </div>
              <div>
                <label>Auth Token</label>
                <input 
                  type="password" 
                  value={smsConfig.authToken} 
                  onChange={(e) => setSmsConfig({...smsConfig, authToken: e.target.value})}
                  placeholder="Auth token from Twilio console"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: '1rem'
                  }}
                />
              </div>
            </div>
            <div className="grid" style={{gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
              <div>
                <label>Twilio Phone Number</label>
                <input 
                  type="tel" 
                  value={smsConfig.phoneNumber} 
                  onChange={(e) => setSmsConfig({...smsConfig, phoneNumber: e.target.value})}
                  placeholder="+1234567890"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    marginBottom: '1rem'
                  }}
                />
                <small style={{color: '#666', display: 'block'}}>
                  Your Twilio phone number (must include +1 country code)
                </small>
              </div>
              <div>
                <button 
                  onClick={async () => {
                    if (!smsConfig.accountSid || !smsConfig.authToken || !smsConfig.phoneNumber) {
                      alert('Please enter all Twilio credentials first');
                      return;
                    }
                    
                    if (!reportPhone) {
                      alert('Please set a report phone number in the settings above');
                      return;
                    }
                    
                    try {
                      const response = await fetch('http://localhost:3001/api/test-sms', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          smsConfig,
                          testRecipient: reportPhone
                        })
                      });
                      
                      const result = await response.json();
                      if (result.success) {
                        alert('Test SMS sent successfully!');
                      } else {
                        alert('Test SMS failed: ' + result.message);
                      }
                    } catch (error) {
                      console.error('Error testing SMS:', error);
                      alert('Error testing SMS. Please check your connection.');
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '1.5rem'
                  }}
                >
                  Test SMS
                </button>
              </div>
            </div>
            <div style={{marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', fontSize: '0.9rem'}}>
              <strong>📱 Twilio Setup Instructions:</strong>
              <ol style={{marginTop: '0.5rem', paddingLeft: '1.2rem'}}>
                <li>Create a free Twilio account at <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer">twilio.com</a></li>
                <li>Get a phone number from the Twilio console</li>
                <li>Copy your Account SID and Auth Token from the console dashboard</li>
                <li>Enter the credentials above and test the connection</li>
              </ol>
              <p style={{marginTop: '0.5rem', fontSize: '0.8rem', color: '#856404'}}>
                <strong>Note:</strong> Twilio free trial includes $15 credit. Standard SMS rates apply after trial.
              </p>
            </div>
          </div>

          <div className="section">
            <h3>Data Management</h3>
            <div className="grid" style={{gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
              <div>
                <h4>Export Data</h4>
                <button 
                  onClick={() => {
                    const allData = {
                      properties,
                      dailyInputs,
                      goals,
                      closedDeals,
                      expenses,
                      hours,
                      contractTransactions,
                      calendarEvents,
                      gciData,
                      exportDate: new Date().toISOString()
                    };
                    const dataStr = JSON.stringify(allData, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `kpi-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Download Backup
                </button>
                <p style={{fontSize: '0.8rem', color: '#666', marginTop: '0.5rem'}}>
                  Downloads all your data as a JSON file
                </p>
              </div>
              
              <div>
                <h4>Clear Data</h4>                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all data? This cannot be undone!')) {
                      if (window.confirm('This will delete ALL your properties, transactions, goals, and daily inputs. Are you absolutely sure?')) {
                        try {
                          // Clear all localStorage data
                          localStorage.clear();
                          
                          // Reset all state variables to their initial values
                          setProperties([]);
                          setExpenses([]);
                          setHours([]);
                          setShowings([]);
                          setOffers([]);
                          setListings([]);
                          setBuyers([]);
                          setLostDeals([]);
                          setTransactions([]);
                          setClosedDeals([]);
                          setContractTransactions([]);
                          setLeads({ total: 0, sources: { 'Social Media': 0, SOI: 0, Zillow: 0, OpCity: 0, Referral: 0, UpNest: 0, Homelight: 0, OneSuite: 0, 'Direct Mail': 0, Realtor: 0 } });
                          setCalls({ made: 0, answered: 0 });
                          setMarketingExpenses([]);
                          setGciData({ gciGoal: 215000, avgSale: 325090, avgCommission: 0.025 });
                          setDailyInputs({});
                          setGoals({ 
                            daily: { calls: 10, hours: 8, appointments: 2, offersWritten: 5, listingAgreements: 2, buyerContracts: 3 }, 
                            weekly: { calls: 70, hours: 40, appointments: 10, offersWritten: 25, listingAgreements: 10, buyerContracts: 15 }, 
                            monthly: { calls: 300, hours: 160, appointments: 40, offersWritten: 100, listingAgreements: 40, buyerContracts: 60 } 
                          });
                          
                          alert('All data has been cleared successfully!');
                          
                          // Reload the page to ensure complete reset
                          setTimeout(() => {
                            window.location.reload();
                          }, 1000);
                        } catch (error) {
                          console.error('Error clearing data:', error);
                          alert('There was an error clearing data. Please refresh the page manually.');
                        }
                      }
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ Clear All Data
                </button><p style={{fontSize: '0.8rem', color: '#666', marginTop: '0.5rem'}}>
                  ⚠️ This will permanently delete all data
                </p>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Weekly Reports</h3>
            <div className="grid" style={{gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
              <div>
                <h4>Automated Reports</h4>
                <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>
                  Weekly reports are automatically sent every Sunday at 8:00 PM to the configured email and phone recipients.
                </p>
                <button 
                  onClick={async () => {
                    const currentDate = new Date();
                    const currentYear = currentDate.getFullYear();
                    const currentMonth = currentDate.getMonth() + 1;
                    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
                    const currentWeek = Math.ceil((currentDate.getDate() + firstDayOfMonth.getDay()) / 7);
                    
                    const { weeklyTotals } = calculateWeeklyMetrics(currentYear, currentMonth, currentWeek);
                    const { startDate, endDate } = getWeekDates(currentYear, currentMonth, currentWeek);
                    
                    const weeklyReportData = {
                      week: currentWeek,
                      month: ['January', 'February', 'March', 'April', 'May', 'June', 
                             'July', 'August', 'September', 'October', 'November', 'December'][currentMonth - 1],
                      year: currentYear,
                      startDate: startDate.toLocaleDateString(),
                      endDate: endDate.toLocaleDateString(),
                      totals: weeklyTotals,
                      goals: goals.weekly,
                      progress: {
                        calls: ((weeklyTotals.calls / goals.weekly.calls) * 100).toFixed(1),
                        hours: ((weeklyTotals.hours / goals.weekly.hours) * 100).toFixed(1),
                        appointments: ((weeklyTotals.appointments / goals.weekly.appointments) * 100).toFixed(1),
                        offersWritten: ((weeklyTotals.offersWritten / goals.weekly.offersWritten) * 100).toFixed(1),
                        listingAgreements: ((weeklyTotals.listingAgreements / goals.weekly.listingAgreements) * 100).toFixed(1),
                        buyerContracts: ((weeklyTotals.buyerContracts / goals.weekly.buyerContracts) * 100).toFixed(1)
                      },
                      propertyActivity: {
                        newProperties: properties.filter(p => {
                          const propDate = new Date(p.timestamp);
                          return propDate >= startDate && propDate <= endDate;
                        }).length,
                        underContract: contractTransactions.filter(t => t.status === 'Under Contract').length,
                        closed: closedDeals.filter(d => {
                          const closedDate = new Date(d.closedDate);
                          return closedDate >= startDate && closedDate <= endDate;
                        }).length
                      }
                    };
                      try {
                      const emailRecipients = reportEmail ? [reportEmail] : [];
                      const phoneRecipients = reportPhone ? [reportPhone] : [];
                      
                      const response = await fetch('http://localhost:3001/api/send-weekly-report', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          reportData: weeklyReportData,
                          emailRecipients,
                          phoneRecipients,
                          emailConfig,
                          smsConfig
                        })
                      });
                      
                      const result = await response.json();
                      if (result.success) {
                        alert('Weekly report sent successfully!');
                      } else {
                        alert('Failed to send weekly report: ' + result.message);
                      }
                    } catch (error) {
                      console.error('Error sending weekly report:', error);
                      alert('Error sending weekly report. Please check your connection.');
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Send Weekly Report Now
                </button>
              </div>
                <div>
                <h4>Report Configuration</h4>
                <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem'}}>
                  Reports will be sent using your configured email and SMS settings.
                </p>
                <div style={{fontSize: '0.8rem', color: '#666', marginBottom: '1rem'}}>
                  <strong>Recipients:</strong><br/>
                  <span style={{marginLeft: '0.5rem'}}>Email: {reportEmail || 'Not configured'}</span><br/>
                  <span style={{marginLeft: '0.5rem'}}>Phone: {reportPhone || 'Not configured'}</span>
                </div>
                <div style={{fontSize: '0.8rem', color: '#666', marginBottom: '1rem'}}>
                  <strong>Service Configuration:</strong><br/>
                  <span style={{marginLeft: '0.5rem', color: emailConfig.user && emailConfig.password ? '#28a745' : '#dc3545'}}>
                    Email: {emailConfig.user && emailConfig.password ? `✓ Configured (${emailConfig.service})` : '✗ Not configured'}
                  </span><br/>
                  <span style={{marginLeft: '0.5rem', color: smsConfig.accountSid && smsConfig.authToken && smsConfig.phoneNumber ? '#28a745' : '#dc3545'}}>
                    SMS: {smsConfig.accountSid && smsConfig.authToken && smsConfig.phoneNumber ? '✓ Configured (Twilio)' : '✗ Not configured'}
                  </span>
                </div>
                <p style={{fontSize: '0.8rem', color: '#666'}}>
                  <strong>Schedule:</strong> Every Sunday at 8:00 PM<br/>
                  <strong>Content:</strong> Weekly KPI summary, progress vs goals, property activity
                </p>
                {(!emailConfig.user || !emailConfig.password) && (!smsConfig.accountSid || !smsConfig.authToken) && (
                  <p style={{fontSize: '0.8rem', color: '#dc3545', marginTop: '0.5rem', fontStyle: 'italic'}}>
                    ⚠️ Configure email and/or SMS settings above to enable report delivery
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="section">
          <h2>Insights & Analytics</h2>
          
          {/* Performance Insights */}
          <div className="section">
            <h3>Performance Insights</h3>
            <div className="insights-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'}}>
              {/* Conversion Rate Analysis */}
              <div className="insight-card" style={{
                border: '1px solid #C5A95E',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#f9f9f9'
              }}>
                <h4 style={{color: '#C5A95E', marginBottom: '0.5rem'}}>🎯 Conversion Opportunities</h4>
                {(() => {
                  const buyerApptToContractRate = totalBuyerAppts > 0 ? (totalBuyerContracts / totalBuyerAppts) * 100 : 0;
                  const listingApptToAgreementRate = totalListingAppts > 0 ? (totalListingAgreements / totalListingAppts) * 100 : 0;
                  const suggestions = [];
                  
                  if (buyerApptToContractRate < 30) {
                    suggestions.push("Consider improving buyer appointment quality - aim for 30%+ conversion rate");
                  }
                  if (listingApptToAgreementRate < 50) {
                    suggestions.push("Focus on listing appointment preparation - aim for 50%+ conversion rate");
                  }
                  if (totalBuyerAppts < 10) {
                    suggestions.push("Increase buyer appointment frequency to build momentum");
                  }
                  
                  return suggestions.length > 0 ? suggestions.map((suggestion, i) => (
                    <p key={i} style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>• {suggestion}</p>
                  )) : <p style={{color: '#28a745'}}>✅ Great conversion rates across the board!</p>;
                })()}
              </div>

              {/* Activity Level Analysis */}
              <div className="insight-card" style={{
                border: '1px solid #17a2b8',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#f9f9f9'
              }}>
                <h4 style={{color: '#17a2b8', marginBottom: '0.5rem'}}>📊 Activity Analysis</h4>
                {(() => {
                  const avgHoursPerWeek = totalWorkHours / Math.max(1, Math.ceil(Object.keys(dailyInputs).length / 7));
                  const suggestions = [];
                  
                  if (avgHoursPerWeek < 20) {
                    suggestions.push("Consider increasing weekly work hours for better results");
                  }
                  if (totalWorkHours > 0 && hourlyRate < 50) {
                    suggestions.push("Focus on higher-value activities to improve hourly rate");
                  }
                  if (Object.keys(dailyInputs).length < 30) {
                    suggestions.push("Maintain consistent daily tracking for better insights");
                  }
                  
                  return suggestions.length > 0 ? suggestions.map((suggestion, i) => (
                    <p key={i} style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>• {suggestion}</p>
                  )) : <p style={{color: '#28a745'}}>✅ Excellent activity levels and tracking!</p>;
                })()}
              </div>              {/* Deal Pipeline Health */}              <div className="insight-card" style={{
                border: '1px solid #28a745',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#f9f9f9'
              }}>
                <h4 style={{color: '#28a745', marginBottom: '0.5rem'}}>💼 Pipeline Health</h4>
                {(() => {
                  const activeDeals = contractTransactions.filter(t => ['Under Contract', 'Pending'].includes(t.status)).length;
                  const terminatedDeals = contractTransactions.filter(t => ['Terminated', 'Withdrawn', 'Expired', 'Fired Client'].includes(t.status)).length;
                  const closingRate = (closedDeals.length / Math.max(1, closedDeals.length + terminatedDeals)) * 100;
                  const suggestions = [];
                  
                  if (activeDeals < 3) {
                    suggestions.push("Build your pipeline - aim for 3+ active deals");
                  }
                  if (closingRate < 60) {
                    suggestions.push("Review deal qualification process to improve closing rate");
                  }
                  if (terminatedDeals > closedDeals.length) {
                    suggestions.push("Focus on deal retention strategies");
                  }
                  
                  return suggestions.length > 0 ? suggestions.map((suggestion, i) => (
                    <p key={i} style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>• {suggestion}</p>
                  )) : <p style={{color: '#28a745'}}>✅ Strong pipeline management!</p>;
                })()}
              </div>              {/* DOM (Days on Market) Analysis */}
              <div className="insight-card" style={{
                border: '1px solid #dc3545',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#f9f9f9'
              }}>
                <h4 style={{color: '#dc3545', marginBottom: '0.5rem'}}>⏱️ Days on Market (DOM)</h4>
                {(() => {
                  const sellerDealsWithDates = closedDeals.filter(deal => 
                    deal.type === 'Seller' && deal.statusDates?.listedDate && deal.closedDate
                  );
                  
                  let avgDOM = 0;
                  let minDOM = Infinity;
                  let maxDOM = 0;
                  
                  if (sellerDealsWithDates.length > 0) {
                    const domValues = sellerDealsWithDates.map(deal => {
                      const listedDate = new Date(deal.statusDates.listedDate);
                      const closedDate = new Date(deal.closedDate);
                      return Math.ceil((closedDate - listedDate) / (1000 * 60 * 60 * 24));
                    });
                    
                    avgDOM = domValues.reduce((sum, days) => sum + days, 0) / domValues.length;
                    minDOM = Math.min(...domValues);
                    maxDOM = Math.max(...domValues);
                  }
                    const suggestions = [];
                  
                  if (sellerDealsWithDates.length === 0) {
                    suggestions.push("No closed listings with dates available for DOM analysis");
                  } else {
                    // DOM Performance Rating
                    let domRating = "";
                    if (avgDOM <= 7) {
                      domRating = "Excellent";
                    } else if (avgDOM <= 14) {
                      domRating = "Very Good";
                    } else if (avgDOM <= 21) {
                      domRating = "Good";
                    } else if (avgDOM <= 30) {
                      domRating = "Not Bad";
                    } else {
                      domRating = "Not Great";
                    }
                    
                    suggestions.push(`Average DOM: ${Math.round(avgDOM)} days - ${domRating}`);
                    
                    // Individual deal analysis
                    if (maxDOM > 30) {
                      suggestions.push("Some listings took 30+ days - consider pricing and marketing strategies");
                    }
                    
                    if (minDOM <= 7 && sellerDealsWithDates.length > 1) {
                      suggestions.push(`✅ Fastest listing closed in ${minDOM} days - excellent!`);
                    }
                    
                    // Range analysis
                    if (sellerDealsWithDates.length > 1) {
                      suggestions.push(`DOM range: ${minDOM} - ${maxDOM} days`);
                    }
                  }
                  
                  return suggestions.map((suggestion, i) => (
                    <p key={i} style={{fontSize: '0.9rem', marginBottom: '0.5rem'}}>• {suggestion}</p>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Activity Timeline Chart */}
          <div className="section">
            <h3>Activity Over Time</h3>
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: 'white',
              minHeight: '400px'
            }}>
              <canvas 
                ref={chartRef}
                id="activityChart"
                style={{
                  width: '100%',
                  height: '350px'
                }}
              ></canvas>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="section">
            <h3>Key Performance Indicators</h3>
            <div className="grid">              <div className="tile" style={{backgroundColor: '#f8f9fa'}}>
                <h4>Efficiency Score</h4>
                <p style={{fontSize: '2rem', color: '#C5A95E'}}>
                  {(() => {
                    try {
                      // 1. Daily Goal Achievement (40% weight)
                      const todayStr = new Date().toISOString().split('T')[0];
                      const todayData = dailyInputs[todayStr] || {};
                      
                      const dailyCallsProgress = Math.min(100, ((todayData.callsMade || 0) / goals.daily.calls) * 100);
                      const dailyHoursProgress = Math.min(100, ((todayData.hoursWorked || 0) / goals.daily.hours) * 100);
                      const dailyApptsProgress = Math.min(100, (((todayData.listingsApptsTaken || 0) + (todayData.buyerAppts || 0)) / goals.daily.appointments) * 100);
                      const dailyOffersProgress = Math.min(100, ((todayData.offersWritten || 0) / goals.daily.offersWritten) * 100);
                      const dailyListingProgress = Math.min(100, ((todayData.listingAgreements || 0) / goals.daily.listingAgreements) * 100);
                      const dailyBuyerProgress = Math.min(100, ((todayData.buyerContracts || 0) / goals.daily.buyerContracts) * 100);
                      
                      const dailyGoalScore = (dailyCallsProgress + dailyHoursProgress + dailyApptsProgress + dailyOffersProgress + dailyListingProgress + dailyBuyerProgress) / 6;
                      
                      // 2. Conversion Rates (30% weight)
                      const buyerContractClosingRate = totalBuyerContracts > 0 ? (totalBuyerDeals / totalBuyerContracts) * 100 : 0;
                      const listingAgreementClosingRate = totalListingAgreements > 0 ? (totalSellerDeals / totalListingAgreements) * 100 : 0;
                      const buyerApptContractRate = totalBuyerAppts > 0 ? (totalBuyerContracts / totalBuyerAppts) * 100 : 0;
                      const listingApptAgreementRate = totalListingAppts > 0 ? (totalListingAgreements / totalListingAppts) * 100 : 0;
                      const offerAcceptanceRate = properties.filter(p => p.offerWritten).length > 0 ? 
                        (properties.filter(p => p.offerWritten && p.offerAccepted).length / properties.filter(p => p.offerWritten).length) * 100 : 0;
                      
                      const conversionScore = (buyerContractClosingRate + listingAgreementClosingRate + buyerApptContractRate + listingApptAgreementRate + offerAcceptanceRate) / 5;
                      
                      // 3. Time Efficiency including DOM (20% weight)
                      const sellerDealsWithDates = closedDeals.filter(deal => 
                        deal.type === 'Seller' && deal.statusDates?.listedDate && deal.closedDate
                      );
                      const buyerDealsWithDates = closedDeals.filter(deal => 
                        deal.type === 'Buyer' && deal.statusDates?.buyerContractDate && deal.closedDate
                      );
                      
                      let avgSellerTime = 0;
                      let avgBuyerTime = 0;
                      let avgDOM = 0;
                      
                      if (sellerDealsWithDates.length > 0) {
                        const totalSellerDays = sellerDealsWithDates.reduce((sum, deal) => {
                          const listedDate = new Date(deal.statusDates.listedDate);
                          const closedDate = new Date(deal.closedDate);
                          const days = Math.ceil((closedDate - listedDate) / (1000 * 60 * 60 * 24));
                          return sum + days;
                        }, 0);
                        avgSellerTime = totalSellerDays / sellerDealsWithDates.length;
                        avgDOM = avgSellerTime; // DOM is the same as avg seller time for listings
                      }
                      
                      if (buyerDealsWithDates.length > 0) {
                        const totalBuyerDays = buyerDealsWithDates.reduce((sum, deal) => {
                          const contractDate = new Date(deal.statusDates.buyerContractDate);
                          const closedDate = new Date(deal.closedDate);
                          return sum + Math.ceil((closedDate - contractDate) / (1000 * 60 * 60 * 24));
                        }, 0);
                        avgBuyerTime = totalBuyerDays / buyerDealsWithDates.length;
                      }
                        // Score based on faster closing times and DOM performance
                      const sellerTimeScore = avgSellerTime > 0 ? Math.max(0, Math.min(100, (45 / avgSellerTime) * 100)) : 100;
                      const buyerTimeScore = avgBuyerTime > 0 ? Math.max(0, Math.min(100, (30 / avgBuyerTime) * 100)) : 100;
                      
                      // DOM Score based on new criteria
                      let domScore = 100;
                      if (avgDOM > 0) {
                        if (avgDOM <= 7) domScore = 100;        // Excellent
                        else if (avgDOM <= 14) domScore = 85;   // Very Good
                        else if (avgDOM <= 21) domScore = 70;   // Good
                        else if (avgDOM <= 30) domScore = 55;   // Not Bad
                        else domScore = 40;                     // Not Great
                      }
                      
                      const timeEfficiencyScore = (sellerTimeScore + buyerTimeScore + domScore) / 3;
                        // 4. ROI Efficiency (10% weight)
                      const totalCommissionEarned = closedDeals.reduce((sum, deal) => sum + (deal.commission || 0), 0);
                      const totalExpensesIncurred = [...expenses, ...closedDeals.flatMap(deal => deal.expensesDetails || [])].reduce((sum, expense) => sum + (expense.amount || 0), 0);
                      let roiScore = 100; // Default to 100 if no expenses
                      
                      if (totalExpensesIncurred > 0 && totalCommissionEarned > 0) {
                        const roiRatio = totalCommissionEarned / totalExpensesIncurred;
                        // ROI score: 2:1 ratio = 50 points, 4:1 ratio = 75 points, 6:1+ ratio = 100 points
                        if (roiRatio >= 6) roiScore = 100;
                        else if (roiRatio >= 4) roiScore = 75;
                        else if (roiRatio >= 2) roiScore = 50;
                        else roiScore = Math.max(0, roiRatio * 25); // Below 2:1 gets proportional score
                      }
                      
                      // Calculate weighted final score
                      const finalScore = (
                        (dailyGoalScore * 0.4) +
                        (conversionScore * 0.3) +
                        (timeEfficiencyScore * 0.2) +
                        (roiScore * 0.1)
                      );
                      
                      return Math.round(Math.max(0, Math.min(100, finalScore)));
                    } catch (error) {
                      console.error('Error calculating efficiency score:', error);
                      return 0;
                    }
                  })()}%
                </p>
                <small style={{color: '#666'}}>
                  Daily goals (40%), conversions (30%), time/DOM efficiency (20%), ROI (10%)
                </small>
              </div>
              
              <div className="tile" style={{backgroundColor: '#f8f9fa'}}>
                <h4>Monthly Revenue Run Rate</h4>
                <p style={{fontSize: '1.5rem', color: '#28a745'}}>
                  ${(() => {
                    const monthsTracked = Math.max(1, Object.keys(dailyInputs).length / 30);
                    const monthlyCommission = totalClosedCommission / monthsTracked;
                    return monthlyCommission.toFixed(0);
                  })()}
                </p>
                <small style={{color: '#666'}}>
                  Based on current closing rate
                </small>
              </div>
              
              <div className="tile" style={{backgroundColor: '#f8f9fa'}}>
                <h4>Days to Close (Avg)</h4>
                <p style={{fontSize: '1.5rem', color: '#17a2b8'}}>
                  {(() => {
                    const dealsWithDates = closedDeals.filter(deal => deal.statusDates?.underContractDate && deal.closedDate);
                    if (dealsWithDates.length === 0) return 'N/A';
                    const totalDays = dealsWithDates.reduce((sum, deal) => {
                      const contractDate = new Date(deal.statusDates.underContractDate);
                      const closedDate = new Date(deal.closedDate);
                      return sum + Math.ceil((closedDate - contractDate) / (1000 * 60 * 60 * 24));
                    }, 0);
                    return Math.round(totalDays / dealsWithDates.length);
                  })()} days
                </p>
                <small style={{color: '#666'}}>
                  From under contract to closing
                </small>
              </div>
                <div className="tile" style={{backgroundColor: '#f8f9fa'}}>
                <h4>ROI on Expenses</h4>
                <p style={{fontSize: '1.5rem', color: '#ffc107'}}>
                  {(() => {
                    // Include both regular expenses and expenses from closed deals
                    const regularExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
                    const closedDealExpenses = closedDeals.reduce((sum, deal) => sum + (deal.totalExpenses || 0), 0);
                    const totalExpensesAmount = regularExpenses + closedDealExpenses;
                    
                    if (totalExpensesAmount === 0) return 'N/A';
                    
                    // Use total closed commission which includes both regular and closed deal commissions
                    const roi = ((totalClosedCommission - totalExpensesAmount) / totalExpensesAmount) * 100;
                    return roi.toFixed(0) + '%';
                  })()}
                </p>
                <small style={{color: '#666'}}>
                  Commission earned vs expenses
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
