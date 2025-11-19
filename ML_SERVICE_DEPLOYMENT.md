# ML Service Deployment Guide

## Overview
The ML service provides recommendation, forecasting, and sentiment analysis features for the Canteen Management System.

## Deployment Platform: Render.com

### Step 1: Add Gunicorn to requirements.txt
The ML service needs `gunicorn` for production deployment.

### Step 2: Create New Web Service on Render
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `cooper235/Canteen_project`
4. Configure the service:
   - **Name**: `canteen-ml-service`
   - **Region**: Oregon (US West) or closest to your users
   - **Branch**: `main`
   - **Root Directory**: `ml-service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 app:app`
   - **Instance Type**: Free (for testing) or Starter ($7/month for better performance)

### Step 3: Environment Variables
Add these in Render Dashboard → Environment:

```
ALLOWED_ORIGINS=https://canteen-project-mnk6.onrender.com
```

### Step 4: Update Backend Environment Variables
After ML service is deployed, get the URL (e.g., `https://canteen-ml-service.onrender.com`) and add to backend:

**In Render Dashboard → canteen-project (backend) → Environment:**
```
ML_SERVICE_URL=https://canteen-ml-service.onrender.com
```

### Step 5: Verify Deployment
1. Visit: `https://canteen-ml-service.onrender.com/health`
2. Should return: `{"status": "healthy", "service": "ml-service"}`

## Local Development

### Setup
```bash
cd ml-service
pip install -r requirements.txt
```

### Create .env file
```
ML_SERVICE_PORT=5001
ALLOWED_ORIGINS=http://localhost:5000
```

### Run locally
```bash
python app.py
```

Service runs on: http://localhost:5001

## API Endpoints

### Health Check
- `GET /health` - Check service status

### Recommendations
- `GET /api/recommendations/user/<user_id>` - Get user recommendations
- `POST /api/recommendations/train` - Train recommendation model

### Forecasting
- `POST /api/forecast/demand` - Forecast dish demand
- `POST /api/forecast/train` - Train forecasting model

### Sentiment Analysis
- `POST /api/sentiment/analyze` - Analyze single review
- `POST /api/sentiment/batch` - Analyze multiple reviews
- `GET /api/sentiment/insights/<canteen_id>` - Get canteen insights

## Architecture Flow

```
Frontend (Vercel)
    ↓
Backend (Render) ←→ ML Service (Render)
    ↓
MongoDB Atlas
```

## Cost Estimate
- **Free tier**: Limited to 750 hours/month, spins down after 15 min of inactivity
- **Starter ($7/month)**: Always on, better performance
- **Recommendation**: Start with free, upgrade if needed

## Important Notes

1. **Cold Starts**: Free tier services sleep after 15 minutes of inactivity. First request after sleep takes ~30-60 seconds.

2. **Model Persistence**: Models are saved to `models/` directory. This persists across deploys on paid plans but may be lost on free tier restarts.

3. **Training Data**: The ML service requires historical order and review data to train models. Run training endpoints after populating database.

4. **CORS**: The service only accepts requests from allowed origins (your backend). Direct browser requests will be blocked.

## Troubleshooting

### ML service returns 500 errors
- Check Render logs for Python errors
- Verify all dependencies installed correctly
- Ensure sufficient memory (upgrade from free tier if needed)

### Backend can't connect to ML service
- Verify `ML_SERVICE_URL` environment variable in backend
- Check ML service is running: visit `/health` endpoint
- Verify CORS allows backend origin

### Models not persisting
- Free tier doesn't guarantee disk persistence
- Consider upgrading to paid tier for persistent storage
- Or store models in cloud storage (S3, Cloudinary, etc.)
