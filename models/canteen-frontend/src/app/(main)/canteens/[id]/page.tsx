'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { useState, useMemo } from 'react';
import ReviewModal from '@/components/ReviewModal';
import ReviewsList from '@/components/ReviewsList';
import { MapPin, Clock, Star } from 'lucide-react';

type Dish = {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  availability: boolean;
  image?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isSpicy?: boolean;
  tags?: string[];
  allergens?: string[];
  ratings?: {
    averageRating: number;
    totalReviews: number;
  };
  popularity?: {
    orderCount: number;
    score: number;
  };
  offer?: {
    isActive: boolean;
    type: string;
    title: string;
    description: string;
    discountPercentage?: number;
    originalPrice?: number;
  };
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
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState<string>('default');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<{ id: string; name: string } | null>(null);
  const [reviewsRefresh, setReviewsRefresh] = useState(0);
  const [showReviews, setShowReviews] = useState<string | null>(null);

  const { data: canteenResponse, isLoading: canteenLoading } = useQuery<{ success: boolean; canteen: Canteen }>({
    queryKey: ['canteen', canteenId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/canteens/${canteenId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch canteen');
      }
      
      return response.json();
    },
  });

  const canteen = canteenResponse?.canteen;

  const { data: dishesResponse, isLoading: dishesLoading } = useQuery<{ success: boolean; dishes: Dish[] }>({
    queryKey: ['canteen-dishes', canteenId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/dishes/canteen/${canteenId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dishes');
      }
      
      return response.json();
    },
  });

  const dishes = dishesResponse?.dishes;

  // Filter and sort dishes
  const filteredAndSortedDishes = useMemo(() => {
    if (!dishes) return [];
    
    // Filter by category
    let filtered = dishes;
    if (filterCategory !== 'all') {
      filtered = dishes.filter(dish => dish.category === filterCategory);
    }
    
    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => (b.ratings?.averageRating || 0) - (a.ratings?.averageRating || 0));
        break;
      case 'popularity':
        sorted.sort((a, b) => (b.popularity?.orderCount || 0) - (a.popularity?.orderCount || 0));
        break;
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      default:
        // default order
        break;
    }
    
    return sorted;
  }, [dishes, sortBy, filterCategory]);

  if (canteenLoading || dishesLoading) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/[0.08] backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="h-4 bg-slate-600 rounded w-1/4"></div>
                <div className="space-y-3 mt-4">
                  <div className="h-4 bg-slate-600 rounded"></div>
                  <div className="h-4 bg-slate-600 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Canteen Header */}
        <div className="bg-white/[0.08] backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl shadow-orange-500/20 overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-orange-500 to-amber-600">
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
              <h1 className="text-3xl font-bold text-white">{canteen?.name}</h1>
              {canteen?.isVerified && (
                <span className="ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="mt-2 text-slate-300">{canteen?.description}</p>
            {canteen?.cuisineTypes && canteen.cuisineTypes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {canteen.cuisineTypes.map((cuisine) => (
                  <span
                    key={cuisine}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center gap-x-4 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-orange-400" />
                {canteen?.location || 'Location not available'}
              </div>
              {canteen?.operatingHours && (
                <>
                  <div>•</div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-green-400" />
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
              <div className="mt-4 text-sm text-slate-300">
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
          <h2 className="text-2xl font-bold text-white mb-2">Menu</h2>
          <p className="text-slate-400 mb-6">Discover our delicious offerings</p>
          
          {/* Filter and Sort Controls */}
          <div className="mt-4 flex flex-wrap gap-4 mb-6">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {['all', 'breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts'].map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-lg capitalize transition-all duration-300 ${
                    filterCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-white/[0.08] text-slate-300 hover:bg-white/[0.12] border border-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Sort Dropdown */}
            <div className="ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/[0.08] border border-white/10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm"
              >
                <option value="default" className="bg-slate-800">Sort by: Default</option>
                <option value="rating" className="bg-slate-800">Rating (High to Low)</option>
                <option value="popularity" className="bg-slate-800">Popularity</option>
                <option value="price-low" className="bg-slate-800">Price (Low to High)</option>
                <option value="price-high" className="bg-slate-800">Price (High to Low)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedDishes?.map((dish) => (
              <div
                key={dish._id}
                className="bg-white/[0.08] backdrop-blur-sm rounded-2xl border border-white/10 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 overflow-hidden group"
              >
                <div className="h-48 bg-gray-200 relative">
                  {dish.image && (
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Offer Badge */}
                  {dish.offer?.isActive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {dish.offer.type === 'discount' && dish.offer.discountPercentage
                        ? `${dish.offer.discountPercentage}% OFF`
                        : dish.offer.type === 'combo'
                        ? 'COMBO DEAL'
                        : dish.offer.type === 'buy_one_get_one'
                        ? 'BOGO'
                        : 'SPECIAL OFFER'}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
                      {dish.name}
                    </h3>
                    <div className="text-right">
                      {dish.offer?.isActive && dish.offer.originalPrice && (
                        <div className="text-sm text-slate-400 line-through">
                          ₹{dish.offer.originalPrice}
                        </div>
                      )}
                      <span className="text-orange-400 font-bold text-lg">
                        ₹{dish.price}
                      </span>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  {dish.ratings && dish.ratings.totalReviews > 0 && (
                    <div className="flex items-center mt-2 text-sm">
                      <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < Math.round(dish.ratings?.averageRating || 0) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="ml-2 text-slate-300">
                        {dish.ratings?.averageRating.toFixed(1)} ({dish.ratings?.totalReviews} reviews)
                      </span>
                    </div>
                  )}
                  
                  {/* Offer Title */}
                  {dish.offer?.isActive && dish.offer.title && (
                    <div className="mt-2 text-sm font-medium text-red-600">
                      🎉 {dish.offer.title}
                    </div>
                  )}
                  
                  <p className="mt-2 text-sm text-slate-300">
                    {dish.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dish.isVegetarian && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                        🌱 Veg
                      </span>
                    )}
                    {dish.isVegan && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                        🌿 Vegan
                      </span>
                    )}
                    {dish.isSpicy && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                        🌶️ Spicy
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      {dish.category}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span
                      className={`px-2 py-1 rounded font-medium ${
                        dish.availability
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {dish.availability ? '✓ Available' : '✗ Unavailable'}
                    </span>
                  </div>
                  {dish.availability && (
                    <div className="mt-4 space-y-2">
                      <button 
                        onClick={() => {
                          addItem({
                            dishId: dish._id,
                            name: dish.name,
                            price: dish.price,
                            image: dish.image,
                            canteenId: canteen?._id || '',
                            canteenName: canteen?.name || '',
                          });
                          showToast(`${dish.name} added to cart!`, 'success');
                        }}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-lg shadow-orange-500/30 transition-all duration-300"
                      >
                        Add to Cart
                      </button>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedDish({ id: dish._id, name: dish.name });
                            setReviewModalOpen(true);
                          }}
                          className="flex-1 bg-white/[0.08] border border-orange-500/50 text-orange-300 py-2 px-4 rounded-lg hover:bg-white/[0.12] hover:border-orange-500 transition-all text-sm font-medium"
                        >
                          ⭐ Rate Dish
                        </button>
                        <button
                          onClick={() => setShowReviews(showReviews === dish._id ? null : dish._id)}
                          className="flex-1 bg-white/[0.08] border border-white/10 text-slate-300 py-2 px-4 rounded-lg hover:bg-white/[0.12] transition-all text-sm font-medium"
                        >
                          {showReviews === dish._id ? 'Hide Reviews' : 'View Reviews'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Reviews Section */}
                  {showReviews === dish._id && (
                    <div className="mt-4 pt-4 border-t border-slate-700/30">
                      <ReviewsList dishId={dish._id} refreshTrigger={reviewsRefresh} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Review Modal */}
      {selectedDish && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedDish(null);
          }}
          dishId={selectedDish.id}
          dishName={selectedDish.name}
          canteenId={canteenId}
          onReviewSubmitted={() => {
            showToast('Review submitted successfully!', 'success');
            setReviewsRefresh(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}