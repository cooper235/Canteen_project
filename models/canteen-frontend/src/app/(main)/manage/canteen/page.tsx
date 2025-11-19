'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/contexts/ToastContext';
import { themeClasses, animations } from '@/lib/theme';

interface Canteen {
  _id: string;
  name: string;
  description: string;
  location?: {
    building?: string;
    floor?: string;
  } | string | null;
  contactPhone?: string;
  email: string;
  operatingHours?: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  isActive: boolean;
  isVerified: boolean;
  image?: string;
  ratings: {
    averageRating: number;
    totalReviews: number;
  };
}

export default function ManageCanteenPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Canteen>>({});

  // Fetch canteen owner's canteen
  const { data: canteenData, isLoading } = useQuery<{ success: boolean; canteens: Canteen[] }>({
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

  // Create canteen mutation
  const createCanteenMutation = useMutation({
    mutationFn: async (data: Partial<Canteen>) => {
      const response = await fetch('http://localhost:5000/api/canteens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create canteen');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-canteens'] });
      showToast('Canteen created successfully', 'success');
      setIsEditing(false);
      setFormData({});
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to create canteen', 'error');
    },
  });

  // Update canteen mutation
  const updateCanteenMutation = useMutation({
    mutationFn: async (data: Partial<Canteen>) => {
      const response = await fetch(`http://localhost:5000/api/canteens/${canteen?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update canteen');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-canteens'] });
      showToast('Canteen updated successfully', 'success');
      setIsEditing(false);
    },
    onError: (error: any) => {
      showToast(error.message || 'Failed to update canteen', 'error');
    },
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen py-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'canteen_owner') {
    router.push('/');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canteen) {
      updateCanteenMutation.mutate(formData);
    } else {
      createCanteenMutation.mutate(formData);
    }
  };

  const handleEdit = () => {
    if (canteen) {
      let locationStr = '';
      if (canteen.location) {
        if (typeof canteen.location === 'string') {
          locationStr = canteen.location;
        } else {
          locationStr = `${canteen.location.building || ''} ${canteen.location.floor || ''}`.trim();
        }
      }
      
      setFormData({
        name: canteen.name,
        description: canteen.description,
        location: locationStr,
        contactPhone: canteen.contactPhone,
        email: canteen.email,
        operatingHours: canteen.operatingHours,
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  // Show create form if no canteen exists
  if (!canteen) {
    return (
      <div className={`min-h-screen py-8 ${themeClasses.background}`}>
        <motion.div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <motion.div className={`${themeClasses.card} shadow-lg rounded-lg p-8 border border-slate-600/50`} initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
            <h1 className={`text-3xl font-bold ${themeClasses.textPrimary} mb-6`}>Create Your Canteen</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  Canteen Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border border-slate-600/50 rounded-md ${themeClasses.card} ${themeClasses.textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-700/50`}
                  placeholder="e.g., Main Campus Canteen"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2 border border-slate-600/50 rounded-md ${themeClasses.card} ${themeClasses.textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-700/50`}
                  placeholder="Describe your canteen..."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={typeof formData.location === 'string' ? formData.location : ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-4 py-2 border border-slate-600/50 rounded-md ${themeClasses.card} ${themeClasses.textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-700/50`}
                  placeholder="e.g., Building A, Ground Floor"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone || ''}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className={`w-full px-4 py-2 border border-slate-600/50 rounded-md ${themeClasses.card} ${themeClasses.textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-700/50`}
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2 border border-slate-600/50 rounded-md ${themeClasses.card} ${themeClasses.textPrimary} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-700/50`}
                    placeholder="canteen@example.com"
                  />
                </div>
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
                  placeholder="https://example.com/canteen-image.jpg"
                />
                <p className="mt-1 text-xs text-gray-500">Enter the URL of your canteen image</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Operating Hours (Monday - Friday)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Opening Time</label>
                    <input
                      type="time"
                      value={formData.operatingHours?.monday?.open || ''}
                      onChange={(e) => {
                        const time = e.target.value;
                        setFormData({
                          ...formData,
                          operatingHours: {
                            monday: { open: time, close: formData.operatingHours?.monday?.close || '' },
                            tuesday: { open: time, close: formData.operatingHours?.tuesday?.close || '' },
                            wednesday: { open: time, close: formData.operatingHours?.wednesday?.close || '' },
                            thursday: { open: time, close: formData.operatingHours?.thursday?.close || '' },
                            friday: { open: time, close: formData.operatingHours?.friday?.close || '' },
                          }
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Closing Time</label>
                    <input
                      type="time"
                      value={formData.operatingHours?.monday?.close || ''}
                      onChange={(e) => {
                        const time = e.target.value;
                        setFormData({
                          ...formData,
                          operatingHours: {
                            monday: { open: formData.operatingHours?.monday?.open || '', close: time },
                            tuesday: { open: formData.operatingHours?.tuesday?.open || '', close: time },
                            wednesday: { open: formData.operatingHours?.wednesday?.open || '', close: time },
                            thursday: { open: formData.operatingHours?.thursday?.open || '', close: time },
                            friday: { open: formData.operatingHours?.friday?.open || '', close: time },
                          }
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={createCanteenMutation.isPending}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createCanteenMutation.isPending ? 'Creating...' : 'Create Canteen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show canteen details/edit form if canteen exists
  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Canteen</h1>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              Edit Details
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="bg-white shadow rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Canteen Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canteen Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={typeof formData.location === 'string' ? formData.location : ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contactPhone || ''}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canteen Image URL
                </label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com/canteen-image.jpg"
                />
                <p className="mt-1 text-xs text-gray-500">Enter the URL of your canteen's banner or logo image</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.operatingHours?.monday?.open || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      operatingHours: {
                        ...formData.operatingHours,
                        monday: { open: e.target.value, close: formData.operatingHours?.monday?.close || '' }
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.operatingHours?.monday?.close || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      operatingHours: {
                        ...formData.operatingHours,
                        monday: { open: formData.operatingHours?.monday?.open || '', close: e.target.value }
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={updateCanteenMutation.isPending}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateCanteenMutation.isPending ? 'Saving...' : 'Save Changes'}
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
        ) : (
          <div className="space-y-6">
            {/* Status Badges */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex flex-wrap gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  canteen.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {canteen.isActive ? '✓ Active' : '✗ Inactive'}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  canteen.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {canteen.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                </span>
              </div>
            </div>

            {/* Canteen Image */}
            {canteen.image && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Canteen Image</h2>
                <img 
                  src={canteen.image} 
                  alt={canteen.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Canteen Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Canteen Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg text-gray-900">{canteen.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900">{canteen.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-gray-900">
                    {!canteen.location 
                      ? 'Not set'
                      : typeof canteen.location === 'string' 
                        ? canteen.location 
                        : `${canteen.location.building || ''} ${canteen.location.floor || ''}`.trim() || 'Not set'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contact Number</label>
                    <p className="text-gray-900">{canteen.contactPhone || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{canteen.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Opening Time (Weekdays)</label>
                    <p className="text-gray-900">{canteen.operatingHours?.monday?.open || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Closing Time (Weekdays)</label>
                    <p className="text-gray-900">{canteen.operatingHours?.monday?.close || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ratings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ratings & Reviews</h2>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-4xl font-bold text-gray-900">
                    {canteen.ratings.averageRating.toFixed(1)} ⭐
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Average Rating</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{canteen.ratings.totalReviews}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Reviews</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
