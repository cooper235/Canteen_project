'use client';

import { useEffect, useState } from 'react';
import { mlApi } from '@/lib/mlApi';

interface Prediction {
  date: string;
  predicted_quantity: number;
  confidence_interval: [number, number];
}

interface Insights {
  trend: string;
  peak_day: string;
  average_daily: number;
  total_forecast: number;
  historical_average?: number;
  note?: string;
}

interface ForecastData {
  predictions: Prediction[];
  insights: Insights;
}

interface Dish {
  _id: string;
  name: string;
  category: string;
}

export default function ForecastingDashboard({ canteenId }: { canteenId: string }) {
  const [selectedDish, setSelectedDish] = useState<string>('');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);

  // Fetch dishes for the canteen
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await fetch(`/api/dishes?canteen=${canteenId}`);
        const data = await response.json();
        if (data.success) {
          setDishes(data.data);
          if (data.data.length > 0) {
            setSelectedDish(data.data[0]._id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dishes:', error);
      }
    };
    fetchDishes();
  }, [canteenId]);

  // Fetch forecast data
  useEffect(() => {
    if (!selectedDish) return;

    const fetchForecast = async () => {
      setLoading(true);
      try {
        const data = await mlApi.forecastDishDemand(selectedDish, { days });
        setForecastData(data);
      } catch (error) {
        console.error('Failed to fetch forecast:', error);
        setForecastData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [selectedDish, days]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '📈';
      case 'decreasing':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '❓';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      case 'stable':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📊 Demand Forecasting</h2>
          <p className="text-sm text-gray-600 mt-1">AI-powered demand predictions</p>
        </div>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
          ML Powered
        </span>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Dish
          </label>
          <select
            value={selectedDish}
            onChange={(e) => setSelectedDish(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {dishes.map((dish) => (
              <option key={dish._id} value={dish._id}>
                {dish.name} ({dish.category})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Forecast Period
          </label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : forecastData ? (
        <>
          {/* Insights Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
              <div className="text-sm text-gray-600 mb-1">Trend</div>
              <div className={`text-2xl font-bold ${getTrendColor(forecastData.insights.trend)}`}>
                {getTrendIcon(forecastData.insights.trend)} {forecastData.insights.trend}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">Peak Day</div>
              <div className="text-2xl font-bold text-blue-600">
                {forecastData.insights.peak_day}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
              <div className="text-sm text-gray-600 mb-1">Avg Daily</div>
              <div className="text-2xl font-bold text-green-600">
                {forecastData.insights.average_daily}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-100">
              <div className="text-sm text-gray-600 mb-1">Total Forecast</div>
              <div className="text-2xl font-bold text-orange-600">
                {forecastData.insights.total_forecast}
              </div>
            </div>
          </div>

          {/* Historical Average */}
          {forecastData.insights.historical_average && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Historical Average (Past Data)</span>
                <span className="text-lg font-semibold text-gray-800">
                  {forecastData.insights.historical_average} units/day
                </span>
              </div>
            </div>
          )}

          {/* Note if present */}
          {forecastData.insights.note && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span className="text-sm text-yellow-800">{forecastData.insights.note}</span>
              </div>
            </div>
          )}

          {/* Predictions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predicted Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence Range
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forecastData.predictions.map((pred, index) => {
                  const date = new Date(pred.date);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const isPeakDay = dayName === forecastData.insights.peak_day.substring(0, 3);

                  return (
                    <tr key={index} className={isPeakDay ? 'bg-purple-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        {dayName}
                        {isPeakDay && <span className="ml-2 text-purple-600">🔥</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="font-bold text-purple-600">{pred.predicted_quantity}</span> units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {pred.confidence_interval[0]} - {pred.confidence_interval[1]} units
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Chart visualization (simple bar chart) */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Visual Forecast</h3>
            <div className="flex items-end justify-between h-48 gap-2">
              {forecastData.predictions.map((pred, index) => {
                const maxValue = Math.max(...forecastData.predictions.map(p => p.predicted_quantity));
                const height = (pred.predicted_quantity / maxValue) * 100;
                const date = new Date(pred.date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t hover:from-purple-600 hover:to-purple-400 transition-all cursor-pointer relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {pred.predicted_quantity} units
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2 text-center">
                      {dayName}
                      <br />
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No forecast data available. Please select a dish with sufficient historical data.</p>
        </div>
      )}
    </div>
  );
}
