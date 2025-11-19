'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useSocket } from '@/contexts/SocketContext';
import { motion } from 'framer-motion';
import { themeClasses, animations } from '@/lib/theme';

interface Order {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryType: string;
  student: {
    name: string;
    email: string;
  };
  items: Array<{
    dish: {
      name: string;
    } | string;
    quantity: number;
    price: number;
  }>;
}

interface Canteen {
  _id: string;
  name: string;
}

export default function ManageOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { socket, isConnected } = useSocket();
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  // Fetch orders for canteen
  const { data: ordersData, isLoading } = useQuery<{ success: boolean; orders: Order[] }>({
    queryKey: ['canteen-orders', canteen?._id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/orders/canteen/${canteen?._id}`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: !!session && !!canteen,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Listen for real-time order events
  useEffect(() => {
    if (!socket || !isConnected || !canteen) return;

    const handleOrderCreated = (data: any) => {
      console.log('New order received:', data);
      
      // Show toast notification
      showToast(data.message || `New order #${data.order.orderNumber} received!`, 'success');
      
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['canteen-orders', canteen._id] });
    };

    const handleOrderStatusChanged = (data: any) => {
      console.log('Order status changed:', data);
      
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['canteen-orders', canteen._id] });
    };

    socket.on('order:created', handleOrderCreated);
    socket.on('order:statusChanged', handleOrderStatusChanged);

    return () => {
      socket.off('order:created', handleOrderCreated);
      socket.off('order:statusChanged', handleOrderStatusChanged);
    };
  }, [socket, isConnected, canteen, showToast, queryClient]);

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both the specific canteen orders and all canteen-orders queries
      queryClient.invalidateQueries({ queryKey: ['canteen-orders', canteen?._id] });
      queryClient.invalidateQueries({ queryKey: ['canteen-orders'] });
      // Also invalidate analytics to update dashboard - use predicate to match all timeRanges
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'canteen-analytics' && 
          query.queryKey[1] === canteen?._id 
      });
      showToast('Order status updated successfully', 'success');
    },
    onError: () => {
      showToast('Failed to update order status', 'error');
    },
  });

  if (status === 'loading' || canteenLoading) {
    return (
      <div className={`min-h-screen py-12 ${themeClasses.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${themeClasses.textSecondary}`}>Loading orders...</p>
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

  const orders = ordersData?.orders || [];
  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50',
      confirmed: 'bg-blue-900/30 text-blue-300 border-blue-700/50',
      preparing: 'bg-purple-900/30 text-purple-300 border-purple-700/50',
      ready: 'bg-green-900/30 text-green-300 border-green-700/50',
      completed: 'bg-gray-700/50 text-gray-200 border-gray-600/50',
      cancelled: 'bg-red-900/30 text-red-300 border-red-700/50',
    };
    return colors[status] || 'bg-gray-700/50 text-gray-200';
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow: Record<string, string> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'completed',
    };
    return statusFlow[currentStatus] || null;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Confirm Order',
      confirmed: 'Start Preparing',
      preparing: 'Mark as Ready',
      ready: 'Mark Completed',
    };
    return labels[status] || 'Update Status';
  };

  const getTimeElapsed = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleStatusUpdate = (orderId: string, currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    if (nextStatus) {
      updateStatusMutation.mutate({ orderId, status: nextStatus });
    }
  };

  return (
    <div className={`min-h-screen py-8 ${themeClasses.background}`}>
      <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${themeClasses.textPrimary}`}>Manage Orders</h1>
          <p className={`mt-2 ${themeClasses.textSecondary}`}>{canteen?.name}</p>
        </div>

        {/* Status Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'pending', label: 'Pending' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'preparing', label: 'Preparing' },
            { key: 'ready', label: 'Ready' },
            { key: 'completed', label: 'Completed' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filterStatus === filter.key
                  ? `${themeClasses.buttonPrimary} text-white`
                  : `${themeClasses.card} ${themeClasses.textSecondary} hover:bg-slate-600/50 border border-slate-600/50`
              }`}
            >
              {filter.label}
              {filter.key !== 'all' && (
                <span className="ml-2 text-xs">
                  ({orders.filter(o => o.status === filter.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className={`mt-4 ${themeClasses.textSecondary}`}>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={`${themeClasses.card} rounded-lg shadow p-12 text-center border border-slate-600/50`}>
            <svg className={`mx-auto h-12 w-12 ${themeClasses.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className={`mt-4 ${themeClasses.textMuted} text-lg`}>No orders found</p>
            <p className={`text-sm ${themeClasses.textMuted} mt-2`}>
              {filterStatus === 'all' ? 'No orders yet' : `No ${filterStatus} orders`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${themeClasses.card} rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-slate-600/50`}
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-xl font-bold ${themeClasses.textPrimary}`}>
                        Order #{order.orderNumber}
                      </h3>
                      <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
                        {order.student.name} • {order.student.email}
                      </p>
                      <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                        {getTimeElapsed(order.createdAt)} • {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                      <p className={`text-2xl font-bold ${themeClasses.textPrimary} mt-2`}>₹{order.totalAmount}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className={`border-t border-slate-600/50 pt-4 mb-4`}>
                    <h4 className={`font-semibold ${themeClasses.textPrimary} mb-2`}>Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => {
                        const dish = typeof item.dish !== 'string' ? item.dish : null;
                        return (
                          <div key={index} className="flex justify-between text-sm">
                            <span className={themeClasses.textSecondary}>
                              {item.quantity}x {dish ? dish.name : 'Dish unavailable'}
                            </span>
                            <span className={`font-medium ${themeClasses.textPrimary}`}>₹{item.price * item.quantity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className={`border-t border-slate-600/50 pt-4 mb-4 grid grid-cols-2 gap-4 text-sm`}>
                    <div>
                      <span className={themeClasses.textSecondary}>Payment:</span>
                      <span className={`ml-2 font-medium ${themeClasses.textPrimary} uppercase`}>{order.paymentMethod}</span>
                      <span className={`ml-2 text-xs px-2 py-1 rounded ${
                        order.paymentStatus === 'paid' ? 'bg-green-900/30 text-green-300' : 'bg-yellow-900/30 text-yellow-300'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <span className={themeClasses.textSecondary}>Delivery:</span>
                      <span className={`ml-2 font-medium ${themeClasses.textPrimary} capitalize`}>{order.deliveryType}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div className={`border-t border-slate-600/50 pt-4 flex gap-3`}>
                      <button
                        onClick={() => handleStatusUpdate(order._id, order.status)}
                        disabled={updateStatusMutation.isPending}
                        className={`flex-1 ${themeClasses.buttonPrimary} text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {updateStatusMutation.isPending ? 'Updating...' : getStatusLabel(order.status)}
                      </button>
                      <button
                        onClick={() => router.push(`/orders/${order._id}`)}
                        className={`px-4 py-2 ${themeClasses.card} ${themeClasses.textSecondary} rounded-md hover:bg-slate-600/50 transition-colors font-medium border border-slate-600/50`}
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
