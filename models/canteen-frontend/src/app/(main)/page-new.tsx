'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Zap, Heart, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import RecommendationsSection from '@/components/RecommendationsSection';

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
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.05,
    y: -10,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export default function HomePage() {
  const { data: session } = useSession();
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [filteredCanteens, setFilteredCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'nearby' | 'trending'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [surpriseCanteen, setSurpriseCanteen] = useState<Canteen | null>(null);
  const [showSurprise, setShowSurprise] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section with Full-Bleed Image */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-96 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/80 to-amber-600/80 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1555939594-58d7cb561620?w=1200&q=80')`,
            backgroundPosition: 'center',
          }}
        />

        {/* Hero Content */}
        <motion.div
          className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-lg"
            variants={itemVariants}
          >
            Discover Your Next
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Favorite Meal
            </span>
          </motion.h1>
          <motion.p
            className="text-xl text-white/90 mb-8 max-w-2xl drop-shadow"
            variants={itemVariants}
          >
            AI-powered recommendations tailored just for you
          </motion.p>

          {/* Surprise Me Button */}
          <motion.button
            onClick={handleSurpriseMe}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full flex items-center gap-2 hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            variants={itemVariants}
          >
            <Sparkles size={20} />
            Surprise Me! AI Pick
          </motion.button>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
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

        {/* Search & Filter Section */}
        <motion.section
          className="mt-16 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-6">
              Explore All Canteens
            </h2>

            {/* Search Bar */}
            <motion.div
              className="relative mb-6"
              variants={itemVariants}
            >
              <Search className="absolute left-4 top-4 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search canteens, cuisines, dishes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3 rounded-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
              className="flex gap-3"
              variants={itemVariants}
            >
              {(['all', 'trending', 'nearby'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full font-semibold capitalize transition-all ${
                    activeFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {filter === 'all' ? '✨ All' : filter === 'trending' ? '🔥 Trending' : '📍 Nearby'}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Canteen Grid */}
          {loading ? (
            <div className="text-center py-12">
              <motion.div
                className="inline-block"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="text-blue-500" size={40} />
              </motion.div>
              <p className="text-slate-400 mt-4">Loading delicious canteens...</p>
            </div>
          ) : filteredCanteens.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCanteens.map(canteen => (
                <motion.div
                  key={canteen._id}
                  variants={itemVariants}
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                  variants={cardHoverVariants}
                  className="group"
                >
                  <Link href={`/canteens/${canteen._id}`}>
                    <div className="bg-slate-700/50 rounded-xl overflow-hidden border border-slate-600 hover:border-blue-500 transition-colors cursor-pointer h-full flex flex-col">
                      {/* Image Section */}
                      <div className="relative h-48 bg-gradient-to-br from-orange-500 to-amber-600 overflow-hidden">
                        {canteen.image ? (
                          <img
                            src={canteen.image}
                            alt={canteen.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl">
                            🍽️
                          </div>
                        )}

                        {/* Favorite Button */}
                        <motion.button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(canteen._id);
                          }}
                          className="absolute top-4 right-4 bg-white/20 backdrop-blur p-2 rounded-full hover:bg-white/40 transition"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart
                            size={20}
                            className={`${
                              favorites.includes(canteen._id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-white'
                            }`}
                          />
                        </motion.button>

                        {/* Rating Badge */}
                        {canteen.rating && (
                          <div className="absolute bottom-4 left-4 bg-yellow-400 text-slate-900 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                            <Star size={16} fill="currentColor" />
                            {canteen.rating.toFixed(1)}
                          </div>
                        )}
                      </div>

                      {/* Info Section */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-2">
                          {canteen.name}
                        </h3>
                        <p className="text-sm text-slate-300 mb-4 line-clamp-2 flex-1">
                          {canteen.description}
                        </p>

                        {/* Meta Info */}
                        <div className="flex gap-4 text-sm text-slate-400 pt-4 border-t border-slate-600">
                          {canteen.deliveryTime && (
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              <span>{canteen.deliveryTime} min</span>
                            </div>
                          )}
                          {canteen.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={16} />
                              <span className="truncate">{canteen.location}</span>
                            </div>
                          )}
                        </div>
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
