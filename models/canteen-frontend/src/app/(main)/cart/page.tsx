'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Sparkles } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/[0.05] backdrop-blur-lg border border-white/10 rounded-3xl p-12 max-w-md mx-auto shadow-2xl">
              <ShoppingCart size={80} className="mx-auto mb-6 text-orange-400/60" />
              <h1 className="text-4xl font-black text-white mb-4">Your Cart</h1>
              <p className="text-slate-400 mb-8 text-lg">Your cart is empty</p>
              <Link href="/canteens">
                <motion.button
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles size={20} />
                  Browse Canteens
                  <ArrowRight size={20} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              Your <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Cart</span>
            </h1>
            <p className="text-slate-400">
              {items.length} item{items.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/10"
          >
            <Trash2 size={16} />
            Clear Cart
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {items.map((item, index) => (
              <motion.div
                key={item.dishId}
                className="bg-white/[0.08] backdrop-blur-sm rounded-2xl border border-white/10 hover:border-orange-500/50 p-6 flex items-center gap-6 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                {/* Item Image */}
                {item.image && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-orange-500/20">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Item Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-2">{item.canteenName}</p>
                  <p className="font-bold text-orange-400 text-lg">
                    ₹{item.price}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 bg-slate-800/70 backdrop-blur rounded-xl p-2 border border-slate-700/50">
                  <motion.button
                    onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                    className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 rounded-lg transition shadow"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Minus size={18} className="text-white" />
                  </motion.button>
                  <span className="w-12 text-center font-bold text-white text-lg">
                    {item.quantity}
                  </span>
                  <motion.button
                    onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg transition shadow-lg shadow-orange-500/30"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={18} className="text-white" />
                  </motion.button>
                </div>

                {/* Total & Remove */}
                <div className="text-right">
                  <p className="text-xl font-black text-white mb-3">
                    ₹{item.price * item.quantity}
                  </p>
                  <motion.button
                    onClick={() => removeItem(item.dishId)}
                    className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition font-medium"
                    whileHover={{ scale: 1.1, x: 4 }}
                  >
                    <Trash2 size={14} />
                    Remove
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Order Summary - Sticky Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white/[0.08] backdrop-blur-xl rounded-3xl border border-white/10 p-8 sticky top-4 shadow-2xl shadow-orange-500/10">
              <h2 className="text-2xl font-black text-white mb-6">
                Order Summary
              </h2>

              {/* Summary Items */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{getTotal()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-green-400">FREE</span>
                </div>
                <div className="border-t border-slate-700/50 pt-4 mt-4">
                  <div className="flex justify-between text-xl font-black text-white">
                    <span>Total</span>
                    <span className="text-orange-400">₹{getTotal()}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                onClick={() => router.push('/checkout')}
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:via-orange-700 hover:to-amber-600 text-white font-bold py-4 px-6 rounded-xl shadow-xl shadow-orange-500/40 transition-all duration-300 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </motion.button>

              {/* Continue Shopping Link */}
              <Link
                href="/canteens"
                className="block text-center mt-4 text-orange-400 hover:text-orange-300 text-sm font-medium transition hover:underline"
              >
                ← Continue Shopping
              </Link>

              {/* Promo Badge */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                <p className="text-sm text-green-300 font-semibold flex items-center gap-2">
                  <Sparkles size={16} />
                  Free delivery on all orders!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
