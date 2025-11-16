'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ForecastingDashboard from '@/components/ForecastingDashboard';
import SentimentAnalysis from '@/components/SentimentAnalysis';

interface Canteen {
  _id: string;
  name: string;
  owner: string;
}

export default function MLAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'forecasting' | 'sentiment'>('forecasting');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'canteen_owner') {
      router.push('/');
      return;
    }

    const fetchCanteen = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/canteens/my-canteen', {
          credentials: 'include',
        });

        const data = await response.json();
        if (data.success) {
          setCanteen(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch canteen:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchCanteen();
    }
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!canteen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Canteen Found</h2>
          <p className="text-gray-600">You need to register a canteen first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🤖 ML Analytics</h1>
              <p className="mt-2 text-gray-600">
                AI-powered insights for <span className="font-semibold">{canteen.name}</span>
              </p>
            </div>
            <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium shadow-lg">
              Powered by AI/ML
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('forecasting')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'forecasting'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📈 Demand Forecasting
            </button>
            <button
              onClick={() => setActiveTab('sentiment')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'sentiment'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💬 Sentiment Analysis
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'forecasting' && (
            <div className="animate-fadeIn">
              <ForecastingDashboard canteenId={canteen._id} />
            </div>
          )}

          {activeTab === 'sentiment' && (
            <div className="animate-fadeIn">
              <SentimentAnalysis canteenId={canteen._id} type="canteen" />
              
              {/* Additional Sentiment Insights */}
              <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  💡 How to Use Sentiment Insights
                </h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>
                      <strong>Monitor trends:</strong> Track sentiment changes over time to identify improvements or issues
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>
                      <strong>Address concerns:</strong> Pay attention to negative keywords and aspect feedback
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>
                      <strong>Celebrate wins:</strong> Use positive feedback to understand what customers love
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>
                      <strong>Take action:</strong> Use insights to improve food quality, service, and value
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
          <div className="flex items-start">
            <span className="text-2xl mr-3">ℹ️</span>
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">About ML Analytics</h4>
              <p className="text-sm text-blue-800 mb-3">
                Our ML-powered analytics use advanced machine learning algorithms to help you make data-driven decisions:
              </p>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Demand Forecasting:</strong> Uses Holt-Winters Exponential Smoothing to predict future demand based on historical patterns and seasonal trends
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Sentiment Analysis:</strong> Employs NLP (Natural Language Processing) to analyze review text and extract customer opinions about food quality, service, and value
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
