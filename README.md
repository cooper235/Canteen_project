# 🍽️ Canteen Management System

A comprehensive full-stack application for managing college canteens with real-time order tracking, ML-powered recommendations, and analytics.

## ✨ Features

- 🔐 **User Authentication** - JWT-based auth with role management (Student, Owner, Admin)
- 🏪 **Canteen Management** - Create and manage multiple canteens with custom menus
- 🍕 **Dish Management** - Add dishes with images, pricing, and availability
- 📦 **Order System** - Real-time order placement, tracking, and status updates
- ⭐ **Reviews & Ratings** - Student feedback with sentiment analysis
- 📊 **Analytics Dashboard** - Revenue tracking, popular dishes, and insights
- 🤖 **ML Features** - Personalized recommendations and demand forecasting
- 🔔 **Real-time Notifications** - Socket.IO for live updates
- 📱 **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.IO
- **Image Upload**: Cloudinary
- **ML Service**: Python Flask (optional)

### Frontend
- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

## 📁 Project Structure

```
Canteen_project/
├── server.js              # Backend entry point
├── package.json           # Backend dependencies
├── render.yaml           # Render deployment config
├── config/               # Database & Cloudinary config
├── controllers/          # Route controllers
├── middleware/           # Auth & validation middleware
├── models/               # MongoDB schemas
│   └── canteen-frontend/ # Frontend Next.js app
│       ├── vercel.json   # Vercel deployment config
│       └── src/          # Frontend source code
├── routes/               # API routes
├── ml-service/          # Python ML service (optional)
└── scripts/             # Database seed & utility scripts
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 16+ and pnpm
- MongoDB Atlas account
- Cloudinary account (for image uploads)

### 1. Clone Repository
```bash
git clone https://github.com/cooper235/Canteen_project.git
cd Canteen_project
```

### 2. Install Dependencies
```bash
# Backend
pnpm install

# Frontend
cd models/canteen-frontend
pnpm install
cd ../..
```

### 3. Environment Setup

Create `.env` in root directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
ML_SERVICE_URL=http://localhost:5001
```

Create `.env.local` in `models/canteen-frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4. Run Development Servers

**Backend:**
```bash
node server.js
# Runs on http://localhost:5000
```

**Frontend:**
```bash
cd models/canteen-frontend
pnpm dev
# Runs on http://localhost:3000
```

## 🌐 Deployment

For detailed deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Deploy Summary:

**Backend → Render.com**
- Free tier available
- Auto-deploys from GitHub
- Set environment variables in dashboard

**Frontend → Vercel.com**
- Free tier with generous limits
- Auto-deploys from GitHub
- Set `NEXT_PUBLIC_*` environment variables

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Canteens
- `GET /api/canteens` - List all canteens
- `POST /api/canteens` - Create canteen (Owner)
- `GET /api/canteens/:id` - Get canteen details
- `PUT /api/canteens/:id` - Update canteen (Owner)

### Dishes
- `GET /api/dishes` - List dishes
- `POST /api/dishes` - Create dish (Owner)
- `PUT /api/dishes/:id` - Update dish (Owner)
- `DELETE /api/dishes/:id` - Delete dish (Owner)

### Orders
- `POST /api/orders` - Place order (Student)
- `GET /api/orders` - Get user orders
- `PUT /api/orders/:id/status` - Update order status (Owner)

### Reviews
- `POST /api/reviews` - Create review (Student)
- `GET /api/reviews/dish/:id` - Get dish reviews

For complete API documentation, test the endpoints at:
```
http://localhost:5000/api/health
```

## 🧪 Testing

```bash
# Check backend API
curl http://localhost:5000/api/health

# Run database scripts
node scripts/seedCanteens.js
node scripts/populate-dummy-data.js
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For deployment help, see [DEPLOYMENT.md](./DEPLOYMENT.md)

For issues, please open a GitHub issue.

## 👥 Authors

- **Cooper235** - [GitHub](https://github.com/cooper235)

---

**⭐ Star this repo if you find it useful!**
