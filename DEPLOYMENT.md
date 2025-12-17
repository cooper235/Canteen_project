# 🚀 Deployment Guide - Canteen Management System

## Overview
This guide covers deploying:
- **Frontend**: Next.js app on **Vercel**
- **Backend**: Express.js API on **Render**
- **Database**: MongoDB Atlas (already set up)

---

## 📋 Pre-Deployment Checklist

### 1. Clean Repository
```powershell
# Make sure these are in .gitignore (already done):
- .env files
- node_modules/
- .next/
- All test and documentation files
```

### 2. Commit and Push to GitHub
```powershell
cd C:\Users\hp\Desktop\canteen\Canteen_project
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## 🔧 Backend Deployment (Render)

### Step 1: Sign Up & Create Service
1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository: `cooper235/Canteen_project`

### Step 2: Configure Service
```
Name: canteen-backend
Region: Oregon (US West)
Branch: main
Root Directory: (leave empty)
Runtime: Node
Build Command: pnpm install
Start Command: node server.js
Instance Type: Free
```

### Step 3: Add Environment Variables
Click **"Environment"** and add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://kelly_2006:Gadha_dual123@cluster0.oqke7ub.mongodb.net/?appName=Cluster0` |
| `JWT_SECRET` | `N7v$2pQ8xZ!rL9mT4wB#fK1uH6eG0sY5` |
| `JWT_EXPIRE` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | `deqzetctp` |
| `CLOUDINARY_API_KEY` | `251755738777254` |
| `CLOUDINARY_API_SECRET` | `he5zK0UWxWNA2sCQr1J0RK5P3pM` |
| `FRONTEND_URL` | `https://your-app.vercel.app` (update after frontend deployment) |
| `ML_SERVICE_URL` | `http://localhost:5001` |

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL: `https://canteen-backend-xxxx.onrender.com`

### ⚠️ Important Notes for Render:
- Free tier sleeps after 15 mins of inactivity
- First request after sleep takes ~30 seconds
- Keep your backend URL handy for frontend setup

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Sign Up & Import Project
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click **"Add New..."** → **"Project"**
4. Import: `cooper235/Canteen_project`

### Step 2: Configure Project
```
Framework Preset: Next.js
Root Directory: models/canteen-frontend
Build Command: pnpm build
Output Directory: .next
Install Command: pnpm install
```

### Step 3: Add Environment Variables
Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://canteen-backend-xxxx.onrender.com/api` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://canteen-backend-xxxx.onrender.com` |

**Replace** `canteen-backend-xxxx.onrender.com` with your actual Render backend URL!

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build (3-5 minutes)
3. Copy your frontend URL: `https://your-app.vercel.app`

### Step 5: Update Backend CORS
1. Go back to Render dashboard
2. Open your backend service
3. Update `FRONTEND_URL` environment variable to your Vercel URL
4. Service will auto-redeploy

---

## 🔄 Post-Deployment Steps

### 1. Update MongoDB IP Whitelist
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Network Access"**
3. Add Render's IP or use `0.0.0.0/0` (allow all)

### 2. Test Your Deployment
```
Frontend: https://your-app.vercel.app
Backend API: https://canteen-backend-xxxx.onrender.com/api/health
```

### 3. Update vercel.json (Optional)
Edit `models/canteen-frontend/vercel.json` and replace:
```json
"destination": "https://canteen-backend-xxxx.onrender.com/api/:path*"
```

---

## 🔄 Redeployment (Updates)

### For Backend Changes:
```powershell
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys on push
```

### For Frontend Changes:
```powershell
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys on push
```

---

## 🐛 Troubleshooting

### Backend Issues:

**MongoDB Connection Failed**
- Check MongoDB Atlas IP whitelist
- Verify MONGODB_URI is correct
- Check Render logs: Dashboard → Logs

**Port Already in Use**
- Render automatically assigns PORT via environment variable
- Make sure your code uses `process.env.PORT`

**Build Failed**
- Check if all dependencies are in `package.json`
- Verify build command is correct

### Frontend Issues:

**API Calls Failing**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is deployed and running
- Check CORS settings in backend

**Build Failed**
- Check if root directory is set to `models/canteen-frontend`
- Verify all dependencies are installed
- Check Vercel build logs

**Environment Variables Not Working**
- Environment variables must start with `NEXT_PUBLIC_` for client-side
- Redeploy after adding new variables

---

## 📊 Monitoring & Logs

### Render (Backend)
- Dashboard → Your Service → **Logs**
- View real-time logs and errors

### Vercel (Frontend)
- Dashboard → Your Project → **Deployments**
- Click deployment → **View Function Logs**

---

## 🔒 Security Recommendations

Before going to production:

1. **Change JWT Secret**
   - Generate new secret: Use a password generator
   - Update in Render environment variables

2. **MongoDB Security**
   - Use specific IP whitelist instead of 0.0.0.0/0
   - Create database user with minimal permissions

3. **Environment Variables**
   - Never commit `.env` files
   - Use Render/Vercel dashboards for secrets
   - Rotate credentials regularly

4. **Cloudinary**
   - Set upload restrictions
   - Monitor usage

---

## 💰 Cost Considerations

### Free Tiers:
- **Render**: Free tier available (sleeps after inactivity)
- **Vercel**: Free tier with usage limits
- **MongoDB Atlas**: Free M0 cluster (512MB)

### Upgrading:
- **Render**: $7/month for always-on instance
- **Vercel**: $20/month for Pro plan
- **MongoDB**: $9/month for M2 cluster

---

## 🎯 Quick Commands Reference

```powershell
# Clean and prepare for deployment
git rm -r --cached .
git add .
git commit -m "Clean repository for deployment"
git push origin main

# Check what will be committed
git status

# View .gitignore patterns
cat .gitignore
```

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas IP whitelist configured
- [ ] Backend deployed on Render
- [ ] Backend environment variables set
- [ ] Backend URL copied
- [ ] Frontend deployed on Vercel
- [ ] Frontend environment variables set with backend URL
- [ ] Vercel URL copied
- [ ] Backend FRONTEND_URL updated with Vercel URL
- [ ] Test frontend loads
- [ ] Test API endpoints work
- [ ] Test authentication works
- [ ] Test image uploads (Cloudinary)

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/

**Common URLs:**
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com

Good luck with your deployment! 🚀
