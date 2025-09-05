'use client';

import { 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Filter, 
  Search as SearchIcon, 
  Eye, 
  ImageIcon, 
  ChevronDown, 
  ChevronRight, 
  Loader2, 
  MoreHorizontal, 
  Plus, 
  RefreshCw, 
  SlidersHorizontal,
  TrendingUp,
  X,
  Sun,
  Moon,
  FileText
} from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import Image from "next/image";
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/icons";

// Utils & Services
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';

// Constants
const ITEMS_PER_PAGE = 20;

interface Contribution {
  id: string;
  brand: string | null;
  brand_suggestion: string | null;
  beach_name: string | null;
  created_at: string;
  status: string;
  product_image_url?: string;
  [key: string]: any; // Allow additional properties
}

type Stats = {
  pending: number;
  classified: number;
  newToday: number;
  weeklyChange: number;
  avgProcessingTime: string;
};

// Types for VirtualizedList props
interface VirtualizedListProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T, index: number, isScrolling: boolean) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  loading?: boolean;
}

// Virtual scrolling implementation for better performance with large datasets
const VirtualizedList = <T extends { id: string }>({
  items = [],
  renderItem,
  itemHeight = 72,
  containerHeight = 600,
  loading = false
}: VirtualizedListProps<T>): React.ReactElement => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setIsScrolling(true);
    setScrollTop(target.scrollTop);
    
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  // Calculate visible items
  const startIdx = Math.max(0, Math.floor(scrollTop / (itemHeight || 1)) - 5);
  const endIdx = Math.min(
    items.length - 1, 
    Math.ceil((scrollTop + (containerHeight || 600)) / (itemHeight || 1)) + 5
  );
  
  const visibleItems = items.slice(startIdx, endIdx + 1);
  const paddingTop = startIdx * (itemHeight || 1);
  const paddingBottom = Math.max(0, (items.length - endIdx - 1) * (itemHeight || 1));

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div 
      className="overflow-y-auto w-full"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ paddingTop, paddingBottom }}>
        {visibleItems.map((item, index) => (
          <div 
            key={item.id} 
            style={{ height: itemHeight }}
            className="w-full"
          >
            {renderItem(item, startIdx + index, isScrolling)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Initialize theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // State for the admin dashboard
  const [activeTab, setActiveTab] = useState<'pending' | 'classified'>(searchParams.get('tab') as 'pending' | 'classified' || 'pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState<{ pending: Contribution[], classified: Contribution[] }>({ 
    pending: [], 
    classified: [] 
  });
  const [stats, setStats] = useState<Stats>({ 
    pending: 0, 
    classified: 0, 
    newToday: 0, 
    weeklyChange: 0, 
    avgProcessingTime: '0m' 
  });

  // Fetch contributions and stats
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch pending contributions
        const { data: pendingData } = await supabase
          .from('contributions')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        // Fetch classified contributions
        const { data: classifiedData } = await supabase
          .from('contributions')
          .select('*')
          .eq('status', 'classified')
          .order('created_at', { ascending: false });

        // Update state
        setContributions({
          pending: pendingData || [],
          classified: classifiedData || []
        });

        // Calculate stats (simplified for example)
        setStats({
          pending: pendingData?.length || 0,
          classified: classifiedData?.length || 0,
          newToday: Math.floor(Math.random() * 10), // Example
          weeklyChange: Math.floor(Math.random() * 30) - 10, // Example: -10% to +20%
          avgProcessingTime: '15m' // Example
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    const tab = value as 'pending' | 'classified';
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    if (tab === 'pending') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Filter contributions based on search query
  const filteredContributions = useMemo(() => {
    const items = activeTab === 'pending' ? contributions.pending : contributions.classified;
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      (item.brand?.toLowerCase().includes(query) ?? false) ||
      (item.brand_suggestion?.toLowerCase().includes(query) ?? false) ||
      (item.beach_name?.toLowerCase().includes(query) ?? false) ||
      (item.id?.toLowerCase().includes(query) ?? false)
    );
  }, [activeTab, contributions, searchQuery]);

  // Calculate stats
  const total = stats.pending + stats.classified;
  const classificationRate = total > 0 ? Number(((stats.classified / total) * 100).toFixed(1)) : 0;

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header and Theme Toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting classification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.classified}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.newToday}</div>
            <p className="text-xs text-muted-foreground">Since yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classification Rate</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classificationRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.weeklyChange >= 0 ? '+' : ''}{stats.weeklyChange}% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Contributions</CardTitle>
              <CardDescription>
                {activeTab === 'pending' 
                  ? 'Review and classify new submissions' 
                  : 'View previously classified items'}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search contributions..."
                  className="pl-9 w-[200px] md:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Pending Review</span>
                  {stats.pending > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {stats.pending}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger value="classified">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Classified</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              <div className="rounded-md border">
                <VirtualizedList
                  items={filteredContributions}
                  itemHeight={80}
                  containerHeight={600}
                  loading={loading}
                  renderItem={(item, index, isScrolling) => (
                    <div className="p-4 border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
                          {item.product_image_url ? (
                            <Image
                              src={item.product_image_url}
                              alt={item.brand || 'Contribution'}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.brand || 'Unknown Brand'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.beach_name || 'Location not specified'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={item.status === 'pending' ? 'secondary' : 'default'}>
                            {item.status}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 whitespace-nowrap"
                            onClick={() => router.push(`/admin/review/${item.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>
              
              {filteredContributions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    {searchQuery 
                      ? 'No matching contributions found' 
                      : activeTab === 'pending' 
                        ? 'No pending contributions' 
                        : 'No classified contributions yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-2">
                    {searchQuery
                      ? 'Try adjusting your search or filter to find what you\'re looking for.'
                      : activeTab === 'pending'
                        ? 'All caught up! New submissions will appear here.'
                        : 'As you classify items, they will appear here.'}
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="ghost" 
                      className="mt-4"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function for conditional class names
function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
