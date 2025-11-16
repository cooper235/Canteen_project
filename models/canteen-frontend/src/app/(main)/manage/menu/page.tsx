'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

interface Dish {
  _id: string;
  name: string;
  description: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages' | 'desserts';
  price: number;
  image?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isSpicy: boolean;
  availability: boolean;
  ratings: {
    averageRating: number;
    totalReviews: number;
  };
  popularity: {
    orderCount: number;
  };
}

interface Canteen {
  _id: string;
  name: string;
}

export default function ManageMenuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddingDish, setIsAddingDish] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState<Partial<Dish>>({
    isVegetarian: false,
    isVegan: false,
    isSpicy: false,
    availability: true,
  });

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

  // Fetch dishes
  const { data: dishesData, isLoading: dishesLoading } = useQuery<{ success: boolean; dishes: Dish[] }>({
    queryKey: ['canteen-dishes', canteen?._id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/dishes/canteen/${canteen?._id}`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch dishes');
      return response.json();
    },
    enabled: !!session && !!canteen,
  });

  // Create dish mutation
  const createDishMutation = useMutation({
    mutationFn: async (data: Partial<Dish>) => {
      const response = await fetch(`http://localhost:5000/api/dishes/canteen/${canteen?._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create dish');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-dishes'] });
      showToast('Dish added successfully', 'success');
      setIsAddingDish(false);
      setFormData({ isVegetarian: false, isVegan: false, isSpicy: false, availability: true });
    },
    onError: () => {
      showToast('Failed to add dish', 'error');
    },
  });

  // Update dish mutation
  const updateDishMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Dish> }) => {
      const response = await fetch(`http://localhost:5000/api/dishes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update dish');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-dishes'] });
      showToast('Dish updated successfully', 'success');
      setEditingDish(null);
      setFormData({ isVegetarian: false, isVegan: false, isSpicy: false, availability: true });
    },
    onError: () => {
      showToast('Failed to update dish', 'error');
    },
  });

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ id, availability }: { id: string; availability: boolean }) => {
      const response = await fetch(`http://localhost:5000/api/dishes/${id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({ availability }),
      });
      if (!response.ok) throw new Error('Failed to toggle availability');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-dishes'] });
      showToast('Availability updated', 'success');
    },
    onError: () => {
      showToast('Failed to update availability', 'error');
    },
  });

  // Delete dish mutation
  const deleteDishMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`http://localhost:5000/api/dishes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete dish');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-dishes'] });
      showToast('Dish deleted successfully', 'success');
    },
    onError: () => {
      showToast('Failed to delete dish', 'error');
    },
  });

  if (status === 'loading' || canteenLoading) {
    return (
      <div className="min-h-screen py-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
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
      <div className="min-h-screen py-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">No Canteen Found</h1>
          <p className="mt-4 text-gray-500">Please create a canteen first</p>
          <button
            onClick={() => router.push('/manage/canteen')}
            className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
          >
            Create Canteen
          </button>
        </div>
      </div>
    );
  }

  const dishes = dishesData?.dishes || [];
  const filteredDishes = filterCategory === 'all'
    ? dishes
    : dishes.filter(dish => dish.category === filterCategory);

  const categories = [
    { key: 'all', label: 'All Items', icon: '🍽️' },
    { key: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { key: 'lunch', label: 'Lunch', icon: '🍛' },
    { key: 'dinner', label: 'Dinner', icon: '🍝' },
    { key: 'snacks', label: 'Snacks', icon: '🍟' },
    { key: 'beverages', label: 'Beverages', icon: '☕' },
    { key: 'desserts', label: 'Desserts', icon: '🍰' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDish) {
      updateDishMutation.mutate({ id: editingDish._id, data: formData });
    } else {
      createDishMutation.mutate(formData);
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description,
      category: dish.category,
      price: dish.price,
      isVegetarian: dish.isVegetarian,
      isVegan: dish.isVegan,
      isSpicy: dish.isSpicy,
      availability: dish.availability,
    });
    setIsAddingDish(true);
  };

  const handleCancel = () => {
    setIsAddingDish(false);
    setEditingDish(null);
    setFormData({ isVegetarian: false, isVegan: false, isSpicy: false, availability: true });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteDishMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Menu</h1>
            <p className="mt-2 text-gray-600">{canteen.name}</p>
          </div>
          {!isAddingDish && (
            <button
              onClick={() => setIsAddingDish(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-semibold flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add New Dish
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {isAddingDish && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingDish ? 'Edit Dish' : 'Add New Dish'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Chicken Biryani"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select category</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snacks">Snacks</option>
                    <option value="beverages">Beverages</option>
                    <option value="desserts">Desserts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe the dish..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-1 text-xs text-gray-500">Enter the URL of the dish image</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Dish Properties
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVegetarian || false}
                      onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">🥬 Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVegan || false}
                      onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">🌱 Vegan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSpicy || false}
                      onChange={(e) => setFormData({ ...formData, isSpicy: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">🌶️ Spicy</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.availability !== false}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">✓ Available</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={createDishMutation.isPending || updateDishMutation.isPending}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createDishMutation.isPending || updateDishMutation.isPending
                    ? 'Saving...'
                    : editingDish
                    ? 'Update Dish'
                    : 'Add Dish'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setFilterCategory(category.key)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filterCategory === category.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {category.icon} {category.label}
              {category.key !== 'all' && (
                <span className="ml-2 text-xs">
                  ({dishes.filter(d => d.category === category.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Dishes Grid */}
        {dishesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dishes...</p>
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="mt-4 text-gray-500 text-lg">
              {filterCategory === 'all' ? 'No dishes yet' : `No ${filterCategory} dishes`}
            </p>
            <button
              onClick={() => setIsAddingDish(true)}
              className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Add Your First Dish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.map((dish) => (
              <div
                key={dish._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Dish Image */}
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  {dish.image ? (
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl">🍽️</span>
                  )}
                </div>

                {/* Dish Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{dish.name}</h3>
                    <span className="text-lg font-bold text-indigo-600">₹{dish.price}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dish.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">
                      {dish.category}
                    </span>
                    {dish.isVegetarian && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        🥬 Veg
                      </span>
                    )}
                    {dish.isVegan && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        🌱 Vegan
                      </span>
                    )}
                    {dish.isSpicy && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                        🌶️ Spicy
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <span>⭐ {dish.ratings.averageRating.toFixed(1)}</span>
                    <span>📦 {dish.popularity.orderCount} orders</span>
                  </div>

                  {/* Availability Toggle */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <span className="text-sm font-medium text-gray-700">Available</span>
                    <button
                      onClick={() =>
                        toggleAvailabilityMutation.mutate({
                          id: dish._id,
                          availability: !dish.availability,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        dish.availability ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          dish.availability ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(dish)}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dish._id, dish.name)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
