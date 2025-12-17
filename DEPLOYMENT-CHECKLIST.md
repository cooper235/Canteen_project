# ✅ Deployment Checklist

## 📝 Pre-Deployment
- [x] Clean .gitignore updated
- [x] All unnecessary .md files removed
- [x] vercel.json created for frontend
- [x] render.yaml created for backend
- [x] README.md updated
- [x] DEPLOYMENT.md guide created
- [ ] .env removed from git (check with `git status`)
- [ ] node_modules not in git

## 🔄 Push to GitHub
Run: `.\push-to-github.ps1`

Or manually:
```powershell
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## 🔧 Backend Deployment (Render)

### 1. Create Account
- [ ] Sign up at https://render.com with GitHub
- [ ] Connect your GitHub account

### 2. Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Select repository: cooper235/Canteen_project
- [ ] Configure:
  - Name: `canteen-backend`
  - Region: Oregon
  - Branch: main
  - Build: `pnpm install`
  - Start: `node server.js`

### 3. Add Environment Variables
- [ ] PORT = `5000`
- [ ] NODE_ENV = `production`
- [ ] MONGODB_URI = `mongodb+srv://kelly_2006:Gadha_dual123@cluster0.oqke7ub.mongodb.net/?appName=Cluster0`
- [ ] JWT_SECRET = `N7v$2pQ8xZ!rL9mT4wB#fK1uH6eG0sY5`
- [ ] JWT_EXPIRE = `7d`
- [ ] CLOUDINARY_CLOUD_NAME = `deqzetctp`
- [ ] CLOUDINARY_API_KEY = `251755738777254`
- [ ] CLOUDINARY_API_SECRET = `he5zK0UWxWNA2sCQr1J0RK5P3pM`
- [ ] FRONTEND_URL = (add after Vercel deployment)
- [ ] ML_SERVICE_URL = `http://localhost:5001`

### 4. Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 mins)
- [ ] Copy your URL: `https://__________.onrender.com`

## 🎨 Frontend Deployment (Vercel)

### 1. Create Account
- [ ] Sign up at https://vercel.com with GitHub
- [ ] Connect your GitHub account

### 2. Import Project
- [ ] Click "Add New..." → "Project"
- [ ] Select repository: cooper235/Canteen_project
- [ ] Configure:
  - Framework: Next.js
  - Root Directory: `models/canteen-frontend`
  - Build: `pnpm build`
  - Install: `pnpm install`

### 3. Add Environment Variables
- [ ] NEXT_PUBLIC_API_URL = `https://your-backend.onrender.com/api`
- [ ] NEXT_PUBLIC_SOCKET_URL = `https://your-backend.onrender.com`

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build (3-5 mins)
- [ ] Copy your URL: `https://__________.vercel.app`

## 🔄 Final Steps

### Update Backend CORS
- [ ] Go to Render dashboard
- [ ] Update FRONTEND_URL env variable to your Vercel URL
- [ ] Service will auto-redeploy

### Test Everything
- [ ] Visit frontend URL
- [ ] Test login/register
- [ ] Test creating canteen
- [ ] Test creating dish
- [ ] Test placing order
- [ ] Check real-time updates

### MongoDB Atlas
- [ ] Add Render IP to whitelist (or use 0.0.0.0/0)
- [ ] Verify connection from Render logs

## 📊 Monitoring

### Check Logs
- **Render**: Dashboard → Your Service → Logs
- **Vercel**: Dashboard → Deployments → View Logs

### Common Issues
- MongoDB connection: Check IP whitelist
- CORS errors: Verify FRONTEND_URL matches Vercel URL
- API calls fail: Check NEXT_PUBLIC_API_URL is correct
- Images not uploading: Verify Cloudinary credentials

## 🎉 Success!
Once all checkboxes are marked, your app is live!

**Frontend**: https://__________.vercel.app
**Backend**: https://__________.onrender.com

---

For detailed help, see DEPLOYMENT.md
