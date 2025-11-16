'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Recommendation {
  dish_id: string;
  score: number;
  reason: string;
}

interface Dish {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  canteen: {
    _id: string;
    name: string;
  };
}

export default function RecommendationsSection() {
  const { data: session, status } = useSession();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for session to be loaded
    if (status === 'loading') {
      return;
    }
    
    // Get user email and token from session
    const userEmail = (session?.user as any)?.email;
    const token = (session?.user as any)?.token;
    
    if (!userEmail || !token) {
      console.log('No user session or token available');
      setLoading(false);
      return;
    }
    
    console.log('Fetching recommendations for user:', userEmail);

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // Get recommendations from backend API using user email
        const response = await fetch(
          `http://localhost:5000/api/ml/recommendations/user/${userEmail}?limit=6`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const data = await response.json();
        console.log('Recommendations response:', data);

        if (data.success && data.recommendations) {
          const recs = data.recommendations;
          console.log('Got recommendations:', recs);
          setRecommendations(recs);

          // Fetch dish details for each recommendation
          const dishPromises = recs.map(async (rec: Recommendation) => {
            try {
              console.log(`Fetching dish ${rec.dish_id}...`);
              const dishResponse = await fetch(
                `http://localhost:5000/api/dishes/${rec.dish_id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              console.log(`Dish ${rec.dish_id} response status:`, dishResponse.status);
              
              if (dishResponse.ok) {
                const dishData = await dishResponse.json();
                console.log(`Dish ${rec.dish_id} data:`, dishData);
                // The API returns {success: true, dish: {...}} 
                const dish = dishData.dish || dishData.data || dishData;
                console.log(`Dish ${rec.dish_id} final:`, dish);
                return dish;
              } else {
                console.error(`Dish ${rec.dish_id} not found (${dishResponse.status})`);
              }
            } catch (error) {
              console.error(`Error fetching dish ${rec.dish_id}:`, error);
            }
            return null;
          });

          const dishesData = await Promise.all(dishPromises);
          console.log('All dishes fetched:', dishesData);
          const validDishes = dishesData.filter(d => d !== null);
          console.log('Valid dishes:', validDishes);
          setDishes(validDishes);
        } else {
          console.log('No recommendations found or error in response:', data);
          setDishes([]);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setDishes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [status, session]);

  if (!session?.user?.id || loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">🤖 Recommended for You</h2>
        <div className="flex space-x-4 overflow-x-auto">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-64 flex-shrink-0">
              <div className="animate-pulse bg-gray-200 h-40 rounded-lg mb-2"></div>
              <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (dishes.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-8 border border-blue-100">
        <h2 className="text-2xl font-bold mb-2 text-indigo-900">🤖 Personalized Recommendations</h2>
        <p className="text-gray-600">
          Order some dishes to get personalized recommendations powered by AI!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-8 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-indigo-900">🤖 Recommended for You</h2>
          <p className="text-sm text-gray-600">AI-powered suggestions based on your preferences</p>
        </div>
        <div className="bg-indigo-100 px-3 py-1 rounded-full">
          <span className="text-indigo-700 text-sm font-medium">ML Powered</span>
        </div>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4">
        {dishes.map((dish) => {
          // Find the corresponding recommendation by dish_id
          const rec = recommendations.find(r => r.dish_id === dish._id);
          
          // Ensure we have valid canteen data
          if (!dish || !dish.canteen) {
            return null;
          }
          
          return (
            <Link
              key={dish._id}
              href={`/canteens/${dish.canteen._id || dish.canteen}`}
              className="w-72 flex-shrink-0 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
            >
              {/* Dish Image */}
              <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                {dish.image ? (
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Recommendation Badge */}
                {rec && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {Math.round((rec.score || 0.5) * 100)}% match
                  </div>
                )}
              </div>

              {/* Dish Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">{dish.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {typeof dish.canteen === 'object' ? dish.canteen.name : 'Canteen'}
                </p>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{dish.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-indigo-600">₹{dish.price}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {dish.category}
                  </span>
                </div>

                {/* Recommendation Reason */}
                {rec && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-indigo-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {rec.reason}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
