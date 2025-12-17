'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

type Order = {
  _id: string;
  orderNumber: string;
  student: {
    name: string;
    email: string;
  };
  canteen: {
    _id: string;
    name: string;
    location?: string;
  };
  items: Array<{
    dish: {
      _id: string;
      name: string;
      price: number;
    } | string;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: string;
  paymentMethod: string;
  deliveryType: string;
  specialRequests?: string;
  createdAt: string;
  estimatedTime?: string;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { data: session } = useSession();

  const { data, isLoading, error } = useQuery<{ success: boolean; order: Order }>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      
      return response.json();
    },
    enabled: !!session,
  });

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📋' },
    { key: 'confirmed', label: 'Confirmed', icon: '✓' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'ready', label: 'Ready', icon: '🔔' },
    { key: 'completed', label: 'Completed', icon: '✅' },
  ];

  const getCurrentStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex(step => step.key === status);
  };

  const getTimeElapsed = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  };

  const getEstimatedTime = (status: string, createdAt: string) => {
    if (status === 'completed' || status === 'cancelled') return null;
    
    const created = new Date(createdAt);
    const estimatedMinutes = {
      pending: 5,
      confirmed: 20,
      preparing: 15,
      ready: 5,
    };
    
    const minutes = estimatedMinutes[status as keyof typeof estimatedMinutes] || 10;
    const estimatedTime = new Date(created.getTime() + minutes * 60000);
    
    return estimatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Order Not Found</h1>
            <p className="mt-4 text-gray-400">This order doesn't exist or you don't have access to it</p>
            <button
              onClick={() => router.push('/orders')}
              className="mt-6 inline-block bg-gradient-to-r from-orange-600 to-amber-500 text-white px-6 py-3 rounded-md hover:from-orange-700 hover:to-amber-600"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const order = data.order;
  const currentStepIndex = getCurrentStepIndex(order.status);
  const estimatedTime = getEstimatedTime(order.status, order.createdAt);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    preparing: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    ready: 'bg-green-500/20 text-green-300 border-green-500/50',
    completed: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
    cancelled: 'bg-red-500/20 text-red-300 border-red-500/50',
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/orders')}
          className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <span className="mr-2">←</span> Back to Orders
        </button>

        {/* Success Banner (only for first time view) */}
        <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 rounded-lg p-6 mb-6 text-center backdrop-blur-sm">
          <div className="text-orange-400 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-300">
            Your order has been received and is being processed
          </p>
        </div>

        {/* Order Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl rounded-lg overflow-hidden mb-6 border border-slate-700">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Order #{order.orderNumber}
                </h2>
                <p className="text-gray-400">
                  {getTimeElapsed(order.createdAt)} • {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full font-semibold border-2 ${statusColors[order.status]}`}>
                {order.status.toUpperCase()}
              </span>
            </div>

            {/* Estimated Time */}
            {estimatedTime && order.status !== 'completed' && order.status !== 'cancelled' && (
              <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 mb-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⏱️</span>
                  <div>
                    <p className="font-semibold text-white">Estimated Ready Time</p>
                    <p className="text-orange-300 text-lg">{estimatedTime}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            {order.status !== 'cancelled' && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-6">Order Progress</h3>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 right-0 h-1 bg-slate-700 rounded">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-500 rounded"
                      style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (statusSteps.length - 1)) * 100 : 0}%` }}
                    ></div>
                  </div>

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      
                      return (
                        <div key={step.key} className="flex flex-col items-center z-10">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 transition-all ${
                              isCompleted
                                ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/50'
                                : 'bg-slate-700 border-slate-600 text-gray-500'
                            } ${isCurrent ? 'ring-4 ring-orange-500/30 scale-110' : ''}`}
                          >
                            {step.icon}
                          </div>
                          <p className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                            isCompleted ? 'text-white' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled Status */}
            {order.status === 'cancelled' && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mt-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">❌</span>
                  <div>
                    <p className="font-semibold text-white">Order Cancelled</p>
                    <p className="text-red-300 text-sm">This order has been cancelled</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canteen & Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl rounded-lg p-6 border border-slate-700">
            <h3 className="font-semibold text-white mb-3">Canteen Details</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300"><span className="font-medium text-gray-200">Name:</span> {order.canteen.name}</p>
              {order.canteen.location && (
                <p className="text-gray-300"><span className="font-medium text-gray-200">Location:</span> {order.canteen.location}</p>
              )}
              <p className="text-gray-300"><span className="font-medium text-gray-200">Delivery:</span> <span className="capitalize">{order.deliveryType}</span></p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl rounded-lg p-6 border border-slate-700">
            <h3 className="font-semibold text-white mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300"><span className="font-medium text-gray-200">Method:</span> <span className="uppercase">{order.paymentMethod}</span></p>
              <p className="text-gray-300">
                <span className="font-medium text-gray-200">Status:</span>{' '}
                <span className="capitalize">{order.paymentStatus}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl rounded-lg p-6 mb-6 border border-slate-700">
          <h3 className="font-semibold text-white mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => {
              const dish = typeof item.dish !== 'string' ? item.dish : null;
              return (
                <div
                  key={index}
                  className="flex items-start justify-between py-3 border-b border-slate-700 last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-300">{item.quantity}x</span>
                      <p className="font-medium text-white">
                        {dish ? dish.name : 'Dish unavailable'}
                      </p>
                    </div>
                    {item.specialInstructions && (
                      <p className="text-sm text-gray-400 mt-1 ml-6">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold text-white">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="border-t-2 border-orange-500/50 pt-4 mt-4">
            <div className="flex justify-between text-xl font-bold text-white">
              <span>Total Amount</span>
              <span className="text-orange-400">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {order.specialRequests && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl rounded-lg p-6 mb-6 border border-slate-700">
            <h3 className="font-semibold text-white mb-2">Special Requests</h3>
            <p className="text-gray-300">{order.specialRequests}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/orders')}
            className="flex-1 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-center py-3 px-6 rounded-md hover:from-orange-700 hover:to-amber-600 transition-colors font-semibold shadow-lg"
          >
            View All Orders
          </button>
          <button
            onClick={() => router.push('/canteens')}
            className="flex-1 bg-slate-800 border border-slate-600 text-white text-center py-3 px-6 rounded-md hover:bg-slate-700 transition-colors font-semibold"
          >
            Order Again
          </button>
        </div>
      </div>
    </div>
  );
}
