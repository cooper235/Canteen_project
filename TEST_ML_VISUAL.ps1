# Quick Visual Test - ML Features
# Run this after starting services to verify all ML features are visible

Write-Host "`n=== ML FEATURES VISUAL TEST ===" -ForegroundColor Cyan
Write-Host "This script will guide you through testing all ML features in the browser`n" -ForegroundColor Yellow

# Check if services are running
Write-Host "Step 1: Checking if services are running..." -ForegroundColor Green
$backendRunning = $false
$mlServiceRunning = $false
$frontendRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 2 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend running on port 5000" -ForegroundColor Green
        $backendRunning = $true
    }
} catch {
    Write-Host "❌ Backend NOT running on port 5000" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5001/health" -Method GET -TimeoutSec 2 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ ML Service running on port 5001" -ForegroundColor Green
        $mlServiceRunning = $true
    }
} catch {
    Write-Host "❌ ML Service NOT running on port 5001" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 2 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend running on port 3000" -ForegroundColor Green
        $frontendRunning = $true
    }
} catch {
    Write-Host "❌ Frontend NOT running on port 3000" -ForegroundColor Red
}

if (-not ($backendRunning -and $mlServiceRunning -and $frontendRunning)) {
    Write-Host "`n⚠️  Not all services are running. Run: .\START_QUICK.ps1" -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host "`n=== All services are running! ===" -ForegroundColor Green

# Test URLs
Write-Host "`n`nStep 2: Opening browser for visual testing..." -ForegroundColor Green
Write-Host "`n📋 TEST CHECKLIST:" -ForegroundColor Cyan

Write-Host "`n1️⃣  SENTIMENT ANALYSIS TEST" -ForegroundColor Yellow
Write-Host "   Opening: http://localhost:3000/canteens" -ForegroundColor White
Write-Host "   What to check:" -ForegroundColor Gray
Write-Host "   - Click on any canteen" -ForegroundColor Gray
Write-Host "   - Scroll to reviews section" -ForegroundColor Gray
Write-Host "   - [OK] Look for sentiment badges: Positive, Neutral, Negative" -ForegroundColor Gray
Write-Host "   - [OK] Look for sentiment scores and keywords" -ForegroundColor Gray

Start-Sleep -Seconds 2
Start-Process "http://localhost:3000/canteens"

Read-Host "`nPress Enter to continue to next test"

Write-Host "`n2️⃣  RECOMMENDATIONS TEST (Homepage)" -ForegroundColor Yellow
Write-Host "   Opening: http://localhost:3000/login" -ForegroundColor White
Write-Host "   What to do:" -ForegroundColor Gray
Write-Host "   - Login with: student1@example.com / Student123!" -ForegroundColor Gray
Write-Host "   - Go to Homepage: http://localhost:3000/" -ForegroundColor Gray
Write-Host "   - Scroll down after hero section" -ForegroundColor Gray
Write-Host "   - [OK] Look for 'Recommended for You' section" -ForegroundColor Gray
Write-Host "   - [OK] Should show personalized dish recommendations" -ForegroundColor Gray
Write-Host "   - [OK] Look for match percentages, for example: 85 percent match" -ForegroundColor Gray

Start-Sleep -Seconds 2
Start-Process "http://localhost:3000/login"

Read-Host "`nPress Enter to continue to next test"

Write-Host "`n3️⃣  RECOMMENDATIONS TEST (Canteens Page)" -ForegroundColor Yellow
Write-Host "   Opening: http://localhost:3000/canteens (while logged in)" -ForegroundColor White
Write-Host "   What to check:" -ForegroundColor Gray
Write-Host "   - After logging in, go to Canteens page" -ForegroundColor Gray
Write-Host "   - [OK] Look for 'Recommended for You' section at the top" -ForegroundColor Gray
Write-Host "   - [OK] Shows AI-powered dish recommendations" -ForegroundColor Gray

Start-Sleep -Seconds 2
Start-Process "http://localhost:3000/canteens"

Read-Host "`nPress Enter to continue to next test"

Write-Host "`n4️⃣  FORECASTING DASHBOARD TEST (Owner Only)" -ForegroundColor Yellow
Write-Host "   Opening: http://localhost:3000/login" -ForegroundColor White
Write-Host "   What to do:" -ForegroundColor Gray
Write-Host "   - Logout and login with: owner@techcanteen.com / Owner123!" -ForegroundColor Gray
Write-Host "   - Navigate to: http://localhost:3000/manage/ml-analytics" -ForegroundColor Gray
Write-Host "   - [OK] Look for 'Demand Forecasting' tab" -ForegroundColor Gray
Write-Host "   - [OK] Should show forecasting charts and predictions" -ForegroundColor Gray
Write-Host "   - [OK] Also check 'Sentiment Analysis' tab for sentiment overview" -ForegroundColor Gray

Start-Sleep -Seconds 2
Start-Process "http://localhost:3000/manage/ml-analytics"

Write-Host "`n`n=== VISUAL TEST COMPLETE ===" -ForegroundColor Cyan
Write-Host "`nAll ML features should now be visible in the frontend!" -ForegroundColor Green
Write-Host "`nFor detailed guide, see: ML_FEATURES_GUIDE.md" -ForegroundColor Yellow

Write-Host "`n📊 Quick Summary:" -ForegroundColor Cyan
Write-Host "[OK] Sentiment Analysis: Reviews on dish pages" -ForegroundColor Green
Write-Host "[OK] Recommendations: Homepage & Canteens page (logged in)" -ForegroundColor Green
Write-Host "[OK] Forecasting: ML Analytics page (owner only)" -ForegroundColor Green

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
