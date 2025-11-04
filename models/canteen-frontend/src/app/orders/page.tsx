'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

type Order = {
  _id: string;
  canteen: {
    _id: string;
    name: string;
  };
  items: {
    dish: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    specialInstructions?: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await api.get('/orders/my-orders');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="min-h-screen py-12 bg-gray-50">Loading...</div>;
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>

        <div className="mt-8 space-y-8">
          {orders?.map((order) => (
            <div
              key={order._id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {order.canteen.name}
                  </h3>
                  <div className="flex items-center gap-x-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        {
                          pending: 'bg-yellow-100 text-yellow-800',
                          preparing: 'bg-blue-100 text-blue-800',
                          ready: 'bg-green-100 text-green-800',
                          delivered: 'bg-gray-100 text-gray-800',
                          cancelled: 'bg-red-100 text-red-800',
                        }[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        {
                          pending: 'bg-yellow-100 text-yellow-800',
                          completed: 'bg-green-100 text-green-800',
                          failed: 'bg-red-100 text-red-800',
                        }[order.paymentStatus]
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-4 divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <div key={index} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{item.quantity}x</span>{' '}
                          {item.dish.name}
                          {item.specialInstructions && (
                            <p className="mt-1 text-sm text-gray-500">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <div className="text-gray-900">
                          ₹{item.dish.price * item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                  <div className="text-lg font-semibold">
                    Total: ₹{order.totalAmount}
                  </div>
                </div>

                {order.status === 'delivered' && (
                  <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}

          {orders?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}