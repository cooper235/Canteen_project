import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import pickle
import os

class ForecastingService:
    """
    Demand Forecasting using:
    1. Exponential Smoothing (Holt-Winters)
    2. Moving Average (simple fallback)
    3. Day-of-week patterns
    """
    
    def __init__(self):
        self.models = {}  # {canteen_id: {dish_id: model}}
        self.models_path = 'models/forecasting_models.pkl'
        self.load_models()
    
    def train_model(self, canteen_id, historical_data):
        """
        Train forecasting model for a canteen
        
        historical_data format: [
            {
                "date": "2025-01-01",
                "dish_id": "dish_id",
                "quantity": 25
            }
        ]
        """
        if not historical_data or len(historical_data) < 14:
            return {"message": "Need at least 14 days of data", "data_points": len(historical_data)}
        
        df = pd.DataFrame(historical_data)
        df['date'] = pd.to_datetime(df['date'])
        
        # Group by dish and train individual models
        dish_ids = df['dish_id'].unique()
        canteen_models = {}
        
        for dish_id in dish_ids:
            dish_df = df[df['dish_id'] == dish_id].copy()
            dish_df = dish_df.set_index('date')['quantity']
            
            # Resample to daily frequency, fill missing days with 0
            dish_df = dish_df.resample('D').sum().fillna(0)
            
            if len(dish_df) >= 14:
                try:
                    # Train Holt-Winters model
                    model = ExponentialSmoothing(
                        dish_df,
                        seasonal_periods=7,  # Weekly seasonality
                        trend='add',
                        seasonal='add'
                    ).fit()
                    
                    canteen_models[dish_id] = {
                        'model': model,
                        'historical_data': dish_df,
                        'last_date': dish_df.index[-1]
                    }
                except Exception as e:
                    print(f"Error training model for dish {dish_id}: {e}")
                    # Fallback to simple moving average
                    canteen_models[dish_id] = {
                        'model': None,
                        'historical_data': dish_df,
                        'last_date': dish_df.index[-1]
                    }
        
        self.models[canteen_id] = canteen_models
        self._save_models()
        
        return {
            "canteen_id": canteen_id,
            "dishes_trained": len(canteen_models),
            "data_points": len(df)
        }
    
    def predict_demand(self, canteen_id, dish_id=None, days_ahead=7, historical_data=None):
        """
        Predict demand for upcoming days
        
        Returns: {
            "predictions": [
                {"date": "2025-01-15", "predicted_quantity": 28, "confidence_interval": [22, 34]},
                ...
            ],
            "insights": {
                "trend": "increasing",
                "peak_day": "Friday",
                "average_daily": 25.5
            }
        }
        """
        # If historical data provided, train on-the-fly
        if historical_data and len(historical_data) >= 14:
            self.train_model(canteen_id, historical_data)
        
        # Check if model exists
        if canteen_id not in self.models:
            return self._fallback_prediction(days_ahead)
        
        canteen_models = self.models[canteen_id]
        
        if dish_id:
            # Predict for specific dish
            if dish_id not in canteen_models:
                return self._fallback_prediction(days_ahead)
            
            predictions = self._predict_dish(canteen_models[dish_id], days_ahead)
            return predictions
        else:
            # Predict for all dishes
            all_predictions = {}
            for d_id, model_data in canteen_models.items():
                all_predictions[d_id] = self._predict_dish(model_data, days_ahead)
            return all_predictions
    
    def _predict_dish(self, model_data, days_ahead):
        """Predict demand for a single dish"""
        predictions = []
        
        try:
            if model_data['model'] is not None:
                # Use Holt-Winters model
                forecast = model_data['model'].forecast(steps=days_ahead)
                forecast_values = forecast.values
            else:
                # Use simple moving average
                historical = model_data['historical_data']
                avg = historical[-7:].mean()  # Last week average
                forecast_values = [avg] * days_ahead
            
            # Generate prediction dates
            last_date = model_data['last_date']
            
            for i in range(days_ahead):
                pred_date = last_date + timedelta(days=i+1)
                pred_value = max(0, round(forecast_values[i]))  # Can't be negative
                
                # Simple confidence interval (±20%)
                lower_bound = max(0, int(pred_value * 0.8))
                upper_bound = int(pred_value * 1.2)
                
                predictions.append({
                    "date": pred_date.strftime('%Y-%m-%d'),
                    "predicted_quantity": pred_value,
                    "confidence_interval": [lower_bound, upper_bound]
                })
            
            # Calculate insights
            historical = model_data['historical_data']
            insights = self._calculate_insights(historical, predictions)
            
            return {
                "predictions": predictions,
                "insights": insights
            }
        
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._fallback_prediction(days_ahead)
    
    def _calculate_insights(self, historical, predictions):
        """Calculate insights from historical and predicted data"""
        try:
            # Trend
            recent_avg = historical[-7:].mean()
            older_avg = historical[-14:-7].mean() if len(historical) >= 14 else recent_avg
            
            if recent_avg > older_avg * 1.1:
                trend = "increasing"
            elif recent_avg < older_avg * 0.9:
                trend = "decreasing"
            else:
                trend = "stable"
            
            # Peak day (day of week with highest historical demand)
            day_of_week_avg = historical.groupby(historical.index.dayofweek).mean()
            peak_day_idx = day_of_week_avg.idxmax()
            days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            peak_day = days[peak_day_idx]
            
            # Average daily demand
            pred_values = [p['predicted_quantity'] for p in predictions]
            average_daily = round(np.mean(pred_values), 1)
            
            # Total forecast
            total_forecast = sum(pred_values)
            
            return {
                "trend": trend,
                "peak_day": peak_day,
                "average_daily": average_daily,
                "total_forecast": total_forecast,
                "historical_average": round(historical.mean(), 1)
            }
        
        except Exception as e:
            print(f"Insights calculation error: {e}")
            return {
                "trend": "unknown",
                "peak_day": "unknown",
                "average_daily": 0,
                "total_forecast": 0
            }
    
    def _fallback_prediction(self, days_ahead):
        """Simple fallback when no model is available"""
        predictions = []
        for i in range(days_ahead):
            date = (datetime.now() + timedelta(days=i+1)).strftime('%Y-%m-%d')
            predictions.append({
                "date": date,
                "predicted_quantity": 20,
                "confidence_interval": [15, 25]
            })
        
        return {
            "predictions": predictions,
            "insights": {
                "trend": "unknown",
                "peak_day": "unknown",
                "average_daily": 20,
                "total_forecast": 20 * days_ahead,
                "note": "Using default values - insufficient historical data"
            }
        }
    
    def _save_models(self):
        """Save models to disk"""
        os.makedirs('models', exist_ok=True)
        with open(self.models_path, 'wb') as f:
            pickle.dump(self.models, f)
        print(f"Forecasting models saved to {self.models_path}")
    
    def load_models(self):
        """Load models from disk"""
        if os.path.exists(self.models_path):
            try:
                with open(self.models_path, 'rb') as f:
                    self.models = pickle.load(f)
                print(f"Forecasting models loaded from {self.models_path}")
            except Exception as e:
                print(f"Error loading forecasting models: {e}")
                self.models = {}
