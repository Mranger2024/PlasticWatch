'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import { Factory, TrendingUp, AlertTriangle, Shield, BarChart2, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PolluterData {
  rank: number;
  company: string;
  items: number;
  manufacturer: string;
  trend?: 'up' | 'down' | 'stable';
  lastReported?: string;
}

function getPollutionBadge(rank: number): { variant: "destructive" | "secondary" | "default", label: string, icon: JSX.Element } {
  if (rank === 1) return { 
    variant: "destructive", 
    label: "Top Polluter",
    icon: <AlertTriangle className="h-3 w-3 mr-1" />
  };
  if (rank <= 3) return { 
    variant: "destructive", 
    label: "Major Polluter",
    icon: <AlertTriangle className="h-3 w-3 mr-1" />
  };
  return { 
    variant: "default", 
    label: "Moderate",
    icon: <Info className="h-3 w-3 mr-1" />
  };
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
      return 'bg-gray-50 text-gray-700';
  }
}

async function getTopPolluters(): Promise<PolluterData[]> {
  const { data, error } = await supabase
    .from('contributions')
    .select('brand, manufacturer, created_at')
    .filter('status', 'eq', 'classified')
    .not('brand', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching company data:', error);
    return [];
  }

  // Process data to get counts and timestamps
  const companyData = data.reduce((acc, { brand, manufacturer, created_at }) => {
    if (brand) {
      const brandKey = brand.trim();
      if (!acc[brandKey]) {
        acc[brandKey] = { 
          items: 0, 
          manufacturer: manufacturer?.trim() || 'Unspecified',
          timestamps: []
        };
      }
      acc[brandKey].items += 1;
      acc[brandKey].timestamps.push(new Date(created_at).getTime());
    }
    return acc;
  }, {} as Record<string, { 
    items: number; 
    manufacturer: string; 
    timestamps: number[];
  }>);

  // Calculate trends (simple: more reports in last 30 days = increasing trend)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return Object.entries(companyData)
    .map(([company, { items, manufacturer, timestamps }]) => {
      // Simple trend calculation
      const recentReports = timestamps.filter(t => t > thirtyDaysAgo.getTime()).length;
      const previousPeriod = timestamps.length - recentReports;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentReports > previousPeriod) trend = 'up';
      else if (recentReports < previousPeriod) trend = 'down';
      
      return { 
        company, 
        items, 
        manufacturer,
        trend,
        lastReported: new Date(Math.max(...timestamps)).toLocaleDateString(),
        rank: 0 // Will be set after sorting
      };
    })
    .sort((a, b) => b.items - a.items)
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }))
    .slice(0, 10); // Show top 10 polluters
}


function RankBadge({ rank }: { rank: number }) {
  if (rank > 3) return (
    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700 font-semibold">
      {rank}
    </div>
  );
  
  const colors = [
    'bg-yellow-400 text-yellow-900', // 1st
    'bg-gray-300 text-gray-700',     // 2nd
    'bg-amber-600 text-white'        // 3rd
  ];
  
  return (
    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${colors[rank - 1]} font-bold`}>
      {rank}
    </div>
  );
}

export default function LeaderboardSection() {
  const [polluters, setPolluters] = useState<PolluterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPolluters() {
      try {
        setLoading(true);
        const data = await getTopPolluters();
        setPolluters(data);
      } catch (err) {
        console.error('Failed to load polluters:', err);
        setError('Failed to load polluter data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadPolluters();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-medium mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Plastic Pollution Report
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline text-gray-900 mb-4">
              Top Plastic Polluters
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 md:text-lg">
              Companies with the highest number of plastic waste items found in our beaches.
            </p>
          </div>
          
          <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border-b last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
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
    <section className="py-16 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-medium mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Plastic Pollution Report
          </span>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline text-gray-900 mb-4">
            Top Plastic Polluters
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600 md:text-lg">
            Companies with the highest number of plastic waste items found in our beaches.
            <span className="block mt-2 text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </p>
        </div>
        
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart2 className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold">Global Plastic Polluters Ranking</h3>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
                  <span>Top Polluter</span>
                </div>
                <div className="h-4 w-px bg-gray-300 mx-2"></div>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-gray-500 mr-1"></div>
                  <span>Moderate</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {polluters.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-20 text-center">Rank</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="hidden md:table-cell">Manufacturer</TableHead>
                    <TableHead className="text-right">Items Found</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {polluters.map((p) => {
                    const badge = getPollutionBadge(p.rank);
                    return (
                      <TableRow key={`${p.rank}-${p.company}`} className="group hover:bg-gray-50 transition-colors">
                        <TableCell className="text-center">
                          <RankBadge rank={p.rank} />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="font-semibold text-gray-900">{p.company}</div>
                          <div className="text-sm text-muted-foreground md:hidden">{p.manufacturer}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {p.manufacturer}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {p.items.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center justify-end">
                            {getTrendIcon(p.trend)}
                            <span className={`ml-1 text-xs ${p.trend === 'up' ? 'text-red-600' : p.trend === 'down' ? 'text-green-600' : 'text-gray-500'}`}>
                              {p.trend === 'up' ? 'Rising' : p.trend === 'down' ? 'Declining' : 'Stable'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={badge.variant as any} 
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                          >
                            {badge.icon}
                            {badge.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Factory className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No polluter data available</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Once contributions are classified, the top polluters will appear here.
                </p>
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Shield className="h-4 w-4 mr-2" />
                    Report a Polluter
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p className="inline-flex items-center">
            <Info className="h-4 w-4 mr-1.5" />
            Data is collected from community contributions and verified reports.
          </p>
        </div>
      </div>
    </section>
  );
}
