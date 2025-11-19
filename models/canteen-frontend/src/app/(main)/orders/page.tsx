'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from '@/contexts/ToastContext';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { API_URL } from '@/lib/config';

type Order = {
  _id: string;
  orderNumber: string;
  canteen: {
    _id: string;
    name: string;
    image?: string;
  };
  items: {
    dish: {
      _id: string;
      name: string;
      price: number;
      image?: string;
    };
    quantity: number;
    specialInstructions?: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  deliveryType: string;
  createdAt: string;
  updatedAt: string;
};

export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const token = (session?.user as any)?.token;
  const { socket, isConnected } = useSocket();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery<{ success: boolean; orders: Order[] }>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      return response.json();
    },
    enabled: !!token,
  });

  // Listen for real-time order status updates
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('⚠️ Orders page: Socket not ready', { socket: !!socket, isConnected });
      return;
    }

    console.log('✅ Orders page: Listening for order:statusChanged events');

    const handleOrderStatusChanged = (data: any) => {
      console.log('📬 Order status changed:', data);
      
      // Show toast notification
      showToast(data.message || `Order #${data.orderNumber} status updated`, 'success');
      
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    };

    socket.on('order:statusChanged', handleOrderStatusChanged);

    return () => {
      socket.off('order:statusChanged', handleOrderStatusChanged);
    };
  }, [socket, isConnected, showToast, queryClient]);

  const orders = ordersData?.orders;

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
      confirmed: 'bg-blue-900/30 text-blue-300 border-blue-700',
      preparing: 'bg-purple-900/30 text-purple-300 border-purple-700',
      ready: 'bg-green-900/30 text-green-300 border-green-700',
      completed: 'bg-slate-900/30 text-slate-300 border-slate-700',
      cancelled: 'bg-red-900/30 text-red-300 border-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-slate-900/30 text-slate-300 border-slate-700';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: '⏳',
      confirmed: '✓',
      preparing: '👨‍🍳',
      ready: '🔔',
      completed: '✅',
      cancelled: '❌',
    };
    return icons[status as keyof typeof icons] || '📦';
  };

  const getTimeElapsed = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen py-12 ${themeClasses.background}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className={`mt-4 ${themeClasses.textSecondary}`}>Loading your orders...</p>
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
          <h1 className={`text-3xl font-black ${themeClasses.textPrimary}`}>My Orders</h1>
          <div className={`text-sm ${themeClasses.textSecondary}`}>
            {orders?.length || 0} order{orders?.length !== 1 ? 's' : ''}
          </div>
        </motion.div>

        <motion.div
          className="space-y-6"
          variants={animations.containerVariants}
          initial="hidden"
          animate="visible"
        >
          {orders?.map((order) => (
            <motion.div
              key={order._id}
              onClick={() => router.push(`/orders/${order._id}`)}
              className={`${themeClasses.card} overflow-hidden hover:border-blue-500 transition-all cursor-pointer`}
              variants={animations.itemVariants}
              whileHover={{ scale: 1.01, boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)' }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${themeClasses.textPrimary}`}>
                        {order.canteen.name}
                      </h3>
                      <span className={`text-sm ${themeClasses.textMuted}`}>
                        #{order.orderNumber}
                      </span>
                    </div>
                    <p className={`text-sm ${themeClasses.textMuted}`}>
                      {getTimeElapsed(order.createdAt)} • {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)} {order.status.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        {
                          pending: 'bg-yellow-900/30 text-yellow-300 border border-yellow-700',
                          completed: 'bg-green-900/30 text-green-300 border border-green-700',
                          failed: 'bg-red-900/30 text-red-300 border border-red-700',
                        }[order.paymentStatus]
                      }`}
                    >
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className={`border-t ${themeClasses.border} pt-4`}>
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item, index) => {
                      if (!item.dish || typeof item.dish === 'string') {
                        return (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${themeClasses.textPrimary}`}>{item.quantity}x</span>
                              <span className={`${themeClasses.textSecondary} italic`}>Dish unavailable</span>
                            </div>
                            <span className={themeClasses.textMuted}>-</span>
                          </div>
                        );
                      }
                      return (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${themeClasses.textPrimary}`}>{item.quantity}x</span>
                            <span className={themeClasses.textSecondary}>{item.dish.name}</span>
                          </div>
                          <span className={`font-medium ${themeClasses.textPrimary}`}>
                            ₹{item.dish.price * item.quantity}
                          </span>
                        </div>
                      );
                    })}
                    {order.items.length > 2 && (
                      <p className={`text-sm ${themeClasses.textMuted}`}>
                        +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-between mt-4 pt-4 border-t ${themeClasses.border}`}>
                  <div className={`flex items-center gap-4 text-sm ${themeClasses.textMuted}`}>
                    <span className="capitalize">{order.deliveryType}</span>
                    <span>•</span>
                    <span className="capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className={`text-lg font-bold ${themeClasses.textPrimary}`}>
                    Total: ₹{order.totalAmount}
                  </div>
                </div>
              </div>

              {/* Click hint */}
              <div className="bg-slate-800/50 px-6 py-3 border-t border-slate-700">
                <p className={`text-sm text-center ${themeClasses.textMuted}`}>
                  Click to view full details →
                </p>
              </div>
            </motion.div>
          ))}

          {orders?.length === 0 && (
            <div className={`text-center py-16 ${themeClasses.card} rounded-lg`}>
              <Package size={64} className="mx-auto mb-4 text-slate-600 opacity-60" />
              <h3 className={`text-xl font-semibold ${themeClasses.textPrimary} mb-2`}>No orders yet</h3>
              <p className={`${themeClasses.textSecondary} mb-6`}>Start ordering from your favorite canteens!</p>
              <button
                onClick={() => router.push('/canteens')}
                className={`${themeClasses.buttonPrimary} px-6 py-3 rounded-lg`}
              >
                Browse Canteens
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
