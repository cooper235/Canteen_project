# Setup & Testing Guide - College Canteen Management Backend

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account
- Postman or similar API testing tool (optional)
# Setup & Testing Guide - College Canteen Management Backend

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account (optional)
- Postman or similar API testing tool (optional)

---

## Step 1: Installation

### 1.1 Clone/Download the Project
```
# Navigate to your project directory
cd canteen-backend
```

### 1.2 Install Dependencies
```
npm install
```

This will install all required packages (express, mongoose, dotenv, etc.).

---

## Step 2: Environment Setup

### 2.1 Create `.env` File
Create a `.env` file in the root directory. You can copy `.env.example` and fill in values.

Example variables you need to set:

```
# Server
PORT=5000
NODE_ENV=development

# MongoDB (replace <username> and <password> with your Atlas DB user)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/canteen_management

# JWT (required)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS - comma separated allowed origins (optional)
ALLOWED_ORIGINS=http://localhost:3000

# Cloudinary (optional, only if you use uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

See `.env.example` for a ready template.

---

## Step 3: Start the Server

### 3.1 Development Mode (with auto-reload)
```
npm run dev
```

### 3.2 Production Mode
```
npm start
```

### Expected Output:
```
MongoDB Connected: <your-cluster-host>
Server running on port 5000
```

### 3.3 Verify Server is Running
Open your browser and go to:
```
http://localhost:5000/api/health
```

You should see a JSON health response.

---

## Step 4: Testing Endpoints

Use Postman, cURL, or Thunder Client. Example requests are similar to those in `API_DOCUMENTATION.md`.

---

## Step 5: Troubleshooting

Common issues:
- MongoDB connection: check `MONGODB_URI` and Atlas IP whitelist
- Cloudinary uploads: check Cloudinary credentials
- JWT issues: check `JWT_SECRET`
- CORS errors: update `ALLOWED_ORIGINS` or allow localhost during development

---

## Next Steps

1. Build the frontend to consume these APIs (there is a `models/canteen-frontend` folder with a Next.js scaffold).
2. Add CI, deployment, and secure secret management for production.
