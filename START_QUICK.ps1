# Simple ML Services Starter
# Use this for quick testing without prompts

Write-Host "`nStarting ML Services...`n" -ForegroundColor Cyan

# Stop existing processes
Stop-Process -Name node,python -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start ML Service
Write-Host "Starting ML Service on port 5001..." -ForegroundColor Yellow
Start-Process -FilePath "ml-service\venv\Scripts\python.exe" -ArgumentList "ml-service\app.py" -WindowStyle Normal
Start-Sleep -Seconds 5

# Start Backend
Write-Host "Starting Backend on port 5000..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Normal
Start-Sleep -Seconds 5

# Check health
Write-Host "`nChecking services..." -ForegroundColor Yellow

try {
    $mlHealth = Invoke-RestMethod -Uri "http://localhost:5001/health" -TimeoutSec 3
    Write-Host "ML Service: RUNNING" -ForegroundColor Green
}
catch {
    Write-Host "ML Service: FAILED" -ForegroundColor Red
}

try {
    $backendHealth = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 3
    Write-Host "Backend: RUNNING" -ForegroundColor Green
}
catch {
    Write-Host "Backend: FAILED" -ForegroundColor Red
}

Write-Host "`nServices started! Run: .\test-ml-complete.ps1 to test`n" -ForegroundColor Cyan
