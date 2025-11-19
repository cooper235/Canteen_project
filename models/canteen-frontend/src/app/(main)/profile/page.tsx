'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ShoppingBag, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { API_URL } from '@/lib/config';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  canteen: {
    name: string;
  };
}

interface UserStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'stats'>('info');

  // Fetch user's orders
  const { data: ordersData } = useQuery<{ success: boolean; orders: Order[] }>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: !!session,
  });

  if (status === 'loading') {
    return (
      <div className={`min-h-screen py-12 flex items-center justify-center ${themeClasses.background}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${themeClasses.textSecondary}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const orders = ordersData?.orders || [];
  
  // Calculate stats
  const stats: UserStats = {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    pendingOrders: orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length,
    totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
      confirmed: 'bg-blue-900/30 text-blue-300 border-blue-700',
      preparing: 'bg-purple-900/30 text-purple-300 border-purple-700',
      ready: 'bg-green-900/30 text-green-300 border-green-700',
      completed: 'bg-slate-900/30 text-slate-300 border-slate-700',
      cancelled: 'bg-red-900/30 text-red-300 border-red-700',
    };
    return colors[status] || 'bg-slate-900/30 text-slate-300 border-slate-700';
  };

  return (
    <div className={`min-h-screen py-12 ${themeClasses.background}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${themeClasses.card} overflow-hidden mb-6`}
        >
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-16 mb-4">
              <div className={`${themeClasses.card} rounded-full p-2`}>
                <div className="w-28 h-28 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-blue-400">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-6 mb-2">
                <h1 className={`text-3xl font-black ${themeClasses.textPrimary}`}>{session.user.name}</h1>
                <p className={themeClasses.textSecondary}>{session.user.email}</p>
                <span className={`inline-block mt-2 px-3 py-1 bg-blue-900/30 text-blue-300 text-sm font-semibold rounded-full capitalize border border-blue-700`}>
                  {session.user.role}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
          variants={animations.containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={animations.itemVariants} className={`${themeClasses.card} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeClasses.textMuted}`}>Total Orders</p>
                <p className={`text-3xl font-bold ${themeClasses.textPrimary} mt-2`}>{stats.totalOrders}</p>
              </div>
              <ShoppingBag size={32} className="text-blue-400 opacity-60" />
            </div>
          </motion.div>

          <motion.div variants={animations.itemVariants} className={`${themeClasses.card} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeClasses.textMuted}`}>Completed</p>
                <p className={`text-3xl font-bold ${themeClasses.textPrimary} mt-2`}>{stats.completedOrders}</p>
              </div>
              <CheckCircle size={32} className="text-green-400 opacity-60" />
            </div>
          </motion.div>

          <motion.div variants={animations.itemVariants} className={`${themeClasses.card} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeClasses.textMuted}`}>Pending</p>
                <p className={`text-3xl font-bold ${themeClasses.textPrimary} mt-2`}>{stats.pendingOrders}</p>
              </div>
              <Clock size={32} className="text-yellow-400 opacity-60" />
            </div>
          </motion.div>

          <motion.div variants={animations.itemVariants} className={`${themeClasses.card} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeClasses.textMuted}`}>Total Spent</p>
                <p className={`text-3xl font-bold ${themeClasses.textPrimary} mt-2`}>₹{stats.totalSpent}</p>
              </div>
              <TrendingUp size={32} className="text-purple-400 opacity-60" />
            </div>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${themeClasses.card} overflow-hidden`}
        >
          <div className={`border-b ${themeClasses.border}`}>
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-400'
                    : `border-transparent ${themeClasses.textSecondary} hover:text-blue-300`
                }`}
              >
                Account Info
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-400'
                    : `border-transparent ${themeClasses.textSecondary} hover:text-blue-300`
                }`}
              >
                Recent Orders
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-400'
                    : `border-transparent ${themeClasses.textSecondary} hover:text-blue-300`
                }`}
              >
                Statistics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Account Info Tab */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Full Name</label>
                      <p className={`${themeClasses.textPrimary} bg-slate-800/50 px-4 py-3 rounded-md`}>{session.user.name}</p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Email Address</label>
                      <p className={`${themeClasses.textPrimary} bg-slate-800/50 px-4 py-3 rounded-md`}>{session.user.email}</p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Account Type</label>
                      <p className={`${themeClasses.textPrimary} bg-slate-800/50 px-4 py-3 rounded-md capitalize`}>{session.user.role}</p>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>User ID</label>
                      <p className={`${themeClasses.textPrimary} bg-slate-800/50 px-4 py-3 rounded-md font-mono text-sm`}>{session.user.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Recent Orders</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={48} className="mx-auto text-slate-600 opacity-60" />
                    <p className={`mt-4 ${themeClasses.textSecondary}`}>No orders yet</p>
                    <button
                      onClick={() => router.push('/canteens')}
                      className={`mt-4 inline-block ${themeClasses.buttonPrimary} px-6 py-2 rounded-md`}
                    >
                      Browse Canteens
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <motion.div
                        key={order._id}
                        onClick={() => router.push(`/orders/${order._id}`)}
                        className={`${themeClasses.border} border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-500`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-semibold ${themeClasses.textPrimary}`}>Order #{order.orderNumber}</p>
                            <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>{order.canteen.name}</p>
                            <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                              {new Date(order.createdAt).toLocaleDateString()} at{' '}
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                              {order.status.toUpperCase()}
                            </span>
                            <p className={`text-lg font-bold ${themeClasses.textPrimary} mt-2`}>₹{order.totalAmount}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {orders.length > 5 && (
                      <button
                        onClick={() => router.push('/orders')}
                        className={`w-full text-center py-3 text-blue-400 hover:text-blue-300 font-medium`}
                      >
                        View All Orders →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div>
                <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Order Statistics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${themeClasses.textMuted}`}>Completed Orders</span>
                      <span className={`text-sm font-semibold ${themeClasses.textPrimary}`}>
                        {stats.completedOrders} / {stats.totalOrders}
                      </span>
                    </div>
                    <div className={`w-full bg-slate-700 rounded-full h-3`}>
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${stats.totalOrders ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm font-medium ${themeClasses.textMuted}`}>Pending Orders</span>
                      <span className={`text-sm font-semibold ${themeClasses.textPrimary}`}>
                        {stats.pendingOrders} / {stats.totalOrders}
                      </span>
                    </div>
                    <div className={`w-full bg-slate-700 rounded-full h-3`}>
                      <div
                        className="bg-yellow-500 h-3 rounded-full transition-all"
                        style={{ width: `${stats.totalOrders ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className={`pt-4 border-t ${themeClasses.border}`}>
                    <h4 className={`font-medium ${themeClasses.textPrimary} mb-3`}>Spending Overview</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={`text-sm ${themeClasses.textSecondary}`}>Total Spent</span>
                        <span className={`text-sm font-semibold ${themeClasses.textPrimary}`}>₹{stats.totalSpent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${themeClasses.textSecondary}`}>Average Order Value</span>
                        <span className={`text-sm font-semibold ${themeClasses.textPrimary}`}>
                          ₹{stats.totalOrders ? Math.round(stats.totalSpent / stats.totalOrders) : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
