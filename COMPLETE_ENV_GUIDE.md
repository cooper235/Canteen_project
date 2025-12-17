# Complete Environment Variables Configuration

## Overview
This document lists ALL environment variables needed for the complete Canteen Management System deployment.

---

## 1. BACKEND (Node.js/Express) - Render.com

**Service URL**: https://canteen-project-mnk6.onrender.com

### Database & Authentication
```
MONGODB_URI=mongodb+srv://kelly_2006:Gadha_dual123@cluster0.oqke7ub.mongodb.net/?appName=Cluster0
JWT_SECRET=N7v$2pQ8xZ!rL9mT4wB#fK1uH6eG0sY5
JWT_EXPIRE=7d
```

### Cloudinary (Image Storage)
```
CLOUDINARY_CLOUD_NAME=deqzetctp
CLOUDINARY_API_KEY=251755738777254
CLOUDINARY_API_SECRET=he5zK0UWxWNA2sCQr1J0RK5P3pM
```

### CORS & External Services
```
FRONTEND_URL=https://canteen-project-pani.vercel.app
ML_SERVICE_URL=https://canteen-ml-service.onrender.com
```
**Note**: Update `ML_SERVICE_URL` after ML service is deployed

### Server Configuration
```
PORT=5000
NODE_ENV=production
```

### Optional (Email - Not required for basic functionality)
```
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@canteen.com
```

---

## 2. FRONTEND (Next.js) - Vercel

**Service URL**: https://canteen-project-pani.vercel.app

### API Configuration
```
NEXT_PUBLIC_API_URL=https://canteen-project-mnk6.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://canteen-project-mnk6.onrender.com
```

### NextAuth Configuration
```
NEXTAUTH_URL=https://canteen-project-pani.vercel.app
NEXTAUTH_SECRET=N7v$2pQ8xZ!rL9mT4wB#fK1uH6eG0sY5
```

**⚠️ CRITICAL**: All frontend variables MUST have `NEXT_PUBLIC_` prefix (except NEXTAUTH_*)

---

## 3. ML SERVICE (Python/Flask) - Render.com

**Service URL**: https://canteen-ml-service.onrender.com (after deployment)

### Service Configuration
```
ML_SERVICE_PORT=5001
```
**Note**: Render will override this with its own PORT variable

### CORS Configuration
```
ALLOWED_ORIGINS=https://canteen-project-mnk6.onrender.com
```
**Format**: Comma-separated list (no spaces)
**Example**: `https://backend1.com,https://backend2.com`

### Python Version (Optional)
```
PYTHON_VERSION=3.11.0
```

---

## Quick Reference: What Goes Where

### Render Dashboard → Backend Service → Environment
✅ MONGODB_URI
✅ JWT_SECRET
✅ JWT_EXPIRE
✅ CLOUDINARY_CLOUD_NAME
✅ CLOUDINARY_API_KEY
✅ CLOUDINARY_API_SECRET
✅ FRONTEND_URL
✅ ML_SERVICE_URL (add after ML service is deployed)
✅ NODE_ENV=production

### Vercel Dashboard → Frontend Project → Environment Variables
✅ NEXT_PUBLIC_API_URL
✅ NEXT_PUBLIC_SOCKET_URL
✅ NEXTAUTH_URL
✅ NEXTAUTH_SECRET

**Environment**: All Environments (Production, Preview, Development)

### Render Dashboard → ML Service → Environment
✅ ALLOWED_ORIGINS
✅ PYTHON_VERSION (optional)

---

## Deployment Checklist

### Phase 1: Backend (Already Done ✅)
- [x] Backend deployed to Render
- [x] MongoDB Atlas connected
- [x] Environment variables added
- [x] CORS configured for frontend

### Phase 2: Frontend (Already Done ✅)
- [x] Frontend deployed to Vercel
- [x] Environment variables added
- [x] API URL pointing to backend
- [x] Removed hardcoded localhost from next.config.js

### Phase 3: ML Service (To Do)
- [ ] Deploy ML service to Render
- [ ] Add ALLOWED_ORIGINS environment variable
- [ ] Test health endpoint
- [ ] Update backend ML_SERVICE_URL
- [ ] Train ML models with production data

---

## Testing After ML Deployment

### 1. Test ML Service Health
```bash
curl https://canteen-ml-service.onrender.com/health
```
Expected: `{"status": "healthy", "service": "ml-service"}`

### 2. Test Backend → ML Connection
```bash
curl https://canteen-project-mnk6.onrender.com/api/ml/health
```
Expected: `{"success": true, "mlServiceStatus": {...}}`

### 3. Test Recommendations
Login to frontend → Visit ML Analytics page
Should see recommendations and sentiment analysis

---

## Environment Files Structure

```
Canteen_project/
├── .env                          # Backend environment (local dev)
├── models/canteen-frontend/
│   └── .env.local               # Frontend environment (local dev)
└── ml-service/
    └── .env                      # ML service environment (local dev)
```

**⚠️ NEVER commit .env files to Git!**

---

## Common Issues & Solutions

### Issue: Frontend still uses localhost
**Solution**: 
1. Remove any hardcoded URLs in `next.config.js`
2. Verify environment variables in Vercel
3. Trigger new deployment (not redeploy)

### Issue: ML service returns CORS error
**Solution**:
1. Verify `ALLOWED_ORIGINS` includes backend URL
2. Ensure no trailing slashes in URLs
3. Check ML service logs for errors

### Issue: Backend can't connect to ML service
**Solution**:
1. Verify ML service is running: `curl https://canteen-ml-service.onrender.com/health`
2. Check `ML_SERVICE_URL` in backend environment variables
3. Ensure ML service isn't sleeping (free tier limitation)

### Issue: Models not working
**Solution**:
1. Train models using the training endpoints
2. Verify sufficient data in database
3. Check ML service logs for training errors

---

## Cost Summary

| Service | Platform | Plan | Cost |
|---------|----------|------|------|
| Backend | Render | Free | $0 |
| Frontend | Vercel | Hobby | $0 |
| Database | MongoDB Atlas | Free (M0) | $0 |
| ML Service | Render | Free | $0 |
| Images | Cloudinary | Free | $0 |
| **TOTAL** | | | **$0/month** |

**Note**: Free tier limitations:
- Services sleep after 15 min inactivity
- Limited compute resources
- May experience cold starts

**Recommended for Production**:
- Backend: Render Starter ($7/month)
- ML Service: Render Starter ($7/month)
- Total: **$14/month**
