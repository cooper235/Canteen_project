'use client';

import { useEffect, useState } from 'react';
import { mlApi } from '@/lib/mlApi';
import SentimentBadge from './SentimentBadge';

interface SentimentAnalysisProps {
  dishId?: string;
  canteenId?: string;
  type: 'dish' | 'canteen';
}

interface SentimentData {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  total_reviews: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  common_keywords: string[];
  aspects?: {
    food_quality?: string;
    service?: string;
    value?: string;
  };
}

export default function SentimentAnalysis({ dishId, canteenId, type }: SentimentAnalysisProps) {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentiment = async () => {
      setLoading(true);
      try {
        let data;
        if (type === 'dish' && dishId) {
          data = await mlApi.getDishSentiment(dishId);
        } else if (type === 'canteen' && canteenId) {
          data = await mlApi.getCanteenSentiment(canteenId);
        }
        setSentimentData(data);
      } catch (error) {
        console.error('Failed to fetch sentiment:', error);
        setSentimentData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, [dishId, canteenId, type]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!sentimentData || sentimentData.total_reviews === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">Not enough reviews for sentiment analysis</p>
      </div>
    );
  }

  const positivePercentage = (sentimentData.positive_count / sentimentData.total_reviews) * 100;
  const negativePercentage = (sentimentData.negative_count / sentimentData.total_reviews) * 100;
  const neutralPercentage = (sentimentData.neutral_count / sentimentData.total_reviews) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">💬 Sentiment Analysis</h3>
          <p className="text-sm text-gray-600 mt-1">Based on {sentimentData.total_reviews} reviews</p>
        </div>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
          AI Powered
        </span>
      </div>

      {/* Overall Sentiment */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Overall Sentiment</span>
          <SentimentBadge sentiment={sentimentData.sentiment} score={sentimentData.score} size="lg" />
        </div>
        <div className="mt-2">
          <div className="flex items-center text-sm text-gray-600">
            <span>Confidence: </span>
            <span className="ml-2 font-semibold">{(sentimentData.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribution</h4>
        <div className="space-y-3">
          {/* Positive */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <span>😊</span> Positive
              </span>
              <span className="text-sm font-semibold text-green-600">
                {sentimentData.positive_count} ({positivePercentage.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${positivePercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Neutral */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <span>😐</span> Neutral
              </span>
              <span className="text-sm font-semibold text-gray-600">
                {sentimentData.neutral_count} ({neutralPercentage.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${neutralPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Negative */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <span>😢</span> Negative
              </span>
              <span className="text-sm font-semibold text-red-600">
                {sentimentData.negative_count} ({negativePercentage.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${negativePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Common Keywords */}
      {sentimentData.common_keywords && sentimentData.common_keywords.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Common Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {sentimentData.common_keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Aspects Analysis */}
      {sentimentData.aspects && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Aspect Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sentimentData.aspects.food_quality && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="text-xs text-gray-600 mb-1">Food Quality</div>
                <div className="text-sm font-semibold text-orange-700">
                  {sentimentData.aspects.food_quality}
                </div>
              </div>
            )}
            {sentimentData.aspects.service && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-xs text-gray-600 mb-1">Service</div>
                <div className="text-sm font-semibold text-blue-700">
                  {sentimentData.aspects.service}
                </div>
              </div>
            )}
            {sentimentData.aspects.value && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="text-xs text-gray-600 mb-1">Value</div>
                <div className="text-sm font-semibold text-green-700">
                  {sentimentData.aspects.value}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
