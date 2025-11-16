import express from 'express';
import {
  getUserRecommendations,
  getSimilarDishes,
  getPopularDishes,
  forecastDishDemand,
  forecastCanteenDemand,
  analyzeSentiment,
  analyzeBatchSentiment,
  getDishSentimentSummary,
  getCanteenSentimentSummary,
  trainRecommendationModel,
  trainForecastingModel,
  checkMLServiceHealth
} from '../controllers/mlController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Health check (public)
router.get('/health', checkMLServiceHealth);

// ==================== RECOMMENDATION ROUTES ====================

// Get personalized recommendations for a user
router.get('/recommendations/user/:userId', protect, getUserRecommendations);

// Get similar dishes
router.get('/recommendations/similar/:dishId', getSimilarDishes);

// Get popular dishes
router.get('/recommendations/popular', getPopularDishes);

// Train recommendation model (admin only)
router.post(
  '/recommendations/train',
  protect,
  authorize('canteen_owner'),
  trainRecommendationModel
);

// ==================== FORECASTING ROUTES ====================

// Forecast demand for a specific dish
router.post(
  '/forecast/dish/:dishId',
  protect,
  authorize('canteen_owner'),
  forecastDishDemand
);

// Forecast demand for entire canteen
router.post(
  '/forecast/canteen/:canteenId',
  protect,
  authorize('canteen_owner'),
  forecastCanteenDemand
);

// Train forecasting model (admin only)
router.post(
  '/forecast/train',
  protect,
  authorize('canteen_owner'),
  trainForecastingModel
);

// ==================== SENTIMENT ANALYSIS ROUTES ====================

// Analyze single text
router.post('/sentiment/analyze', protect, analyzeSentiment);

// Analyze batch of reviews
router.post('/sentiment/batch', protect, analyzeBatchSentiment);

// Get sentiment summary for a dish
router.get('/sentiment/dish/:dishId', getDishSentimentSummary);

// Get sentiment summary for a canteen
router.get(
  '/sentiment/canteen/:canteenId',
  protect,
  authorize('canteen_owner'),
  getCanteenSentimentSummary
);

export default router;
