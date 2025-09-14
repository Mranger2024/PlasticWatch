'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { Search, BarChart2, AlertTriangle, TrendingUp, Download, ChevronDown, Filter, Info, Factory, Shuffle } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type CompanyRanking = {
  rank: number;
  company: string;
  manufacturer: string;
  items: number;
  trend?: 'up' | 'down' | 'stable';
  lastReported?: string;
};

async function getCompanyRankings(): Promise<CompanyRanking[]> {
  const { data, error } = await supabase
    .from('contributions')
    .select('brand, manufacturer, created_at')
    .filter('status', 'eq', 'classified')
    .not('brand', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching company data:', error);
    throw error;
  }

  // Define types for the company data
  type CompanyAccumulator = Record<string, { 
    items: number; 
    manufacturer: string; 
    timestamps: number[] 
  }>;

  // Process data to get counts and timestamps
  const companyData = (data as Array<{ brand: string | null; manufacturer: string | null; created_at: string }>).reduce<CompanyAccumulator>((acc, { brand, manufacturer, created_at }) => {
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
  }, {});

  // Calculate trends (simple: more reports in last 30 days = increasing trend)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return (Object.entries(companyData) as [string, { items: number; manufacturer: string; timestamps: number[] }][])
    .map(([company, { items, manufacturer, timestamps }]) => {
      // Simple trend calculation based on recent activity
      const recentCount = timestamps.filter((ts: number) => ts > thirtyDaysAgo.getTime()).length;
      const olderCount = timestamps.length - recentCount;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentCount > olderCount) trend = 'up';
      else if (recentCount < olderCount) trend = 'down';
      
      return {
        company,
        manufacturer,
        items,
        trend,
        lastReported: timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : undefined
      };
    })
    .sort((a, b) => b.items - a.items)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

function getPollutionBadge(rank: number, total: number) {
  if (rank === 1) return { 
    label: "Top Polluter", 
    icon: <AlertTriangle className="h-4 w-4 mr-1" />,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  };
  if (rank <= 3) return { 
    label: "High Impact", 
    icon: <AlertTriangle className="h-4 w-4 mr-1" />,
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
  };
  if (rank <= Math.ceil(total / 3)) return { 
    label: "Medium Impact", 
    icon: <Info className="h-4 w-4 mr-1" />,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  };
  return { 
    label: "Low Impact", 
    icon: <BarChart2 className="h-4 w-4 mr-1" />,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  };
}

export default function CompaniesPage() {
  const [rankings, setRankings] = useState<CompanyRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof CompanyRanking; direction: 'asc' | 'desc' }>(
    { key: 'rank', direction: 'asc' }
  );
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  
  const toggleExpandCompany = (company: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(company)) {
        newSet.delete(company);
      } else {
        newSet.add(company);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getCompanyRankings();
        setRankings(data);
      } catch (err) {
        console.error('Failed to load company data:', err);
        setError('Failed to load company rankings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSort = (key: keyof CompanyRanking) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredRankings = [...rankings]
    .filter(company => 
      company.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle undefined/null values
      if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
      
      // Compare values
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const totalItems = rankings.reduce((sum, company) => sum + company.items, 0);
  const topPolluter = rankings[0];
  const averagePerCompany = rankings.length > 0 
    ? Math.round(totalItems / rankings.length) 
    : 0;

  if (loading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-16 w-3/4 mx-auto mb-8" />
        <Skeleton className="h-6 w-1/2 mx-auto mb-12" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-2xl mx-auto">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p className="mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="text-red-700 border-red-200 hover:bg-red-50"
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
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-sm font-medium mb-6">
            <BarChart2 className="h-4 w-4 mr-2" />
            Corporate Accountability
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Company Pollution Rankings
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Tracking corporate plastic pollution based on community-reported data
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search companies..."
              className="w-full pl-12 pr-6 py-6 rounded-full border-0 shadow-lg focus:ring-2 focus:ring-blue-300 text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 -mt-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden border border-blue-100">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Companies Tracked</p>
                  <p className="text-3xl font-bold mt-1 text-gray-800">{rankings.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <BarChart2 className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-100">
                <p className="text-sm text-blue-500">Total items reported</p>
                <p className="text-xl font-semibold text-gray-800">{totalItems.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg overflow-hidden border border-red-100">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Top Polluter</p>
                  <p className="text-xl font-bold mt-1 text-gray-800 truncate">
                    {topPolluter?.company || 'N/A'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
              {topPolluter && (
                <div className="mt-4 pt-4 border-t border-red-100">
                  <p className="text-sm text-red-500">Reported items</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {topPolluter?.items?.toLocaleString() || '0'}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg overflow-hidden border border-green-100">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Average per Company</p>
                  <p className="text-3xl font-bold mt-1 text-gray-800">{averagePerCompany.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-100">
                <p className="text-sm text-green-500">Last updated</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">Corporate Pollution Leaderboard</CardTitle>
                <CardDescription className="mt-1">
                  Companies ranked by their plastic pollution footprint based on community reports
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => setSearchTerm('')}
                >
                  <Factory className="h-4 w-4 mr-2" />
                  Show All Manufacturers
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => {
                    const topManufacturers = Array.from(new Set(rankings.map(r => r.manufacturer))).slice(0, 5);
                    setSearchTerm(topManufacturers[Math.floor(Math.random() * topManufacturers.length)] || '');
                  }}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Random Brand
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead 
                    className="w-20 text-center cursor-pointer"
                    onClick={() => handleSort('rank')}
                  >
                    <div className="flex items-center justify-center">
                      <span>Rank</span>
                      {sortConfig.key === 'rank' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
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
                      {sortConfig.key === 'company' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="min-w-[200px] cursor-pointer"
                    onClick={() => handleSort('manufacturer')}
                  >
                    <div className="flex items-center">
                      <span>Manufacturer</span>
                      {sortConfig.key === 'manufacturer' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer"
                    onClick={() => handleSort('items')}
                  >
                    <div className="flex items-center justify-end">
                      <span>Items Reported</span>
                      {sortConfig.key === 'items' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-32 text-right">Trend</TableHead>
                  <TableHead className="w-40 text-right">Impact Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredRankings.length > 0 ? (
                  sortedAndFilteredRankings.map((company) => {
                    const badge = getPollutionBadge(company.rank, rankings.length);
                    return (
                      <TableRow 
                        key={company.rank} 
                        className="group hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="text-center font-medium">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                            company.rank <= 3 
                              ? 'bg-yellow-100 text-yellow-800 font-bold' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {company.rank}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-lg w-10 h-10 flex items-center justify-center font-bold mr-3 shadow-sm">
                              {company.company.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div 
                                className="group-hover:text-blue-600 transition-colors font-medium cursor-pointer flex items-center"
                                onClick={() => toggleExpandCompany(company.company)}
                              >
                                {company.company}
                                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${expandedCompanies.has(company.company) ? 'rotate-180' : ''}`} />
                              </div>
                              {expandedCompanies.has(company.company) && (
                                <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-md">
                                  <div className="flex items-center mb-1">
                                    <span className="font-medium mr-2">Manufacturer:</span>
                                    <span>{company.manufacturer || 'Not specified'}</span>
                                  </div>
                                  {company.lastReported && (
                                    <div className="flex items-center">
                                      <span className="font-medium mr-2">Last reported:</span>
                                      <span>{new Date(company.lastReported).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {company.manufacturer || 'Unspecified'}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {company.items.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${company.trend === 'up' ? 'bg-red-100 text-red-800' : company.trend === 'down' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {company.trend === 'up' ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : company.trend === 'down' ? (
                                <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                              ) : (
                                <div className="h-3 w-3 mr-1"></div>
                              )}
                              {company.trend === 'up' ? 'Increasing' : company.trend === 'down' ? 'Decreasing' : 'Stable'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${badge.className}`}
                          >
                            {badge.icon}
                            {badge.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No companies found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm 
                            ? `No companies match "${searchTerm}". Try a different search term.`
                            : 'No company data available. Check back later for updates.'
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
          
          {sortedAndFilteredRankings.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 text-sm text-muted-foreground">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p>Showing {sortedAndFilteredRankings.length} of {rankings.length} companies</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Corporate Accountability in Plastic Waste</h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8 text-lg">
            The data presented here is based on community reports of plastic waste found in our oceans and beaches. 
            By identifying the top polluting companies and their manufacturers, we aim to drive corporate responsibility 
            and encourage sustainable packaging solutions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Factory className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Manufacturer Insights</h3>
              <p className="text-gray-600 text-sm">
                See which parent companies are responsible for the most plastic pollution across their brand portfolios.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Trend Analysis</h3>
              <p className="text-gray-600 text-sm">
                Track whether companies are increasing or decreasing their plastic waste footprint over time.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Impact Assessment</h3>
              <p className="text-gray-600 text-sm">
                Understand the scale of each company's environmental impact through verified community reports.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md">
              Report Plastic Waste
            </Button>
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700">
              Learn About Our Methodology
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}