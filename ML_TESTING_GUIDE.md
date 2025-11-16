# ML FEATURES TESTING GUIDE

## Overview
This guide will help you test all ML features integrated into the Canteen Management System.

## ML Features Implemented

### 1. **Sentiment Analysis**
   - Analyzes review text to determine if it's positive, negative, or neutral
   - Extracts keywords and identifies aspects (food quality, service, value)
   - Provides sentiment scores (-1 to 1)

### 2. **Recommendation System**
   - Personalized dish recommendations based on order history
   - Collaborative filtering (user-based)
   - Association rules (frequently bought together)
   - Popular items fallback

### 3. **Demand Forecasting**
   - Predicts dish demand for upcoming days
   - Uses Exponential Smoothing (Holt-Winters)
   - Provides confidence intervals
   - Identifies trends and peak days

---

## Prerequisites

### Required Software
- **Node.js** (v16+)
- **Python** (v3.8+)
- **MongoDB** (running and accessible)

### Installation Steps

1. **Install Node.js dependencies:**
   ```powershell
   npm install
   ```

2. **Create Python virtual environment:**
   ```powershell
   cd ml-service
   python -m venv venv
   ```

3. **Activate virtual environment and install Python packages:**
   ```powershell
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   
   # Install dependencies
   pip install -r requirements.txt
   ```

4. **Download TextBlob corpora (required for sentiment analysis):**
   ```powershell
   python -m textblob.download_corpora
   ```

---

## Quick Start

### Option 1: Automated Start (Recommended)

Run the automated start script:
```powershell
.\START_ML_SERVICES.ps1
```

This will:
- Check all dependencies
- Install missing packages
- Start ML Service (port 5001)
- Start Backend (port 5000)
- Optionally start Frontend (port 3000)

### Option 2: Manual Start

**Terminal 1 - ML Service:**
```powershell
cd ml-service
.\venv\Scripts\Activate.ps1
python app.py
```

**Terminal 2 - Backend:**
```powershell
node server.js
```

**Terminal 3 - Frontend (optional):**
```powershell
cd models\canteen-frontend
npm run dev
```

---

## Testing the ML Features

### Automated Testing

Run the comprehensive test script:
```powershell
.\test-ml-complete.ps1
```

This will test:
- Service health checks
- User authentication
- Sentiment analysis (single & batch)
- Recommendations
- Demand forecasting
- ML service integration

### Manual Testing with cURL/PowerShell

#### 1. Test ML Service Health
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/health"
```

Expected output:
```json
{
  "status": "healthy",
  "service": "ml-service"
}
```

#### 2. Test Sentiment Analysis

**Single Review:**
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
    "Content-Type" = "application/json"
}

$body = @{
    text = "The food was absolutely delicious and fresh!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/ml/sentiment/analyze" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

Expected output:
```json
{
  "success": true,
  "sentiment": {
    "sentiment": "positive",
    "score": 0.85,
    "confidence": 0.75,
    "keywords": ["delicious", "fresh"],
    "aspects": {
      "food_quality": 0.85
    }
  }
}
```

**Batch Reviews:**
```powershell
$body = @{
    reviews = @(
        @{ text = "Amazing food!"; review_id = "1" },
        @{ text = "Terrible service"; review_id = "2" }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:5000/api/ml/sentiment/batch" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

#### 3. Test Recommendations

```powershell
$userId = "YOUR_USER_ID"
Invoke-RestMethod -Uri "http://localhost:5000/api/ml/recommendations/user/$userId?limit=5" `
    -Headers $headers
```

**Note:** Recommendations require order history. If no orders exist:
- Add orders through the frontend
- Or use the train endpoint with sample data

#### 4. Test Demand Forecasting

```powershell
# Create sample historical data
$historicalData = @()
for ($i = 0; $i -lt 30; $i++) {
    $date = (Get-Date).AddDays(-30 + $i).ToString("yyyy-MM-dd")
    $historicalData += @{
        date = $date
        dish_id = "sample_dish"
        quantity = Get-Random -Minimum 20 -Maximum 40
    }
}

$body = @{
    canteen_id = "sample_canteen"
    dish_id = "sample_dish"
    days_ahead = 7
    historical_data = $historicalData
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:5001/api/forecast/demand" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

Expected output:
```json
{
  "success": true,
  "forecast": {
    "predictions": [
      {
        "date": "2025-11-15",
        "predicted_quantity": 28,
        "confidence_interval": [22, 34]
      },
      ...
    ],
    "insights": {
      "trend": "increasing",
      "peak_day": "Friday",
      "average_daily": 25.5,
      "total_forecast": 178
    }
  }
}
```

---

## Testing in the Frontend

### 1. Sentiment Analysis
- Navigate to any dish page
- Add a review
- The sentiment will be automatically analyzed
- Check the sentiment badge (Positive/Negative/Neutral)

### 2. Recommendations
- Login as a student
- View the home page or any canteen page
- You'll see "Recommended for You" section
- Recommendations improve as you place more orders

### 3. Demand Forecasting (Canteen Owners)
- Login as a canteen owner
- Navigate to Dashboard → Forecasting
- View demand predictions for your dishes
- See insights about trends and peak days

---

## Common Issues & Solutions

### Issue 1: ML Service won't start
**Error:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```powershell
cd ml-service
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Issue 2: TextBlob errors
**Error:** `LookupError: Resource punkt not found`

**Solution:**
```powershell
python -m textblob.download_corpora
```

### Issue 3: No recommendations returned
**Reason:** Not enough order history

**Solution:**
- Place at least 5-10 orders through the frontend
- Or train the model manually with sample data

### Issue 4: Port already in use
**Error:** `Address already in use`

**Solution:**
```powershell
# Kill processes on port 5001
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Stop-Process -Force

# Kill processes on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

### Issue 5: CORS errors in browser
**Solution:** Backend is already configured for CORS. If still getting errors:
- Check if backend is running on port 5000
- Verify frontend is requesting the correct URL
- Clear browser cache

---

## API Endpoints Reference

### Sentiment Analysis
- `POST /api/ml/sentiment/analyze` - Analyze single review
- `POST /api/ml/sentiment/batch` - Analyze multiple reviews
- `GET /api/ml/sentiment/canteen/:canteenId` - Get canteen sentiment insights

### Recommendations
- `GET /api/ml/recommendations/user/:userId` - Get personalized recommendations
- `POST /api/ml/recommendations/train` - Train recommendation model (admin)

### Forecasting
- `POST /api/ml/forecast/demand` - Forecast demand with historical data
- `POST /api/ml/forecast/train` - Train forecasting model (admin)

### Health
- `GET /api/ml/health` - Check ML service status

---

## Performance Tips

1. **Recommendation Model:**
   - Train weekly with fresh data
   - Requires at least 10 orders to be effective
   - Performance improves with more user interactions

2. **Forecasting:**
   - Best with 14+ days of historical data
   - Weekly patterns are detected automatically
   - Confidence increases with more data

3. **Sentiment Analysis:**
   - Real-time analysis, no training needed
   - Supports batch processing for efficiency
   - Keywords are extracted automatically

---

## Next Steps

1. **Populate Data:** Add users, canteens, dishes, and orders through the frontend
2. **Train Models:** Use the admin endpoints to train recommendation and forecasting models
3. **Monitor:** Check the ML service logs for any errors
4. **Optimize:** Adjust parameters based on your canteen's patterns

---

## Support

If you encounter issues:
1. Check the console logs in both backend and ML service terminals
2. Verify all services are running with health checks
3. Review this guide for common solutions
4. Check the API documentation in `API_DOCUMENTATION.md`

---

## Testing Checklist

- [ ] ML Service starts successfully on port 5001
- [ ] Backend starts successfully on port 5000
- [ ] Health check returns "healthy" for ML service
- [ ] Sentiment analysis works for positive reviews
- [ ] Sentiment analysis works for negative reviews
- [ ] Batch sentiment analysis processes multiple reviews
- [ ] User recommendations endpoint returns data
- [ ] Demand forecasting returns predictions
- [ ] Frontend displays sentiment badges correctly
- [ ] Recommendation section appears on frontend
- [ ] Forecasting dashboard shows predictions (for owners)

Once all items are checked, your ML features are fully functional! 🎉
