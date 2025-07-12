// email-scheduler.js
// This script can be run as a separate Node.js process to send emails automatically

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Email configuration - you'll need to set up your email credentials
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your email service
  auth: {
    user: 'your-email@gmail.com', // Replace with your email
    pass: 'your-app-password' // Replace with your app password
  }
});

// Function to read data from localStorage (you'll need to export this from your React app)
function getDailyReportData() {
  try {
    // This would need to be adapted to read from your data source
    // For now, this is a template
    const today = new Date().toISOString().split('T')[0];
    
    // You would need to export your data to a JSON file or API endpoint
    // and read it here
    const dailyInputs = {}; // Load from your data source
    const goals = {}; // Load from your data source
    
    return {
      date: today,
      hoursWorked: dailyInputs[today]?.hoursWorked || 0,
      callsMade: dailyInputs[today]?.callsMade || 0,
      callsAnswered: dailyInputs[today]?.callsAnswered || 0,
      // ... other data
    };
  } catch (error) {
    console.error('Error reading daily report data:', error);
    return null;
  }
}

// Function to send the daily report
async function sendDailyReport() {
  try {
    const reportData = getDailyReportData();
    if (!reportData) {
      console.log('No report data available');
      return;
    }

    const subject = `Daily Real Estate Report - ${reportData.date}`;
    const htmlBody = `
      <h2>Daily Real Estate Activity Report</h2>
      <p><strong>Date:</strong> ${reportData.date}</p>
      
      <h3>DAILY ACTIVITY:</h3>
      <ul>
        <li>Hours Worked: ${reportData.hoursWorked}</li>
        <li>Calls Made: ${reportData.callsMade}</li>
        <li>Calls Answered: ${reportData.callsAnswered}</li>
        <li>Listing Appointments: ${reportData.listingAppts || 0}</li>
        <li>Buyer Appointments: ${reportData.buyerAppts || 0}</li>
      </ul>
      
      <p><em>Generated automatically by KPI Dashboard</em></p>
    `;

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: 'nhcazateam@gmail.com',
      subject: subject,
      html: htmlBody
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Schedule the email to be sent at 11:59 PM daily
function scheduleDailyReport() {
  const now = new Date();
  const target = new Date();
  target.setHours(23, 59, 0, 0); // Set to 11:59 PM
  
  // If it's already past 11:59 PM today, schedule for tomorrow
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }
  
  const timeUntilTarget = target.getTime() - now.getTime();
  
  console.log(`Next email scheduled for: ${target.toLocaleString()}`);
  
  setTimeout(() => {
    sendDailyReport();
    // Schedule the next day
    setInterval(sendDailyReport, 24 * 60 * 60 * 1000); // Every 24 hours
  }, timeUntilTarget);
}

// Start the scheduler
if (require.main === module) {
  console.log('Starting daily report email scheduler...');
  scheduleDailyReport();
}

module.exports = { sendDailyReport, scheduleDailyReport };
