# Canteen Management System

A full-stack application for managing university canteens, orders, and menus.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/divyansh-tech-news-projects/v0-canteen-management-backend)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/IpXRWPKkA2G)

## Features

- User authentication and authorization
- Canteen management and menu creation
- Order placement and tracking
- Reviews and ratings system
- Admin dashboard for analytics

## Technology Stack

- Backend: Node.js, Express.js, MongoDB
- Frontend: Next.js 13, TypeScript, Tailwind CSS
- Authentication: JWT, NextAuth.js

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd canteen-management-system
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd models/canteen-frontend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   PORT=3001
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. Run the development servers:
   ```bash
   # Start backend (from root directory)
   npm run dev

   # Start frontend (from models/canteen-frontend)
   npm run dev
   ```

## API Documentation

Your project is live at:

**[https://vercel.com/divyansh-tech-news-projects/v0-canteen-management-backend](https://vercel.com/divyansh-tech-news-projects/v0-canteen-management-backend)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/IpXRWPKkA2G](https://v0.app/chat/projects/IpXRWPKkA2G)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
