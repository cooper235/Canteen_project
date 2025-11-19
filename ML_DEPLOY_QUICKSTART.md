# 🚀 ML Service Deployment - Quick Start Guide

## Step-by-Step Instructions

### 1️⃣ Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Find and select your repository: **`cooper235/Canteen_project`**

### 2️⃣ Configure Service Settings

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `canteen-ml-service` |
| **Region** | Oregon (US West) or closest to you |
| **Branch** | `main` |
| **Root Directory** | `ml-service` |
| **Environment** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 app:app` |

**Instance Type**: 
- Free (for testing) - sleeps after 15 min
- OR Starter - $7/month (recommended for production)

Click **"Create Web Service"**

### 3️⃣ Add Environment Variables

While the service is deploying:

1. Click on **"Environment"** tab (left sidebar)
2. Click **"Add Environment Variable"**
3. Add this variable:

```
Key: ALLOWED_ORIGINS
Value: https://canteen-project-mnk6.onrender.com
```

4. Click **"Save Changes"**

### 4️⃣ Wait for Deployment

- Initial deployment takes 3-5 minutes
- Watch the logs for any errors
- Look for: ✅ "Deploy successful"

### 5️⃣ Copy ML Service URL

After deployment succeeds:

1. You'll see the URL at the top, like: `https://canteen-ml-service-xxxx.onrender.com`
2. **Copy this URL** (you'll need it in the next step)

### 6️⃣ Test ML Service

Open your browser or use curl:
```
https://your-ml-service-url.onrender.com/health
```

Expected response:
```json
{"status": "healthy", "service": "ml-service"}
```

✅ If you see this, ML service is working!

### 7️⃣ Update Backend Environment Variables

Go back to your **backend service** on Render:

1. Go to Dashboard → **canteen-project** (your backend service)
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add:

```
Key: ML_SERVICE_URL
Value: https://your-ml-service-url.onrender.com
```
(Use the URL you copied in step 5)

5. Click **"Save Changes"**

This will automatically restart your backend.

### 8️⃣ Verify Everything Works

1. Visit your frontend: https://canteen-project-pani.vercel.app
2. Login as canteen owner
3. Go to **ML Analytics** page
4. You should see ML features working!

---

## 🎉 You're Done!

All three services are now deployed:

✅ **Backend**: https://canteen-project-mnk6.onrender.com  
✅ **Frontend**: https://canteen-project-pani.vercel.app  
✅ **ML Service**: https://your-ml-service-url.onrender.com

---

## 🐛 Troubleshooting

### ML service shows "Build failed"
**Check**: 
- Logs for specific error
- Verify `requirements.txt` has all dependencies
- Try redeploying

### ML service shows "Deploy failed"
**Solution**:
- Check if Python version is compatible
- Verify `gunicorn` is in requirements.txt
- Check logs for specific error

### Backend can't connect to ML service
**Check**:
1. ML service health endpoint works
2. `ML_SERVICE_URL` is correct in backend env vars
3. No typos in the URL (no trailing slash)

### ML features not working in frontend
**Check**:
1. Backend logs for ML service connection errors
2. ML service logs for CORS errors
3. Train ML models using the training endpoints

---

## 📝 Next Steps

After deployment, you should:

1. **Train ML Models**: 
   - Populate database with sample data
   - Use training endpoints to train models
   - Models improve with more data

2. **Monitor Performance**:
   - Check Render logs regularly
   - Watch for errors or slow responses
   - Consider upgrading to paid tier if needed

3. **Upgrade Plans** (Optional):
   - Backend: $7/month for always-on
   - ML Service: $7/month for better performance
   - Total: $14/month for production-ready setup

---

## 📚 Documentation Files

- `COMPLETE_ENV_GUIDE.md` - All environment variables explained
- `ML_SERVICE_DEPLOYMENT.md` - Detailed ML service deployment guide
- `DEPLOYMENT.md` - Original deployment documentation

---

**Need help?** Check the logs in Render Dashboard → Your Service → Logs
