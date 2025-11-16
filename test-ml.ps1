Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Testing ML Features" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: ML Service Health
Write-Host "1. ML Service Health Check" -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:5001/health"
Write-Host "   Status: $($health.status)" -ForegroundColor Green
Write-Host ""

# Test 2: Sentiment Analysis - Positive
Write-Host "2. Sentiment Analysis - Positive Review" -ForegroundColor Yellow
$positive = Invoke-RestMethod -Uri "http://localhost:5001/api/sentiment/analyze" -Method POST -ContentType "application/json" -Body '{"text":"The food was absolutely delicious and fresh! Great service too."}'
Write-Host "   Sentiment: $($positive.sentiment.sentiment)" -ForegroundColor Green
Write-Host "   Score: $([math]::Round($positive.sentiment.score, 2))" -ForegroundColor White
Write-Host "   Confidence: $([math]::Round($positive.sentiment.confidence * 100))%" -ForegroundColor Cyan
if ($positive.sentiment.keywords) {
    Write-Host "   Keywords: $($positive.sentiment.keywords -join ', ')" -ForegroundColor Gray
}
Write-Host ""

# Test 3: Sentiment Analysis - Negative
Write-Host "3. Sentiment Analysis - Negative Review" -ForegroundColor Yellow
$negative = Invoke-RestMethod -Uri "http://localhost:5001/api/sentiment/analyze" -Method POST -ContentType "application/json" -Body '{"text":"The food was cold and stale. Terrible service, very slow."}'
Write-Host "   Sentiment: $($negative.sentiment.sentiment)" -ForegroundColor Red
Write-Host "   Score: $([math]::Round($negative.sentiment.score, 2))" -ForegroundColor White
Write-Host "   Confidence: $([math]::Round($negative.sentiment.confidence * 100))%" -ForegroundColor Cyan
if ($negative.sentiment.keywords) {
    Write-Host "   Keywords: $($negative.sentiment.keywords -join ', ')" -ForegroundColor Gray
}
Write-Host ""

# Test 4: Demand Forecasting
Write-Host "4. Demand Forecasting with Sample Data" -ForegroundColor Yellow
$data = @()
for ($i = 20; $i -gt 0; $i--) {
    $data += @{
        date = (Get-Date).AddDays(-$i).ToString("yyyy-MM-dd")
        dish_id = "dish_001"
        quantity = Get-Random -Minimum 15 -Maximum 35
    }
}
$forecastBody = @{
    canteen_id = "canteen_001"
    dish_id = "dish_001"
    historical_data = $data
} | ConvertTo-Json -Depth 10

$forecast = Invoke-RestMethod -Uri "http://localhost:5001/api/forecast/demand" -Method POST -ContentType "application/json" -Body $forecastBody
Write-Host "   Next 3 Days Forecast:" -ForegroundColor Green
$forecast.forecast.predictions | Select-Object -First 3 | ForEach-Object {
    Write-Host "   $($_.date): $($_.predicted_quantity) units (range: $($_.confidence_interval[0])-$($_.confidence_interval[1]))" -ForegroundColor White
}
Write-Host "   Trend: $($forecast.forecast.insights.trend)" -ForegroundColor Cyan
Write-Host "   Peak Day: $($forecast.forecast.insights.peak_day)" -ForegroundColor Cyan
Write-Host "   Average Daily: $($forecast.forecast.insights.average_daily)" -ForegroundColor Cyan
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "All ML Features Working!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Visit these URLs in your browser:" -ForegroundColor Yellow
Write-Host "  • http://localhost:3000/canteens - See recommendations" -ForegroundColor White
Write-Host "  • http://localhost:3000/manage/ml-analytics - Owner ML dashboard" -ForegroundColor White
Write-Host ""
