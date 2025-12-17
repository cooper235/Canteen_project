'use client';

import { useEffect, useState } from 'react';
import SentimentBadge from './SentimentBadge';

interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  reviewer: {
    name: string;
    profileImage?: string;
  };
  isVerifiedPurchase: boolean;
  helpful: number;
  unhelpful: number;
  createdAt: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentScore?: number;
  sentimentKeywords?: string[];
}

interface ReviewsListProps {
  dishId: string;
  refreshTrigger?: number;
}

export default function ReviewsList({ dishId, refreshTrigger }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchReviews();
  }, [dishId, sortBy, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `/reviews/dish/${dishId}?sortBy=${sortBy}`
      );
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Options */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Customer Reviews ({reviews.length})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="newest">Newest First</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating-high">Highest Rating</option>
          <option value="rating-low">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="border border-gray-200 rounded-lg p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {review.reviewer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.reviewer.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </span>
            </div>

            {/* Review Content */}
            <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
            <p className="text-gray-700 text-sm mb-3">{review.comment}</p>

            {/* Sentiment Analysis */}
            {review.sentiment && (
              <div className="mb-3 flex items-center gap-2">
                <SentimentBadge 
                  sentiment={review.sentiment} 
                  score={review.sentimentScore}
                  size="sm"
                />
                {review.sentimentKeywords && review.sentimentKeywords.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {review.sentimentKeywords.slice(0, 3).map((keyword, idx) => (
                      <span key={idx} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Helpful Buttons */}
            <div className="flex items-center gap-4 text-sm">
              <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <span>👍</span>
                <span>Helpful ({review.helpful})</span>
              </button>
              <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <span>👎</span>
                <span>({review.unhelpful})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
