# ML FEATURES - COMPLETE TESTING PROCEDURE

## 🎯 Overview

Your Canteen Management System now has **three powerful ML features**:

1. **Sentiment Analysis** - Automatically analyzes review sentiment (positive/negative/neutral)
2. **Recommendation System** - Provides personalized dish recommendations based on order history
3. **Demand Forecasting** - Predicts future dish demand using historical data

---

## ✅ WHAT HAS BEEN FIXED

### 1. **Endpoint Mismatches** ✓
   - Fixed `mlController.js` to match Flask app routes
   - Changed forecast routes from GET to POST (to accept historical data)
   - Removed non-existent endpoints

### 2. **Review Integration** ✓
   - Added automatic sentiment analysis when reviews are created
   - Added sentiment fields to Review model (sentiment, sentimentScore, sentimentKeywords)
   - Reviews now automatically get analyzed by ML service

### 3. **Service Configuration** ✓
   - Created setup script (`SETUP_ML_SERVICE.ps1`)
   - Configured virtual environment
   - Installed all Python dependencies
   - Downloaded TextBlob corpora

### 4. **Testing Scripts** ✓
   - Created `test-ml-complete.ps1` - comprehensive test suite
   - Created `START_ML_SERVICES.ps1` - automated service starter
   - Created `ML_TESTING_GUIDE.md` - detailed documentation

---

## 🚀 COMPLETE TESTING PROCEDURE

### STEP 1: Setup (One-time)

**Already completed!** The ML service is now configured. But if you need to re-run:

```powershell
.\SETUP_ML_SERVICE.ps1
```

### STEP 2: Start Services

Choose one of these methods:

#### Option A: Automated (Recommended)
```powershell
.\START_ML_SERVICES.ps1
```
This will start:
- ML Service (port 5001)
- Backend (port 5000)
- Optionally Frontend (port 3000)

#### Option B: Manual

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

**Terminal 3 - Frontend:**
```powershell
cd models\canteen-frontend
npm run dev
```

### STEP 3: Run Automated Tests

```powershell
.\test-ml-complete.ps1
```

This will test:
- ✓ Service health checks
- ✓ User authentication
- ✓ Sentiment analysis (positive/negative)
- ✓ Batch sentiment analysis
- ✓ User recommendations
- ✓ Demand forecasting with sample data
- ✓ ML service integration

### STEP 4: Test in Frontend

#### A. Test Sentiment Analysis
1. Open http://localhost:3000
2. Login as a student
3. Navigate to any dish page
4. Add a review with text like: "The food was delicious and fresh!"
5. Check the database - the review should have sentiment fields populated
6. The sentiment badge should appear next to the review

#### B. Test Recommendations
1. Place several orders (at least 5-10)
2. Navigate to homepage or canteen page
3. Look for "Recommended for You" section
4. Recommendations will appear based on your order history

#### C. Test Demand Forecasting (Canteen Owners)
1. Login as a canteen owner
2. Navigate to Dashboard → Forecasting
3. Select a dish that has order history
4. View demand predictions for next 7 days
5. See insights: trend, peak day, average daily demand

### STEP 5: Manual API Testing

#### Test Sentiment Analysis API

```powershell
# Get auth token first
$loginBody = @{
    email = "student@test.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

# Test sentiment
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    text = "The food was absolutely amazing and delicious!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/ml/sentiment/analyze" -Method POST -Headers $headers -Body $body
```

Expected output:
```json
{
  "success": true,
  "sentiment": {
    "sentiment": "positive",
    "score": 0.85,
    "confidence": 0.75,
    "keywords": ["amazing", "delicious"],
    "aspects": {
      "food_quality": 0.85
    }
  }
}
```

#### Test Recommendations API

```powershell
$userId = $loginResponse.user._id
Invoke-RestMethod -Uri "http://localhost:5000/api/ml/recommendations/user/$userId?limit=5" -Headers $headers
```

#### Test Forecasting API

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

Invoke-RestMethod -Uri "http://localhost:5001/api/forecast/demand" -Method POST -Body $body -ContentType "application/json"
```

---

## 📊 EXPECTED RESULTS

### ✓ All Tests Passing
When you run `test-ml-complete.ps1`, you should see:
- Total Tests: ~15
- Passed: ~15
- Failed: 0
- Success Rate: 100%

### ✓ Sentiment Analysis Working
- Reviews automatically get sentiment analyzed
- Sentiment badges appear in UI
- Keywords are extracted
- Aspects (food quality, service, value) are identified

### ✓ Recommendations Working
- Users see personalized recommendations
- Recommendations improve with more orders
- Based on collaborative filtering and association rules

### ✓ Forecasting Working
- Predicts demand for next 7 days
- Shows confidence intervals
- Identifies trends (increasing/decreasing/stable)
- Detects peak days

---

## 🔧 TROUBLESHOOTING

### Issue: ML Service won't start

**Check:**
```powershell
cd ml-service
.\venv\Scripts\Activate.ps1
python app.py
```

**If errors:**
```powershell
pip install -r requirements.txt
python -m textblob.download_corpora
```

### Issue: No recommendations appearing

**Reason:** Need order history

**Solution:**
- Place at least 5-10 orders through frontend
- Recommendations improve with more data

### Issue: Port already in use

```powershell
# Kill processes on ports
Stop-Process -Name node,python -Force
```

### Issue: Backend can't connect to ML Service

**Check:**
1. Is ML service running? Visit http://localhost:5001/health
2. Check `.env` has: `ML_SERVICE_URL=http://localhost:5001`
3. Check firewall isn't blocking port 5001

---

## 📁 FILES CREATED/MODIFIED

### New Files:
- `SETUP_ML_SERVICE.ps1` - Setup script
- `START_ML_SERVICES.ps1` - Service starter
- `test-ml-complete.ps1` - Test suite
- `ML_TESTING_GUIDE.md` - Detailed guide
- `ML_FEATURES_PROCEDURE.md` - This file

### Modified Files:
- `controllers/mlController.js` - Fixed endpoints
- `routes/mlRoutes.js` - Changed GET to POST for forecasting
- `controllers/reviewController.js` - Added sentiment analysis
- `models/Review.js` - Added sentiment fields

---

## 🎯 QUICK TEST COMMANDS

```powershell
# 1. Setup (one-time)
.\SETUP_ML_SERVICE.ps1

# 2. Start services
.\START_ML_SERVICES.ps1

# 3. Run tests (in new terminal)
.\test-ml-complete.ps1

# 4. Check ML service health
Invoke-RestMethod -Uri "http://localhost:5001/health"

# 5. Check backend health
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

---

## 📋 TESTING CHECKLIST

Complete this checklist to verify all features:

### Setup Phase
- [ ] Run `SETUP_ML_SERVICE.ps1` successfully
- [ ] Virtual environment created
- [ ] Python packages installed
- [ ] TextBlob corpora downloaded

### Service Startup
- [ ] ML Service starts on port 5001
- [ ] Backend starts on port 5000
- [ ] Frontend starts on port 3000 (optional)
- [ ] All health checks pass

### Automated Tests
- [ ] Run `test-ml-complete.ps1`
- [ ] All sentiment analysis tests pass
- [ ] Recommendation endpoint responds
- [ ] Forecasting returns predictions
- [ ] Success rate > 80%

### Manual Testing
- [ ] Create a review - sentiment is analyzed
- [ ] Sentiment badge appears in UI
- [ ] Place orders and get recommendations
- [ ] View forecasting dashboard (owners)
- [ ] API calls work with Postman/PowerShell

### Production Ready
- [ ] No errors in ML service logs
- [ ] No errors in backend logs
- [ ] Frontend displays ML features correctly
- [ ] Performance is acceptable (<2s response time)

---

## 🎉 CONGRATULATIONS!

Once all tests pass, your ML features are fully functional!

### What's Working:
✅ Sentiment analysis on all reviews (automatic)
✅ Personalized recommendations (improves with usage)
✅ Demand forecasting (requires 14+ days historical data)
✅ Full API integration
✅ Frontend components ready

### Next Steps:
1. Populate data through frontend (users, orders, reviews)
2. Train models with real data
3. Monitor ML service logs
4. Optimize based on usage patterns

---

## 📞 NEED HELP?

1. Check logs in ML service terminal
2. Check logs in backend terminal
3. Review `ML_TESTING_GUIDE.md` for detailed troubleshooting
4. Verify all services are running with health checks

---

**Note:** The ML features work best with real data. The more orders and reviews in your system, the better the recommendations and forecasts will be!
