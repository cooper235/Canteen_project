# ML Features User Guide

## ✅ ML Features Now Integrated in Frontend

All three ML features are now properly integrated into the frontend. Here's where to find each one:

---

## 1. 😊 Sentiment Analysis

### Where to see it:
**Reviews on Dish Pages**

### How to access:
1. Go to **Canteens** page: http://localhost:3000/canteens
2. Click on any canteen
3. Scroll down to any dish and view its reviews
4. **You'll see sentiment badges** on each review:
   - 😊 **Positive** (green badge)
   - 😐 **Neutral** (gray badge)
   - 😢 **Negative** (red badge)
   - Shows sentiment score percentage
   - Shows keyword highlights

### What was fixed:
- Added sentiment fields to `ReviewsList.tsx` interface
- Imported and integrated `SentimentBadge` component
- Reviews now display sentiment badges with scores and keywords
- Backend automatically analyzes sentiment when reviews are created

---

## 2. 🤖 Personalized Recommendations

### Where to see it:
**Homepage (when logged in) AND Canteens Page**

### How to access:

#### Option A: Homepage
1. **Login** to your account
2. Go to **Home** page: http://localhost:3000/
3. Scroll down - you'll see **"🤖 Recommended for You"** section
4. Shows AI-powered dish recommendations with match percentages

#### Option B: Canteens Page
1. **Login** to your account
2. Go to **Canteens** page: http://localhost:3000/canteens
3. At the top, you'll see **"🤖 Recommended for You"** section
4. Shows personalized dish recommendations based on your order history

### Features:
- Shows **match percentage** (e.g., "85% match")
- Shows **recommendation reason** (e.g., "Similar to your favorites")
- Displays dish image, name, price, canteen
- Links directly to the dish's canteen page
- **ML Powered** badge indicator
- Requires login and order history

---

## 3. 📈 Demand Forecasting Dashboard

### Where to see it:
**ML Analytics Page (Canteen Owners Only)**

### How to access:
1. **Login as a canteen owner** (test credentials below)
2. Go to **Manage** section
3. Click on **ML Analytics**: http://localhost:3000/manage/ml-analytics
4. View the **"📈 Demand Forecasting"** tab

### Features:
- 7-day demand predictions for each dish
- Interactive charts and graphs
- Historical vs predicted demand comparison
- Confidence intervals
- Based on Holt-Winters Exponential Smoothing algorithm
- Also includes **Sentiment Analysis** tab for overview of all reviews

---

## Test Credentials

### Student Accounts (for Recommendations & Reviews)
```
Email: student1@example.com
Password: Student123!

Email: student2@example.com
Password: Student123!

Email: student3@example.com
Password: Student123!
```

### Owner Account (for Forecasting Dashboard)
```
Email: owner@techcanteen.com
Password: Owner123!
```

---

## Quick Test Procedure

### Step 1: Test Sentiment Analysis (No login needed)
```powershell
# 1. Start services
.\START_QUICK.ps1

# 2. Open browser
# Navigate to: http://localhost:3000/canteens
# Click any canteen → View dishes with reviews
# ✅ See sentiment badges on reviews
```

### Step 2: Test Recommendations (Login required)
```powershell
# 1. Login with student account: student1@example.com / Student123!

# 2. Navigate to homepage: http://localhost:3000/
# ✅ See "Recommended for You" section

# 3. Or go to canteens page: http://localhost:3000/canteens
# ✅ See recommendations at the top
```

### Step 3: Test Forecasting Dashboard (Owner login required)
```powershell
# 1. Login with owner account: owner@techcanteen.com / Owner123!

# 2. Navigate to: http://localhost:3000/manage/ml-analytics
# ✅ See demand forecasting charts and predictions
```

---

## Dummy Data Overview

The database has been populated with:
- ✅ **5 students** (student1-5@example.com)
- ✅ **1 owner** (owner@techcanteen.com)
- ✅ **1 canteen** (Tech Canteen)
- ✅ **12 dishes** (various categories: breakfast, lunch, snacks, beverages, desserts)
- ✅ **30 orders** (distributed across students and dishes)
- ✅ **10 reviews** with sentiment analysis
- ✅ **Trained recommendation model** (11 users × 23 items)

---

## ML Service Details

### Backend Endpoints:
- `POST /api/ml/recommendations/user/:userId` - Get personalized recommendations
- `POST /api/ml/sentiment/analyze` - Analyze text sentiment
- `POST /api/ml/sentiment/batch` - Batch sentiment analysis
- `POST /api/ml/forecast/demand` - Forecast dish demand

### ML Service (Python Flask):
- Runs on **port 5001**
- Uses **TextBlob** for sentiment analysis
- Uses **scikit-learn** for collaborative filtering recommendations
- Uses **statsmodels** for Holt-Winters forecasting

---

## Verification Checklist

- [x] **Sentiment badges display on reviews**
- [x] **Recommendations show on homepage (logged in)**
- [x] **Recommendations show on canteens page (logged in)**
- [x] **Forecasting dashboard accessible to owners**
- [x] **ML service running and responding**
- [x] **Backend proxying ML requests correctly**
- [x] **Dummy data populated with sentiment**
- [x] **Recommendation model trained**

---

## Troubleshooting

### If recommendations don't show:
1. Make sure you're **logged in** with a student account
2. Ensure the user has **order history** (dummy data includes this)
3. Check that ML service is running on port 5001
4. Check browser console for errors

### If sentiment badges don't show:
1. Make sure reviews have been analyzed (dummy data includes this)
2. Check that ReviewsList component is displaying
3. Verify backend is returning sentiment fields

### If forecasting doesn't work:
1. Login as **owner account** (not student)
2. Navigate to `/manage/ml-analytics`
3. Ensure enough historical order data exists
4. Check ML service logs

---

## Architecture Summary

```
Frontend (Next.js) - Port 3000
    ↓
Backend (Node.js) - Port 5000
    ↓
ML Service (Flask) - Port 5001
    ↓
MongoDB Database
```

All ML features are now **fully integrated and visible** in the frontend! 🎉
