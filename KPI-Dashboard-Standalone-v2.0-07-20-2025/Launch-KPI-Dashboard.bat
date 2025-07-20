@echo off
title Real Estate KPI Dashboard Launcher
color 0A

echo.
echo ========================================
echo    Real Estate KPI Dashboard v2.0
echo    Professional Analytics Platform
echo ========================================
echo.
echo Starting dashboard in your default browser...
echo.

REM Check if the HTML file exists
if not exist "KPI-Dashboard-Standalone-Complete.html" (
    echo ERROR: Dashboard file not found!
    echo Please ensure "KPI-Dashboard-Standalone-Complete.html" is in the same folder.
    pause
    exit /b 1
)

REM Open the dashboard in the default browser
start "" "KPI-Dashboard-Standalone-Complete.html"

echo Dashboard launched successfully!
echo.
echo INSTRUCTIONS:
echo - The dashboard will open in your web browser
echo - All data is saved locally in your browser
echo - No internet required after initial load
echo - Close this window when done
echo.
echo Press any key to close this launcher...
pause >nul
