'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

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
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
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
      <div className="min-h-screen py-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
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
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      preparing: 'bg-purple-100 text-purple-800 border-purple-300',
      ready: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-16 mb-4">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <div className="w-28 h-28 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-indigo-600">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-6 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{session.user.name}</h1>
                <p className="text-gray-600">{session.user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full capitalize">
                  {session.user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedOrders}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalSpent}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account Info
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'orders'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recent Orders
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'stats'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-md">{session.user.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-md">{session.user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                      <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-md capitalize">{session.user.role}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                      <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-md font-mono text-sm">{session.user.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="mt-4 text-gray-500">No orders yet</p>
                    <button
                      onClick={() => router.push('/canteens')}
                      className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Browse Canteens
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order._id}
                        onClick={() => router.push(`/orders/${order._id}`)}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                            <p className="text-sm text-gray-600 mt-1">{order.canteen.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(order.createdAt).toLocaleDateString()} at{' '}
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                              {order.status.toUpperCase()}
                            </span>
                            <p className="text-lg font-bold text-gray-900 mt-2">₹{order.totalAmount}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {orders.length > 5 && (
                      <button
                        onClick={() => router.push('/orders')}
                        className="w-full text-center py-3 text-indigo-600 hover:text-indigo-700 font-medium"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Completed Orders</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {stats.completedOrders} / {stats.totalOrders}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${stats.totalOrders ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Pending Orders</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {stats.pendingOrders} / {stats.totalOrders}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-yellow-500 h-3 rounded-full transition-all"
                        style={{ width: `${stats.totalOrders ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Spending Overview</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Spent</span>
                        <span className="text-sm font-semibold text-gray-900">₹{stats.totalSpent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average Order Value</span>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{stats.totalOrders ? Math.round(stats.totalSpent / stats.totalOrders) : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
