'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { Waves, MapPin, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface BeachData {
  name: string;
  items: number;
  lastReported?: string;
  trend?: 'up' | 'down' | 'stable';
  location?: string;
  image?: string;
}

const BEACH_IMAGES = [
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1505228390891-13dd3b9c9d0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1506929562872-b5415bb2928d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
];

function getTrendIcon(trend?: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    case 'down':
      return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
    default:
      return <div className="h-4 w-4"></div>;
  }
}

function getTrendColor(trend?: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return 'bg-red-50 text-red-700';
    case 'down':
      return 'bg-green-50 text-green-700';
    default:
      return 'bg-blue-50 text-blue-700';
  }
}

async function getBeachData(): Promise<BeachData[]> {
  const { data, error } = await supabase
    .from('contributions')
    .select('beach_name, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching beach data:', error);
    return [];
  }

  const beachData = data.reduce((acc, { beach_name, created_at }) => {
    if (beach_name) {
      if (!acc[beach_name]) {
        acc[beach_name] = { 
          items: 0, 
          timestamps: [],
          lastReported: created_at
        };
      }
      acc[beach_name].items += 1;
      acc[beach_name].timestamps.push(new Date(created_at).getTime());
      
      // Update last reported time if this is newer
      if (new Date(created_at) > new Date(acc[beach_name].lastReported)) {
        acc[beach_name].lastReported = created_at;
      }
    }
    return acc;
  }, {} as Record<string, { items: number; timestamps: number[]; lastReported: string }>);

  // Calculate trends (simple: more reports in last 30 days = increasing trend)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return Object.entries(beachData)
    .map(([name, { items, timestamps, lastReported }], index) => {
      // Simple trend calculation
      const recentReports = timestamps.filter(t => t > thirtyDaysAgo.getTime()).length;
      const previousPeriod = timestamps.length - recentReports;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentReports > previousPeriod) trend = 'up';
      else if (recentReports < previousPeriod) trend = 'down';
      
      // Get a consistent image for each beach
      const imageIndex = index % BEACH_IMAGES.length;
      
      return { 
        name, 
        items, 
        lastReported: new Date(lastReported).toLocaleDateString(),
        trend,
        location: 'Coastal Area', // This would come from your data in a real app
        image: BEACH_IMAGES[imageIndex]
      };
    })
    .sort((a, b) => b.items - a.items);
}

export default function BeachesPage() {
  const [beaches, setBeaches] = useState<BeachData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'items' | 'name' | 'trend'>('items');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function loadBeaches() {
      try {
        setLoading(true);
        const data = await getBeachData();
        setBeaches(data);
      } catch (err) {
        console.error('Failed to load beaches:', err);
        setError('Failed to load beach data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadBeaches();
  }, []);

  const filteredBeaches = beaches
    .filter(beach => 
      beach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beach.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'items') {
        return sortOrder === 'desc' ? b.items - a.items : a.items - b.items;
      } else if (sortBy === 'name') {
        return sortOrder === 'desc' 
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      } else {
        // Sort by trend (simplified)
        const trendOrder = { 'up': 1, 'stable': 0, 'down': -1 };
        return sortOrder === 'desc'
          ? (trendOrder[b.trend || 'stable'] - trendOrder[a.trend || 'stable'])
          : (trendOrder[a.trend || 'stable'] - trendOrder[b.trend || 'stable']);
      }
    });

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Data</h2>
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-sm font-medium mb-6">
            <Waves className="h-4 w-4 mr-2" />
            Beach Impact Report
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Global Beach Pollution Tracker
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Real-time monitoring of plastic pollution across the world's most beautiful beaches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="relative max-w-xl w-full">
              <input
                type="text"
                placeholder="Search beaches..."
                className="w-full px-6 py-3 rounded-full border-0 shadow-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute right-3 top-3 h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <select
              className="px-4 py-3 rounded-full border-0 bg-white/20 text-white focus:ring-2 focus:ring-white shadow-lg"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="items">Sort by items</option>
              <option value="name">Sort by name</option>
              <option value="trend">Sort by trend</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 -mt-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Waves className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Beaches</p>
              <p className="text-2xl font-bold">{beaches.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Items Tracked</p>
              <p className="text-2xl font-bold">
                {beaches.reduce((sum, beach) => sum + beach.items, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Beaches at Risk</p>
              <p className="text-2xl font-bold">
                {beaches.filter(b => b.trend === 'up').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Beaches Grid */}
      <div className="container mx-auto px-4 pb-16">
        {filteredBeaches.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredBeaches.map((beach, index) => (
              <div 
                key={beach.name} 
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Background Image with Overlay */}
                <div className="relative h-48">
                  <img
                    src={beach.image}
                    alt={beach.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-end">
                      <h3 className="text-xl font-bold text-white">{beach.name}</h3>
                      <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <Waves className="h-4 w-4 text-white" />
                        <span className="text-white font-medium">{beach.items.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-white p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{beach.name}</h4>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {beach.location}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTrendColor(beach.trend)}`}>
                      {getTrendIcon(beach.trend)}
                      <span className="ml-1">
                        {beach.trend === 'up' ? 'Increasing' : beach.trend === 'down' ? 'Decreasing' : 'Stable'}
                      </span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Last updated: {beach.lastReported}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <Button variant="outline" size="sm" className="group-hover:bg-blue-50 group-hover:border-blue-100">
                      <Info className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <div className="text-xs text-gray-500">
                      {beach.items} items reported
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <Waves className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No beaches found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm ? 
                `No beaches match "${searchTerm}". Try a different search term.` : 
                'No beach data available yet.'
              }
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to make a difference?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Join our community of environmental activists and help us track and reduce plastic pollution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Report Plastic Waste
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
