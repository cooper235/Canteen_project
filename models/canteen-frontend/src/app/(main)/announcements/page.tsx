'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface Announcement {
  _id: string;
  title: string;
  description: string;
  image?: string;
  type: 'promotion' | 'menu_update' | 'closure' | 'special_event' | 'general';
  priority: 'low' | 'medium' | 'high';
  canteen: {
    _id: string;
    name: string;
  };
  createdAt: string;
  startDate?: string;
  endDate?: string;
}

export default function AnnouncementsPage() {
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch all announcements
  const { data: announcementsData, isLoading } = useQuery<{ success: boolean; announcements: Announcement[] }>({
    queryKey: ['all-announcements'],
    queryFn: async () => {
      const response = await fetch('/announcements');
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    },
  });

  const announcements = announcementsData?.announcements || [];

  const filteredAnnouncements = filterType === 'all' 
    ? announcements 
    : announcements.filter(a => a.type === filterType);

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
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const types = [
    { key: 'all', label: 'All', icon: '📋' },
    { key: 'promotion', label: 'Promotions', icon: '🎉' },
    { key: 'menu_update', label: 'Menu Updates', icon: '📋' },
    { key: 'special_event', label: 'Events', icon: '⭐' },
    { key: 'closure', label: 'Closures', icon: '🔒' },
    { key: 'general', label: 'General', icon: '📢' },
  ];

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📢 All Announcements</h1>
          <p className="mt-2 text-gray-600">Stay updated with the latest news, offers, and updates from all canteens</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type.key}
              onClick={() => setFilterType(type.key)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filterType === type.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {type.icon} {type.label}
              {type.key !== 'all' && (
                <span className="ml-2 text-xs">
                  ({announcements.filter(a => a.type === type.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Announcements Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading announcements...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <p className="mt-4 text-gray-500 text-lg">
              {filterType === 'all' ? 'No announcements yet' : `No ${filterType.replace('_', ' ')} announcements`}
            </p>
            <Link
              href="/canteens"
              className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Browse Canteens
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement) => (
              <Link
                key={announcement._id}
                href={`/canteens/${announcement.canteen._id}`}
                className="block group"
              >
                <div className={`bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden border-l-4 ${getPriorityColor(announcement.priority)} h-full`}>
                  {announcement.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={announcement.image}
                        alt={announcement.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{getTypeIcon(announcement.type)}</span>
                      <span className="text-sm font-medium text-indigo-600 capitalize">
                        {announcement.type.replace('_', ' ')}
                      </span>
                      <span className={`ml-auto px-2 py-1 rounded text-xs font-semibold ${
                        announcement.priority === 'high' ? 'bg-red-100 text-red-800' :
                        announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {announcement.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {announcement.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {announcement.description}
                    </p>

                    {(announcement.startDate || announcement.endDate) && (
                      <div className="text-xs text-gray-500 mb-3 space-y-1">
                        {announcement.startDate && (
                          <div>📅 Start: {new Date(announcement.startDate).toLocaleDateString()}</div>
                        )}
                        {announcement.endDate && (
                          <div>⏰ End: {new Date(announcement.endDate).toLocaleDateString()}</div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
                      <span className="text-gray-500 flex items-center gap-1">
                        📍 {announcement.canteen.name}
                      </span>
                      <span className="text-indigo-600 font-medium group-hover:underline flex items-center gap-1">
                        Visit Canteen
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
