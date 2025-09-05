'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Factory, Shield, BarChart2, TrendingUp, Info, Search, ChevronDown, ChevronUp } from "lucide-react";

interface CompanyRanking {
  rank: number;
  company: string;
  items: number;
  trend?: 'up' | 'down' | 'stable';
  lastReported?: string;
  country?: string;
  sector?: string;
}

async function getCompanyRankings(): Promise<CompanyRanking[]> {
  const { data, error } = await supabase
    .from('contributions')
    .select('brand, created_at, country, sector')
    .filter('status', 'eq', 'classified')
    .not('brand', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching company data:', error);
    throw error;
  }

  // Process company data
  const companyData = data.reduce((acc, { brand, created_at, country, sector }) => {
    if (brand) {
      const company = brand.trim();
      if (!acc[company]) {
        acc[company] = { 
          items: 0, 
          timestamps: [],
          lastReported: created_at,
          country: country || 'Unknown',
          sector: sector || 'Other'
        };
      }
      acc[company].items += 1;
      acc[company].timestamps.push(new Date(created_at).getTime());
      
      // Update last reported time if this is newer
      if (new Date(created_at) > new Date(acc[company].lastReported)) {
        acc[company].lastReported = created_at;
      }
    }
    return acc;
  }, {} as Record<string, { 
    items: number; 
    timestamps: number[]; 
    lastReported: string;
    country: string;
    sector: string;
  }>);

  // Calculate trends (simple: more reports in last 30 days = increasing trend)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const companyRankings = Object.entries(companyData)
    .map(([company, { items, timestamps, lastReported, country, sector }]) => {
      // Simple trend calculation
      const recentReports = timestamps.filter(t => t > thirtyDaysAgo.getTime()).length;
      const previousPeriod = timestamps.length - recentReports;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentReports > previousPeriod) trend = 'up';
      else if (recentReports < previousPeriod) trend = 'down';
      
      return { 
        company, 
        items, 
        trend,
        lastReported: new Date(lastReported).toLocaleDateString(),
        country,
        sector
      };
    })
    .sort((a, b) => b.items - a.items)
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));

  return companyRankings;
}

function getPollutionBadge(rank: number, total: number) {
  if (rank === 1) return { variant: 'default', label: 'Top Polluter', icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" /> };
  if (rank <= 3) return { variant: 'destructive', label: 'High Impact', icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" /> };
  if (rank <= Math.ceil(total / 3)) return { variant: 'destructive', label: 'High', icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" /> };
  if (rank <= Math.ceil(total * 2/3)) return { variant: 'secondary', label: 'Medium', icon: <BarChart2 className="h-3.5 w-3.5 mr-1" /> };
  return { variant: 'default', label: 'Low', icon: <BarChart2 className="h-3.5 w-3.5 mr-1" /> };
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

type SortField = 'rank' | 'company' | 'items' | 'trend' | 'country' | 'sector';
type SortOrder = 'asc' | 'desc';

export default function CompaniesPage() {
  const [rankings, setRankings] = useState<CompanyRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    async function loadRankings() {
      try {
        setLoading(true);
        const data = await getCompanyRankings();
        setRankings(data);
      } catch (err) {
        console.error('Failed to load company rankings:', err);
        setError('Failed to load company data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadRankings();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedRankings = [...rankings]
    .filter(company => 
      company.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.sector?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'rank':
          comparison = a.rank - b.rank;
          break;
        case 'company':
          comparison = a.company.localeCompare(b.company);
          break;
        case 'items':
          comparison = a.items - b.items;
          break;
        case 'trend':
          const trendOrder = { 'up': 1, 'stable': 0, 'down': -1 };
          comparison = (trendOrder[a.trend || 'stable'] - trendOrder[b.trend || 'stable']);
          break;
        case 'country':
          comparison = (a.country || '').localeCompare(b.country || '');
          break;
        case 'sector':
          comparison = (a.sector || '').localeCompare(b.sector || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalCompanies = rankings.length;
  const totalItems = rankings.reduce((sum, company) => sum + company.items, 0);
  const topPolluter = rankings[0];
  const topSector: Record<string, number> = [...rankings]
    .reduce((acc, company) => {
      const sector = company.sector || 'Other';
      acc[sector] = (acc[sector] || 0) + company.items;
      return acc;
    }, {} as Record<string, number>);
  
  const mostPollutingSector = Object.entries(topSector)
    .sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-12 w-full mt-8" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-sm font-medium mb-4">
                <Factory className="h-4 w-4 mr-2" />
                Corporate Accountability
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                Plastic Polluters Index
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl">
                Holding corporations accountable for their plastic waste and environmental impact.
              </p>
            </div>
            
            <div className="w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search companies..."
                  className="w-full md:w-80 px-6 py-3 rounded-full border-0 shadow-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 -mt-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Factory className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Companies Tracked</p>
              <p className="text-2xl font-bold">{totalCompanies}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Items Found</p>
              <p className="text-2xl font-bold">{totalItems.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Top Polluter</p>
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{topPolluter?.company || 'N/A'}</p>
                <p className="text-sm text-gray-500">{topPolluter?.items.toLocaleString()} items</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Most Polluting Sector</p>
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{mostPollutingSector[0]}</p>
                <p className="text-sm text-gray-500">{mostPollutingSector[1].toLocaleString()} items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="container mx-auto px-4 pb-16">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">Corporate Plastic Footprint</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Ranking companies by their plastic waste contribution
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {sortedRankings.length} of {rankings.length} companies
                </span>
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead 
                    className="w-20 cursor-pointer"
                    onClick={() => handleSort('rank')}
                  >
                    <div className="flex items-center">
                      <span>Rank</span>
                      {sortField === 'rank' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="min-w-[250px] cursor-pointer"
                    onClick={() => handleSort('company')}
                  >
                    <div className="flex items-center">
                      <span>Company</span>
                      {sortField === 'company' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer"
                    onClick={() => handleSort('items')}
                  >
                    <div className="flex items-center justify-end">
                      <span>Items Found</span>
                      {sortField === 'items' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('sector')}
                  >
                    <div className="flex items-center">
                      <span>Sector</span>
                      {sortField === 'sector' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('country')}
                  >
                    <div className="flex items-center">
                      <span>Country</span>
                      {sortField === 'country' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer"
                    onClick={() => handleSort('trend')}
                  >
                    <div className="flex items-center justify-end">
                      <span>Trend</span>
                      {sortField === 'trend' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRankings.length > 0 ? (
                  sortedRankings.map((company) => {
                    const badge = getPollutionBadge(company.rank, totalCompanies);
                    return (
                      <TableRow 
                        key={`${company.rank}-${company.company}`} 
                        className="group hover:bg-gray-50 cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === company.rank ? null : company.rank)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-2 ${company.rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                              {company.rank}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                              <Factory className="h-5 w-5" />
                            </div>
                            <span className="group-hover:text-blue-600 transition-colors">
                              {company.company}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {company.items.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            {company.sector}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700">
                            {company.country}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            {getTrendIcon(company.trend)}
                            <span className="ml-1 text-sm text-gray-500">
                              {company.trend === 'up' ? 'Increasing' : company.trend === 'down' ? 'Decreasing' : 'Stable'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Badge variant={badge.variant as any} className="flex items-center">
                              {badge.icon}
                              {badge.label}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No companies found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm 
                            ? `No companies match "${searchTerm}". Try a different search term.`
                            : 'No company data available yet.'
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
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {sortedRankings.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 text-sm text-muted-foreground">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p>Showing {sortedRankings.length} of {rankings.length} companies</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Data last updated: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Demand Corporate Responsibility</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Join our campaign to hold corporations accountable for their plastic waste and push for sustainable alternatives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              Sign the Petition
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
