# API Testing Script
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Backend API Testing" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"
$testResults = @()

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "   ✓ Health check passed" -ForegroundColor Green
    $testResults += @{Test="Health"; Status="PASS"}
} catch {
    Write-Host "   ✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Test="Health"; Status="FAIL"; Error=$_.Exception.Message}
}

# Test 2: Canteens List
Write-Host "`n2. Testing Canteens Endpoint (GET)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/canteens" -Method GET
    Write-Host "   ✓ Canteens list retrieved: $($response.count) canteens found" -ForegroundColor Green
    $testResults += @{Test="GET /canteens"; Status="PASS"; Data="Count: $($response.count)"}
} catch {
    Write-Host "   ✗ Canteens list failed: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Test="GET /canteens"; Status="FAIL"; Error=$_.Exception.Message}
}

# Test 3: Auth Register
Write-Host "`n3. Testing Auth Register Endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        name = "Test User"
        email = "test@example.com"
        password = "Test123456"
        role = "student"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "   ✓ Auth register endpoint working" -ForegroundColor Green
    $testResults += @{Test="POST /auth/register"; Status="PASS"}
} catch {
    Write-Host "   ✗ Auth register failed: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Test="POST /auth/register"; Status="FAIL"; Error=$_.Exception.Message}
}

# Test 4: Dishes Endpoint
Write-Host "`n4. Testing Dishes Endpoint (GET)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/dishes" -Method GET
    Write-Host "   ✓ Dishes list retrieved" -ForegroundColor Green
    $testResults += @{Test="GET /dishes"; Status="PASS"}
} catch {
    Write-Host "   ✗ Dishes list failed: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Test="GET /dishes"; Status="FAIL"; Error=$_.Exception.Message}
}

# Test 5: Announcements Endpoint
Write-Host "`n5. Testing Announcements Endpoint (GET)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/announcements" -Method GET
    Write-Host "   ✓ Announcements list retrieved" -ForegroundColor Green
    $testResults += @{Test="GET /announcements"; Status="PASS"}
} catch {
    Write-Host "   ✗ Announcements list failed: $($_.Exception.Message)" -ForegroundColor Red
    $testResults += @{Test="GET /announcements"; Status="FAIL"; Error=$_.Exception.Message}
}

# Summary
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -like "PASS*" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count

Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

if ($failed -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.Test): $($_.Error)" -ForegroundColor Red
    }
}
