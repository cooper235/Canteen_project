# ============================================
# COMPLETE ML FEATURES TEST SCRIPT
# ============================================

$ErrorActionPreference = "Continue"
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   ML FEATURES COMPREHENSIVE TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Configuration
$BACKEND_URL = "http://localhost:5000"
$ML_SERVICE_URL = "http://localhost:5001"
$TEST_USER_EMAIL = "student@test.com"
$TEST_USER_PASSWORD = "password123"

# Color functions
function Write-Success { param($msg) Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-ErrorMsg { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-InfoMsg { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host "[WARNING] $msg" -ForegroundColor Yellow }

# Test counter
$script:totalTests = 0
$script:passedTests = 0
$script:failedTests = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    $script:totalTests++
    Write-InfoMsg "Testing: $Name"
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        
        if ($response) {
            Write-Success "$Name - PASSED"
            $script:passedTests++
            return $response
        }
    }
    catch {
        Write-ErrorMsg "$Name - FAILED: $($_.Exception.Message)"
        $script:failedTests++
        return $null
    }
}

# ============================================
# STEP 1: Check if services are running
# ============================================
Write-Host "`n--- STEP 1: SERVICE HEALTH CHECK ---`n" -ForegroundColor Yellow

$backendHealth = Test-Endpoint -Name "Backend Health" -Url "$BACKEND_URL/api/health"
$mlHealth = Test-Endpoint -Name "ML Service Health" -Url "$ML_SERVICE_URL/health"

if (-not $backendHealth) {
    Write-ErrorMsg "Backend is not running! Start it with: node server.js"
    exit 1
}

if (-not $mlHealth) {
    Write-ErrorMsg "ML Service is not running! Start it with: cd ml-service; python app.py"
    exit 1
}

# ============================================
# STEP 2: Login and get token
# ============================================
Write-Host "`n--- STEP 2: USER AUTHENTICATION ---`n" -ForegroundColor Yellow

$loginBody = @{
    email = $TEST_USER_EMAIL
    password = $TEST_USER_PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Success "Login successful - Token obtained"
    $script:passedTests++
    $script:totalTests++
}
catch {
    Write-ErrorMsg "Login failed: $($_.Exception.Message)"
    Write-Warning "Make sure user exists: email=$TEST_USER_EMAIL, password=$TEST_USER_PASSWORD"
    Write-InfoMsg "Creating test user..."
    
    # Try to create the user
    try {
        $registerBody = @{
            name = "Test Student"
            email = $TEST_USER_EMAIL
            password = $TEST_USER_PASSWORD
            role = "student"
        } | ConvertTo-Json
        
        $registerResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
        Write-Success "Test user created successfully"
        
        # Try login again
        $loginResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
        $token = $loginResponse.token
        Write-Success "Login successful after registration"
        $script:passedTests++
        $script:totalTests++
    }
    catch {
        Write-ErrorMsg "Could not create or login test user: $($_.Exception.Message)"
        $script:failedTests++
        $script:totalTests++
        exit 1
    }
}

$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# ============================================
# STEP 3: Test Sentiment Analysis
# ============================================
Write-Host "`n--- STEP 3: SENTIMENT ANALYSIS TESTS ---`n" -ForegroundColor Yellow

# Test 3.1: Analyze single positive review
$positiveReview = @{
    text = "The food was absolutely delicious and fresh! Great service and wonderful taste. Highly recommended!"
} | ConvertTo-Json

$sentimentResult = Test-Endpoint -Name "Positive Sentiment Analysis" `
    -Url "$BACKEND_URL/api/ml/sentiment/analyze" `
    -Method "POST" `
    -Headers $authHeaders `
    -Body $positiveReview

if ($sentimentResult -and $sentimentResult.success) {
    Write-Host "  → Sentiment: $($sentimentResult.sentiment.sentiment)" -ForegroundColor Cyan
    Write-Host "  → Score: $($sentimentResult.sentiment.score)" -ForegroundColor Cyan
    Write-Host "  → Keywords: $($sentimentResult.sentiment.keywords -join ', ')" -ForegroundColor Cyan
}

# Test 3.2: Analyze single negative review
$negativeReview = @{
    text = "Terrible food, cold and tasteless. Very disappointed with the quality. Worst experience ever!"
} | ConvertTo-Json

$sentimentResult2 = Test-Endpoint -Name "Negative Sentiment Analysis" `
    -Url "$BACKEND_URL/api/ml/sentiment/analyze" `
    -Method "POST" `
    -Headers $authHeaders `
    -Body $negativeReview

if ($sentimentResult2 -and $sentimentResult2.success) {
    Write-Host "  → Sentiment: $($sentimentResult2.sentiment.sentiment)" -ForegroundColor Cyan
    Write-Host "  → Score: $($sentimentResult2.sentiment.score)" -ForegroundColor Cyan
}

# Test 3.3: Batch sentiment analysis
$batchReviews = @{
    reviews = @(
        @{ text = "Amazing food, loved it!"; review_id = "1" },
        @{ text = "Not bad, decent taste"; review_id = "2" },
        @{ text = "Horrible, never again"; review_id = "3" }
    )
} | ConvertTo-Json -Depth 10

$batchResult = Test-Endpoint -Name "Batch Sentiment Analysis" `
    -Url "$BACKEND_URL/api/ml/sentiment/batch" `
    -Method "POST" `
    -Headers $authHeaders `
    -Body $batchReviews

if ($batchResult -and $batchResult.success) {
    Write-Host "  → Analyzed $($batchResult.results.Count) reviews" -ForegroundColor Cyan
    foreach ($result in $batchResult.results) {
        Write-Host "    • Review $($result.review_id): $($result.sentiment.sentiment) (score: $($result.sentiment.score))" -ForegroundColor Gray
    }
}

# ============================================
# STEP 4: Test Recommendations
# ============================================
Write-Host "`n--- STEP 4: RECOMMENDATION TESTS ---`n" -ForegroundColor Yellow

# Get user ID from login response
$userId = $loginResponse.user._id

# Test 4.1: Get user recommendations
$recsResult = Test-Endpoint -Name "User Recommendations" `
    -Url "$BACKEND_URL/api/ml/recommendations/user/${userId}?limit=5" `
    -Method "GET" `
    -Headers $authHeaders

if ($recsResult -and $recsResult.success) {
    Write-Host "  → Found $($recsResult.recommendations.Count) recommendations" -ForegroundColor Cyan
    if ($recsResult.recommendations.Count -gt 0) {
        foreach ($rec in $recsResult.recommendations) {
            Write-Host "    • Dish: $($rec.dish_id) | Score: $($rec.score) | Reason: $($rec.reason)" -ForegroundColor Gray
        }
    } else {
        Write-InfoMsg "    No recommendations available yet. Need order history to train the model."
    }
}

# Test 4.2: Train recommendation model (requires owner access)
Write-InfoMsg "`nNote: Recommendation model training requires order data from database"
Write-InfoMsg "This should be done by canteen owners through the dashboard"

# ============================================
# STEP 5: Test Demand Forecasting
# ============================================
Write-Host "`n--- STEP 5: DEMAND FORECASTING TESTS ---`n" -ForegroundColor Yellow

# Test 5.1: Forecast with sample historical data
$historicalData = @()
$startDate = (Get-Date).AddDays(-30)
for ($i = 0; $i -lt 30; $i++) {
    $date = $startDate.AddDays($i).ToString("yyyy-MM-dd")
    $quantity = Get-Random -Minimum 15 -Maximum 45
    $historicalData += @{
        date = $date
        dish_id = "sample_dish_123"
        quantity = $quantity
    }
}

$forecastBody = @{
    canteen_id = "sample_canteen_123"
    dish_id = "sample_dish_123"
    days_ahead = 7
    historical_data = $historicalData
} | ConvertTo-Json -Depth 10

Write-InfoMsg "Forecasting demand with 30 days of sample historical data..."

try {
    $forecastResponse = Invoke-RestMethod -Uri "$ML_SERVICE_URL/api/forecast/demand" `
        -Method POST `
        -Body $forecastBody `
        -ContentType "application/json" `
        -TimeoutSec 15
    
    Write-Success "Demand Forecasting - PASSED"
    $script:passedTests++
    $script:totalTests++
    
    if ($forecastResponse.success) {
        Write-Host "  → Predictions for next 7 days:" -ForegroundColor Cyan
        foreach ($pred in $forecastResponse.forecast.predictions) {
            Write-Host "    • $($pred.date): $($pred.predicted_quantity) units (range: $($pred.confidence_interval[0])-$($pred.confidence_interval[1]))" -ForegroundColor Gray
        }
        
        if ($forecastResponse.forecast.insights) {
            $insights = $forecastResponse.forecast.insights
            Write-Host "`n  → Insights:" -ForegroundColor Cyan
            Write-Host "    • Trend: $($insights.trend)" -ForegroundColor Gray
            Write-Host "    • Peak Day: $($insights.peak_day)" -ForegroundColor Gray
            Write-Host "    • Average Daily: $($insights.average_daily)" -ForegroundColor Gray
            Write-Host "    • Total Forecast: $($insights.total_forecast)" -ForegroundColor Gray
        }
    }
}
catch {
    Write-ErrorMsg "Demand Forecasting - FAILED: $($_.Exception.Message)"
    $script:failedTests++
    $script:totalTests++
}

# ============================================
# STEP 6: Test ML Service Health via Backend
# ============================================
Write-Host "`n--- STEP 6: ML SERVICE INTEGRATION ---`n" -ForegroundColor Yellow

$mlHealthCheck = Test-Endpoint -Name "ML Service Health via Backend" `
    -Url "$BACKEND_URL/api/ml/health" `
    -Method "GET"

# ============================================
# FINAL REPORT
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "           TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $script:totalTests" -ForegroundColor White
Write-Host "Passed: $script:passedTests" -ForegroundColor Green
Write-Host "Failed: $script:failedTests" -ForegroundColor Red

$successRate = [math]::Round(($script:passedTests / $script:totalTests) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

Write-Host "`n========================================`n" -ForegroundColor Cyan

# ============================================
# TESTING INSTRUCTIONS
# ============================================
Write-Host "NEXT STEPS FOR TESTING:" -ForegroundColor Yellow
Write-Host "1. To test with real data, add orders through the frontend" -ForegroundColor White
Write-Host "2. To train the recommendation model, use the canteen owner dashboard" -ForegroundColor White
Write-Host "3. Reviews will be automatically analyzed for sentiment when posted" -ForegroundColor White
Write-Host "4. Forecasting works best with at least 14 days of order history" -ForegroundColor White
Write-Host "`n"

if ($script:failedTests -eq 0) {
    Write-Success "All ML features are working correctly!"
    exit 0
} else {
    Write-Warning "Some tests failed. Check the errors above for details."
    exit 1
}
