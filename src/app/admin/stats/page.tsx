'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, FileText, Clock, TrendingUp, Activity, Calendar, Download } from "lucide-react";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface Stats {
  totalUsers: number;
  totalContributions: number;
  pendingContributions: number;
  classifiedContributions: number;
  avgProcessingTime: string;
  classificationRate: string;
  weeklyChange: number;
  newThisWeek: number;
  lastUpdated: Date | null;
}

export default function AdminStatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalContributions: 0,
    pendingContributions: 0,
    classifiedContributions: 0,
    avgProcessingTime: '0m',
    classificationRate: '0%',
    weeklyChange: 0,
    newThisWeek: 0,
    lastUpdated: null,
  });

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch contribution stats
      const { count: totalContributions } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true });

      const { count: pendingContributions } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: classifiedContributions } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'classified');

      // Calculate classification rate
      const classificationRate = totalContributions && totalContributions > 0
        ? Math.round((classifiedContributions || 0) / totalContributions * 100)
        : 0;

      // Get new contributions this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: newThisWeek } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      // Calculate weekly change (simplified - in a real app, you'd compare with previous week)
      const weeklyChange = 0; // This would require historical data to calculate

      // Calculate average processing time (simplified)
      // In a real app, you'd calculate the actual time difference between creation and classification
      const avgProcessingTime = '2h 15m';

      setStats({
        totalUsers: userCount || 0,
        totalContributions: totalContributions || 0,
        pendingContributions: pendingContributions || 0,
        classifiedContributions: classifiedContributions || 0,
        avgProcessingTime,
        classificationRate: `${classificationRate}%`,
        weeklyChange,
        newThisWeek: newThisWeek || 0,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchStats();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Analytics</h1>
          <p className="text-muted-foreground">
            Track and analyze platform performance and user engagement
            {stats.lastUpdated && (
              <span className="text-xs ml-2">
                (Last updated {formatDistanceToNow(stats.lastUpdated, { addSuffix: true })})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" disabled={isLoading}>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  Registered on the platform
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.totalContributions}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  {stats.pendingContributions} pending, {stats.classifiedContributions} classified
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New This Week</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">+{stats.newThisWeek}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  New contributions in the last 7 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Classification Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.classificationRate}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  Of all contributions
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Weekly contribution trends</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p>Activity chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="rounded-full bg-muted h-10 w-10 flex items-center justify-center">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none">New contribution submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {i} hour{i !== 1 ? 's' : ''} ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed user statistics and metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
              <p>User analytics will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contribution Analytics</CardTitle>
              <CardDescription>Detailed contribution statistics and metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
              <p>Contribution analytics will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Platform performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
              <p>Performance metrics will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
