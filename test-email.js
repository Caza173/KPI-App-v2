// Email test script
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error.message);
    console.log('📝 Make sure to:');
    console.log('   1. Enable 2FA on Gmail account');
    console.log('   2. Generate an App Password');
    console.log('   3. Update .env file with the App Password');
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Send test email
const testEmail = {
  from: process.env.EMAIL_USER,
  to: 'nhcazateam@gmail.com',
  subject: 'KPI Dashboard - Email Test',
  text: 'This is a test email from your KPI Dashboard application.',
  html: '<h2>KPI Dashboard - Email Test</h2><p>This is a test email from your KPI Dashboard application.</p><p>✅ Email functionality is working correctly!</p>'
};

transporter.sendMail(testEmail, (error, info) => {
  if (error) {
    console.log('❌ Failed to send test email:', error.message);
  } else {
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
  }
});
