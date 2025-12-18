<div align="center">

# 🍽️ Smart Canteen Management System

### *AI-Powered College Canteen Management Platform*

[![Made with Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**A comprehensive full-stack application revolutionizing college canteen operations with intelligent features, real-time updates, and ML-powered insights.**

[Features](#-features) • [Tech Stack](#-technology-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API](#-api-documentation)

---

</div>

## 📖 Overview

The **Smart Canteen Management System** is an enterprise-grade platform designed to streamline canteen operations in educational institutions. It connects students, canteen owners, and administrators through a unified system with real-time order tracking, AI-powered recommendations, sentiment analysis, and comprehensive analytics.

### 🎯 Problem Solved

Traditional canteen management faces challenges like:
- Long queues and inefficient order processing
- Poor inventory management leading to food waste
- Lack of customer feedback mechanisms
- No personalized user experience
- Difficulty in tracking revenue and popular items

Our solution addresses all these pain points with modern technology and intelligent automation.

---

## ✨ Key Features

### 🔐 **Authentication & User Management**
- Secure JWT-based authentication with role-based access control (RBAC)
- Three user roles: **Student**, **Canteen Owner**, and **Admin**
- Password encryption with bcryptjs
- Session management and token refresh

### 🏪 **Multi-Canteen Support**
- Support for multiple canteens within a single platform
- Each canteen has its own customizable menu and settings
- Canteen owners can manage their own establishments independently
- Students can browse and order from any canteen

### 🍕 **Smart Menu Management**
- Add, update, and delete dishes with ease
- Rich media support with Cloudinary integration for dish images
- Real-time availability status (Available, Out of Stock, Coming Soon)
- Pricing management and category organization
- Nutritional information and dietary tags

### 📦 **Advanced Order System**
- Seamless order placement with instant confirmation
- Real-time order tracking with status updates:
  - Pending → Confirmed → Preparing → Ready → Completed
- Order history and receipt generation
- Bulk order support for events
- Queue management system

### ⭐ **Reviews & Ratings**
- Students can rate dishes and canteens (1-5 stars)
- Written reviews with sentiment analysis
- Average ratings calculated automatically
- Review moderation capabilities for admins
- Trending dishes based on ratings

### 📊 **Comprehensive Analytics Dashboard**
- **Revenue Analytics**: Daily, weekly, monthly revenue tracking
- **Popular Dishes**: Most ordered items and trending foods
- **Peak Hours**: Identify busy times for better resource allocation
- **Customer Insights**: User behavior and preferences
- **Sales Forecasting**: Predict future demand using ML
- Export reports in CSV/PDF format

### 🤖 **AI/ML Features**
- **Personalized Recommendations**: Collaborative filtering-based dish suggestions
- **Demand Forecasting**: Predict ingredient requirements to reduce waste
- **Sentiment Analysis**: Automatically analyze customer feedback sentiment
- **Smart Pricing**: Dynamic pricing suggestions based on demand
- **Inventory Optimization**: AI-driven stock level recommendations

### 🔔 **Real-Time Notifications**
- Socket.IO-powered live updates
- Order status change notifications
- New announcement alerts
- Low stock warnings for owners
- Special offers and promotions

### 💬 **AI Chatbot Assistant**
- Answer common queries about menu, timings, and orders
- Help students navigate the platform
- Provide nutritional information
- Handle booking inquiries

### 📢 **Announcements & Promotions**
- Broadcast important updates to all users
- Targeted announcements to specific canteens
- Special offers and discount alerts
- Menu changes and new dish launches

### 📱 **Responsive Design**
- Mobile-first approach for on-the-go ordering
- Progressive Web App (PWA) capabilities
- Works seamlessly on desktop, tablet, and mobile
- Optimized performance with lazy loading

---

## 🛠️ Technology Stack

### **Backend Infrastructure**
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web application framework |
| **MongoDB Atlas** | NoSQL cloud database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Secure authentication tokens |
| **Socket.IO** | Real-time bidirectional communication |
| **Cloudinary** | Cloud-based image management |
| **Helmet** | Security middleware |
| **Morgan** | HTTP request logger |
| **Express Rate Limit** | API rate limiting |
| **Joi** | Schema validation |
| **Bcryptjs** | Password hashing |

### **Frontend Stack**
| Technology | Purpose |
|-----------|---------|
| **Next.js 13** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **React 18** | UI library |
| **Tailwind CSS** | Utility-first CSS framework |
| **Framer Motion** | Animation library |
| **Axios** | HTTP client |
| **React Query** | Server state management |
| **React Hook Form** | Form validation |
| **Recharts** | Data visualization |
| **Lucide React** | Icon library |
| **Socket.IO Client** | Real-time client |

### **ML Service (Python)**
| Technology | Purpose |
|-----------|---------|
| **Flask** | Micro web framework |
| **Scikit-learn** | Machine learning algorithms |
| **Pandas** | Data manipulation |
| **NumPy** | Numerical computing |
| **NLTK/TextBlob** | Natural language processing |
| **Joblib** | Model serialization |

### **DevOps & Deployment**
- **Git & GitHub**: Version control
- **Render.com**: Backend hosting
- **Vercel**: Frontend hosting
- **MongoDB Atlas**: Database hosting
- **Cloudinary**: Image CDN

---

## 📁 Project Architecture

```
Canteen_project/
│
├── 🔧 Backend (Node.js/Express)
│   ├── server.js                    # Express server with Socket.IO
│   ├── package.json                 # Backend dependencies
│   ├── config/                      # Configuration files
│   │   ├── database.js             # MongoDB connection
│   │   └── cloudinary.js           # Cloudinary setup
│   │
│   ├── controllers/                # Business logic
│   │   ├── authController.js       # User authentication
│   │   ├── canteenController.js    # Canteen operations
│   │   ├── dishController.js       # Menu management
│   │   ├── orderController.js      # Order processing
│   │   ├── reviewController.js     # Review handling
│   │   ├── analyticsController.js  # Data analytics
│   │   ├── mlController.js         # ML integration
│   │   ├── chatbotController.js    # Chatbot logic
│   │   ├── announcementController.js
│   │   └── userController.js
│   │
│   ├── models/                     # MongoDB schemas
│   │   ├── User.js
│   │   ├── Canteen.js
│   │   ├── Dish.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   └── Announcement.js
│   │
│   ├── routes/                     # API endpoints
│   │   ├── authRoutes.js
│   │   ├── canteenRoutes.js
│   │   ├── dishRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── mlRoutes.js
│   │   ├── chatbotRoutes.js
│   │   ├── announcementRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── middleware/                 # Express middleware
│   │   ├── auth.js                # JWT verification
│   │   ├── rateLimiter.js         # Rate limiting
│   │   └── validation.js          # Input validation
│   │
│   └── scripts/                   # Utility scripts
│       ├── seedCanteens.js        # Seed initial data
│       ├── populate-dummy-data.js
│       └── train-ml-models.js
│
├── 🎨 Frontend (Next.js/TypeScript)
│   └── models/canteen-frontend/
│       ├── src/
│       │   ├── app/               # Next.js 13 App Router
│       │   │   ├── (auth)/        # Auth pages
│       │   │   ├── (dashboard)/   # Dashboard pages
│       │   │   ├── canteens/      # Canteen pages
│       │   │   ├── orders/        # Order pages
│       │   │   └── layout.tsx     # Root layout
│       │   │
│       │   ├── components/        # React components
│       │   │   ├── ui/            # Reusable UI components
│       │   │   ├── dashboard/     # Dashboard widgets
│       │   │   ├── canteen/       # Canteen components
│       │   │   └── orders/        # Order components
│       │   │
│       │   ├── context/           # React Context
│       │   │   ├── AuthContext.tsx
│       │   │   └── SocketContext.tsx
│       │   │
│       │   ├── hooks/             # Custom React hooks
│       │   ├── lib/               # Utility functions
│       │   ├── services/          # API service layer
│       │   └── types/             # TypeScript types
│       │
│       ├── public/                # Static assets
│       ├── next.config.js         # Next.js configuration
│       ├── tailwind.config.js     # Tailwind configuration
│       ├── tsconfig.json          # TypeScript configuration
│       ├── package.json           # Frontend dependencies
│       └── vercel.json            # Vercel deployment config
│
├── 🧠 ML Service (Python/Flask)
│   └── ml-service/
│       ├── app.py                 # Flask application
│       ├── requirements.txt       # Python dependencies
│       ├── render.yaml            # Render deployment
│       │
│       ├── services/              # ML services
│       │   ├── recommendations.py # Recommendation engine
│       │   ├── forecasting.py     # Demand forecasting
│       │   └── sentiment.py       # Sentiment analysis
│       │
│       └── models/                # Trained ML models
│           ├── recommendation_model.pkl
│           └── forecasting_models.pkl
│
├── 📝 Documentation
│   ├── README.md                  # This file
│   ├── DEPLOYMENT.md              # Deployment guide
│   ├── DEPLOYMENT-CHECKLIST.md    # Pre-deployment checklist
│   ├── COMPLETE_ENV_GUIDE.md      # Environment variables guide
│   ├── ML_SERVICE_DEPLOYMENT.md   # ML service setup
│   └── ML_DEPLOY_QUICKSTART.md    # Quick ML setup
│
└── 🔧 Configuration
    ├── .env.example               # Environment variables template
    ├── .gitignore                # Git ignore rules
    ├── render.yaml               # Backend deployment config
    └── pnpm-lock.yaml            # Dependency lock file
```

---

## 🚀 Quick Start

### **Prerequisites**

Before you begin, ensure you have the following installed:

- ✅ **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- ✅ **pnpm** - Install via `npm install -g pnpm`
- ✅ **MongoDB Atlas** account - [Sign up](https://www.mongodb.com/cloud/atlas)
- ✅ **Cloudinary** account - [Sign up](https://cloudinary.com/)
- ✅ **Python 3.8+** (optional, for ML features) - [Download](https://www.python.org/)
- ✅ **Git** - [Download](https://git-scm.com/)

### **1️⃣ Clone the Repository**

```bash
git clone https://github.com/cooper235/Canteen_project.git
cd Canteen_project
```

### **2️⃣ Install Backend Dependencies**

```bash
# Install backend packages
pnpm install
```

### **3️⃣ Install Frontend Dependencies**

```bash
# Navigate to frontend directory
cd models/canteen-frontend

# Install frontend packages
pnpm install

# Return to root
cd ../..
```

### **4️⃣ Environment Configuration**

#### **Backend Environment (.env in root)**

> ⚠️ **SECURITY WARNING**: The values below are **EXAMPLES ONLY**. Replace ALL placeholder values with your actual credentials. Never commit your `.env` file to Git!

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - REPLACE WITH YOUR ACTUAL MONGODB URI
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE_NAME

# JWT Authentication - REPLACE WITH A STRONG RANDOM SECRET
JWT_SECRET=REPLACE_THIS_WITH_A_STRONG_RANDOM_SECRET_KEY_AT_LEAST_32_CHARACTERS
JWT_EXPIRE=7d

# Cloudinary (for image uploads) - REPLACE WITH YOUR CLOUDINARY CREDENTIALS
CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# ML Service URL (optional)
ML_SERVICE_URL=http://localhost:5001

# Request Limits
JSON_LIMIT=10mb
URLENCODE_LIMIT=10mb
```

> 📘 **Tip**: See [COMPLETE_ENV_GUIDE.md](./COMPLETE_ENV_GUIDE.md) for detailed environment variable documentation.
> 
> 🔒 **Security Best Practice**: Generate a strong JWT secret using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

#### **Frontend Environment (.env.local in models/canteen-frontend/)**

Create a `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Socket.IO URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### **5️⃣ Database Setup**

```bash
# Seed initial canteen data (optional)
node scripts/seedCanteens.js

# Populate with dummy data for testing (optional)
node scripts/populate-dummy-data.js
```

### **6️⃣ Start Development Servers**

#### **Option A: Start Backend Only**

```bash
# From root directory
node server.js
```

Backend will run on **http://localhost:5000**

#### **Option B: Start Frontend Only**

```bash
# From root directory
cd models/canteen-frontend
pnpm dev
```

Frontend will run on **http://localhost:3000**

#### **Option C: Start Both (Recommended)**

```bash
# Terminal 1 - Backend
node server.js

# Terminal 2 - Frontend
cd models/canteen-frontend && pnpm dev
```

#### **Option D: Start with ML Service**

```bash
# Terminal 1 - Backend
node server.js

# Terminal 2 - Frontend
cd models/canteen-frontend && pnpm dev

# Terminal 3 - ML Service
cd ml-service
pip install -r requirements.txt
python app.py
```

ML Service will run on **http://localhost:5001**

### **7️⃣ Access the Application**

- 🌐 **Frontend**: [http://localhost:3000](http://localhost:3000)
- 🔧 **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- 🧠 **ML Service**: [http://localhost:5001](http://localhost:5001) (if running)
- 📊 **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### **8️⃣ Default Credentials (After Seeding)**

Create your first user via the registration page, or seed the database with test accounts.

---

## 📚 API Documentation

### **Base URL**
- **Local**: `http://localhost:5000/api`
- **Production**: `https://your-backend-url.com/api`

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| GET | `/auth/me` | Get current user | ✅ |
| PUT | `/auth/update-profile` | Update user profile | ✅ |
| PUT | `/auth/change-password` | Change password | ✅ |

### **Canteen Endpoints**

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/canteens` | List all canteens | ❌ | All |
| GET | `/canteens/:id` | Get canteen details | ❌ | All |
| POST | `/canteens` | Create new canteen | ✅ | Owner/Admin |
| PUT | `/canteens/:id` | Update canteen | ✅ | Owner/Admin |
| DELETE | `/canteens/:id` | Delete canteen | ✅ | Admin |
| GET | `/canteens/:id/menu` | Get canteen menu | ❌ | All |

### **Dish Endpoints**

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/dishes` | List dishes (with filters) | ❌ | All |
| GET | `/dishes/:id` | Get dish details | ❌ | All |
| POST | `/dishes` | Create new dish | ✅ | Owner |
| PUT | `/dishes/:id` | Update dish | ✅ | Owner |
| DELETE | `/dishes/:id` | Delete dish | ✅ | Owner |
| PATCH | `/dishes/:id/availability` | Update availability | ✅ | Owner |

### **Order Endpoints**

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/orders` | Place new order | ✅ | Student |
| GET | `/orders` | Get user orders | ✅ | All |
| GET | `/orders/:id` | Get order details | ✅ | All |
| PUT | `/orders/:id/status` | Update order status | ✅ | Owner |
| DELETE | `/orders/:id` | Cancel order | ✅ | Student |
| GET | `/orders/canteen/:id` | Get canteen orders | ✅ | Owner |

### **Review Endpoints**

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/reviews` | Create review | ✅ | Student |
| GET | `/reviews/dish/:id` | Get dish reviews | ❌ | All |
| GET | `/reviews/canteen/:id` | Get canteen reviews | ❌ | All |
| PUT | `/reviews/:id` | Update review | ✅ | Student |
| DELETE | `/reviews/:id` | Delete review | ✅ | Student/Admin |

### **Analytics Endpoints**

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/analytics/revenue` | Get revenue analytics | ✅ | Owner/Admin |
| GET | `/analytics/orders` | Get order statistics | ✅ | Owner/Admin |
| GET | `/analytics/popular-dishes` | Get popular dishes | ✅ | Owner/Admin |
| GET | `/analytics/peak-hours` | Get peak hours data | ✅ | Owner/Admin |
| GET | `/analytics/dashboard` | Get dashboard summary | ✅ | Owner/Admin |

### **ML Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/ml/recommendations/:userId` | Get personalized recommendations | ✅ |
| POST | `/ml/forecast` | Forecast demand | ✅ |
| POST | `/ml/sentiment` | Analyze sentiment | ✅ |
| POST | `/ml/train-recommendations` | Train recommendation model | ✅ |

### **Example API Requests**

#### **Register User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
  }'
```

#### **Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### **Get All Canteens**
```bash
curl http://localhost:5000/api/canteens
```

#### **Place Order (requires JWT token)**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "canteenId": "canteen_id",
    "items": [
      {
        "dishId": "dish_id",
        "quantity": 2
      }
    ],
    "notes": "Extra spicy please"
  }'
```

---

## 🌐 Deployment Guide

For detailed deployment instructions, refer to our comprehensive guides:

- 📖 **[Deployment Guide](./DEPLOYMENT.md)** - Complete deployment walkthrough
- ✅ **[Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)** - Pre-deployment verification
- 🧠 **[ML Service Deployment](./ML_SERVICE_DEPLOYMENT.md)** - ML service setup

### **Quick Deployment Overview**

#### **Backend → Render.com**

1. Create account on [Render.com](https://render.com/)
2. Create new Web Service from GitHub repository
3. Configure build settings:
   - **Build Command**: `pnpm install`
   - **Start Command**: `node server.js`
4. Add environment variables from `.env`
5. Deploy!

#### **Frontend → Vercel**

1. Create account on [Vercel](https://vercel.com/)
2. Import GitHub repository
3. Set root directory to `models/canteen-frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SOCKET_URL`
5. Deploy!

#### **Database → MongoDB Atlas**

1. Create free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist IP addresses (use `0.0.0.0/0` for all IPs)
3. Create database user
4. Get connection string
5. Add to `MONGODB_URI` environment variable

#### **ML Service → Render.com**

1. Create new Web Service
2. Root directory: `ml-service`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `python app.py`
5. Add `ML_SERVICE_URL` to backend environment

---

## 🧪 Testing

### **Backend API Testing**

```bash
# Health check
curl http://localhost:5000/api/health

# Run test script
.\test-apis.ps1

# Test backend
.\test-backend.ps1
```

### **Frontend Testing**

```bash
# Run frontend tests
cd models/canteen-frontend
pnpm test

# Build test
pnpm build
```

### **ML Service Testing**

```bash
# Test ML endpoints
.\test-ml.ps1

# Quick ML test
.\test-ml-quick.ps1

# Complete ML feature test
.\test-ml-complete.ps1
```

### **Integration Testing**

```bash
# Run integration tests
.\test-integration.sh
```

---

## 🔒 Security Features

- 🔐 **JWT Authentication** - Secure token-based auth
- 🛡️ **Helmet.js** - Security headers
- 🚦 **Rate Limiting** - Prevent API abuse
- 🔑 **Password Hashing** - Bcryptjs encryption
- ✅ **Input Validation** - Joi schema validation
- 🌐 **CORS Protection** - Configured origins
- 🔒 **Environment Variables** - Sensitive data protection
- 📝 **Request Logging** - Morgan HTTP logs
- 🚫 **SQL Injection Prevention** - MongoDB NoSQL
- 🔐 **XSS Protection** - Helmet middleware

---

## 🎯 User Roles & Permissions

### **Student**
- ✅ Browse canteens and menus
- ✅ Place and track orders
- ✅ Write reviews and ratings
- ✅ View order history
- ✅ Get personalized recommendations
- ✅ Chat with AI assistant

### **Canteen Owner**
- ✅ All student permissions
- ✅ Create and manage canteen
- ✅ Add/update/delete dishes
- ✅ Manage orders and update status
- ✅ View analytics and reports
- ✅ Create announcements
- ✅ View customer feedback
- ✅ Access forecasting tools

### **Admin**
- ✅ All owner permissions
- ✅ Manage all canteens
- ✅ Moderate reviews
- ✅ View system-wide analytics
- ✅ Manage users
- ✅ Access all features

---

## 📊 Database Schema

### **User Model**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['student', 'owner', 'admin'],
  profilePicture: String,
  phone: String,
  preferences: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### **Canteen Model**
```javascript
{
  name: String,
  description: String,
  owner: ObjectId (ref: User),
  location: String,
  images: [String],
  timings: Object,
  contactInfo: Object,
  isActive: Boolean,
  rating: Number,
  createdAt: Date
}
```

### **Dish Model**
```javascript
{
  name: String,
  description: String,
  canteen: ObjectId (ref: Canteen),
  category: String,
  price: Number,
  image: String,
  availability: Enum ['available', 'out_of_stock', 'coming_soon'],
  nutritionalInfo: Object,
  tags: [String],
  rating: Number,
  createdAt: Date
}
```

### **Order Model**
```javascript
{
  user: ObjectId (ref: User),
  canteen: ObjectId (ref: Canteen),
  items: [{
    dish: ObjectId (ref: Dish),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: Enum ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
  notes: String,
  orderNumber: String,
  createdAt: Date
}
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### **1. Fork the Repository**
```bash
# Click the Fork button on GitHub
```

### **2. Create a Feature Branch**
```bash
git checkout -b feature/YourAmazingFeature
```

### **3. Make Your Changes**
- Write clean, commented code
- Follow existing code style
- Test your changes thoroughly

### **4. Commit Your Changes**
```bash
git add .
git commit -m "Add: Your descriptive commit message"
```

### **5. Push to Your Fork**
```bash
git push origin feature/YourAmazingFeature
```

### **6. Open a Pull Request**
- Go to the original repository
- Click "New Pull Request"
- Describe your changes in detail

### **Contribution Guidelines**
- ✅ Follow the existing code style
- ✅ Write meaningful commit messages
- ✅ Add comments for complex logic
- ✅ Test before submitting
- ✅ Update documentation if needed
- ✅ One feature per pull request

---

## 🐛 Known Issues & Roadmap

### **Current Limitations**
- ML features require Python service (can be deployed separately)
- Real-time notifications need Socket.IO connection
- Image uploads limited by Cloudinary free tier

### **Future Enhancements**
- 📱 Native mobile apps (iOS/Android)
- 💳 Payment gateway integration (Stripe/Razorpay)
- 🗺️ Location-based canteen suggestions
- 🎫 Digital coupons and loyalty program
- 📧 Email notifications
- 🌍 Multi-language support
- 🎨 Theme customization
- 📱 Progressive Web App (PWA) features
- 🔔 Push notifications
- 📊 Advanced reporting with PDF export

---

## 📞 Support & Community

### **Getting Help**

- 📖 **Documentation**: Read our [guides](./DEPLOYMENT.md)
- 🐛 **Bug Reports**: [Open an issue](https://github.com/cooper235/Canteen_project/issues)
- 💡 **Feature Requests**: [Create a discussion](https://github.com/cooper235/Canteen_project/discussions)
- 📧 **Email**: Reach out to the maintainers

### **Troubleshooting**

#### **Backend won't start**
- Check MongoDB connection string
- Verify all environment variables are set
- Check if port 5000 is available

#### **Frontend can't connect to backend**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration
- Ensure backend is running

#### **Socket.IO not working**
- Check `NEXT_PUBLIC_SOCKET_URL`
- Verify WebSocket connections aren't blocked
- Check browser console for errors

---

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Cooper235

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👥 Authors & Acknowledgments

### **Project Team**
- **Cooper235** - *Lead Developer* - [GitHub](https://github.com/cooper235)

### **Built With**
- ❤️ Passion for solving real-world problems
- ☕ Lots of coffee and late nights
- 🎓 Dedication to improving campus life

### **Special Thanks**
- MongoDB for excellent documentation
- Next.js team for the amazing framework
- Open source community for inspiration

---

## 📈 Project Stats

![GitHub Stars](https://img.shields.io/github/stars/cooper235/Canteen_project?style=social)
![GitHub Forks](https://img.shields.io/github/forks/cooper235/Canteen_project?style=social)
![GitHub Issues](https://img.shields.io/github/issues/cooper235/Canteen_project)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/cooper235/Canteen_project)

---

## 🌟 Show Your Support

If you find this project helpful, please consider:

- ⭐ **Star this repository** on GitHub
- 🐛 **Report bugs** to help improve the project
- 💡 **Suggest features** for future development
- 🤝 **Contribute** to make it even better
- 📢 **Share** with your friends and colleagues

---

<div align="center">

### **Made with ❤️ for the campus community**

**[⬆ Back to Top](#-smart-canteen-management-system)**

</div>
