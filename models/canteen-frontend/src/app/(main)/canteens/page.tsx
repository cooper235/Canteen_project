'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, MapPin, Clock } from 'lucide-react';
import RecommendationsSection from '@/components/RecommendationsSection';
import { themeClasses, animations } from '@/lib/theme';

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
      console.log('🔄 Fetching canteens...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      try {
        const response = await fetch('http://localhost:5000/api/canteens', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log('✅ Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to fetch canteens');
        }
        
        const json = await response.json();
        console.log('✅ Data received:', json);
        return json;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('❌ Fetch error:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000,
  });

  const canteens = data?.canteens;

  console.log('📊 Query state:', { isLoading, hasError: !!error, dataCount: canteens?.length });

  if (isLoading) {
    return (
      <div className={`min-h-screen py-12 ${themeClasses.background}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`${themeClasses.card} p-6`}>
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

  if (error) {
    return (
      <div className={`min-h-screen py-12 ${themeClasses.background}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-900/20 border border-red-700 p-4 rounded-md">
            <p className="text-red-300">Error loading canteens. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 ${themeClasses.background}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className={`text-5xl md:text-6xl font-black ${themeClasses.textPrimary} mb-6 leading-tight`}>
            Discover 
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent"> Campus </span>
            Canteens
          </h1>
          <p className={`text-xl md:text-2xl ${themeClasses.textSecondary} max-w-2xl mx-auto font-medium`}>
            Explore amazing food options around campus
          </p>
        </motion.div>

        {/* AI-Powered Recommendations Section */}
        <div className="mb-16">
          <RecommendationsSection />
        </div>

        {/* Canteens Grid */}
        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          variants={animations.containerVariants}
          initial="hidden"
          animate="visible"
        >
          {canteens?.map((canteen, index) => (
            <motion.div
              key={canteen._id}
              variants={animations.itemVariants as any}
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              <Link
                href={`/canteens/${canteen._id}`}
                className="block group h-full"
              >
                <div className={`${themeClasses.card} overflow-hidden h-full flex flex-col`}>
                  {/* Image Section */}
                  <div className="relative h-56 overflow-hidden">
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                    
                    {canteen.image ? (
                      <motion.img 
                        src={canteen.image} 
                        alt={canteen.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    ) : (
                      <motion.img
                        src={`https://images.unsplash.com/photo-${[
                          '1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80',
                          '1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80',
                          '1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80',
                          '1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80',
                          '1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop&q=80'
                        ][index % 5]}`}
                        alt={canteen.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                    
                    {/* Verified Badge */}
                    {canteen.isVerified && (
                      <div className="absolute top-4 left-4 z-20 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
                        ✓ Verified
                      </div>
                    )}
                    
                    {/* Rating Badge */}
                    {canteen.rating && (
                      <div className="absolute bottom-4 left-4 z-20 bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-lg">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm">{canteen.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${themeClasses.textPrimary} mb-2 group-hover:text-orange-400 transition-colors`}>
                        {canteen.name}
                      </h3>
                      <p className={`${themeClasses.textSecondary} text-sm line-clamp-2 mb-4 leading-relaxed`}>
                        {canteen.description || 'Delicious meals awaiting you'}
                      </p>
                      
                      {/* Cuisine Tags */}
                      {canteen.cuisineTypes && canteen.cuisineTypes.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {canteen.cuisineTypes.slice(0, 3).map((cuisine) => (
                            <span key={cuisine} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                              {cuisine}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Info Section */}
                    <div className={`mt-auto pt-4 border-t ${themeClasses.border} space-y-3`}>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-orange-400 flex-shrink-0" />
                        <span className={`${themeClasses.textSecondary} font-medium truncate`}>{canteen.location}</span>
                      </div>
                      {canteen.operatingHours && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={16} className="text-green-400 flex-shrink-0" />
                          <span className={`${themeClasses.textSecondary} font-medium`}>
                            {canteen.operatingHours.open || 'N/A'} - {canteen.operatingHours.close || 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}