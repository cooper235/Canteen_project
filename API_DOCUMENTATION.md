# College Canteen Management Backend - Complete API Documentation

## Base URL
\`\`\`
http://localhost:5000/api
\`\`\`

## Authentication
Most endpoints require JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

---

## 1. AUTHENTICATION ENDPOINTS
**Base Path:** `/api/auth`

### Register User
- **Method:** `POST`
- **Endpoint:** `/register`
- **Auth Required:** No
- **Body:**
\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" // or "canteen_owner", "admin"
}
\`\`\`
- **Response:** User object with JWT token

### Login
- **Method:** `POST`
- **Endpoint:** `/login`
- **Auth Required:** No
- **Body:**
\`\`\`json
{
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`
- **Response:** User object with JWT token

### Get Current User
- **Method:** `GET`
- **Endpoint:** `/me`
- **Auth Required:** Yes
- **Response:** Current user details

### Logout
- **Method:** `POST`
- **Endpoint:** `/logout`
- **Auth Required:** Yes
- **Response:** Success message

---

## 2. USER MANAGEMENT ENDPOINTS
**Base Path:** `/api/users`

### Get User by ID
- **Method:** `GET`
- **Endpoint:** `/:id`
- **Auth Required:** No
- **Params:** `id` (user ID)
- **Response:** User profile

### Get All Users (Admin Only)
- **Method:** `GET`
- **Endpoint:** `/`
- **Auth Required:** Yes (Admin)
- **Response:** Array of all users

### Update User Profile
- **Method:** `PUT`
- **Endpoint:** `/profile/update`
- **Auth Required:** Yes
- **Body:**
\`\`\`json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "phone": "9876543210",
  "preferences": { "notifications": true }
}
\`\`\`
- **Response:** Updated user object

### Upload Profile Image
- **Method:** `POST`
- **Endpoint:** `/profile/upload-image`
- **Auth Required:** Yes
- **Body:** FormData with `image` file
- **Response:** User object with image URL

### Add Favorite Canteen
- **Method:** `POST`
- **Endpoint:** `/favorites/add`
- **Auth Required:** Yes
- **Body:**
\`\`\`json
{
  "canteenId": "canteen_id_here"
}
\`\`\`
- **Response:** Updated user favorites

### Remove Favorite Canteen
- **Method:** `POST`
- **Endpoint:** `/favorites/remove`
- **Auth Required:** Yes
- **Body:**
\`\`\`json
{
  "canteenId": "canteen_id_here"
}
\`\`\`
- **Response:** Updated user favorites

### Get Favorite Canteens
- **Method:** `GET`
- **Endpoint:** `/favorites/list`
- **Auth Required:** Yes
- **Response:** Array of favorite canteens

### Deactivate Account
- **Method:** `POST`
- **Endpoint:** `/deactivate`
- **Auth Required:** Yes
- **Response:** Success message

### Delete User (Admin Only)
- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Auth Required:** Yes (Admin)
- **Params:** `id` (user ID)
- **Response:** Success message

---

## 3. CANTEEN MANAGEMENT ENDPOINTS
**Base Path:** `/api/canteens`

### Get All Canteens
- **Method:** `GET`
- **Endpoint:** `/`
- **Auth Required:** No
- **Query Params:** `page`, `limit`, `search`, `verified`
- **Response:** Array of canteens with pagination

### Get Canteen by ID
- **Method:** `GET`
- **Endpoint:** `/:id`
- **Auth Required:** No
- **Params:** `id` (canteen ID)
- **Response:** Canteen details

### Create Canteen
- **Method:** `POST`
- **Endpoint:** `/`
- **Auth Required:** Yes (Canteen Owner/Admin)
- **Body:**
\`\`\`json
{
  "name": "Main Canteen",
  "description": "Best canteen on campus",
  "location": "Building A, Ground Floor",
  "phone": "9876543210",
  "operatingHours": {
    "open": "08:00",
    "close": "18:00"
  }
}
\`\`\`
- **Response:** Created canteen object

### Update Canteen
- **Method:** `PUT`
- **Endpoint:** `/:id`
- **Auth Required:** Yes
- **Params:** `id` (canteen ID)
- **Body:** Same as create (partial update allowed)
- **Response:** Updated canteen object

### Upload Canteen Image
- **Method:** `POST`
- **Endpoint:** `/:id/upload-image`
- **Auth Required:** Yes
- **Params:** `id` (canteen ID)
- **Body:** FormData with `image` file
- **Response:** Canteen object with image URL

### Delete Canteen
- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Auth Required:** Yes
- **Params:** `id` (canteen ID)
- **Response:** Success message

### Get My Canteens (Owner)
- **Method:** `GET`
- **Endpoint:** `/owner/my-canteens`
- **Auth Required:** Yes
- **Response:** Array of canteens owned by user

### Verify Canteen (Admin Only)
- **Method:** `POST`
- **Endpoint:** `/:id/verify`
- **Auth Required:** Yes (Admin)
- **Params:** `id` (canteen ID)
- **Body:**
\`\`\`json
{
  "verified": true
}
\`\`\`
- **Response:** Updated canteen object

---

## 4. DISH MANAGEMENT ENDPOINTS
**Base Path:** `/api/dishes`

### Get All Dishes
- **Method:** `GET`
- **Endpoint:** `/`
- **Auth Required:** No
- **Query Params:** `page`, `limit`, `search`, `category`, `minPrice`, `maxPrice`
- **Response:** Array of dishes with pagination

### Get Dish by ID
- **Method:** `GET`
- **Endpoint:** `/:id`
- **Auth Required:** No
- **Params:** `id` (dish ID)
- **Response:** Dish details

### Get Dishes by Canteen
- **Method:** `GET`
- **Endpoint:** `/canteen/:canteenId`
- **Auth Required:** No
- **Params:** `canteenId` (canteen ID)
- **Query Params:** `page`, `limit`, `category`
- **Response:** Array of dishes for that canteen

### Create Dish
- **Method:** `POST`
- **Endpoint:** `/canteen/:canteenId`
- **Auth Required:** Yes (Canteen Owner/Admin)
- **Params:** `canteenId` (canteen ID)
- **Body:**
\`\`\`json
{
  "name": "Biryani",
  "description": "Delicious chicken biryani",
  "category": "Main Course",
  "price": 150,
  "ingredients": ["rice", "chicken", "spices"],
  "available": true,
  "preparationTime": 20
}
\`\`\`
- **Response:** Created dish object

### Update Dish
- **Method:** `PUT`
- **Endpoint:** `/:id`
- **Auth Required:** Yes
- **Params:** `id` (dish ID)
- **Body:** Same as create (partial update allowed)
- **Response:** Updated dish object

### Upload Dish Image
- **Method:** `POST`
- **Endpoint:** `/:id/upload-image`
- **Auth Required:** Yes
- **Params:** `id` (dish ID)
- **Body:** FormData with `image` file
- **Response:** Dish object with image URL

### Update Dish Availability
- **Method:** `PATCH`
- **Endpoint:** `/:id/availability`
- **Auth Required:** Yes
- **Params:** `id` (dish ID)
- **Body:**
\`\`\`json
{
  "available": true
}
\`\`\`
- **Response:** Updated dish object

### Delete Dish
- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Auth Required:** Yes
- **Params:** `id` (dish ID)
- **Response:** Success message

---

## 5. ORDER MANAGEMENT ENDPOINTS
**Base Path:** `/api/orders`

### Create Order
- **Method:** `POST`
- **Endpoint:** `/`
- **Auth Required:** Yes
- **Body:**
\`\`\`json
{
  "canteenId": "canteen_id",
  "items": [
    {
      "dishId": "dish_id",
      "quantity": 2,
      "specialInstructions": "No onions"
    }
  ],
  "totalAmount": 300,
  "deliveryAddress": "Room 101, Hostel A"
}
\`\`\`
- **Response:** Created order object

### Get My Orders
- **Method:** `GET`
- **Endpoint:** `/my-orders`
- **Auth Required:** Yes
- **Query Params:** `page`, `limit`, `status`
- **Response:** Array of user's orders

### Get Order by ID
- **Method:** `GET`
- **Endpoint:** `/:id`
- **Auth Required:** Yes
- **Params:** `id` (order ID)
- **Response:** Order details

### Update Order Status
- **Method:** `PATCH`
- **Endpoint:** `/:id/status`
- **Auth Required:** Yes
- **Params:** `id` (order ID)
- **Body:**
\`\`\`json
{
  "status": "preparing" // pending, preparing, ready, delivered, cancelled
}
\`\`\`
- **Response:** Updated order object

### Update Payment Status
- **Method:** `PATCH`
- **Endpoint:** `/:id/payment-status`
- **Auth Required:** Yes
- **Params:** `id` (order ID)
- **Body:**
\`\`\`json
{
  "paymentStatus": "completed" // pending, completed, failed
}
\`\`\`
- **Response:** Updated order object

### Cancel Order
- **Method:** `POST`
- **Endpoint:** `/:id/cancel`
- **Auth Required:** Yes
- **Params:** `id` (order ID)
- **Response:** Cancelled order object

### Rate Order
- **Method:** `POST`
- **Endpoint:** `/:id/rate`
- **Auth Required:** Yes
- **Params:** `id` (order ID)
- **Body:**
\`\`\`json
{
  "rating": 4,
  "comment": "Great food and fast delivery"
}
\`\`\`
- **Response:** Updated order object

### Get Canteen Orders
- **Method:** `GET`
- **Endpoint:** `/canteen/:canteenId`
- **Auth Required:** Yes
- **Params:** `canteenId` (canteen ID)
- **Query Params:** `page`, `limit`, `status`
- **Response:** Array of orders for that canteen

### Get All Orders (Admin Only)
- **Method:** `GET`
- **Endpoint:** `/`
- **Auth Required:** Yes (Admin)
- **Query Params:** `page`, `limit`, `status`
- **Response:** Array of all orders

---

## 6. REVIEW & RATING ENDPOINTS
**Base Path:** `/api/reviews`

### Create Review
- **Method:** `POST`
- **Endpoint:** `/`
- **Auth Required:** Yes
- **Body:**
\`\`\`json
{
  "canteenId": "canteen_id", // or dishId
  "dishId": "dish_id",
  "rating": 4,
  "comment": "Great food quality",
  "tags": ["tasty", "fresh"]
}
\`\`\`
- **Response:** Created review object

### Get Canteen Reviews
- **Method:** `GET`
- **Endpoint:** `/canteen/:canteenId`
- **Auth Required:** No
- **Params:** `canteenId` (canteen ID)
- **Query Params:** `page`, `limit`, `sortBy`
- **Response:** Array of canteen reviews

### Get Dish Reviews
- **Method:** `GET`
- **Endpoint:** `/dish/:dishId`
- **Auth Required:** No
- **Params:** `dishId` (dish ID)
- **Query Params:** `page`, `limit`, `sortBy`
- **Response:** Array of dish reviews

### Get My Reviews
- **Method:** `GET`
- **Endpoint:** `/my-reviews`
- **Auth Required:** Yes
- **Query Params:** `page`, `limit`
- **Response:** Array of user's reviews

### Mark Review as Helpful
- **Method:** `POST`
- **Endpoint:** `/:id/helpful`
- **Auth Required:** Yes
- **Params:** `id` (review ID)
- **Response:** Updated review object

### Mark Review as Unhelpful
- **Method:** `POST`
- **Endpoint:** `/:id/unhelpful`
- **Auth Required:** Yes
- **Params:** `id` (review ID)
- **Response:** Updated review object

### Approve Review (Admin/Owner)
- **Method:** `POST`
- **Endpoint:** `/:id/approve`
- **Auth Required:** Yes (Admin/Canteen Owner)
- **Params:** `id` (review ID)
- **Response:** Updated review object

### Delete Review
- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Auth Required:** Yes
- **Params:** `id` (review ID)
- **Response:** Success message

---

## 7. ANNOUNCEMENT ENDPOINTS
**Base Path:** `/api/announcements`

### Get All Announcements
- **Method:** `GET`
- **Endpoint:** `/`
- **Auth Required:** No
- **Query Params:** `page`, `limit`, `type`
- **Response:** Array of announcements

### Get Canteen Announcements
- **Method:** `GET`
- **Endpoint:** `/canteen/:canteenId`
- **Auth Required:** No
- **Params:** `canteenId` (canteen ID)
- **Query Params:** `page`, `limit`
- **Response:** Array of canteen announcements

### Create Announcement
- **Method:** `POST`
- **Endpoint:** `/`
- **Auth Required:** Yes (Canteen Owner/Admin)
- **Body:**
\`\`\`json
{
  "canteenId": "canteen_id",
  "title": "Special Offer",
  "description": "50% off on all items",
  "type": "promotion", // promotion, menu_update, event, maintenance
  "startDate": "2024-01-15",
  "endDate": "2024-01-20"
}
\`\`\`
- **Response:** Created announcement object

### Update Announcement
- **Method:** `PUT`
- **Endpoint:** `/:id`
- **Auth Required:** Yes
- **Params:** `id` (announcement ID)
- **Body:** Same as create (partial update allowed)
- **Response:** Updated announcement object

### Delete Announcement
- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Auth Required:** Yes
- **Params:** `id` (announcement ID)
- **Response:** Success message

---

## 8. ANALYTICS ENDPOINTS
**Base Path:** `/api/analytics`

### Get Canteen Analytics
- **Method:** `GET`
- **Endpoint:** `/canteen/:canteenId`
- **Auth Required:** Yes
- **Params:** `canteenId` (canteen ID)
- **Query Params:** `startDate`, `endDate`
- **Response:**
\`\`\`json
{
  "totalOrders": 150,
  "totalRevenue": 45000,
  "averageRating": 4.5,
  "topDishes": [],
  "orderTrends": []
}
\`\`\`

### Get Recommendations
- **Method:** `GET`
- **Endpoint:** `/recommendations`
- **Auth Required:** Yes
- **Query Params:** `limit`
- **Response:** Array of recommended canteens/dishes based on user history

### Get Platform Analytics (Admin Only)
- **Method:** `GET`
- **Endpoint:** `/platform/overview`
- **Auth Required:** Yes (Admin)
- **Query Params:** `startDate`, `endDate`
- **Response:**
\`\`\`json
{
  "totalUsers": 500,
  "totalCanteens": 10,
  "totalOrders": 5000,
  "totalRevenue": 500000,
  "activeUsers": 250,
  "topCanteens": []
}
\`\`\`

---

## 9. HEALTH CHECK
- **Method:** `GET`
- **Endpoint:** `/api/health`
- **Auth Required:** No
- **Response:**
\`\`\`json
{
  "status": "Server is running",
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`

---

## Error Responses

All errors follow this format:
\`\`\`json
{
  "success": false,
  "message": "Error description"
}
\`\`\`

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (Rate Limited)
- `500` - Internal Server Error

---

## Rate Limiting

- **Auth Endpoints:** 5 requests per 15 minutes
- **API Endpoints:** 100 requests per 15 minutes
- **Order Endpoints:** 50 requests per 15 minutes

---

## User Roles & Permissions

### Student
- View canteens and dishes
- Create orders
- Leave reviews
- Manage favorites
- View own orders

### Canteen Owner
- Create and manage canteens
- Add and manage dishes
- View canteen analytics
- Manage orders
- Create announcements
- Approve reviews

### Admin
- All permissions
- Verify canteens
- View platform analytics
- Manage all users
- Manage all content

---
