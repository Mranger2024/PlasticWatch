'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Waves, MapPin, AlertTriangle, TrendingUp, Clock, Info } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface BeachData {
  name: string;
  items: number;
  lastReported?: string;
  trend?: 'up' | 'down' | 'stable';
  location?: string;
}

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

async function getAffectedBeaches(): Promise<BeachData[]> {
  const { data, error } = await supabase
    .from('contributions')
    .select('beach_name, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching beach data:', error);
    return [];
  }

  // Define types for the reduce accumulator
  type BeachAccumulator = Record<string, { 
    items: number; 
    timestamps: number[]; 
    lastReported: string 
  }>;

  const beachData = (data as Array<{ beach_name: string | null; created_at: string }>).reduce<BeachAccumulator>((acc, { beach_name, created_at }) => {
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
  }, {});

  // Calculate trends (simple: more reports in last 30 days = increasing trend)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return (Object.entries(beachData) as [string, { items: number; timestamps: number[]; lastReported: string }][])
    .map(([name, { items, timestamps, lastReported }]) => {
      // Simple trend calculation
      const recentReports = timestamps.filter((t: number) => t > thirtyDaysAgo.getTime()).length;
      const previousPeriod = timestamps.length - recentReports;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentReports > previousPeriod) trend = 'up';
      else if (recentReports < previousPeriod) trend = 'down';
      
      return { 
        name, 
        items, 
        lastReported: new Date(lastReported).toLocaleDateString(),
        trend,
        location: 'Coastal Area' // This would come from your data in a real app
      };
    })
    .sort((a, b) => b.items - a.items)
    .slice(0, 6);
}


export default function BeachesSection() {
  const [beaches, setBeaches] = useState<BeachData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBeaches() {
      try {
        setLoading(true);
        const data = await getAffectedBeaches();
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

  if (loading) {
    return (
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Most Affected Beaches</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            These locations have the highest concentration of documented plastic waste.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Waves className="h-4 w-4 mr-2" />
            Beach Pollution Report
          </span>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline text-gray-900 mb-4">
            Most Affected Beaches
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600 md:text-lg">
            These locations have the highest concentration of documented plastic waste. 
            <span className="block mt-2 text-sm text-muted-foreground">
              Data is updated in real-time based on community contributions.
            </span>
          </p>
        </div>

        {beaches.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {beaches.map((beach, index) => (
              <Card 
                key={beach.name} 
                className="group relative overflow-hidden border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-16 h-16 rotate-45 transform bg-blue-50 border-b border-r border-blue-100" />
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <Waves className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{beach.items.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">plastic items</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{beach.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrendColor(beach.trend)}`}>
                      {getTrendIcon(beach.trend)}
                      <span className="ml-1">
                        {beach.trend === 'up' ? 'Increasing' : beach.trend === 'down' ? 'Decreasing' : 'Stable'}
                      </span>
                    </span>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{beach.location || 'Coastal Area'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Last reported: {beach.lastReported || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                      <Info className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </CardContent>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Waves className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No beach data available</h3>
            <p className="mt-2 text-muted-foreground">Be the first to report plastic waste in your area.</p>
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Report Plastic Waste
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <button className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            View All Beaches
            <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
