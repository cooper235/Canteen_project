'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { themeClasses, animations } from '@/lib/theme';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className={`min-h-screen py-12 ${themeClasses.background}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingCart size={64} className="mx-auto mb-4 text-slate-600 opacity-60" />
            <h1 className={`text-3xl font-black ${themeClasses.textPrimary}`}>Your Cart</h1>
            <p className={`mt-4 ${themeClasses.textSecondary}`}>Your cart is empty</p>
            <Link
              href="/canteens"
              className={`mt-6 inline-block ${themeClasses.buttonPrimary} px-6 py-3 rounded-lg`}
            >
              Browse Canteens
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 ${themeClasses.background}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className={`text-3xl font-black ${themeClasses.textPrimary}`}>Your Cart</h1>
          <button
            onClick={clearCart}
            className={`text-red-400 hover:text-red-300 text-sm font-medium transition`}
          >
            Clear Cart
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            variants={animations.containerVariants}
            initial="hidden"
            animate="visible"
          >
            {items.map((item) => (
              <motion.div
                key={item.dishId}
                className={`${themeClasses.card} p-6 flex items-center gap-4`}
                variants={animations.itemVariants}
                whileHover={{ scale: 1.01 }}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
                    {item.name}
                  </h3>
                  <p className={`text-sm ${themeClasses.textMuted}`}>{item.canteenName}</p>
                  <p className={`mt-1 font-semibold text-orange-400`}>
                    ₹{item.price}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2">
                  <motion.button
                    onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Minus size={16} className="text-slate-300" />
                  </motion.button>
                  <span className={`w-12 text-center font-semibold ${themeClasses.textPrimary}`}>
                    {item.quantity}
                  </span>
                  <motion.button
                    onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={16} className="text-slate-300" />
                  </motion.button>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${themeClasses.textPrimary}`}>
                    ₹{item.price * item.quantity}
                  </p>
                  <motion.button
                    onClick={() => removeItem(item.dishId)}
                    className="mt-2 text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Trash2 size={14} />
                    Remove
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Order Summary */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className={`${themeClasses.card} p-6 sticky top-4`}>
              <h2 className={`text-xl font-bold ${themeClasses.textPrimary} mb-4`}>
                Order Summary
              </h2>
              <div className="space-y-2 mb-4">
                <div className={`flex justify-between ${themeClasses.textMuted}`}>
                  <span>Subtotal</span>
                  <span>₹{getTotal()}</span>
                </div>
                <div className={`flex justify-between ${themeClasses.textMuted}`}>
                  <span>Delivery Fee</span>
                  <span>₹0</span>
                </div>
                <div className={`border-t ${themeClasses.border} pt-2 mt-2`}>
                  <div className={`flex justify-between text-lg font-bold ${themeClasses.textPrimary}`}>
                    <span>Total</span>
                    <span>₹{getTotal()}</span>
                  </div>
                </div>
              </div>
              <motion.button
                onClick={() => router.push('/checkout')}
                className={`w-full ${themeClasses.buttonPrimary} py-3 px-4 rounded-lg font-semibold transition-colors`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Proceed to Checkout
              </motion.button>
              <Link
                href="/canteens"
                className={`block text-center mt-4 text-orange-400 hover:text-orange-300 text-sm transition`}
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
