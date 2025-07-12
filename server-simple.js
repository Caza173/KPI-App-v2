// Simplified server with basic functionality
console.log('Starting KPI Dashboard Server...');

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

// Email configuration
console.log('Configuring email transporter...');
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'nhcazateam@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Default recipient emails
const DEFAULT_RECIPIENTS = [
  'nhcazateam@gmail.com',
  'corey@nhomeatlast.net'
];

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'KPI Dashboard Server is running'
  });
});

// API endpoint for sending emails to multiple recipients
app.post('/api/send-email', async (req, res) => {
  console.log('Received email request:', req.body);
  
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

        console.log(`Sending email to ${recipient}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipient}: ${info.messageId}`);
        
        results.push({
          recipient: recipient,
          success: true,
          messageId: info.messageId
        });
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error.message);
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

// Test email endpoint - sends to both default recipients
app.post('/api/test-email', async (req, res) => {
  console.log('Test email requested');
  
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

        console.log(`Sending test email to ${recipient}...`);
        const info = await transporter.sendMail(testEmail);
        console.log(`Test email sent to ${recipient}: ${info.messageId}`);
        
        results.push({
          recipient: recipient,
          success: true,
          messageId: info.messageId
        });
      } catch (error) {
        console.error(`Failed to send test email to ${recipient}:`, error.message);
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

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📧 Email service configured for: ${process.env.EMAIL_USER || 'Not configured - set EMAIL_USER and EMAIL_PASS environment variables'}`);
  console.log(`🌐 Test URL: http://localhost:${PORT}/test`);
  console.log(`📊 Dashboard: http://localhost:3000 (start React dev server separately)`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
