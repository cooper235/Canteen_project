'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function FloatingCartButton() {
  const { items } = useCart();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Show button when there are items
  useEffect(() => {
    setIsVisible(totalItems > 0);
  }, [totalItems]);

  // Pulse animation when item is added
  useEffect(() => {
    if (totalItems > 0) {
      setJustAdded(true);
      const timer = setTimeout(() => setJustAdded(false), 600);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={() => router.push('/cart')}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-full shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70 transition-all group"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: justAdded ? 1.1 : 1,
            opacity: 1
          }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          <div className="relative">
            <ShoppingCart size={28} className="group-hover:scale-110 transition-transform" />
            
            {/* Badge */}
            <motion.div
              className="absolute -top-2 -right-2 bg-white text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={totalItems}
            >
              {totalItems}
            </motion.div>
          </div>
          
          {/* Ripple Effect */}
          {justAdded && (
            <motion.div
              className="absolute inset-0 bg-white rounded-full"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
