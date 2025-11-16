'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, Zap, TrendingUp } from 'lucide-react';

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
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const cardHoverVariants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -8, scale: 1.02 },
};

export default function RecommendationsSection() {
  const { data: session, status } = useSession();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

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

        const response = await fetch(
          `http://localhost:5000/api/ml/recommendations/user/${userEmail}?limit=6`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        console.log('Recommendations response:', data);

        if (data.success && data.recommendations) {
          const recs = data.recommendations;
          console.log('Got recommendations:', recs);
          setRecommendations(recs);

          const dishPromises = recs.map(async (rec: Recommendation) => {
            try {
              console.log(`Fetching dish ${rec.dish_id}...`);
              const dishResponse = await fetch(
                `http://localhost:5000/api/dishes/${rec.dish_id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );
              console.log(`Dish ${rec.dish_id} response status:`, dishResponse.status);

              if (dishResponse.ok) {
                const dishData = await dishResponse.json();
                console.log(`Dish ${rec.dish_id} data:`, dishData);
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur rounded-2xl border border-slate-600/50 p-8 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Zap className="text-yellow-400" size={28} />
          <h2 className="text-2xl font-black text-white">AI Recommendations</h2>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              className="w-80 flex-shrink-0"
              animate={{ opacity: 0.5, scale: 0.95 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
            >
              <div className="bg-slate-600/50 h-48 rounded-xl mb-3"></div>
              <div className="bg-slate-600/50 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-slate-600/50 h-4 rounded w-1/2"></div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (dishes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur rounded-2xl border border-purple-500/30 p-8 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Zap className="text-purple-400" size={28} />
          <div>
            <h2 className="text-2xl font-black text-white">AI Recommendations</h2>
            <p className="text-sm text-slate-300">Personalized just for you</p>
          </div>
        </div>
        <p className="text-slate-400">
          Start ordering your favorite dishes to unlock AI-powered recommendations!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="bg-gradient-to-r from-slate-700/40 to-slate-800/40 backdrop-blur rounded-2xl border border-slate-600/50 p-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-50"
              />
              <div className="relative bg-slate-900 p-3 rounded-full">
                <Zap className="text-yellow-400" size={24} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white flex items-center gap-2">
                AI-Powered Picks
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Recommendations based on your taste preferences
              </p>
            </div>
          </div>
          <motion.div
            className="hidden sm:flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <TrendingUp size={16} className="text-yellow-400" />
            <span className="text-xs font-bold text-yellow-300">ML Powered</span>
          </motion.div>
        </motion.div>

        {/* Recommendations Grid */}
        <motion.div
          className="flex space-x-4 overflow-x-auto pb-4 -mx-8 px-8 snap-x snap-mandatory"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {dishes.map((dish, idx) => {
            const rec = recommendations.find(r => r.dish_id === dish._id);

            if (!dish || !dish.canteen) {
              return null;
            }

            return (
              <motion.div
                key={dish._id}
                variants={itemVariants}
                className="w-80 flex-shrink-0 snap-start group"
              >
                <Link href={`/canteens/${dish.canteen._id || dish.canteen}`}>
                  <motion.div
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                    variants={cardHoverVariants}
                    className="h-full bg-slate-800/60 backdrop-blur rounded-xl overflow-hidden border border-slate-700/50 group-hover:border-blue-500/50 transition-colors duration-300 flex flex-col shadow-lg hover:shadow-2xl"
                  >
                    {/* Image Section */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-500/30 to-purple-500/30 overflow-hidden">
                      {dish.image ? (
                        <motion.img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.15 }}
                          transition={{ duration: 0.5 }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          🍽️
                        </div>
                      )}

                      {/* Match Score Badge */}
                      {rec && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-3 py-1.5 rounded-full font-bold text-sm flex items-center gap-1 shadow-lg"
                        >
                          <Star size={14} fill="currentColor" />
                          {Math.round((rec.score || 0.5) * 100)}%
                        </motion.div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-slate-200">
                        {dish.category}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Title and Canteen */}
                      <div className="mb-3">
                        <h3 className="font-bold text-lg text-white mb-1 line-clamp-2 group-hover:text-blue-300 transition">
                          {dish.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {typeof dish.canteen === 'object' ? dish.canteen.name : 'Canteen'}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2 flex-1">
                        {dish.description}
                      </p>

                      {/* Recommendation Reason */}
                      {rec && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="mb-4 p-2.5 bg-slate-700/50 rounded-lg border border-slate-600/50"
                        >
                          <p className="text-xs text-purple-300 flex items-start gap-2">
                            <Zap size={14} className="flex-shrink-0 mt-0.5" />
                            <span>{rec.reason}</span>
                          </p>
                        </motion.div>
                      )}

                      {/* Price and Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        <span className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                          ₹{dish.price}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition"
                        >
                          View
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}
