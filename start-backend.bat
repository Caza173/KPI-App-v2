@echo off
echo.
echo ================================================
echo   KPI Dashboard - Backend Server Startup
echo ================================================
echo.

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Checking for .env file...
if not exist .env (
    echo WARNING: .env file not found
    echo Email functionality will not work without proper configuration
    echo Please copy .env.example to .env and configure your Gmail App Password
    echo.
)

echo.
echo Starting KPI Dashboard Backend Server...
echo Server will be available at: http://localhost:3001
echo API Test URL: http://localhost:3001/test
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

echo.
echo Server stopped. Press any key to exit.
pause
