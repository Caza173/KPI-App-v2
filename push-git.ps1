$ErrorActionPreference = "Continue"

Write-Host "Starting Git operations..." -ForegroundColor Green
Set-Location "c:\Users\mainc\Caza Team Dropbox\01. Caza Team Folder\KPI App\KPI-App-v2"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow

Write-Host "Checking Git status..." -ForegroundColor Yellow
git status

Write-Host "Adding all files..." -ForegroundColor Yellow
git add -A

Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Enhance KPI dashboard with property edit/delete and updated expense categories"

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "Git operations completed!" -ForegroundColor Green
Read-Host "Press Enter to continue..."
