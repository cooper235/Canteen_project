from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Import ML modules
from services.recommendations import RecommendationService
from services.forecasting import ForecastingService
from services.sentiment import SentimentService

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5000"])  # Allow backend to call ML service

# Initialize services
recommendation_service = RecommendationService()
forecasting_service = ForecastingService()
sentiment_service = SentimentService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "ml-service"}), 200

# ============= RECOMMENDATION ENDPOINTS =============

@app.route('/api/recommendations/user/<user_id>', methods=['GET'])
def get_user_recommendations(user_id):
    """Get personalized dish recommendations for a user"""
    try:
        limit = request.args.get('limit', 10, type=int)
        canteen_id = request.args.get('canteen_id')
        
        recommendations = recommendation_service.get_recommendations(
            user_id=user_id,
            limit=limit,
            canteen_id=canteen_id
        )
        
        return jsonify({
            "success": True,
            "recommendations": recommendations
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/recommendations/train', methods=['POST'])
def train_recommendation_model():
    """Train/retrain the recommendation model"""
    try:
        data = request.json
        orders_data = data.get('orders', [])
        
        result = recommendation_service.train_model(orders_data)
        
        return jsonify({
            "success": True,
            "message": "Model trained successfully",
            "metrics": result
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============= FORECASTING ENDPOINTS =============

@app.route('/api/forecast/demand', methods=['POST'])
def forecast_demand():
    """Forecast dish demand for upcoming days"""
    try:
        data = request.json
        canteen_id = data.get('canteen_id')
        dish_id = data.get('dish_id')
        days_ahead = data.get('days_ahead', 7)
        historical_data = data.get('historical_data', [])
        
        forecast = forecasting_service.predict_demand(
            canteen_id=canteen_id,
            dish_id=dish_id,
            days_ahead=days_ahead,
            historical_data=historical_data
        )
        
        return jsonify({
            "success": True,
            "forecast": forecast
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/forecast/train', methods=['POST'])
def train_forecast_model():
    """Train/retrain the forecasting model"""
    try:
        data = request.json
        canteen_id = data.get('canteen_id')
        historical_data = data.get('historical_data', [])
        
        result = forecasting_service.train_model(canteen_id, historical_data)
        
        return jsonify({
            "success": True,
            "message": "Forecasting model trained successfully",
            "metrics": result
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============= SENTIMENT ANALYSIS ENDPOINTS =============

@app.route('/api/sentiment/analyze', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment of review text"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"success": False, "error": "Text is required"}), 400
        
        result = sentiment_service.analyze(text)
        
        return jsonify({
            "success": True,
            "sentiment": result
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/sentiment/batch', methods=['POST'])
def analyze_sentiment_batch():
    """Analyze sentiment for multiple reviews"""
    try:
        data = request.json
        reviews = data.get('reviews', [])
        
        if not reviews:
            return jsonify({"success": False, "error": "Reviews array is required"}), 400
        
        results = sentiment_service.analyze_batch(reviews)
        
        return jsonify({
            "success": True,
            "results": results
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/sentiment/insights/<canteen_id>', methods=['GET'])
def get_sentiment_insights(canteen_id):
    """Get sentiment insights for a canteen"""
    try:
        insights = sentiment_service.get_insights(canteen_id)
        
        return jsonify({
            "success": True,
            "insights": insights
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('ML_SERVICE_PORT', 5001))
    debug = False  # Disable debug mode to avoid reload issues
    app.run(host='0.0.0.0', port=port, debug=debug, use_reloader=False)

