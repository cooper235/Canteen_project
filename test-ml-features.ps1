Write-Host "`nTesting ML Features..." -ForegroundColor Cyan

# Login and get token
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body '{"email":"alice@test.com","password":"password123"}' -ContentType "application/json"
$userId = $login.user._id
$token = $login.token
Write-Host "Logged in as Alice (ID: $userId)" -ForegroundColor Green

# Test Recommendations
Write-Host "`nGetting Recommendations..." -ForegroundColor Yellow
$headers = @{"Authorization" = "Bearer $token"}
$recs = Invoke-RestMethod -Uri "http://localhost:5000/api/ml/recommendations/user/$userId" -Headers $headers
Write-Host "Found $($recs.recommendations.Count) recommendations!" -ForegroundColor Green
$recs.recommendations | Select-Object -First 3 | ForEach-Object {
    Write-Host "  - Dish: $($_.dish_id) | Score: $([math]::Round($_.score * 100, 2))%" -ForegroundColor Cyan
}

# Test Sentiment
Write-Host "`nTesting Sentiment Analysis..." -ForegroundColor Yellow
$dishes = Invoke-RestMethod -Uri "http://localhost:5000/api/dishes"
$dish = $dishes.dishes | Where-Object { $_.reviewCount -gt 0 } | Select-Object -First 1
if ($dish) {
    $sentiment = Invoke-RestMethod -Uri "http://localhost:5000/api/ml/sentiment/dish/$($dish._id)"
    Write-Host "Sentiment for $($dish.name):" -ForegroundColor Green
    Write-Host "  Overall: $($sentiment.overall_sentiment)" -ForegroundColor Cyan
    Write-Host "  Positive: $($sentiment.sentiment_distribution.positive)%" -ForegroundColor Green
}

# Test Forecasting
Write-Host "`nTesting Demand Forecasting..." -ForegroundColor Yellow
$forecast = Invoke-RestMethod -Uri "http://localhost:5000/api/ml/forecasting/dish/$($dishes.dishes[0]._id)?days=7"
Write-Host "7-day forecast for $($dishes.dishes[0].name):" -ForegroundColor Green
Write-Host "  Trend: $($forecast.metadata.trend)" -ForegroundColor Cyan
Write-Host "  Avg Daily: $([math]::Round($forecast.metadata.average_daily_demand, 2))" -ForegroundColor Cyan

Write-Host "`nAll ML features working! Now login at http://localhost:3000/login" -ForegroundColor Green
Write-Host "Email: alice@test.com | Password: password123" -ForegroundColor Yellow
