# KPI Dashboard Backend Setup & Troubleshooting

## Current Status
✅ **Conversion Rates**: Implemented and displayed in Dashboard tab
✅ **Multi-recipient Email**: Enhanced to send to both nhcazateam@gmail.com AND corey@nhomeatlast.net
✅ **SMS Functionality**: Added Twilio integration for text message reports
✅ **Enhanced UI**: Added SMS buttons and configuration in Settings tab

## Quick Start Instructions

### 1. Start Backend Server
```bash
# Option 1: Using npm script
npm start

# Option 2: Direct Node.js
node server.js

# Option 3: Using simplified server (if main server has issues)
node server-simple.js
```

### 2. Start Frontend (in separate terminal)
```bash
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/test

## Email Setup (Gmail App Password Required)

### Step 1: Create Gmail App Password
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already enabled)
3. Go to "App passwords" section
4. Select "Mail" and generate a password
5. Copy the 16-character password (looks like: abcd efgh ijkl mnop)

### Step 2: Update .env File
```bash
EMAIL_USER=nhcazateam@gmail.com
EMAIL_PASS=your_16_character_app_password_here
```

### Step 3: Test Email
- Click "🧪 Test Email Connection" in Settings tab
- Or visit: http://localhost:3001/api/test-email

## SMS Setup (Optional - Twilio Integration)

### Step 1: Sign up for Twilio
1. Go to https://www.twilio.com/try-twilio
2. Get your Account SID, Auth Token, and phone number

### Step 2: Update .env File
```bash
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
DEFAULT_SMS_RECIPIENTS=+1234567890,+0987654321
```

### Step 3: Test SMS
- Click "🧪 Test SMS Connection" in Settings tab
- Or visit: http://localhost:3001/api/test-sms

## Troubleshooting

### Backend Not Starting
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill existing Node processes
taskkill /f /im node.exe

# Try starting again
npm start
```

### Email Test Failing
1. ❌ **"Could not connect to email server"**
   - Check if Gmail App Password is set correctly in .env
   - Ensure 2-factor authentication is enabled on Gmail
   - Try generating a new App Password

2. ❌ **"Authentication failed"**
   - Double-check EMAIL_USER and EMAIL_PASS in .env
   - Make sure there are no extra spaces in the password

3. ❌ **"Backend server not reachable"**
   - Ensure backend server is running on port 3001
   - Check console for error messages
   - Try restarting the backend server

### SMS Test Failing
1. ❌ **"SMS service not available"**
   - Check if Twilio credentials are set in .env
   - Ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN are correct

2. ❌ **"No SMS recipients configured"**
   - Set DEFAULT_SMS_RECIPIENTS in .env file
   - Use international format: +1234567890

## Features Added

### ✅ Conversion Rates (Already Working)
The Dashboard tab now shows:
- **Listing Appointments → Signed Sellers → Closed Listings**
- **Buyer Appointments → Buyer Contracts → Buyers Sold**
- Real-time conversion rate calculations
- Monthly breakdown with conversion tracking

### ✅ Email to Multiple Recipients
- Default recipients: nhcazateam@gmail.com, corey@nhomeatlast.net
- Enhanced email templates with detailed KPI information
- Fallback mailto method for offline functionality
- Test email functionality

### ✅ SMS Integration
- Daily, Weekly, Monthly, and Summary SMS reports
- Twilio integration for reliable delivery
- Multiple recipient support
- Character-optimized messages for SMS limits
- Test SMS functionality

### ✅ Enhanced UI
- **Dashboard Tab**: SMS report buttons alongside email buttons
- **Settings Tab**: SMS configuration section with setup instructions
- Clear visual distinction between email and SMS functionality
- Status indicators and help text

## File Changes Made

### Backend Files
- `server.js` - Enhanced with multi-recipient email and SMS endpoints
- `server-simple.js` - Simplified backup server for troubleshooting
- `.env` - Updated with Twilio configuration
- `.env.example` - Updated with all new configuration options

### Frontend Files
- `src/App.js` - Added SMS functions and enhanced UI
  - `sendSMSReport()` - Sends SMS reports
  - `generateSMSText()` - Creates SMS content
  - `testSMS()` - Tests SMS functionality
  - Enhanced Dashboard with SMS buttons
  - Enhanced Settings with SMS configuration

## Next Steps

1. **Get Email Working**: Set up Gmail App Password and test email functionality
2. **Optional SMS Setup**: Configure Twilio for text message reports
3. **Test All Features**: Use test buttons to verify email and SMS work
4. **Production Deployment**: When ready, deploy to cloud hosting

## Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check the terminal/command prompt for server errors
3. Verify .env file configuration
4. Test individual components (email test, SMS test)
5. Use the simplified server (server-simple.js) if main server has issues

---

**Real Estate KPI Dashboard - Now with Email & SMS Reporting!** 📧📱
