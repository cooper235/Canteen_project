import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// ==================== RECOMMENDATION METHODS ====================

export const getUserRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, canteenId } = req.query;

    const response = await axios.get(
      `${ML_SERVICE_URL}/api/recommendations/user/${userId}`,
      {
        params: { limit, canteen_id: canteenId },
        timeout: 5000
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error getting user recommendations:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
      message: error.message
    });
  }
};

export const getSimilarDishes = async (req, res) => {
  try {
    const { dishId } = req.params;
    const { limit = 5 } = req.query;

    // Use user recommendations as fallback for similar dishes
    // In a production system, you'd implement content-based filtering
    res.json({
      success: true,
      recommendations: [],
      message: 'Similar dishes feature coming soon'
    });
  } catch (error) {
    console.error('Error getting similar dishes:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get similar dishes'
    });
  }
};

export const getPopularDishes = async (req, res) => {
  try {
    const { limit = 10, canteenId, timeWindow = '7d' } = req.query;

    // Return popular dishes based on order data from DB
    // This should be computed from actual order statistics
    res.json({
      success: true,
      dishes: [],
      message: 'Popular dishes feature coming soon'
    });
  } catch (error) {
    console.error('Error getting popular dishes:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular dishes'
    });
  }
};

// ==================== FORECASTING METHODS ====================

export const forecastDishDemand = async (req, res) => {
  try {
    const { dishId } = req.params;
    const { days = 7, canteenId } = req.query;
    const { historicalData } = req.body;

    const response = await axios.post(
      `${ML_SERVICE_URL}/api/forecast/demand`,
      {
        dish_id: dishId,
        canteen_id: canteenId,
        days_ahead: parseInt(days),
        historical_data: historicalData || []
      },
      { timeout: 10000 }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error forecasting dish demand:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to forecast demand',
      message: error.message
    });
  }
};

export const forecastCanteenDemand = async (req, res) => {
  try {
    const { canteenId } = req.params;
    const { days = 7 } = req.query;
    const { historicalData } = req.body;

    const response = await axios.post(
      `${ML_SERVICE_URL}/api/forecast/demand`,
      {
        canteen_id: canteenId,
        days_ahead: parseInt(days),
        historical_data: historicalData || []
      },
      { timeout: 10000 }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error forecasting canteen demand:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to forecast demand',
      message: error.message
    });
  }
};

// ==================== SENTIMENT ANALYSIS METHODS ====================

export const analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const response = await axios.post(
      `${ML_SERVICE_URL}/api/sentiment/analyze`,
      { text },
      { timeout: 5000 }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error analyzing sentiment:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze sentiment'
    });
  }
};

export const analyzeBatchSentiment = async (req, res) => {
  try {
    const { reviews } = req.body;

    if (!reviews || !Array.isArray(reviews)) {
      return res.status(400).json({
        success: false,
        error: 'Reviews array is required'
      });
    }

    const response = await axios.post(
      `${ML_SERVICE_URL}/api/sentiment/batch`,
      { reviews },
      { timeout: 10000 }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error analyzing batch sentiment:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze sentiment'
    });
  }
};

export const getDishSentimentSummary = async (req, res) => {
  try {
    const { dishId } = req.params;

    // Get reviews for this dish from DB and analyze them
    res.json({
      success: true,
      sentiment: 'neutral',
      message: 'Dish sentiment feature coming soon - analyze reviews in batch'
    });
  } catch (error) {
    console.error('Error getting dish sentiment summary:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get sentiment summary'
    });
  }
};

export const getCanteenSentimentSummary = async (req, res) => {
  try {
    const { canteenId } = req.params;
    const { timeWindow = '30d' } = req.query;

    const response = await axios.get(
      `${ML_SERVICE_URL}/api/sentiment/insights/${canteenId}`,
      {
        params: { time_window: timeWindow },
        timeout: 5000
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error getting canteen sentiment summary:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get sentiment summary',
      message: error.message
    });
  }
};

// ==================== TRAINING METHODS (Admin only) ====================

export const trainRecommendationModel = async (req, res) => {
  try {
    const { orders } = req.body;

    const response = await axios.post(
      `${ML_SERVICE_URL}/api/recommendations/train`,
      { orders },
      { timeout: 30000 }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error training recommendation model:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to train model'
    });
  }
};

export const trainForecastingModel = async (req, res) => {
  try {
    const { historicalData } = req.body;

    const response = await axios.post(
      `${ML_SERVICE_URL}/api/forecast/train`,
      { historical_data: historicalData },
      { timeout: 30000 }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error training forecasting model:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to train model'
    });
  }
};

// ==================== HEALTH CHECK ====================

export const checkMLServiceHealth = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 3000
    });

    res.json(response.data);
  } catch (error) {
    console.error('ML Service health check failed:', error.message);
    res.status(503).json({
      success: false,
      error: 'ML Service unavailable'
    });
  }
};
