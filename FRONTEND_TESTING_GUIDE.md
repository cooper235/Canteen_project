# 🎯 FRONTEND ML FEATURES TESTING - QUICK GUIDE

## 🚀 ONE-COMMAND SETUP

```powershell
.\TEST_FRONTEND.ps1
```

This will:
1. ✓ Start ML Service and Backend
2. ✓ Create dummy data (5 students, 1 owner, 10 dishes, 30 orders, 10 reviews)
3. ✓ Analyze all reviews for sentiment
4. ✓ Train recommendation model
5. ✓ Optionally start frontend

---

## 📋 WHAT YOU'LL SEE IN FRONTEND

### 1. **SENTIMENT ANALYSIS** 🎭

**Where to see:**
- Any dish page with reviews
- Sentiment badges next to reviews

**What to look for:**
- ✅ Green badge = Positive review
- ⚠️ Yellow badge = Neutral review  
- ❌ Red badge = Negative review
- Keywords displayed under reviews

**Test it:**
1. Login as `student1@test.com`
2. Go to any dish
3. View existing reviews with sentiment badges
4. Add a new review → Auto-analyzed!

---

### 2. **RECOMMENDATIONS** 💡

**Where to see:**
- Homepage after login
- "Recommended for You" section
- Canteen pages

**What to look for:**
- Personalized dish suggestions
- "Based on your orders" label
- Different for each student

**Test it:**
1. Login as `student1@test.com`
2. Check homepage recommendations
3. Logout and login as `student2@test.com`
4. See different recommendations!

---

### 3. **DEMAND FORECASTING** 📊

**Where to see:**
- Owner Dashboard
- Forecasting section
- Individual dish analytics

**What to look for:**
- 7-day demand predictions
- Trend indicators (↑ ↓ →)
- Peak days highlighted
- Confidence intervals

**Test it:**
1. Login as `owner@test.com`
2. Go to Dashboard
3. Click "Forecasting"
4. View predictions for each dish

---

## 🔐 LOGIN CREDENTIALS

### Students (for recommendations & sentiment):
```
Email: student1@test.com   Password: password123
Email: student2@test.com   Password: password123
Email: student3@test.com   Password: password123
Email: student4@test.com   Password: password123
Email: student5@test.com   Password: password123
```

### Owner (for forecasting):
```
Email: owner@test.com      Password: password123
```

---

## 📊 DUMMY DATA CREATED

- ✅ **5 Students** - Different order histories
- ✅ **1 Canteen** - "Test Canteen"
- ✅ **10 Dishes** - Various categories
- ✅ **30 Orders** - Last 30 days (for recommendations)
- ✅ **10 Reviews** - With sentiment analysis
- ✅ **Trained Model** - Ready for recommendations

---

## 🎨 ML FEATURES TO DEMONSTRATE

### Sentiment Analysis:
✅ Positive review detection  
✅ Negative review detection  
✅ Keyword extraction  
✅ Real-time analysis on new reviews  
✅ Sentiment badges in UI

### Recommendations:
✅ Collaborative filtering  
✅ Order-based suggestions  
✅ Personalized per user  
✅ "Recommended for You" section

### Forecasting:
✅ 7-day predictions  
✅ Trend analysis  
✅ Peak day identification  
✅ Visual charts (if implemented)

---

## 🧪 TEST SCENARIOS

### Scenario 1: View Sentiment
1. Login as any student
2. Click on "Veg Biryani" dish
3. Scroll to reviews
4. See sentiment badges and keywords

### Scenario 2: Get Recommendations
1. Login as `student1@test.com`
2. Homepage shows recommendations
3. Based on their 30-day order history
4. Click to view recommended dishes

### Scenario 3: Add Review (Live Sentiment)
1. Login as `student1@test.com`
2. Go to any dish
3. Add review: "Amazing food, very delicious!"
4. Submit → Sentiment auto-analyzed
5. See positive badge appear

### Scenario 4: View Forecasts (Owner)
1. Login as `owner@test.com`
2. Dashboard → Forecasting
3. See 7-day predictions for dishes
4. Check trending dishes
5. View confidence intervals

---

## 🔍 WHERE TO LOOK IN FRONTEND

### Homepage:
- Recommended dishes section
- Trending items
- Popular choices

### Dish Page:
- Reviews with sentiment badges
- Average sentiment score
- Keyword cloud (if implemented)

### Profile/Orders:
- Order history
- Past reviews with sentiments

### Owner Dashboard:
- Demand forecasting charts
- Sentiment analysis overview
- Top performing dishes
- Trend indicators

---

## 🎯 EXPECTED BEHAVIOR

✅ **Reviews show colored badges** based on sentiment  
✅ **Keywords appear** under reviews (delicious, fresh, etc.)  
✅ **Recommendations change** per user  
✅ **Forecasts show** realistic predictions  
✅ **New reviews** get analyzed instantly  
✅ **Different students** see different recommendations

---

## 🔧 TROUBLESHOOTING

### No Recommendations?
- Need more orders in system
- Re-run: `node scripts/populate-dummy-data.js`

### No Sentiment Badges?
- Check ML service: `Invoke-RestMethod http://localhost:5001/health`
- Reviews might be old (add new one)

### Forecasts Not Showing?
- Login as owner (not student)
- Need minimum 14 days data
- Check dashboard permissions

---

## 📱 FRONTEND PAGES TO CHECK

```
http://localhost:3000/               → Homepage (recommendations)
http://localhost:3000/canteens       → All canteens
http://localhost:3000/canteens/[id]  → Canteen dishes
http://localhost:3000/dishes/[id]    → Dish details (reviews)
http://localhost:3000/dashboard      → Owner dashboard
http://localhost:3000/profile        → User profile
```

---

## ✨ QUICK COMMANDS

```powershell
# Complete setup
.\TEST_FRONTEND.ps1

# Just start services
.\START_QUICK.ps1

# Add more data
node scripts/populate-dummy-data.js

# Test ML directly
.\test-ml-quick.ps1

# Start frontend only
cd models\canteen-frontend
npm run dev
```

---

## 🎉 SUCCESS CRITERIA

✅ You see sentiment badges on reviews  
✅ Different students get different recommendations  
✅ New reviews are auto-analyzed  
✅ Owner sees demand forecasts  
✅ Keywords appear in reviews  
✅ All features work without errors

---

**Ready to test? Run: `.\TEST_FRONTEND.ps1` and follow the guide!** 🚀
