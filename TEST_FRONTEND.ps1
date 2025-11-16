# ============================================
# COMPLETE FRONTEND TESTING SETUP
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   FRONTEND ML FEATURES TESTING" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Start Services
Write-Host "Step 1: Starting Services..." -ForegroundColor Yellow
.\START_QUICK.ps1
Start-Sleep -Seconds 3

# Step 2: Populate Dummy Data
Write-Host "`nStep 2: Populating Dummy Data..." -ForegroundColor Yellow
node scripts/populate-dummy-data.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "   SETUP COMPLETE!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan

    Write-Host "Your database now has:" -ForegroundColor Yellow
    Write-Host "  • 5 Students (student1@test.com - student5@test.com)" -ForegroundColor White
    Write-Host "  • 1 Canteen Owner (owner@test.com)" -ForegroundColor White
    Write-Host "  • 1 Test Canteen with 10 dishes" -ForegroundColor White
    Write-Host "  • 30 Orders (for recommendations)" -ForegroundColor White
    Write-Host "  • 10 Reviews with sentiment analysis" -ForegroundColor White
    Write-Host "  • Trained recommendation model" -ForegroundColor White

    Write-Host "`nPassword for all users: password123" -ForegroundColor Cyan

    Write-Host "`nStep 3: Start Frontend" -ForegroundColor Yellow
    Write-Host "Run this command in a new terminal:" -ForegroundColor White
    Write-Host "  cd models\canteen-frontend" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray

    Write-Host "`nOR press Y to start it now (Y/N):" -ForegroundColor Yellow
    $response = Read-Host

    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host "`nStarting Frontend..." -ForegroundColor Cyan
        Set-Location "models\canteen-frontend"
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal
        Set-Location "..\..\"
        Write-Host "Frontend starting on http://localhost:3000`n" -ForegroundColor Green
    }

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "   HOW TO TEST ML FEATURES" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Cyan

    Write-Host "1. SENTIMENT ANALYSIS:" -ForegroundColor Yellow
    Write-Host "   • Go to http://localhost:3000" -ForegroundColor White
    Write-Host "   • Login: student1@test.com / password123" -ForegroundColor White
    Write-Host "   • Browse dishes and view reviews" -ForegroundColor White
    Write-Host "   • See sentiment badges (Positive/Negative/Neutral)" -ForegroundColor White
    Write-Host "   • Add a new review - it will be auto-analyzed!`n" -ForegroundColor White

    Write-Host "2. RECOMMENDATIONS:" -ForegroundColor Yellow
    Write-Host "   • On homepage, see 'Recommended for You'" -ForegroundColor White
    Write-Host "   • Recommendations are based on order history" -ForegroundColor White
    Write-Host "   • Different students see different recommendations`n" -ForegroundColor White

    Write-Host "3. DEMAND FORECASTING:" -ForegroundColor Yellow
    Write-Host "   • Logout and login as: owner@test.com / password123" -ForegroundColor White
    Write-Host "   • Go to Dashboard" -ForegroundColor White
    Write-Host "   • View demand forecasts for dishes" -ForegroundColor White
    Write-Host "   • See 7-day predictions and trends`n" -ForegroundColor White

    Write-Host "🎉 Everything is ready to test!" -ForegroundColor Green
    Write-Host "`nServices running:" -ForegroundColor Yellow
    Write-Host "  • Backend: http://localhost:5000" -ForegroundColor White
    Write-Host "  • ML Service: http://localhost:5001" -ForegroundColor White
    Write-Host "  • Frontend: http://localhost:3000`n" -ForegroundColor White

} else {
    Write-Host "`n❌ Failed to populate dummy data!" -ForegroundColor Red
    Write-Host "Check if services are running with: .\START_QUICK.ps1`n" -ForegroundColor Yellow
}
