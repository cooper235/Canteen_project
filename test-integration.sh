# Test Backend-Frontend Integration

echo "Testing backend-frontend integration..."

# 1. Start backend server
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# 2. Start frontend server
echo "Starting frontend server..."
cd models/canteen-frontend
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

# 3. Test backend health endpoint
echo "Testing backend health endpoint..."
curl http://localhost:5000/api/health

# 4. Test frontend can reach backend
echo "Testing frontend-backend communication..."
curl -H "Accept: application/json" http://localhost:3000/api/auth/check

# Cleanup
kill $BACKEND_PID
kill $FRONTEND_PID

echo "Integration test complete!"