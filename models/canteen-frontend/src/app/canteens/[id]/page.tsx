'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

type Dish = {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  preparationTime: number;
  image?: string;
};

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
  contactPhone?: string;
  email?: string;
  cuisineTypes?: string[];
  isVerified?: boolean;
};

export default function CanteenDetailsPage() {
  const params = useParams();
  const canteenId = params.id as string;

  const { data: canteenResponse, isLoading: canteenLoading } = useQuery<{ success: boolean; canteen: Canteen }>({
    queryKey: ['canteen', canteenId],
    queryFn: async () => {
      const response = await api.get(`/canteens/${canteenId}`);
      return response.data;
    },
  });

  const canteen = canteenResponse?.canteen;

  const { data: dishesResponse, isLoading: dishesLoading } = useQuery<{ success: boolean; dishes: Dish[] }>({
    queryKey: ['canteen-dishes', canteenId],
    queryFn: async () => {
      const response = await api.get(`/dishes/canteen/${canteenId}`);
      return response.data;
    },
  });

  const dishes = dishesResponse?.dishes;

  if (canteenLoading || dishesLoading) {
    return <div className="min-h-screen py-12 bg-gray-50">Loading...</div>;
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Canteen Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-indigo-500 to-purple-600">
            {canteen?.image && (
              <img
                src={canteen.image}
                alt={canteen.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-8">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">{canteen?.name}</h1>
              {canteen?.isVerified && (
                <span className="ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              )}
            </div>
            <p className="mt-2 text-gray-600">{canteen?.description}</p>
            {canteen?.cuisineTypes && canteen.cuisineTypes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {canteen.cuisineTypes.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center gap-x-4 text-sm text-gray-600">
              <div>{canteen?.location || 'Location not available'}</div>
              {canteen?.operatingHours && (
                <>
                  <div>•</div>
                  <div>
                    {canteen.operatingHours.open} - {canteen.operatingHours.close}
                  </div>
                </>
              )}
              {canteen?.rating && (
                <>
                  <div>•</div>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1">{canteen.rating.toFixed(1)}</span>
                  </div>
                </>
              )}
            </div>
            {(canteen?.contactPhone || canteen?.email) && (
              <div className="mt-4 text-sm text-gray-600">
                {canteen.contactPhone && (
                  <div>Phone: {canteen.contactPhone}</div>
                )}
                {canteen.email && <div>Email: {canteen.email}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Menu Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dishes?.map((dish) => (
              <div
                key={dish._id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <div className="h-48 bg-gray-200">
                  {dish.image && (
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {dish.name}
                    </h3>
                    <span className="text-indigo-600 font-semibold">
                      ₹{dish.price}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {dish.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span
                      className={`px-2 py-1 rounded ${
                        dish.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {dish.available ? 'Available' : 'Unavailable'}
                    </span>
                    <span className="text-gray-500">
                      {dish.preparationTime} mins
                    </span>
                  </div>
                  {dish.available && (
                    <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                      Add to Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}