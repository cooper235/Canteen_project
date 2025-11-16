# ============================================
# ML SERVICE SETUP SCRIPT
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   ML SERVICE SETUP" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Python is not installed!" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/downloads/" -ForegroundColor Red
    exit 1
}

$pythonVersion = python --version
Write-Host "Found: $pythonVersion" -ForegroundColor Green

# Create virtual environment if it doesn't exist
Write-Host "`nSetting up virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path "ml-service\venv")) {
    Write-Host "Creating new virtual environment..." -ForegroundColor Cyan
    python -m venv ml-service\venv
    Write-Host "Virtual environment created" -ForegroundColor Green
}
else {
    Write-Host "Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment and install packages
Write-Host "`nInstalling Python packages..." -ForegroundColor Yellow
Write-Host "(This may take a few minutes)" -ForegroundColor Gray

try {
    # Upgrade pip
    & ml-service\venv\Scripts\python.exe -m pip install --upgrade pip --quiet
    Write-Host "pip upgraded" -ForegroundColor Green
    
    # Install requirements
    & ml-service\venv\Scripts\python.exe -m pip install -r ml-service\requirements.txt --quiet
    Write-Host "All packages installed" -ForegroundColor Green
}
catch {
    Write-Host "Failed to install packages: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Download TextBlob corpora
Write-Host "`nDownloading TextBlob corpora..." -ForegroundColor Yellow
try {
    & ml-service\venv\Scripts\python.exe -m textblob.download_corpora
    Write-Host "TextBlob corpora downloaded" -ForegroundColor Green
}
catch {
    Write-Host "Failed to download corpora: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "You may need to download manually: python -m textblob.download_corpora" -ForegroundColor Yellow
}

# Verify installation
Write-Host "`nVerifying installation..." -ForegroundColor Yellow
$testScript = @"
import sys
try:
    import flask
    import flask_cors
    import numpy
    import pandas
    import sklearn
    import statsmodels
    import textblob
    print('All packages imported successfully!')
    sys.exit(0)
except ImportError as e:
    print(f'Import error: {e}')
    sys.exit(1)
"@

$testScript | Out-File -FilePath "ml-service\test_imports.py" -Encoding UTF8

try {
    $result = & ml-service\venv\Scripts\python.exe ml-service\test_imports.py
    Write-Host "$result" -ForegroundColor Green
}
catch {
    Write-Host "Package verification failed" -ForegroundColor Red
    exit 1
}
finally {
    Remove-Item "ml-service\test_imports.py" -ErrorAction SilentlyContinue
}

# Create models directory
Write-Host "`nSetting up directories..." -ForegroundColor Yellow
if (-not (Test-Path "ml-service\models")) {
    New-Item -ItemType Directory -Path "ml-service\models" | Out-Null
    Write-Host "Models directory created" -ForegroundColor Green
}
else {
    Write-Host "Models directory exists" -ForegroundColor Green
}

# Check .env file
Write-Host "`nChecking configuration..." -ForegroundColor Yellow
if (-not (Test-Path "ml-service\.env")) {
    Write-Host "No .env file found in ml-service directory" -ForegroundColor Yellow
    Write-Host "Creating default .env file..." -ForegroundColor Cyan
    
    $envContent = "# ML Service Configuration`nFLASK_ENV=development`nML_SERVICE_PORT=5001`n`n# Node.js backend URL`nBACKEND_URL=http://localhost:5000"
    
    $envContent | Out-File -FilePath "ml-service\.env" -Encoding UTF8
    Write-Host "Default .env file created" -ForegroundColor Green
}
else {
    Write-Host ".env file exists" -ForegroundColor Green
}

# Success
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start the ML service: cd ml-service; .\venv\Scripts\Activate.ps1; python app.py" -ForegroundColor White
Write-Host "  2. Or use the automated start script: .\START_ML_SERVICES.ps1" -ForegroundColor White
Write-Host "  3. Run tests: .\test-ml-complete.ps1" -ForegroundColor White
Write-Host "`n"

Write-Host "ML Service is ready to use!" -ForegroundColor Green
