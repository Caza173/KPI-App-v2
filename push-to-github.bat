@echo off
git config --global user.email "corey@nhomeatlast.net.com"
git config --global user.name "Caza173"
echo Pushing enhanced KPI dashboard to GitHub...
cd "c:\Users\mainc\Caza Team Dropbox\01. Caza Team Folder\KPI App\KPI-App-v2"
git add -A
git commit -m "Enhance KPI dashboard with property edit/delete and updated expense categories - Add inline edit/delete functionality for properties table - Add Save/Cancel buttons for property editing - Update expenses with new categories: Meals, Professional Photography, Staging, Junk Removal, Cleaner, Mileage, Equipment Rental - Remove Transportation category from expenses - Add Mileage and Travel Hours fields to expense tracking - Update expense cards to show Mileage instead of Transportation - Add action button styling for better UX - Implement real-time data updates and localStorage persistence"
git push origin main
echo Done!
pause
