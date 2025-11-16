'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Heart, Eye, Share2 } from 'lucide-react';
import Link from 'next/link';

interface CanteenCardProps {
  id: string;
  name: string;
  description: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  deliveryTime?: number;
  minOrder?: number;
  deliveryFee?: number;
  tags?: string[];
  isOpen?: boolean;
  featured?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const hoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.08, y: -8, transition: { duration: 0.3 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export default function CanteenCard({
  id,
  name,
  description,
  image,
  rating = 4.5,
  reviewCount = 0,
  location,
  deliveryTime = 30,
  minOrder = 100,
  deliveryFee = 0,
  tags = [],
  isOpen = true,
  featured = false,
}: CanteenCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      initial="rest"
      animate="rest"
      variants={hoverVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group h-full"
    >
      <Link href={`/canteens/${id}`}>
        <div className={`bg-slate-800/40 backdrop-blur rounded-2xl overflow-hidden border transition-all cursor-pointer ${
          featured
            ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20'
            : 'border-slate-700/50 hover:border-blue-500/50'
        } h-full flex flex-col`}>
          {/* Image Container */}
          <div className="relative h-56 bg-gradient-to-br from-blue-600/20 to-purple-600/20 overflow-hidden">
            {image ? (
              <motion.img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">🍽️</span>
              </div>
            )}

            {/* Overlay with Actions */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate={isHovered ? 'visible' : 'hidden'}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-between p-4"
            >
              <div className="flex justify-between">
                {featured && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"
                  >
                    ⭐ Featured
                  </motion.span>
                )}
                <div className="flex gap-2 ml-auto">
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsFavorite(!isFavorite);
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-white/20 backdrop-blur p-2 rounded-full hover:bg-white/40 transition"
                  >
                    <Heart
                      size={20}
                      className={isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-white/20 backdrop-blur p-2 rounded-full hover:bg-white/40 transition"
                  >
                    <Share2 size={20} className="text-white" />
                  </motion.button>
                </div>
              </div>
              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                View Menu
              </motion.button>
            </motion.div>

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              {isOpen ? (
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold"
                >
                  🟢 Open
                </motion.span>
              ) : (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Closed
                </span>
              )}
            </div>

            {/* Rating Badge */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-2 rounded-lg flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400" fill="currentColor" />
                <span className="font-bold text-white">{rating.toFixed(1)}</span>
              </div>
              {reviewCount > 0 && (
                <span className="text-xs text-slate-300">({reviewCount})</span>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 flex-1 flex flex-col">
            {/* Title and Description */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition">
                {name}
              </h3>
              <p className="text-sm text-slate-400 line-clamp-2">{description}</p>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.slice(0, 3).map((tag, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-2 py-1 bg-slate-700/50 text-xs text-slate-300 rounded-full"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="space-y-2 py-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={16} />
                  <span>{deliveryTime} mins</span>
                </div>
                {deliveryFee === 0 ? (
                  <span className="text-green-400 font-semibold text-xs">Free delivery</span>
                ) : (
                  <span className="text-slate-400 text-xs">₹{deliveryFee} delivery</span>
                )}
              </div>

              {location && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin size={16} />
                  <span className="truncate">{location}</span>
                </div>
              )}

              {minOrder > 0 && (
                <div className="text-xs text-slate-500">
                  Min order: ₹{minOrder}
                </div>
              )}
            </div>

            {/* Footer Action */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-auto pt-4 border-t border-slate-700/50"
            >
              <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center gap-2 group">
                <Eye size={16} className="group-hover:block hidden" />
                Explore
              </button>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
