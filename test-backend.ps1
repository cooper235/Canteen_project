# Simple API Testing Script
Write-Host "=== Backend API Testing ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"

# Test 1: Health
Write-Host "`n1. Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health"
    Write-Host "   PASS: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "   FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Canteens
Write-Host "`n2. Get Canteens..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/canteens"
    Write-Host "   PASS: Found $($response.count) canteens" -ForegroundColor Green
} catch {
    Write-Host "   FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Dishes
Write-Host "`n3. Get Dishes..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/dishes"
    Write-Host "   PASS: Endpoint responding" -ForegroundColor Green
} catch {
    Write-Host "   FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Announcements
Write-Host "`n4. Get Announcements..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/announcements"
    Write-Host "   PASS: Endpoint responding" -ForegroundColor Green
} catch {
    Write-Host "   FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Auth Register
Write-Host "`n5. Auth Register..." -ForegroundColor Yellow
try {
    $body = '{"name":"Test User","email":"testuser' + (Get-Random) + '@test.com","password":"Password123!","role":"student"}'
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "   PASS: User registered" -ForegroundColor Green
} catch {
    Write-Host "   FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Testing Complete ===" -ForegroundColor Cyan
