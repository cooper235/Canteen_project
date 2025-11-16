import api from './api';

// ==================== ML API Functions ====================

export const mlApi = {
  // Recommendations
  getUserRecommendations: (userId: string, params?: { limit?: number; canteenId?: string }) =>
    api.get(`/ml/recommendations/user/${userId}`, { params }),
  
  getSimilarDishes: (dishId: string, params?: { limit?: number }) =>
    api.get(`/ml/recommendations/similar/${dishId}`, { params }),
  
  getPopularDishes: (params?: { limit?: number; canteenId?: string; timeWindow?: string }) =>
    api.get('/ml/recommendations/popular', { params }),

  // Forecasting
  forecastDishDemand: (dishId: string, params?: { days?: number }) =>
    api.post(`/ml/forecast/dish/${dishId}`, params || {}),
  
  forecastCanteenDemand: (canteenId: string, params?: { days?: number }) =>
    api.post(`/ml/forecast/canteen/${canteenId}`, params || {}),

  // Sentiment
  analyzeSentiment: (text: string) =>
    api.post('/ml/sentiment/analyze', { text }),
  
  getDishSentiment: (dishId: string) =>
    api.get(`/ml/sentiment/dish/${dishId}`),
  
  getCanteenSentiment: (canteenId: string, params?: { timeWindow?: string }) =>
    api.get(`/ml/sentiment/canteen/${canteenId}`, { params }),

  // Health
  checkMLHealth: () =>
    api.get('/ml/health'),
};
