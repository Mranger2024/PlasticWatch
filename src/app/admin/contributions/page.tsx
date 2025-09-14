'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { supabase } from '@/lib/supabase/client';

interface Contribution {
  id: string;
  created_at: string;
  status: 'pending' | 'classified' | 'rejected';
  brand: string | null;
  brand_suggestion: string | null;
  beach_name: string | null;
  product_image_url: string | null;
  user_id: string;
  latitude: number;
  longitude: number;
  backside_image_url: string | null;
  recycling_image_url: string | null;
  manufacturer_image_url: string | null;
  notes: string | null;
}

export default function ContributionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState<{
    pending: Contribution[];
    classified: Contribution[];
    rejected: Contribution[];
  }>({ pending: [], classified: [], rejected: [] });
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      
      // Fetch all contributions with their status
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by status
      const grouped = {
        pending: data.filter((c: Contribution) => c.status === 'pending'),
        classified: data.filter((c: Contribution) => c.status === 'classified'),
        rejected: data.filter((c: Contribution) => c.status === 'rejected')
      };

      setContributions(grouped);
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (id: string) => {
    router.push(`/admin/review/${id}`);
  };

  const renderContributionCard = (contribution: Contribution) => (
    <Card key={contribution.id} className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-4">
          {contribution.product_image_url ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <img
                src={contribution.product_image_url}
                alt={contribution.brand || 'Contribution'}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
              <Icons.fileText className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <h3 className="font-medium">
              {contribution.brand || contribution.brand_suggestion || 'Unknown Brand'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {contribution.beach_name || 'Location not specified'}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(contribution.created_at), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${
            contribution.status === 'classified' 
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
              : contribution.status === 'rejected'
                ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
          }`}>
            {contribution.status}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleReview(contribution.id)}
          >
            <Icons.fileText className="h-4 w-4 mr-1" />
            Review
          </Button>
        </div>
      </CardHeader>
    </Card>
  );

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-md" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contributions</h1>
          <p className="text-muted-foreground">
            Manage and review user contributions
          </p>
        </div>
      </div>

      <Tabs 
        defaultValue="pending" 
        className="space-y-4"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {contributions.pending.length > 0 && (
              <Badge className="ml-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                {contributions.pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="classified">
            Classified
            {contributions.classified.length > 0 && (
              <Badge className="ml-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                {contributions.classified.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            {contributions.rejected.length > 0 && (
              <Badge className="ml-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                {contributions.rejected.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {loading ? (
            renderSkeleton()
          ) : contributions.pending.length > 0 ? (
            contributions.pending.map(renderContributionCard)
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Icons.fileText className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No pending contributions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="classified" className="space-y-4">
          {loading ? (
            renderSkeleton()
          ) : contributions.classified.length > 0 ? (
            contributions.classified.map(renderContributionCard)
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Icons.checkCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No classified contributions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {loading ? (
            renderSkeleton()
          ) : contributions.rejected.length > 0 ? (
            contributions.rejected.map(renderContributionCard)
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Icons.alertTriangle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No rejected contributions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
