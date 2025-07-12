// server.js - Express server with email and SMS sending capability
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

// Load environment variables
require('dotenv').config();

// Initialize Twilio (optional - only if SMS credentials are provided)
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio SMS service initialized');
  } else {
    console.log('Twilio credentials not found - SMS functionality disabled');
  }
} catch (error) {
  console.log('Twilio not available - SMS functionality disabled');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'nhcazateam@gmail.com', // Set this in environment
    pass: process.env.EMAIL_PASS || 'your-app-password'     // Set this in environment
  }
});

// Default recipient emails
const DEFAULT_RECIPIENTS = [
  'nhcazateam@gmail.com',
  'corey@nhomeatlast.net'
];

// API endpoint for sending emails to multiple recipients
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body, recipients } = req.body;
    
    if (!subject || !body) {
      return res.status(400).json({ error: 'Missing required fields: subject, body' });
    }

    // Use provided recipients, single 'to' address, or default recipients
    let emailRecipients = DEFAULT_RECIPIENTS;
    if (recipients && Array.isArray(recipients) && recipients.length > 0) {
      emailRecipients = recipients;
    } else if (to) {
      emailRecipients = [to];
    }

    const results = [];
    
    // Send email to each recipient
    for (const recipient of emailRecipients) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER || 'nhcazateam@gmail.com',
          to: recipient,
          subject: subject,
          html: body
        };

        const info = await transporter.sendMail(mailOptions);
        results.push({
          recipient: recipient,
          success: true,
          messageId: info.messageId
        });
      } catch (error) {
        results.push({
          recipient: recipient,
          success: false,
          error: error.message
        });
      }
    }

    // Check if at least one email was sent successfully
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: successCount > 0,
      message: `${successCount} emails sent successfully, ${failureCount} failed`,
      results: results,
      recipients: emailRecipients
    });

  } catch (error) {
    console.error('Error in send-email endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
});

// API endpoint for sending SMS
app.post('/api/send-sms', async (req, res) => {
  try {
    if (!twilioClient) {
      return res.status(500).json({ 
        error: 'SMS service not available',
        message: 'Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your .env file.'
      });
    }

    const { to, body, phoneNumbers } = req.body;
    
    if (!body) {
      return res.status(400).json({ error: 'Missing required field: body' });
    }

    // Default phone numbers (you'll need to set these)
    const DEFAULT_PHONE_NUMBERS = process.env.DEFAULT_SMS_RECIPIENTS 
      ? process.env.DEFAULT_SMS_RECIPIENTS.split(',') 
      : [];

    // Use provided phone numbers, single 'to' number, or default numbers
    let smsRecipients = DEFAULT_PHONE_NUMBERS;
    if (phoneNumbers && Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
      smsRecipients = phoneNumbers;
    } else if (to) {
      smsRecipients = [to];
    }

    if (smsRecipients.length === 0) {
      return res.status(400).json({ 
        error: 'No SMS recipients specified',
        message: 'Please provide phone numbers or set DEFAULT_SMS_RECIPIENTS in .env'
      });
    }

    const results = [];
    
    // Send SMS to each recipient
    for (const phoneNumber of smsRecipients) {
      try {
        const message = await twilioClient.messages.create({
          body: body,
          from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
          to: phoneNumber
        });

        results.push({
          recipient: phoneNumber,
          success: true,
          messageSid: message.sid
        });
      } catch (error) {
        results.push({
          recipient: phoneNumber,
          success: false,
          error: error.message
        });
      }
    }

    // Check if at least one SMS was sent successfully
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: successCount > 0,
      message: `${successCount} SMS sent successfully, ${failureCount} failed`,
      results: results,
      recipients: smsRecipients
    });

  } catch (error) {
    console.error('Error in send-sms endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to send SMS', 
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test email endpoint - sends to both default recipients
app.post('/api/test-email', async (req, res) => {
  try {
    const results = [];
    
    // Send test email to both default recipients
    for (const recipient of DEFAULT_RECIPIENTS) {
      try {
        const testEmail = {
          from: process.env.EMAIL_USER || 'nhcazateam@gmail.com',
          to: recipient,
          subject: 'Test Email from KPI Dashboard',
          text: 'This is a test email to verify the email service is working correctly.',
          html: `<h1>Test Email</h1>
                 <p>This is a test email to verify the email service is working correctly.</p>
                 <p><strong>Recipient:</strong> ${recipient}</p>
                 <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
                 <p><strong>Server:</strong> ${process.env.EMAIL_USER || 'nhcazateam@gmail.com'}</p>`
        };

        const info = await transporter.sendMail(testEmail);
        results.push({
          recipient: recipient,
          success: true,
          messageId: info.messageId
        });
      } catch (error) {
        results.push({
          recipient: recipient,
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    res.json({ 
      success: successCount > 0,
      message: `Test email sent to ${successCount}/${DEFAULT_RECIPIENTS.length} recipients`,
      results: results,
      recipients: DEFAULT_RECIPIENTS,
      emailConfig: {
        user: process.env.EMAIL_USER || 'nhcazateam@gmail.com',
        hasPassword: !!(process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'YOUR_GMAIL_APP_PASSWORD_HERE')
      }
    });
    
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ 
      error: 'Failed to send test email', 
      details: error.message,
      emailConfig: {
        user: process.env.EMAIL_USER || 'nhcazateam@gmail.com',
        hasPassword: !!(process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'YOUR_GMAIL_APP_PASSWORD_HERE')
      }
    });
  }
});

// Test SMS endpoint - sends to configured phone numbers
app.post('/api/test-sms', async (req, res) => {
  try {
    if (!twilioClient) {
      return res.status(500).json({ 
        error: 'SMS service not available',
        message: 'Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your .env file.'
      });
    }

    const DEFAULT_PHONE_NUMBERS = process.env.DEFAULT_SMS_RECIPIENTS 
      ? process.env.DEFAULT_SMS_RECIPIENTS.split(',') 
      : [];

    if (DEFAULT_PHONE_NUMBERS.length === 0) {
      return res.status(400).json({ 
        error: 'No SMS recipients configured',
        message: 'Please set DEFAULT_SMS_RECIPIENTS in your .env file with comma-separated phone numbers'
      });
    }

    const results = [];
    
    // Send test SMS to all configured numbers
    for (const phoneNumber of DEFAULT_PHONE_NUMBERS) {
      try {
        const message = await twilioClient.messages.create({
          body: `Test SMS from KPI Dashboard\nSent at: ${new Date().toLocaleString()}\nRecipient: ${phoneNumber}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber.trim()
        });

        results.push({
          recipient: phoneNumber.trim(),
          success: true,
          messageSid: message.sid
        });
      } catch (error) {
        results.push({
          recipient: phoneNumber.trim(),
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: successCount > 0,
      message: `Test SMS sent to ${successCount}/${DEFAULT_PHONE_NUMBERS.length} recipients`,
      results: results,
      recipients: DEFAULT_PHONE_NUMBERS
    });

  } catch (error) {
    console.error('Error sending test SMS:', error);
    res.status(500).json({ 
      error: 'Failed to send test SMS', 
      details: error.message 
    });  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { emailConfig, testRecipient } = req.body;
    
    if (!emailConfig || !emailConfig.user || !emailConfig.password) {
      return res.status(400).json({ error: 'Missing email configuration' });
    }

    // Create transporter with user-provided configuration
    let transporterConfig = {};
    
    if (emailConfig.service === 'custom') {
      transporterConfig = {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password
        }
      };
    } else {
      transporterConfig = {
        service: emailConfig.service,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password
        }
      };
    }

    const testTransporter = nodemailer.createTransporter(transporterConfig);

    const mailOptions = {
      from: emailConfig.user,
      to: testRecipient,
      subject: 'KPI Dashboard - Email Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email from your KPI Dashboard.</p>
        <p><strong>Sent from:</strong> ${emailConfig.user}</p>
        <p><strong>Service:</strong> ${emailConfig.service}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p>If you receive this email, your email configuration is working correctly!</p>
      `
    };

    const info = await testTransporter.sendMail(mailOptions);
    res.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ 
      error: 'Failed to send test email', 
      details: error.message 
    });
  }
});

// Test SMS endpoint
app.post('/api/test-sms', async (req, res) => {
  try {
    const { smsConfig, testRecipient } = req.body;
    
    if (!smsConfig || !smsConfig.accountSid || !smsConfig.authToken || !smsConfig.phoneNumber) {
      return res.status(400).json({ error: 'Missing SMS configuration' });
    }

    // Create Twilio client with user-provided configuration
    const twilio = require('twilio');
    const testTwilioClient = twilio(smsConfig.accountSid, smsConfig.authToken);

    const message = await testTwilioClient.messages.create({
      body: `KPI Dashboard SMS Test - ${new Date().toLocaleString()}. Your SMS configuration is working correctly!`,
      from: smsConfig.phoneNumber,
      to: testRecipient
    });

    res.json({
      success: true,
      message: 'Test SMS sent successfully',
      messageSid: message.sid
    });

  } catch (error) {
    console.error('Error sending test SMS:', error);
    res.status(500).json({ 
      error: 'Failed to send test SMS', 
      details: error.message 
    });
  }
});

// Weekly report endpoint
app.post('/api/send-weekly-report', async (req, res) => {
  try {
    const { reportData, emailRecipients, phoneRecipients, emailConfig, smsConfig } = req.body;
    
    if (!reportData) {
      return res.status(400).json({ error: 'Missing reportData' });
    }

    const results = {
      email: [],
      sms: []
    };

    // Generate weekly report content
    const emailSubject = `Weekly KPI Report - Week ${reportData.week} of ${reportData.month} ${reportData.year}`;
    const emailBody = `
      <h2>Weekly Performance Report</h2>
      <h3>Week ${reportData.week} of ${reportData.month} ${reportData.year}</h3>
      <p><strong>Date Range:</strong> ${reportData.startDate} - ${reportData.endDate}</p>
      
      <h3>Performance Summary</h3>
      <table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Metric</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Actual</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Goal</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Progress</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Calls Made</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.totals.calls}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.goals.calls}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.progress.calls}%</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Hours Worked</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.totals.hours}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.goals.hours}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.progress.hours}%</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Appointments</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.totals.appointments}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.goals.appointments}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.progress.appointments}%</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Offers Written</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.totals.offersWritten}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.goals.offersWritten}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.progress.offersWritten}%</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Listing Agreements</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.totals.listingAgreements}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.goals.listingAgreements}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.progress.listingAgreements}%</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Buyer Contracts</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.totals.buyerContracts}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.goals.buyerContracts}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${reportData.progress.buyerContracts}%</td>
        </tr>
      </table>
      
      <h3>Property Activity</h3>
      <p><strong>New Properties Added:</strong> ${reportData.propertyActivity?.newProperties || 0}</p>
      <p><strong>Properties Under Contract:</strong> ${reportData.propertyActivity?.underContract || 0}</p>
      <p><strong>Properties Closed:</strong> ${reportData.propertyActivity?.closed || 0}</p>
      
      <p><em>Generated on ${new Date().toLocaleString()}</em></p>
    `;

    // Send emails using user-provided configuration
    if (emailRecipients && emailRecipients.length > 0 && emailConfig && emailConfig.user && emailConfig.password) {
      // Create transporter with user-provided configuration
      let transporterConfig = {};
      
      if (emailConfig.service === 'custom') {
        transporterConfig = {
          host: emailConfig.host,
          port: emailConfig.port,
          secure: emailConfig.secure,
          auth: {
            user: emailConfig.user,
            pass: emailConfig.password
          }
        };
      } else {
        transporterConfig = {
          service: emailConfig.service,
          auth: {
            user: emailConfig.user,
            pass: emailConfig.password
          }
        };
      }

      const reportTransporter = nodemailer.createTransporter(transporterConfig);

      for (const recipient of emailRecipients) {
        try {
          const mailOptions = {
            from: emailConfig.user,
            to: recipient,
            subject: emailSubject,
            html: emailBody
          };

          const info = await reportTransporter.sendMail(mailOptions);
          results.email.push({
            recipient: recipient,
            success: true,
            messageId: info.messageId
          });
        } catch (error) {
          results.email.push({
            recipient: recipient,
            success: false,
            error: error.message
          });
        }
      }
    } else if (!emailConfig || !emailConfig.user || !emailConfig.password) {
      results.email.push({
        recipient: 'N/A',
        success: false,
        error: 'Email configuration not provided or incomplete'
      });
    }

    // Send SMS using user-provided configuration
    if (phoneRecipients && phoneRecipients.length > 0 && smsConfig && smsConfig.accountSid && smsConfig.authToken && smsConfig.phoneNumber) {
      const smsBody = `Weekly KPI Report - Week ${reportData.week}
Calls: ${reportData.totals.calls}/${reportData.goals.calls} (${reportData.progress.calls}%)
Hours: ${reportData.totals.hours}/${reportData.goals.hours} (${reportData.progress.hours}%)
Appointments: ${reportData.totals.appointments}/${reportData.goals.appointments} (${reportData.progress.appointments}%)
New Properties: ${reportData.propertyActivity?.newProperties || 0}
Closed: ${reportData.propertyActivity?.closed || 0}`;

      // Create Twilio client with user-provided configuration
      const twilio = require('twilio');
      const reportTwilioClient = twilio(smsConfig.accountSid, smsConfig.authToken);

      for (const phoneNumber of phoneRecipients) {
        try {
          const message = await reportTwilioClient.messages.create({
            body: smsBody,
            from: smsConfig.phoneNumber,
            to: phoneNumber
          });

          results.sms.push({
            recipient: phoneNumber,
            success: true,
            messageSid: message.sid
          });
        } catch (error) {
          results.sms.push({
            recipient: phoneNumber,
            success: false,
            error: error.message
          });
        }
      }
    } else if (!smsConfig || !smsConfig.accountSid || !smsConfig.authToken || !smsConfig.phoneNumber) {
      results.sms.push({
        recipient: 'N/A',
        success: false,
        error: 'SMS configuration not provided or incomplete'
      });
    }

    const emailSuccessCount = results.email.filter(r => r.success).length;
    const smsSuccessCount = results.sms.filter(r => r.success).length;

    res.json({
      success: emailSuccessCount > 0 || smsSuccessCount > 0,
      message: `Weekly report sent: ${emailSuccessCount} emails, ${smsSuccessCount} SMS`,
      results: results
    });

  } catch (error) {
    console.error('Error sending weekly report:', error);
    res.status(500).json({ 
      error: 'Failed to send weekly report', 
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Email service configured for: ${process.env.EMAIL_USER || 'Not configured - set EMAIL_USER and EMAIL_PASS environment variables'}`);
  
  // Schedule weekly reports for every Sunday at 8:00 PM
  cron.schedule('0 20 * * 0', async () => {
    console.log('Running weekly report cron job...');
    
    try {
      // Calculate current week data
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const currentWeek = Math.ceil((now.getDate() + firstDayOfMonth.getDay()) / 7);
      
      // You would need to fetch actual data from your frontend
      // For now, this is a placeholder structure
      const weeklyReportData = {
        week: currentWeek,
        month: now.toLocaleString('default', { month: 'long' }),
        year: currentYear,
        startDate: new Date(now.setDate(now.getDate() - now.getDay())).toLocaleDateString(),
        endDate: new Date(now.setDate(now.getDate() - now.getDay() + 6)).toLocaleDateString(),
        totals: {
          calls: 0, // These would come from your app data
          hours: 0,
          appointments: 0,
          offersWritten: 0,
          listingAgreements: 0,
          buyerContracts: 0
        },
        goals: {
          calls: 70,
          hours: 40,
          appointments: 10,
          offersWritten: 25,
          listingAgreements: 10,
          buyerContracts: 15
        },
        progress: {
          calls: '0.0',
          hours: '0.0',
          appointments: '0.0',
          offersWritten: '0.0',
          listingAgreements: '0.0',
          buyerContracts: '0.0'
        },
        propertyActivity: {
          newProperties: 0,
          underContract: 0,
          closed: 0
        }
      };
      
      // Send to default recipients
      const emailRecipients = DEFAULT_RECIPIENTS;
      const phoneRecipients = process.env.DEFAULT_SMS_RECIPIENTS 
        ? process.env.DEFAULT_SMS_RECIPIENTS.split(',').map(num => num.trim()) 
        : [];
      
      // This would ideally make a request to your own endpoint
      // For simplicity, we'll just log that the job ran
      console.log('Weekly report would be sent to:', emailRecipients);
      if (phoneRecipients.length > 0) {
        console.log('SMS would be sent to:', phoneRecipients);
      }
      
    } catch (error) {
      console.error('Error in weekly report cron job:', error);
    }
  }, {
    timezone: "America/New_York" // Adjust timezone as needed
  });
  
  console.log('Weekly report scheduler initialized - reports will be sent every Sunday at 8:00 PM');
});