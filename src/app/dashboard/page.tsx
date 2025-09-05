'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  CheckCircle, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  MapPin,
  FileText,
  Upload,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { formatDistanceToNow, format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

type Contribution = {
  id: string;
  brand: string | null;
  brand_suggestion: string | null;
  manufacturer: string | null;
  manufacturer_suggestion: string | null;
  plastic_type: string | null;
  plastic_type_suggestion: string | null;
  beach_name: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  product_image_url: string | null;
  recycling_image_url: string | null;
  manufacturer_image_url: string | null;
  created_at: string;
  status: string;
  status_updated_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
};

type Stats = {
  total: number;
  classified: number;
  pending: number;
  lastContribution: string;
  last7Days: number;
  topBeach: string;
};

const getUserData = async (): Promise<{ contributions: Contribution[], stats: Stats }> => {
  // Get data from last 30 days for stats
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching user data:", error);
    return { 
      contributions: [], 
      stats: { 
        total: 0, 
        classified: 0, 
        pending: 0,
        lastContribution: 'N/A',
        last7Days: 0,
        topBeach: 'N/A'
      } 
    };
  }

  // Calculate beach statistics with proper typing
  const beachCounts = data.reduce<Record<string, number>>((acc, item) => {
    const beach = item.beach_name || 'Unknown';
    acc[beach] = (acc[beach] || 0) + 1;
    return acc;
  }, {});

  const topBeach = Object.entries(beachCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Calculate contributions from last 7 days
  const last7Days = data.filter(item => {
    const itemDate = new Date(item.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return itemDate >= weekAgo;
  }).length;

  const stats = {
    total: data.length,
    classified: data.filter(c => c.status === 'classified').length,
    pending: data.filter(c => c.status === 'pending' || c.status === 'skipped').length,
    lastContribution: data.length > 0 ? formatDistanceToNow(new Date(data[0].created_at), { addSuffix: true }) : 'N/A',
    last7Days,
    topBeach
  };

  return { contributions: data, stats };
};

export default function DashboardPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [stats, setStats] = useState<Stats>({ 
    total: 0, 
    classified: 0, 
    pending: 0,
    lastContribution: 'N/A',
    last7Days: 0,
    topBeach: 'N/A'
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const { contributions, stats } = await getUserData();
      setContributions(contributions);
      setStats(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate additional stats for more impressive metrics
  const monthlyChange = (() => {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const currentMonthCount = contributions.filter(c => {
      const date = new Date(c.created_at);
      return date.getMonth() === currentMonth && date.getFullYear() === new Date().getFullYear();
    }).length;
    
    const lastMonthCount = contributions.filter(c => {
      const date = new Date(c.created_at);
      return date.getMonth() === lastMonth && date.getFullYear() === (lastMonth === 11 ? new Date().getFullYear() - 1 : new Date().getFullYear());
    }).length;
    
    if (lastMonthCount === 0) return 0;
    return Math.round(((currentMonthCount - lastMonthCount) / lastMonthCount) * 100);
  })();

  const userStats = [
    { 
      title: "Total Impact", 
      value: stats.total, 
      description: `${stats.last7Days} in the last 7 days`,
      icon: <Package className="h-6 w-6 text-blue-500" />,
      trend: stats.last7Days > 0 ? 'up' : 'neutral',
      trendValue: stats.last7Days > 0 ? `${Math.abs(monthlyChange)}% from last month` : 'No change',
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
      gradient: 'from-blue-50 to-blue-100',
      shadow: 'shadow-blue-100'
    },
    { 
      title: "Items Classified", 
      value: stats.classified, 
      description: `${Math.round((stats.classified / Math.max(stats.total, 1)) * 100)}% of total`,
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      trend: 'up',
      trendValue: `${Math.round((stats.classified / Math.max(stats.total, 1)) * 100)}% success rate`,
      color: 'bg-green-50',
      textColor: 'text-green-600',
      gradient: 'from-green-50 to-green-100',
      shadow: 'shadow-green-100'
    },
    { 
      title: "Pending Review", 
      value: stats.pending, 
      description: 'Awaiting classification',
      icon: <Clock className="h-6 w-6 text-amber-500" />,
      trend: stats.pending > 0 ? 'alert' : 'neutral',
      trendValue: stats.pending > 0 ? 'Needs attention' : 'All caught up!',
      color: 'bg-amber-50',
      textColor: 'text-amber-600',
      gradient: 'from-amber-50 to-amber-100',
      shadow: 'shadow-amber-100'
    },
    { 
      title: "Top Location", 
      value: stats.topBeach, 
      description: 'Most frequent beach',
      icon: <MapPin className="h-6 w-6 text-purple-500" />,
      trend: 'neutral',
      trendValue: 'Your main impact area',
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
      gradient: 'from-purple-50 to-purple-100',
      shadow: 'shadow-purple-100'
    },
  ];

  if (loading) {
    return (
      <div className="container py-12">
        <div className="space-y-8">
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-80" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Your Impact Dashboard
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Track your contributions and see the difference you're making in the fight against plastic pollution.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={loadData}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Data
                </>
              )}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {userStats.map((stat) => (
              <div key={stat.title} className={`relative overflow-hidden rounded-xl border-0 bg-gradient-to-br ${stat.gradient} shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                {/* Animated background elements */}
                <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${stat.color} opacity-20`}></div>
                <div className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full ${stat.color} opacity-20`}></div>
                
                <Card className="bg-transparent border-0 shadow-none">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
                    <div>
                      <CardTitle className={`text-sm font-medium ${stat.textColor}`}>
                        {stat.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.color} shadow-inner`}>
                      {stat.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className={`text-3xl font-bold ${stat.textColor} mb-2`}>
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </div>
                    
                    {/* Trend indicator with animation */}
                    <div className="flex items-center">
                      {stat.trend === 'up' && (
                        <div className="flex items-center px-2 py-1 bg-white/30 backdrop-blur-sm rounded-full">
                          <TrendingUp className="h-3.5 w-3.5 mr-1 text-green-600" />
                          <span className="text-xs font-medium text-green-700">{stat.trendValue}</span>
                        </div>
                      )}
                      {stat.trend === 'alert' && (
                        <div className="flex items-center px-2 py-1 bg-white/30 backdrop-blur-sm rounded-full">
                          <AlertCircle className="h-3.5 w-3.5 mr-1 text-amber-600" />
                          <span className="text-xs font-medium text-amber-700">{stat.trendValue}</span>
                        </div>
                      )}
                      {stat.trend === 'neutral' && (
                        <div className="flex items-center px-2 py-1 bg-white/30 backdrop-blur-sm rounded-full">
                          <span className="text-xs font-medium text-gray-700">{stat.trendValue}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  {/* Animated progress bar */}
                  <div className="px-6 pb-4 relative z-10">
                    <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stat.color.replace('bg-', 'bg-opacity-60 bg-')} transition-all duration-1000`}
                        style={{ 
                          width: `${Math.min(
                            (typeof stat.value === 'number' ? (stat.value / (stat.title === 'Total Impact' ? Math.max(stats.total, 10) : 1)) * 100 : 100), 
                            100
                          )}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Recent Contributions Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Contributions</CardTitle>
                    <CardDescription>Your latest plastic waste reports</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    View all <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contributions.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-[200px]">Brand</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                            <TableHead className="w-24"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contributions.slice(0, 5).map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <div className="bg-blue-100 text-blue-600 p-1.5 rounded-md mr-3">
                                    <Package className="h-4 w-4" />
                                  </div>
                                  <span>{item.brand || item.brand_suggestion || 'Unbranded'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                  {item.beach_name || 'Unknown'}
                                </div>
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                {format(new Date(item.created_at), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge 
                                  variant={
                                    item.status === 'classified' ? 'default' : 
                                    item.status === 'pending' || item.status === 'skipped' ? 'secondary' : 'destructive'
                                  }
                                  className="capitalize"
                                >
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-blue-600 hover:text-blue-700"
                                  onClick={() => {
                                    setSelectedContribution(item);
                                    setIsDetailsOpen(true);
                                  }}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg bg-gray-50">
                      <FileText className="h-10 w-10 mx-auto text-gray-400" />
                      <h3 className="mt-4 text-sm font-medium text-gray-900">No contributions yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by uploading your first plastic waste report.</p>
                      <Button className="mt-4" size="sm">
                        <Upload className="mr-2 h-4 w-4" /> Upload Report
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-between" variant="outline">
                  <span>Report Plastic Waste</span>
                  <Upload className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="outline">
                  <span>View Impact Map</span>
                  <MapPin className="h-4 w-4" />
                </Button>
                <Button className="w-full justify-between" variant="outline">
                  <span>View Leaderboard</span>
                  <TrendingUp className="h-4 w-4" />
                </Button>
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Your Impact Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reports this month</span>
                      <span className="font-medium">
                        {Math.min(contributions.filter(c => {
                          const date = new Date(c.created_at);
                          const now = new Date();
                          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                        }).length, 10)}/10
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(
                        (contributions.filter(c => {
                          const date = new Date(c.created_at);
                          const now = new Date();
                          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                        }).length / 10) * 100, 
                        100
                      )} 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {10 - Math.min(contributions.filter(c => {
                        const date = new Date(c.created_at);
                        const now = new Date();
                        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                      }).length, 10)} more to reach your monthly goal
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Empty State for No Contributions */}
          {contributions.length === 0 && (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No contributions yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Get started by uploading your first plastic waste report.
                </p>
                <div className="mt-6">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Contribution Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          {selectedContribution && (
            <>
              <DialogHeader>
                <DialogTitle>Contribution Details</DialogTitle>
                <DialogDescription>
                  Submitted {formatDistanceToNow(new Date(selectedContribution.created_at), { addSuffix: true })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Brand</h4>
                      <p className="mt-1">
                        {selectedContribution.brand || selectedContribution.brand_suggestion || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Manufacturer</h4>
                      <p className="mt-1">
                        {selectedContribution.manufacturer || selectedContribution.manufacturer_suggestion || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Plastic Type</h4>
                      <p className="mt-1">
                        {selectedContribution.plastic_type || selectedContribution.plastic_type_suggestion || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                      <p className="mt-1">
                        {selectedContribution.beach_name || 'Not specified'}
                        {selectedContribution.latitude && selectedContribution.longitude && (
                          <span className="block text-sm text-muted-foreground">
                            {selectedContribution.latitude.toFixed(4)}, {selectedContribution.longitude.toFixed(4)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedContribution.product_image_url && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Product Image</h4>
                          <div className="relative aspect-square rounded-md overflow-hidden border">
                            <img 
                              src={selectedContribution.product_image_url} 
                              alt="Product" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      {selectedContribution.recycling_image_url && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Recycling Info</h4>
                          <div className="relative aspect-square rounded-md overflow-hidden border">
                            <img 
                              src={selectedContribution.recycling_image_url} 
                              alt="Recycling Information" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      
                      {selectedContribution.manufacturer_image_url ? (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Manufacturer Info</h4>
                          <div className="relative aspect-square rounded-md overflow-hidden border">
                            <img 
                              src={selectedContribution.manufacturer_image_url} 
                              alt="Manufacturer Information" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Manufacturer Info</h4>
                          <div className="relative aspect-square rounded-md overflow-hidden border border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                            <div className="text-center p-4">
                              <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-xs text-gray-500">No image available</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {selectedContribution.notes && (
                      <div className="pt-2">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
                        <div className="p-3 bg-muted/30 rounded-md">
                          <p className="text-sm text-foreground">
                            {selectedContribution.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <Badge 
                      variant={
                        selectedContribution.status === 'classified' ? 'default' : 
                        selectedContribution.status === 'pending' || selectedContribution.status === 'skipped' ? 'secondary' : 'destructive'
                      }
                      className="mt-1 capitalize"
                    >
                      {selectedContribution.status}
                    </Badge>
                  </div>
                  
                  {selectedContribution.status_updated_at && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Status Updated</h4>
                      <p className="mt-1">
                        {formatDistanceToNow(new Date(selectedContribution.status_updated_at), { addSuffix: true })}
                      </p>
                    </div>
                  )}
                  
                  {selectedContribution.reviewed_by && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Reviewed By</h4>
                      <p className="mt-1">
                        {selectedContribution.reviewed_by}
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedContribution.review_notes && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-md">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Review Notes</h4>
                    <p className="text-sm">{selectedContribution.review_notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
