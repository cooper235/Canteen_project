'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from '@/contexts/ToastContext';

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
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
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
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      preparing: 'bg-purple-100 text-purple-800 border-purple-300',
      ready: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <div className="text-sm text-gray-600">
            {orders?.length || 0} order{orders?.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="space-y-6">
          {orders?.map((order) => (
            <div
              key={order._id}
              onClick={() => router.push(`/orders/${order._id}`)}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border border-gray-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.canteen.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        #{order.orderNumber}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
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
                          pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
                          completed: 'bg-green-50 text-green-700 border border-green-200',
                          failed: 'bg-red-50 text-red-700 border border-red-200',
                        }[order.paymentStatus]
                      }`}
                    >
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item, index) => {
                      // Safety check for populated dish data
                      if (!item.dish || typeof item.dish === 'string') {
                        return (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">{item.quantity}x</span>
                              <span className="text-gray-500 italic">Dish unavailable</span>
                            </div>
                            <span className="text-gray-500">-</span>
                          </div>
                        );
                      }
                      return (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">{item.quantity}x</span>
                            <span className="text-gray-600">{item.dish.name}</span>
                          </div>
                          <span className="text-gray-900 font-medium">
                            ₹{item.dish.price * item.quantity}
                          </span>
                        </div>
                      );
                    })}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-500">
                        +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="capitalize">{order.deliveryType}</span>
                    <span>•</span>
                    <span className="capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    Total: ₹{order.totalAmount}
                  </div>
                </div>
              </div>

              {/* Click hint */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Click to view full details →
                </p>
              </div>
            </div>
          ))}

          {orders?.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start ordering from your favorite canteens!</p>
              <button
                onClick={() => router.push('/canteens')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Canteens
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}