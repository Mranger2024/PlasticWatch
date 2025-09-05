'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, Award, Trophy, TrendingUp, MapPin, Calendar, Users, ChevronRight, CheckCircle, Clock } from "lucide-react";

interface Contributor {
  id: string;
  name: string;
  contributions: number;
  avatar: string;
  location?: string;
  joinDate?: string;
  lastActive?: string;
  level?: number;
  badges?: string[];
  recentActivity?: string[];
}

async function getContributors(): Promise<Contributor[]> {
  // In a real app, this would fetch from your database
  // For now, we'll use mock data with enhanced information
  const mockContributors: Contributor[] = [
    {
      id: '1',
      name: 'EcoWarrior22',
      contributions: 142,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      location: 'San Francisco, CA',
      joinDate: '2022-01-15',
      lastActive: '2023-10-25',
      level: 5,
      badges: ['Top Contributor', 'Beach Cleanup Hero', 'Plastic-Free Champion'],
      recentActivity: [
        'Reported 12 plastic waste items at Ocean Beach',
        'Completed "Plastic-Free July" challenge',
        'Earned "Eco Warrior" badge'
      ]
    },
    {
      id: '2',
      name: 'BeachCleaner_SG',
      contributions: 98,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
      location: 'Singapore',
      joinDate: '2022-03-22',
      lastActive: '2023-10-24',
      level: 4,
      badges: ['Beach Cleanup Hero', 'Community Leader'],
      recentActivity: [
        'Organized beach cleanup at East Coast Park',
        'Reported 8 plastic waste items',
        'Reached level 4 contributor'
      ]
    },
    {
      id: '3',
      name: 'PlasticPatrol_AU',
      contributions: 76,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      location: 'Sydney, Australia',
      joinDate: '2022-05-10',
      lastActive: '2023-10-23',
      level: 3,
      badges: ['Plastic-Free Champion'],
      recentActivity: [
        'Reported 15 plastic waste items at Bondi Beach',
        'Shared cleanup photos with the community',
        'Earned "Plastic-Free Champion" badge'
      ]
    },
    {
      id: '4',
      name: 'GreenGuardian',
      contributions: 51,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      location: 'London, UK',
      joinDate: '2022-07-18',
      lastActive: '2023-10-22',
      level: 3,
      badges: ['Eco Educator'],
      recentActivity: [
        'Shared educational content about plastic pollution',
        'Reported 5 plastic waste items',
        'Reached level 3 contributor'
      ]
    },
    {
      id: '5',
      name: 'OceanLover',
      contributions: 34,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80',
      location: 'Vancouver, Canada',
      joinDate: '2022-09-05',
      lastActive: '2023-10-21',
      level: 2,
      badges: [],
      recentActivity: [
        'Started contributing to beach cleanups',
        'Reported first plastic waste items',
        'Joined the community'
      ]
    },
  ];

  return mockContributors;
}

function getLevelBadge(level: number) {
  if (level >= 5) return { color: 'bg-yellow-100 text-yellow-800', label: 'Elite' };
  if (level >= 3) return { color: 'bg-purple-100 text-purple-800', label: 'Advanced' };
  return { color: 'bg-blue-100 text-blue-800', label: 'Beginner' };
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

type SortField = 'rank' | 'name' | 'contributions' | 'level' | 'joinDate';
type SortOrder = 'asc' | 'desc';

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('contributions');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    async function loadContributors() {
      try {
        setLoading(true);
        const data = await getContributors();
        setContributors(data);
      } catch (err) {
        console.error('Failed to load contributors:', err);
        setError('Failed to load contributor data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadContributors();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedContributors = [...contributors]
    .filter(contributor => 
      contributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contributor.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'rank':
          // Rank is based on the original order in the mock data
          comparison = a.contributions - b.contributions;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'contributions':
          comparison = a.contributions - b.contributions;
          break;
        case 'level':
          comparison = (a.level || 0) - (b.level || 0);
          break;
        case 'joinDate':
          comparison = new Date(a.joinDate || 0).getTime() - new Date(b.joinDate || 0).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0);
  const topContributor = [...contributors].sort((a, b) => b.contributions - a.contributions)[0];
  const activeUsers = contributors.filter(c => {
    const lastActive = c.lastActive ? new Date(c.lastActive) : new Date(0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastActive > thirtyDaysAgo;
  }).length;

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
          <div className="h-12 w-12 mx-auto text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
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
      <div className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-sm font-medium mb-6">
            <Users className="h-4 w-4 mr-2" />
            Community Impact
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Our Amazing Contributors
          </h1>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto mb-8">
            Celebrating the dedicated individuals making a difference in the fight against plastic pollution.
          </p>
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search contributors..."
              className="w-full px-6 py-3 rounded-full border-0 shadow-lg focus:ring-2 focus:ring-teal-300 text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 -mt-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center">
            <div className="p-3 rounded-full bg-teal-100 text-teal-600 mr-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Contributors</p>
              <p className="text-2xl font-bold">{contributors.length}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Contributions</p>
              <p className="text-2xl font-bold">{totalContributions.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">Top Contributor</p>
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={topContributor?.avatar} alt={topContributor?.name} />
                <AvatarFallback>{topContributor?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{topContributor?.name}</p>
                <p className="text-sm text-gray-500">{topContributor?.contributions} contributions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contributors Table */}
      <div className="container mx-auto px-4 pb-16">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">Contributor Leaderboard</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Recognizing the most active members of our community
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {sortedContributors.length} of {contributors.length} contributors
                </span>
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSearchTerm('')}
                    className="text-teal-600 hover:bg-teal-50"
                  >
                    Clear search
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
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Contributor</span>
                      {sortField === 'name' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer"
                    onClick={() => handleSort('contributions')}
                  >
                    <div className="flex items-center justify-end">
                      <span>Contributions</span>
                      {sortField === 'contributions' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('level')}
                  >
                    <div className="flex items-center">
                      <span>Level</span>
                      {sortField === 'level' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('joinDate')}
                  >
                    <div className="flex items-center">
                      <span>Member Since</span>
                      {sortField === 'joinDate' && (
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
                {sortedContributors.length > 0 ? (
                  sortedContributors.map((contributor, index) => {
                    const levelBadge = getLevelBadge(contributor.level || 1);
                    const isExpanded = expandedRow === contributor.id;
                    
                    return (
                      <>
                        <TableRow 
                          key={contributor.id} 
                          className="group hover:bg-gray-50 cursor-pointer"
                          onClick={() => setExpandedRow(isExpanded ? null : contributor.id)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-2 ${index < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                {index + 1}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={contributor.avatar} alt={contributor.name} />
                                <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="block group-hover:text-teal-600 transition-colors">
                                  {contributor.name}
                                </span>
                                {contributor.location && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="h-3.5 w-3.5 mr-1" />
                                    <span>{contributor.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {contributor.contributions.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelBadge.color}`}>
                              Lvl {contributor.level} • {levelBadge.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {contributor.joinDate ? formatDate(contributor.joinDate) : 'N/A'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-gray-50">
                            <TableCell colSpan={6} className="p-0">
                              <div className="p-4 pl-20">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">BADGES</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {contributor.badges && contributor.badges.length > 0 ? (
                                        contributor.badges.map((badge, i) => (
                                          <Badge key={i} variant="outline" className="flex items-center">
                                            <Award className="h-3.5 w-3.5 mr-1 text-amber-500" />
                                            {badge}
                                          </Badge>
                                        ))
                                      ) : (
                                        <p className="text-sm text-gray-500">No badges yet</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">RECENT ACTIVITY</h4>
                                    <ul className="space-y-2">
                                      {contributor.recentActivity?.map((activity, i) => (
                                        <li key={i} className="flex items-start">
                                          <CheckCircle className="h-4 w-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                                          <span className="text-sm text-gray-700">{activity}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">STATS</h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Contributions</span>
                                        <span className="font-medium">{contributor.contributions}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Member since</span>
                                        <span className="text-sm text-gray-700">
                                          {contributor.joinDate ? formatDate(contributor.joinDate) : 'N/A'}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Last active</span>
                                        <div className="flex items-center">
                                          <Clock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                          <span className="text-sm text-gray-700">
                                            {contributor.lastActive ? formatDate(contributor.lastActive) : 'N/A'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="mt-4 w-full">
                                      View full profile
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No contributors found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm 
                            ? `No contributors match "${searchTerm}". Try a different search term.`
                            : 'No contributor data available.'
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
          
          {sortedContributors.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 text-sm text-muted-foreground">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p>Showing {sortedContributors.length} of {contributors.length} contributors</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto mb-8">
            Join our community of environmental activists and help us track and reduce plastic pollution worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50">
              Join the Movement
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Learn How to Contribute
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
