'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import {
  Menu,
  X,
  Home,
  ShoppingCart,
  BarChart3,
  User,
  LogOut,
  Bell,
  Settings,
  Zap,
} from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const { getItemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const itemCount = getItemCount();

  const menuVariants = {
    hidden: { opacity: 0, x: -300 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      x: -300,
      transition: { duration: 0.2 },
    },
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/canteens', label: 'Canteens', icon: Zap },
    { href: '/orders', label: 'Orders', icon: ShoppingCart },
  ];

  if (session?.user?.role === 'owner') {
    navLinks.push({ href: '/dashboard', label: 'Dashboard', icon: BarChart3 });
  }

  return (
    <nav className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="text-3xl font-black bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent tracking-tight">
              FoodHub
            </div>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <Icon size={18} />
                    <span className="font-medium text-sm tracking-wide">{link.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Icon with Badge */}
            <Link href="/cart">
              <motion.div
                className="relative p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-700/50 transition cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                onClick={() => setNotificationOpen(!notificationOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-slate-300 hover:text-white rounded-full hover:bg-slate-700/50 transition"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-700 bg-slate-900">
                      <p className="text-sm text-white font-semibold">Notifications</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 text-center text-slate-400 text-sm">
                        <p>No new notifications</p>
                        <p className="text-xs text-slate-500 mt-1">Check back later for updates</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Close notification dropdown when clicking elsewhere */}
            {notificationOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotificationOpen(false)}
              />
            )}

            {/* User Menu */}
            {session ? (
              <div className="relative">
                <motion.button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-sm font-bold">
                    {session.user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {session.user?.name || 'User'}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-700">
                        <p className="text-sm text-white font-semibold">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-slate-400">{session.user?.email}</p>
                      </div>

                      <div className="py-2">
                        <Link href="/profile">
                          <motion.div
                            className="px-4 py-3 flex items-center gap-3 text-slate-300 hover:text-orange-400 hover:bg-slate-700/50 cursor-pointer transition text-sm font-medium"
                            whileHover={{ x: 4 }}
                          >
                            <User size={16} />
                            <span>Profile</span>
                          </motion.div>
                        </Link>

                        <Link href="/settings">
                          <motion.div
                            className="px-4 py-3 flex items-center gap-3 text-slate-300 hover:text-orange-400 hover:bg-slate-700/50 cursor-pointer transition text-sm font-medium"
                            whileHover={{ x: 4 }}
                          >
                            <Settings size={16} />
                            <span>Settings</span>
                          </motion.div>
                        </Link>

                        <motion.button
                          onClick={() => signOut()}
                          className="w-full px-4 py-3 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-slate-700/50 cursor-pointer transition border-t border-slate-700 text-sm font-medium"
                          whileHover={{ x: 4 }}
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <motion.button
                    className="px-4 py-2 text-slate-300 hover:text-orange-400 font-medium text-sm transition"
                    whileHover={{ scale: 1.05 }}
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    className="px-6 py-2 bg-orange-600 text-white font-medium text-sm rounded-lg hover:bg-orange-700 transition shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700/50 transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden py-4 border-t border-slate-700"
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <motion.div
                      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition cursor-pointer"
                      whileHover={{ x: 8 }}
                    >
                      <Icon size={20} />
                      <span className="font-medium text-sm">{link.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
