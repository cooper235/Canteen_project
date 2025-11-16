'use client';

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import RecommendationsSection from "@/components/RecommendationsSection";

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
}

export default function Home() {
  const { data: session } = useSession();

  // Fetch active announcements
  const { data: announcementsData } = useQuery<{ success: boolean; announcements: Announcement[] }>({
    queryKey: ['all-announcements'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/announcements');
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    },
  });

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
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="relative isolate overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <a href="#" className="inline-flex space-x-6">
              <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
                What&apos;s new
              </span>
              <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                <span>Just shipped v1.0</span>
              </span>
            </a>
          </div>
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Campus Food Made Easy
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Explore campus canteens, view menus, order food, and manage your dining experience - all in one place.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/canteens"
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Browse Canteens
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/canteens"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Explore Canteens
                </Link>
                <Link href="/register" className="text-sm font-semibold leading-6 text-gray-900">
                  Register Now <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-inset ring-gray-900/5">
              {/* Placeholder for a nice image or illustration */}
              <div className="h-[400px] w-[600px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section - Only show for logged in users */}
      {session && (
        <div className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <RecommendationsSection />
          </div>
        </div>
      )}

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                📢 Latest Announcements
              </h2>
              <p className="mt-2 text-lg leading-8 text-gray-600">
                Check out the latest offers, updates, and news from our canteens
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.slice(0, 6).map((announcement) => (
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
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {announcement.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          📍 {announcement.canteen.name}
                        </span>
                        <span className="text-indigo-600 font-medium group-hover:underline">
                          View Canteen →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {announcements.length > 6 && (
              <div className="mt-10 text-center">
                <Link
                  href="/canteens"
                  className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  View All Canteens
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
