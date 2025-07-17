@echo off
echo Testing Git operations...
cd "c:\Users\mainc\Caza Team Dropbox\01. Caza Team Folder\KPI App\KPI-App-v2"
echo Current directory: %CD%
git --version
git status
git add -A
git commit -m "Enhance KPI dashboard with property edit/delete and updated expense categories"
git push origin main
echo Git operations completed
pause
