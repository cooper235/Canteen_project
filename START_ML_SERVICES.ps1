# ============================================
# START ALL SERVICES FOR ML TESTING
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   STARTING CANTEEN SERVICES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Kill existing processes
Write-Host "Stopping existing services..." -ForegroundColor Yellow
Stop-Process -Name node,python -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "Cleared existing processes`n" -ForegroundColor Green

# Check if dependencies are installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "Node.js found: $(node --version)" -ForegroundColor Green

# Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "Python found: $(python --version)" -ForegroundColor Green

# Check npm packages
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
}
Write-Host "Node.js packages ready" -ForegroundColor Green

# Check Python packages
$requirementsPath = "ml-service\requirements.txt"
if (Test-Path $requirementsPath) {
    Write-Host "Checking Python dependencies..." -ForegroundColor Yellow
    
    # Check if virtual environment exists
    if (-not (Test-Path "ml-service\venv")) {
        Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
        python -m venv ml-service\venv
    }
    
    Write-Host "Installing Python packages (this may take a minute)..." -ForegroundColor Yellow
    & ml-service\venv\Scripts\python.exe -m pip install --upgrade pip -q
    & ml-service\venv\Scripts\python.exe -m pip install -r $requirementsPath -q
    Write-Host "Python packages ready" -ForegroundColor Green
}
else {
    Write-Host "requirements.txt not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`n--- Starting Services ---`n" -ForegroundColor Yellow

# Start ML Service
Write-Host "Starting ML Service (Python Flask)..." -ForegroundColor Cyan
$mlProcess = Start-Process -FilePath "ml-service\venv\Scripts\python.exe" `
    -ArgumentList "ml-service\app.py" `
    -WorkingDirectory (Get-Location) `
    -PassThru `
    -WindowStyle Normal

Write-Host "ML Service started (PID: $($mlProcess.Id))" -ForegroundColor Green
Write-Host "  Running on http://localhost:5001" -ForegroundColor Gray

# Wait for ML service to start
Write-Host "`nWaiting for ML Service to be ready..." -ForegroundColor Yellow
$maxAttempts = 10
$attempt = 0
$mlReady = $false

while ($attempt -lt $maxAttempts -and -not $mlReady) {
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5001/health" -TimeoutSec 2
        if ($response.status -eq "healthy") {
            $mlReady = $true
            Write-Host "ML Service is ready!" -ForegroundColor Green
        }
    }
    catch {
        $attempt++
        Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    }
}

if (-not $mlReady) {
    Write-Host "ML Service failed to start!" -ForegroundColor Red
    Stop-Process -Id $mlProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

# Start Node.js Backend
Write-Host "`nStarting Node.js Backend..." -ForegroundColor Cyan
$backendProcess = Start-Process -FilePath "node" `
    -ArgumentList "server.js" `
    -WorkingDirectory (Get-Location) `
    -PassThru `
    -WindowStyle Normal

Write-Host "Backend started (PID: $($backendProcess.Id))" -ForegroundColor Green
Write-Host "  Running on http://localhost:5000" -ForegroundColor Gray

# Wait for backend to start
Write-Host "`nWaiting for Backend to be ready..." -ForegroundColor Yellow
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts -and -not $backendReady) {
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 2
        if ($response.status) {
            $backendReady = $true
            Write-Host "Backend is ready!" -ForegroundColor Green
        }
    }
    catch {
        $attempt++
        Write-Host "  Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    }
}

if (-not $backendReady) {
    Write-Host "Backend failed to start!" -ForegroundColor Red
    Stop-Process -Id $mlProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

# Start Frontend (optional)
Write-Host "`nDo you want to start the Frontend? (Y/N)" -ForegroundColor Yellow
$startFrontend = Read-Host

if ($startFrontend -eq "Y" -or $startFrontend -eq "y") {
    Write-Host "Starting Frontend..." -ForegroundColor Cyan
    Set-Location "models\canteen-frontend"
    $frontendProcess = Start-Process -FilePath "npm" `
        -ArgumentList "run", "dev" `
        -PassThru `
        -WindowStyle Normal
    Set-Location "..\..\"
    Write-Host "Frontend started (PID: $($frontendProcess.Id))" -ForegroundColor Green
    Write-Host "  Running on http://localhost:3000" -ForegroundColor Gray
}

# Success
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   ALL SERVICES RUNNING!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nService Status:" -ForegroundColor Yellow
Write-Host "  ML Service:  http://localhost:5001" -ForegroundColor White
Write-Host "  Backend:     http://localhost:5000" -ForegroundColor White
if ($startFrontend -eq "Y" -or $startFrontend -eq "y") {
    Write-Host "  Frontend:    http://localhost:3000" -ForegroundColor White
}

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Run tests: .\test-ml-complete.ps1" -ForegroundColor White
Write-Host "  2. Or visit http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "  3. To stop services: Press Ctrl+C or close the terminal windows" -ForegroundColor White

Write-Host "`nPress Ctrl+C to stop all services...`n" -ForegroundColor Gray

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 10
        
        # Check if processes are still running
        if (-not (Get-Process -Id $mlProcess.Id -ErrorAction SilentlyContinue)) {
            Write-Host "ML Service stopped unexpectedly!" -ForegroundColor Red
            break
        }
        if (-not (Get-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue)) {
            Write-Host "Backend stopped unexpectedly!" -ForegroundColor Red
            break
        }
    }
}
finally {
    # Cleanup
    Write-Host "`nStopping services..." -ForegroundColor Yellow
    Stop-Process -Id $mlProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    if ($startFrontend -eq "Y" -or $startFrontend -eq "y") {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "All services stopped" -ForegroundColor Green
}
