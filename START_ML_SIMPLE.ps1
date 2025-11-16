# Simple ML Service Starter
Write-Host "Starting ML Service..." -ForegroundColor Cyan

$mlPath = "c:\Users\kripa\OneDrive\Desktop\Canteen_project-main\ml-service"

# Check if venv exists
if (-not (Test-Path "$mlPath\venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    cd $mlPath
    python -m venv venv
    
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    & venv\Scripts\pip.exe install Flask flask-cors numpy pandas scikit-learn python-dotenv requests
    
    # Skip statsmodels and textblob if they cause issues - they're only for forecasting/sentiment
    Write-Host "Installing optional ML packages (may take time)..." -ForegroundColor Yellow
    & venv\Scripts\pip.exe install statsmodels textblob --no-warn-script-location 2>$null
}

Write-Host ""
Write-Host "Starting ML Service on http://localhost:5001" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

cd $mlPath
& venv\Scripts\python.exe app.py
