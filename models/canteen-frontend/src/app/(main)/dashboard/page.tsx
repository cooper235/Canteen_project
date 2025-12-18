'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  ShoppingBag,
  Settings,
  TrendingUp,
  Activity,
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-slate-300 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user as any;

  const quickActions = [
    {
      href: '/canteens',
      icon: Store,
      title: 'Browse Canteens',
      description: 'Explore campus canteens',
      gradient: 'from-orange-500 to-amber-500',
      iconColor: 'text-orange-400',
    },
    {
      href: '/orders',
      icon: ShoppingBag,
      title: 'My Orders',
      description: 'View order history',
      gradient: 'from-green-500 to-emerald-500',
      iconColor: 'text-green-400',
    },
  ];

  if (user.role === 'canteen_owner') {
    quickActions.push({
      href: '/manage',
      icon: Settings,
      title: 'Manage Canteen',
      description: 'Update menu & settings',
      gradient: 'from-purple-500 to-pink-500',
      iconColor: 'text-purple-400',
    });
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            Dashboard
          </h1>
          <p className="text-slate-400">Welcome back to your food hub</p>
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 backdrop-blur-xl rounded-3xl border border-orange-500/20 p-8 shadow-2xl shadow-orange-500/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                  Welcome back, {user.name}!
                  <Sparkles className="text-amber-400" size={24} />
                </h2>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold">
                    {user.role === 'canteen_owner' ? '🏪 Canteen Owner' : '🎓 Student'}
                  </span>
                  <span className="text-slate-400">{user.email}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-orange-400" size={28} />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                >
                  <Link href={action.href}>
                    <motion.div
                      className="bg-white/[0.08] backdrop-blur-xl rounded-2xl border border-white/10 hover:border-orange-500/50 p-6 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer group"
                      whileHover={{ scale: 1.03, y: -8 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon size={28} className="text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition">
                        {action.title}
                      </h4>
                      <p className="text-sm text-slate-400">
                        {action.description}
                      </p>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="text-orange-400" size={28} />
            Recent Activity
          </h3>
          <div className="bg-white/[0.08] backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl text-center">
            <div className="text-slate-500 mb-2">
              <Activity size={48} className="mx-auto opacity-40" />
            </div>
            <p className="text-slate-400 font-medium">No recent activity to display</p>
            <p className="text-sm text-slate-500 mt-2">
              Start browsing canteens to see your activity here
            </p>
            <Link href="/canteens">
              <motion.button
                className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/30 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Canteens
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
