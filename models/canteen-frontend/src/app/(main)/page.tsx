'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Zap, Heart, Search, Sparkles, Coffee, Utensils, Cookie, Droplet, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';
import RecommendationsSection from '@/components/RecommendationsSection';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { AnimatedStats } from '@/components/AnimatedStats';
import { DishCardSkeleton, CanteenCardSkeleton } from '@/components/Skeletons';

interface Canteen {
  _id: string;
  name: string;
  description: string;
  rating?: number;
  image?: string;
  location?: string;
  deliveryTime?: number;
  dishes?: Array<{ name: string; price: number; image?: string }>;
}

interface Dish {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  availability: boolean;
  ratings?: {
    averageRating: number;
    totalReviews: number;
  };
  popularity?: {
    orderCount: number;
  };
  canteen: {
    _id: string;
    name: string;
  } | string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0, rotateX: 0, rotateY: 0 },
  hover: {
    scale: 1.03,
    y: -12,
    rotateX: 2,
    rotateY: 2,
    transition: { 
      duration: 0.3,
      type: 'spring' as const,
      stiffness: 300,
      damping: 20
    },
  },
};

export default function HomePage() {
  const { data: session } = useSession();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [filteredCanteens, setFilteredCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'nearby' | 'trending'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [surpriseCanteen, setSurpriseCanteen] = useState<Canteen | null>(null);
  const [showSurprise, setShowSurprise] = useState(false);
  const [featuredDishes, setFeaturedDishes] = useState<Dish[]>([]);
  const [dishesLoading, setDishesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch canteens
  useEffect(() => {
    const fetchCanteens = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching canteens...');
        const response = await fetch('http://localhost:5000/api/canteens');
        console.log('✅ Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch canteens: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Data received:', data);

        const canteensArray = data.canteens || data.data || [];
        setCanteens(canteensArray);
        setFilteredCanteens(canteensArray);
      } catch (error) {
        console.error('❌ Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCanteens();
  }, []);

  // Fetch featured/popular dishes
  useEffect(() => {
    const fetchFeaturedDishes = async () => {
      try {
        setDishesLoading(true);
        const response = await fetch('http://localhost:5000/api/dishes');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dishes');
        }

        const data = await response.json();
        const dishes = data.dishes || [];
        
        // Sort by popularity and rating, take top 8
        const featured = dishes
          .filter((dish: Dish) => dish.availability)
          .sort((a: Dish, b: Dish) => {
            const aScore = (a.ratings?.averageRating || 0) * (a.popularity?.orderCount || 0);
            const bScore = (b.ratings?.averageRating || 0) * (b.popularity?.orderCount || 0);
            return bScore - aScore;
          })
          .slice(0, 8);
        
        setFeaturedDishes(featured);
      } catch (error) {
        console.error('❌ Error fetching dishes:', error);
      } finally {
        setDishesLoading(false);
      }
    };

    fetchFeaturedDishes();
  }, []);

  // Filter canteens based on search
  useEffect(() => {
    let filtered = canteens;

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeFilter === 'trending') {
      filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (activeFilter === 'nearby') {
      // In a real app, this would use geolocation
      filtered = filtered.slice(0, 5);
    }

    setFilteredCanteens(filtered);
  }, [searchTerm, activeFilter, canteens]);

  // Surprise Me Feature
  const handleSurpriseMe = () => {
    if (canteens.length > 0) {
      const randomIndex = Math.floor(Math.random() * canteens.length);
      const random = canteens[randomIndex];
      setSurpriseCanteen(random);
      setShowSurprise(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => setShowSurprise(false), 5000);
    }
  };

  const toggleFavorite = (canteenId: string) => {
    setFavorites(prev =>
      prev.includes(canteenId)
        ? prev.filter(id => id !== canteenId)
        : [...prev, canteenId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section - Swiggy/Zomato Style */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative w-full min-h-[550px] overflow-hidden"
      >
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 via-orange-500/85 to-amber-500/90 z-10" />
        
        {/* Background Image with Parallax Effect */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=90')`,
            backgroundPosition: 'center',
          }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Decorative Elements */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Hero Content */}
        <motion.div
          className="relative z-20 h-full min-h-[550px] flex flex-col justify-center items-center text-center px-4 py-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="max-w-4xl"
            variants={itemVariants}
          >
            <motion.h1
              className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight"
              variants={itemVariants}
            >
              Order food you
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
                love
              </span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-white/95 mb-10 font-medium max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Get your favourite meals delivered fast with AI-powered recommendations
            </motion.p>

            {/* Search Bar - Swiggy Style */}
            <motion.div
              className="max-w-2xl mx-auto mb-8"
              variants={itemVariants}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <Search className="ml-6 text-slate-400" size={24} />
                  <input
                    type="text"
                    placeholder="Search for canteens, dishes or cuisines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-6 py-5 text-lg text-slate-800 placeholder-slate-400 outline-none bg-transparent font-medium"
                  />
                  <button className="mr-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300">
                    Search
                  </button>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              variants={itemVariants}
            >
              <motion.button
                onClick={handleSurpriseMe}
                className="px-8 py-4 bg-white text-orange-600 font-bold rounded-full flex items-center gap-3 hover:shadow-2xl transition-all duration-300 group"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
                Surprise Me!
              </motion.button>
              
              <Link href="/canteens">
                <motion.button
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full border-2 border-white/30 hover:bg-white/30 hover:shadow-2xl transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View All Canteens
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Surprise Modal */}
      {showSurprise && surpriseCanteen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
          >
            {surpriseCanteen.image && (
              <img
                src={surpriseCanteen.image}
                alt={surpriseCanteen.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-yellow-500" size={24} />
                <h3 className="text-2xl font-bold text-slate-900">
                  {surpriseCanteen.name}
                </h3>
              </div>
              <p className="text-slate-600 mb-4">{surpriseCanteen.description}</p>
              <div className="flex gap-4">
                <Link
                  href={`/canteens/${surpriseCanteen._id}`}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold text-center hover:bg-blue-700 transition"
                >
                  View Menu
                </Link>
                <button
                  onClick={() => setShowSurprise(false)}
                  className="flex-1 bg-slate-200 text-slate-900 py-2 rounded-lg font-semibold hover:bg-slate-300 transition"
                >
                  Skip
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Animated Stats Section */}
      <AnimatedStats />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Category Quick Links */}
        <motion.section
          className="mb-16 -mt-20 relative z-30"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Breakfast', icon: Coffee, color: 'from-yellow-500 to-orange-500', category: 'breakfast' },
              { name: 'Lunch', icon: Utensils, color: 'from-orange-500 to-red-500', category: 'lunch' },
              { name: 'Snacks', icon: Cookie, color: 'from-pink-500 to-purple-500', category: 'snacks' },
              { name: 'Beverages', icon: Droplet, color: 'from-blue-500 to-cyan-500', category: 'beverages' },
            ].map((category, index) => {
              const Icon = category.icon;
              const dishCount = featuredDishes.filter(dish => dish.category === category.category).length;
              return (
                <motion.button
                  key={category.name}
                  onClick={() => {
                    // Toggle category selection
                    if (selectedCategory === category.category) {
                      setSelectedCategory('all');
                    } else {
                      setSelectedCategory(category.category);
                      // Scroll to featured dishes section
                      setTimeout(() => {
                        const section = document.getElementById('featured-dishes');
                        if (section) {
                          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }
                  }}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-white/[0.08] backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 group relative ${
                    selectedCategory === category.category ? 'ring-2 ring-orange-500 shadow-lg shadow-orange-500/30' : ''
                  }`}
                >
                  {/* Dish count badge */}
                  {dishCount > 0 && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      {dishCount}
                    </div>
                  )}
                  <div className={`bg-gradient-to-r ${category.color} w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">{category.name}</h3>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        {/* Personalized Recommendations */}
        {session && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <RecommendationsSection />
          </motion.div>
        )}

        {/* Featured Dishes Section */}
        {!dishesLoading && featuredDishes.length > 0 && (() => {
          // Filter dishes based on selected category
          const displayDishes = selectedCategory === 'all' 
            ? featuredDishes 
            : featuredDishes.filter(dish => dish.category === selectedCategory);
          
          // Get category name for display
          const categoryName = selectedCategory === 'all' ? 'Popular' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
          
          return (
            <motion.section
              id="featured-dishes"
              className="mb-16 scroll-mt-20"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={selectedCategory}
            >
              <motion.div className="flex items-center justify-between mb-8" variants={itemVariants}>
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                    {categoryName} <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Dishes</span>
                  </h2>
                  <p className="text-slate-400 text-lg">
                    {selectedCategory === 'all' ? 'Most loved by students like you!' : `Delicious ${selectedCategory} options`}
                    {selectedCategory !== 'all' && (
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="ml-3 text-orange-400 hover:text-orange-300 underline text-sm"
                      >
                        Show All
                      </button>
                    )}
                  </p>
                </div>
                <TrendingUp className="text-orange-500" size={40} />
              </motion.div>

              {displayDishes.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  variants={containerVariants}
                >
                  {dishesLoading ? (
                    // Loading skeletons
                    [...Array(8)].map((_, i) => <DishCardSkeleton key={i} />)
                  ) : (
                    displayDishes.map((dish, index) => (
                <motion.div
                  key={dish._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/[0.08] backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 group cursor-pointer"
                >
                  {/* Dish Image */}
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                    {dish.image ? (
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <img
                        src={`https://images.unsplash.com/photo-${[
                          '1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80',
                          '1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&q=80',
                          '1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&q=80',
                          '1565958011703-44f9829ba187?w=400&h=300&fit=crop&q=80',
                        ][index % 4]}`}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    
                    {/* Rating Badge */}
                    {dish.ratings && dish.ratings.totalReviews > 0 && (
                      <div className="absolute top-3 left-3 z-20 bg-green-500 text-white px-2 py-1 rounded-lg font-bold flex items-center gap-1 text-xs shadow-lg">
                        <Star size={12} fill="currentColor" />
                        {dish.ratings.averageRating.toFixed(1)}
                      </div>
                    )}
                    
                    {/* Popularity Badge */}
                    {dish.popularity && dish.popularity.orderCount > 10 && (
                      <div className="absolute top-3 right-3 z-20 bg-orange-500 text-white px-2 py-1 rounded-lg font-bold text-xs shadow-lg flex items-center gap-1">
                        <Award size={12} />
                        Hot
                      </div>
                    )}
                  </div>

                  {/* Dish Info */}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-orange-400 transition-colors line-clamp-1">
                      {dish.name}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {dish.description}
                    </p>
                    
                    {/* Canteen Name */}
                    <p className="text-slate-500 text-xs mb-3 flex items-center gap-1">
                      <MapPin size={12} />
                      {typeof dish.canteen === 'object' ? dish.canteen.name : 'Canteen'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-orange-400 font-bold text-xl">₹{dish.price}</span>
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (dish.availability) {
                            const canteenId = typeof dish.canteen === 'object' ? dish.canteen._id : dish.canteen;
                            const canteenName = typeof dish.canteen === 'object' ? dish.canteen.name : 'Canteen';
                            addItem({
                              dishId: dish._id,
                              name: dish.name,
                              price: dish.price,
                              image: dish.image,
                              canteenId,
                              canteenName,
                            });
                            showToast(`${dish.name} added to cart!`, 'success');
                          } else {
                            showToast(`${dish.name} is currently unavailable`, 'error');
                          }
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!dish.availability}
                      >
                        Add
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )))}
            </motion.div>
              ) : (
                <motion.div
                  className="text-center py-12 bg-white/[0.05] rounded-2xl border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Cookie className="mx-auto text-slate-500 mb-4" size={48} />
                  <p className="text-slate-400 text-lg mb-2">No {selectedCategory} dishes available right now</p>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-orange-400 hover:text-orange-300 underline"
                  >
                    View all dishes
                  </button>
                </motion.div>
              )}
            </motion.section>
          );
        })()}

        {/* Search & Filter Section */}
        <motion.section
          className="mt-16 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="mb-8">
            <motion.h2 
              className="text-4xl md:text-5xl font-black text-white mb-8"
              variants={itemVariants}
            >
              Explore <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">All Canteens</span>
            </motion.h2>

            {/* Filter Tabs - Zomato Style */}
            <motion.div
              className="flex flex-wrap gap-3 mb-8"
              variants={itemVariants}
            >
              {(['all', 'trending', 'nearby'] as const).map(filter => (
                <motion.button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-3 rounded-2xl font-semibold capitalize transition-all duration-300 ${
                    activeFilter === filter
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-white/[0.08] border border-white/10 text-slate-300 hover:bg-white/[0.12] hover:border-orange-500/30'
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {filter === 'all' ? '✨ All Canteens' : filter === 'trending' ? '🔥 Trending' : '📍 Nearby'}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Canteen Grid - Swiggy/Zomato Style Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <CanteenCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCanteens.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCanteens.map((canteen, index) => (
                <motion.div
                  key={canteen._id}
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                  variants={cardHoverVariants}
                  className="group"
                >
                  <Link href={`/canteens/${canteen._id}`}>
                    <div className="bg-white/[0.08] backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 cursor-pointer h-full flex flex-col">
                      {/* Image Section with Overlay */}
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

                        {/* Favorite Button */}
                        <motion.button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(canteen._id);
                          }}
                          className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all shadow-lg"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Heart
                            size={20}
                            className={`transition-colors ${
                              favorites.includes(canteen._id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-slate-600'
                            }`}
                          />
                        </motion.button>

                        {/* Rating Badge */}
                        {canteen.rating && (
                          <div className="absolute bottom-4 left-4 z-20 bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-lg">
                            <Star size={14} fill="currentColor" />
                            <span className="text-sm">{canteen.rating.toFixed(1)}</span>
                          </div>
                        )}
                        
                        {/* Delivery Time Badge */}
                        {canteen.deliveryTime && (
                          <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-sm text-slate-700 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 shadow-lg">
                            <Clock size={14} />
                            <span className="text-sm">{canteen.deliveryTime} min</span>
                          </div>
                        )}
                      </div>

                      {/* Info Section */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                            {canteen.name}
                          </h3>
                          <p className="text-sm text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                            {canteen.description}
                          </p>
                        </div>

                        {/* Meta Info */}
                        {canteen.location && (
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-auto pt-3 border-t border-white/5">
                            <MapPin size={16} className="flex-shrink-0" />
                            <span className="truncate font-medium">{canteen.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Search className="mx-auto text-slate-500 mb-4" size={48} />
              <p className="text-slate-400 text-lg">
                No canteens found. Try a different search!
              </p>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
