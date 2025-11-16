'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

interface Announcement {
  _id: string;
  title: string;
  description: string;
  image?: string;
  type: 'promotion' | 'menu_update' | 'closure' | 'special_event' | 'general';
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface Canteen {
  _id: string;
  name: string;
}

export default function ManageAnnouncementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<Partial<Announcement>>({
    type: 'general',
    priority: 'medium',
    isActive: true,
  });

  // Fetch canteen
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

  // Fetch announcements
  const { data: announcementsData, isLoading: announcementsLoading } = useQuery<{ success: boolean; announcements: Announcement[] }>({
    queryKey: ['canteen-announcements', canteen?._id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/announcements/canteen/${canteen?._id}`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    },
    enabled: !!session && !!canteen,
  });

  // Create announcement
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Announcement>) => {
      const response = await fetch(`http://localhost:5000/api/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({ ...data, canteen: canteen?._id }),
      });
      if (!response.ok) throw new Error('Failed to create announcement');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-announcements'] });
      showToast('Announcement created successfully', 'success');
      setIsAdding(false);
      setFormData({ type: 'general', priority: 'medium', isActive: true });
    },
    onError: () => {
      showToast('Failed to create announcement', 'error');
    },
  });

  // Update announcement
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Announcement> }) => {
      const response = await fetch(`http://localhost:5000/api/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update announcement');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-announcements'] });
      showToast('Announcement updated successfully', 'success');
      setEditingAnnouncement(null);
      setFormData({ type: 'general', priority: 'medium', isActive: true });
    },
    onError: () => {
      showToast('Failed to update announcement', 'error');
    },
  });

  // Delete announcement
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`http://localhost:5000/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete announcement');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-announcements'] });
      showToast('Announcement deleted successfully', 'success');
    },
    onError: () => {
      showToast('Failed to delete announcement', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData(announcement);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingAnnouncement(null);
    setFormData({ type: 'general', priority: 'medium', isActive: true });
  };

  if (status === 'loading' || canteenLoading) {
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

  if (!canteen) {
    return (
      <div className="min-h-screen py-12 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">No Canteen Found</h1>
          <p className="mt-4 text-gray-500">Please create a canteen first.</p>
        </div>
      </div>
    );
  }

  const announcements = announcementsData?.announcements || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promotion': return '🎉';
      case 'menu_update': return '📋';
      case 'closure': return '🔒';
      case 'special_event': return '⭐';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📢 Announcements</h1>
            <p className="mt-2 text-gray-600">Manage your canteen announcements and special offers</p>
          </div>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Announcement
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 50% Off on All Pizzas!"
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
                  placeholder="Provide details about the announcement..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type || 'general'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="general">General</option>
                    <option value="promotion">Promotion</option>
                    <option value="menu_update">Menu Update</option>
                    <option value="closure">Closure</option>
                    <option value="special_event">Special Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    required
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer h-full justify-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive !== false}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
                  placeholder="https://example.com/announcement-image.jpg"
                />
                <p className="mt-1 text-xs text-gray-500">Optional: Add an image to make your announcement stand out</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingAnnouncement
                    ? 'Update Announcement'
                    : 'Create Announcement'}
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

        {/* Announcements List */}
        {announcementsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <p className="mt-4 text-gray-500 text-lg">No announcements yet</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Create Your First Announcement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden ${
                  !announcement.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-4xl">{getTypeIcon(announcement.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(announcement.priority)}`}>
                            {announcement.priority.toUpperCase()}
                          </span>
                          {announcement.isActive ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
                              INACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{announcement.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Type: <span className="font-medium">{announcement.type.replace('_', ' ')}</span></span>
                          {announcement.startDate && (
                            <span>Start: <span className="font-medium">{new Date(announcement.startDate).toLocaleDateString()}</span></span>
                          )}
                          {announcement.endDate && (
                            <span>End: <span className="font-medium">{new Date(announcement.endDate).toLocaleDateString()}</span></span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this announcement?')) {
                            deleteMutation.mutate(announcement._id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {announcement.image && (
                    <div className="mt-4">
                      <img
                        src={announcement.image}
                        alt={announcement.title}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
