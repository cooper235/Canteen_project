'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from '@/contexts/ToastContext';
import { motion } from 'framer-motion';
import { themeClasses, animations } from '@/lib/theme';

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  averageRating: number;
  totalReviews: number;
  popularDishes: Array<{
    _id: string;
    count: number;
    revenue: number;
    dishInfo: Array<{ name: string; price: number; image?: string }>;
  }>;
  statusBreakdown: Array<{
    _id: string;
    count: number;
  }>;
}

interface Canteen {
  _id: string;
  name: string;
  location: string;
}

export default function CanteenDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const { socket, isConnected } = useSocket();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch canteen owner's canteen
  const { data: canteenData, isLoading: canteenLoading } = useQuery<{ success: boolean; canteens: Canteen[] }>({
    queryKey: ['my-canteens'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/canteens/owner/my-canteens', {
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch canteens');
      return response.json();
    },
    enabled: !!session,
  });

  const canteen = canteenData?.canteens?.[0];

  // Fetch analytics
  const { data: analyticsData, isLoading, refetch } = useQuery<{ success: boolean; analytics: Analytics }>({
    queryKey: ['canteen-analytics', canteen?._id, timeRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (timeRange === '7d') {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        params.append('startDate', date.toISOString());
      } else if (timeRange === '30d') {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        params.append('startDate', date.toISOString());
      }

      const response = await fetch(
        `http://localhost:5000/api/analytics/canteen/${canteen?._id}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${session?.user?.token}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: !!session && !!canteen,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  // Listen for real-time order events
  useEffect(() => {
    if (!socket || !isConnected || !canteen) return;

    const handleOrderCreated = (data: any) => {
      console.log('New order received:', data);
      
      // Show toast notification
      showToast(data.message || `New order #${data.order.orderNumber} received!`, 'success');
      
      // Invalidate analytics and refetch
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'canteen-analytics' && 
          query.queryKey[1] === canteen._id 
      });
    };

    const handleOrderStatusChanged = (data: any) => {
      console.log('Order status changed:', data);
      
      // Invalidate analytics and refetch
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'canteen-analytics' && 
          query.queryKey[1] === canteen._id 
      });
    };

    socket.on('order:created', handleOrderCreated);
    socket.on('order:statusChanged', handleOrderStatusChanged);

    return () => {
      socket.off('order:created', handleOrderCreated);
      socket.off('order:statusChanged', handleOrderStatusChanged);
    };
  }, [socket, isConnected, canteen, showToast, queryClient]);

  if (status === 'loading' || canteenLoading) {
    return (
      <div className={`min-h-screen py-12 ${themeClasses.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${themeClasses.textSecondary}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'canteen_owner') {
    router.push('/');
    return null;
  }

  if (!canteen) {
    return (
      <div className={`min-h-screen py-12 ${themeClasses.background} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary}`}>No Canteen Found</h1>
          <p className={`mt-4 ${themeClasses.textMuted}`}>You don't have a canteen yet. Please create one first.</p>
          <button
            onClick={() => router.push('/manage/canteen')}
            className={`mt-6 ${themeClasses.buttonPrimary} text-white px-6 py-3 rounded-md hover:opacity-90`}
          >
            Create Canteen
          </button>
        </div>
      </div>
    );
  }

  const analytics = analyticsData?.analytics;
  const statusBreakdown = analytics?.statusBreakdown || [];

  const getStatusCount = (status: string) => {
    return statusBreakdown.find(s => s._id === status)?.count || 0;
  };

  return (
    <div className={`min-h-screen py-8 ${themeClasses.background}`}>
      <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${themeClasses.textPrimary}`}>Dashboard</h1>
            <p className={`mt-2 ${themeClasses.textSecondary}`}>{canteen.name} - {canteen.location}</p>
          </div>
          <button
            onClick={() => refetch()}
            className={`flex items-center gap-2 px-4 py-2 ${themeClasses.card} border border-slate-600/50 ${themeClasses.textSecondary} rounded-md hover:bg-slate-600/50 transition-colors`}
            disabled={isLoading}
          >
            <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Time Range Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              timeRange === '7d'
                ? `${themeClasses.buttonPrimary} text-white`
                : `${themeClasses.card} ${themeClasses.textSecondary} hover:bg-slate-600/50 border border-slate-600/50`
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              timeRange === '30d'
                ? `${themeClasses.buttonPrimary} text-white`
                : `${themeClasses.card} ${themeClasses.textSecondary} hover:bg-slate-600/50 border border-slate-600/50`
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              timeRange === 'all'
                ? `${themeClasses.buttonPrimary} text-white`
                : `${themeClasses.card} ${themeClasses.textSecondary} hover:bg-slate-600/50 border border-slate-600/50`
            }`}
          >
            All Time
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Orders */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${themeClasses.card} rounded-lg shadow-lg p-6 border border-slate-600/50`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Total Orders</p>
                    <p className={`text-3xl font-bold ${themeClasses.textPrimary} mt-2`}>{analytics?.totalOrders || 0}</p>
                  </div>
                  <div className="bg-blue-900/30 rounded-full p-3">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Revenue */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`${themeClasses.card} rounded-lg shadow-lg p-6 border border-slate-600/50`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Total Revenue</p>
                    <p className={`text-3xl font-bold ${themeClasses.textPrimary} mt-2`}>₹{analytics?.totalRevenue || 0}</p>
                  </div>
                  <div className="bg-green-900/30 rounded-full p-3">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Completed Orders */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${themeClasses.card} rounded-lg shadow-lg p-6 border border-slate-600/50`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Completed</p>
                    <p className={`text-3xl font-bold ${themeClasses.textPrimary} mt-2`}>{analytics?.completedOrders || 0}</p>
                  </div>
                  <div className="bg-purple-900/30 rounded-full p-3">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Average Rating */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`${themeClasses.card} rounded-lg shadow-lg p-6 border border-slate-600/50`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Average Rating</p>
                    <p className={`text-3xl font-bold ${themeClasses.textPrimary} mt-2`}>
                      {analytics?.averageRating?.toFixed(1) || '0.0'} ⭐
                    </p>
                    <p className={`text-xs ${themeClasses.textMuted} mt-1`}>{analytics?.totalReviews || 0} reviews</p>
                  </div>
                  <div className="bg-yellow-900/30 rounded-full p-3">
                    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`${themeClasses.card} rounded-lg shadow-lg p-6 border border-slate-600/50`}>
                <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Order Status</h3>
                <div className="space-y-3">
                  {[
                    { key: 'pending', label: 'Pending', color: '#eab308' },
                    { key: 'confirmed', label: 'Confirmed', color: '#3b82f6' },
                    { key: 'preparing', label: 'Preparing', color: '#a855f7' },
                    { key: 'ready', label: 'Ready for Pickup', color: '#22c55e' },
                    { key: 'completed', label: 'Completed', color: '#6b7280' },
                    { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
                  ].map((status) => {
                    const count = getStatusCount(status.key);
                    const percentage = analytics?.totalOrders
                      ? (count / analytics.totalOrders) * 100
                      : 0;

                    return (
                      <div key={status.key}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>{status.label}</span>
                          <span className={`text-sm font-semibold ${themeClasses.textPrimary}`}>{count}</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%`, backgroundColor: status.color }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Popular Dishes */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`${themeClasses.card} rounded-lg shadow-lg p-6 border border-slate-600/50`}>
                <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Popular Dishes</h3>
                {analytics?.popularDishes && analytics.popularDishes.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.popularDishes.slice(0, 5).map((dish, index) => (
                      <div key={dish._id} className={`flex items-center justify-between py-2 border-b border-slate-600/50 last:border-b-0`}>
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-bold ${themeClasses.textMuted}`}>#{index + 1}</span>
                          <div>
                            <p className={`font-medium ${themeClasses.textPrimary}`}>{dish.dishInfo[0]?.name || 'Unknown'}</p>
                            <p className={`text-xs ${themeClasses.textMuted}`}>{dish.count} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${themeClasses.textPrimary}`}>₹{dish.revenue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`${themeClasses.textMuted} text-center py-8`}>No data available</p>
                )}
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${themeClasses.card} rounded-lg shadow-lg p-6 border border-slate-600/50`}>
              <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4`}>Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/manage/orders')}
                  className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Manage Orders
                </button>
                <button
                  onClick={() => router.push('/manage/menu')}
                  className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Manage Menu
                </button>
                <button
                  onClick={() => router.push('/manage/canteen')}
                  className="flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-lg transition-colors font-medium shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Canteen Settings
                </button>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
