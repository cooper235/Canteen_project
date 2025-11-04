'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useEffect } from 'react';

type Canteen = {
  _id: string;
  name: string;
  description: string;
  location: string;
  operatingHours?: {
    open: string;
    close: string;
  };
  rating?: number;
  image?: string;
  cuisineTypes?: string[];
  isActive?: boolean;
  isVerified?: boolean;
};

export default function CanteensPage() {
  const { data, isLoading, error } = useQuery<{ success: boolean; canteens: Canteen[] }>({
    queryKey: ['canteens'],
    queryFn: async () => {
      try {
        console.log('Fetching canteens...');
        const response = await api.get('/canteens');
        console.log('API Response:', response.data);
        return response.data;
      } catch (err) {
        console.error('Error fetching canteens:', err);
        throw err;
      }
    },
  });

  const canteens = data?.canteens;

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white shadow rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-3 mt-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">Error loading canteens. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Campus Canteens
          </h2>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Discover and order from various canteens around the campus
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {canteens?.map((canteen) => (
            <Link
              key={canteen._id}
              href={`/canteens/${canteen._id}`}
              className="block group"
            >
              <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200">
                  {canteen.image ? (
                    <img 
                      src={canteen.image} 
                      alt={canteen.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600">
                    {canteen.name}
                    {canteen.isVerified && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 text-gray-500 line-clamp-2">
                    {canteen.description || 'No description available'}
                  </p>
                  {canteen.cuisineTypes && canteen.cuisineTypes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {canteen.cuisineTypes.map((cuisine) => (
                        <span key={cuisine} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <div>{canteen.location}</div>
                    <div>
                      {canteen.operatingHours ? (
                        `${canteen.operatingHours.open || 'N/A'} - ${canteen.operatingHours.close || 'N/A'}`
                      ) : (
                        'Hours not available'
                      )}
                    </div>
                  </div>
                  {canteen.rating && (
                    <div className="mt-2 flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm text-gray-600">
                        {canteen.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}