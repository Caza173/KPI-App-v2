@echo off
title KPI Dashboard - Package Creator
color 0B

echo.
echo ====================================================
echo    Real Estate KPI Dashboard - Package Creator
echo ====================================================
echo.
echo Creating distribution package...
echo.

REM Create timestamp for package name
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "datestamp=%MM%-%DD%-%YYYY%"

REM Package name
set "package_name=KPI-Dashboard-Standalone-v2.0-%datestamp%"

echo Creating package: %package_name%
echo.

REM Create temporary directory
if exist "%package_name%" rmdir /s /q "%package_name%"
mkdir "%package_name%"

REM Copy files
echo Copying dashboard files...
copy "KPI-Dashboard-Standalone-Complete.html" "%package_name%\" >nul
copy "Launch-KPI-Dashboard.bat" "%package_name%\" >nul
copy "DISTRIBUTION-README.md" "%package_name%\README.md" >nul

REM Create additional launch scripts for different systems
echo Creating cross-platform launchers...

REM Mac/Linux launcher
echo #!/bin/bash > "%package_name%/launch-dashboard.sh"
echo echo "Real Estate KPI Dashboard v2.0" >> "%package_name%/launch-dashboard.sh"
echo echo "Opening dashboard in default browser..." >> "%package_name%/launch-dashboard.sh"
echo open "KPI-Dashboard-Standalone-Complete.html" ^|^| xdg-open "KPI-Dashboard-Standalone-Complete.html" >> "%package_name%/launch-dashboard.sh"

REM Package info file
echo Creating package information...
echo Real Estate KPI Dashboard - Standalone Edition > "%package_name%/PACKAGE-INFO.txt"
echo Version: 2.0.0 >> "%package_name%/PACKAGE-INFO.txt"
echo Created: %datestamp% >> "%package_name%/PACKAGE-INFO.txt"
echo. >> "%package_name%/PACKAGE-INFO.txt"
echo CONTENTS: >> "%package_name%/PACKAGE-INFO.txt"
echo - KPI-Dashboard-Standalone-Complete.html (Main Application) >> "%package_name%/PACKAGE-INFO.txt"
echo - Launch-KPI-Dashboard.bat (Windows Launcher) >> "%package_name%/PACKAGE-INFO.txt"
echo - launch-dashboard.sh (Mac/Linux Launcher) >> "%package_name%/PACKAGE-INFO.txt"
echo - README.md (Instructions and Documentation) >> "%package_name%/PACKAGE-INFO.txt"
echo. >> "%package_name%/PACKAGE-INFO.txt"
echo INSTRUCTIONS: >> "%package_name%/PACKAGE-INFO.txt"
echo 1. Windows: Double-click Launch-KPI-Dashboard.bat >> "%package_name%/PACKAGE-INFO.txt"
echo 2. Mac/Linux: Double-click KPI-Dashboard-Standalone-Complete.html >> "%package_name%/PACKAGE-INFO.txt"
echo 3. Manual: Open the HTML file in any modern web browser >> "%package_name%/PACKAGE-INFO.txt"

echo.
echo ✅ Package created successfully!
echo 📁 Folder: %package_name%
echo.
echo The package contains:
echo - Main dashboard application
echo - Windows launcher (.bat)
echo - Mac/Linux launcher (.sh)  
echo - Complete documentation
echo - Package information
echo.
echo You can now:
echo 1. ZIP the folder for easy distribution
echo 2. Share the entire folder
echo 3. Upload to cloud storage
echo.
echo Opening package folder...
start "" "%package_name%"
echo.
echo Press any key to exit...
pause >nul
