'use client';

import { useCart } from '@/contexts/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    paymentMethod: 'cash',
    deliveryType: 'pickup',
    specialRequests: '',
  });

  if (!session) {
    return (
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Please Login</h1>
            <p className="mt-4 text-gray-500">You need to be logged in to place an order</p>
            <Link
              href="/login"
              className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Your Cart is Empty</h1>
            <p className="mt-4 text-gray-500">Add some items to your cart first</p>
            <Link
              href="/canteens"
              className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
            >
              Browse Canteens
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Group items by canteen (assuming all items are from same canteen)
  const canteenId = items[0]?.canteenId;
  const canteenName = items[0]?.canteenName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔄 Starting order submission...');
    console.log('Session:', session);
    console.log('Token:', session?.user?.token);

    try {
      const orderData = {
        canteenId,
        items: items.map(item => ({
          dishId: item.dishId,
          quantity: item.quantity,
        })),
        paymentMethod: formData.paymentMethod,
        deliveryType: formData.deliveryType,
        specialRequests: formData.specialRequests || undefined,
      };

      console.log('📦 Order data:', orderData);

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`,
        },
        body: JSON.stringify(orderData),
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      console.log('✅ Order placed successfully!');
      // Clear cart and redirect to order confirmation
      clearCart();
      router.push(`/orders/${data.order._id}`);
    } catch (err: any) {
      console.error('❌ Error placing order:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Items */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Order from {canteenName}
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.dishId}
                      className="flex items-center justify-between py-3 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Payment Method
                </h2>
                <div className="space-y-2">
                  {['cash', 'card', 'upi', 'wallet'].map((method) => (
                    <label key={method} className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={formData.paymentMethod === method}
                        onChange={(e) =>
                          setFormData({ ...formData, paymentMethod: e.target.value })
                        }
                        className="mr-2"
                      />
                      <span className="capitalize">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery Type */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Delivery Type
                </h2>
                <div className="space-y-2">
                  {['pickup', 'delivery'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        name="deliveryType"
                        value={type}
                        checked={formData.deliveryType === type}
                        onChange={(e) =>
                          setFormData({ ...formData, deliveryType: e.target.value })
                        }
                        className="mr-2"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Special Requests
                </h2>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) =>
                    setFormData({ ...formData, specialRequests: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Any special instructions for your order..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{getTotal()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₹0</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{getTotal()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
              <Link
                href="/cart"
                className="block text-center mt-4 text-indigo-600 hover:text-indigo-700 text-sm"
              >
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
