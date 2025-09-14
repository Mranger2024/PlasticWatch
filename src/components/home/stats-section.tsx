'use client';

import React, { useEffect, useState } from 'react';
import { Package, Users, Factory, Waves, MapPin, Shield, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

// Dynamically import AnimatedCounter with SSR disabled
const AnimatedCounter = dynamic(
  () => import('@/components/animated-counter'),
  { ssr: false }
);

// Helper function to fetch stats
async function getGlobalStats() {
    try {
        const { count: totalContributions, error: contributionsError } = await supabase
            .from('contributions')
            .select('*', { count: 'exact', head: true });

        const { data: companies, error: companiesError } = await supabase
            .from('contributions')
            .select('brand', { count: 'exact' })
            .filter('status', 'eq', 'classified')
            .not('brand', 'is', null);

        if (contributionsError || companiesError) {
            throw contributionsError || companiesError;
        }

        const { count: uniqueContributors } = await supabase
            .from('contributions')
            .select('user_id', { count: 'exact', head: true });
            
        const uniqueCompanies = new Set((companies as Array<{brand: string | null}>).map(c => c.brand)).size;

        return {
            plastics: totalContributions ?? 0,
            contributors: uniqueContributors ?? 0,
            companies: uniqueCompanies,
        };
    } catch (error) {
        console.error("Error fetching global stats:", error);
        return {
            plastics: 0,
            contributors: 0,
            companies: 0,
        };
    }
}


// This is a Client Component
function StatsSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    plastics: 0,
    contributors: 0,
    companies: 0
  });

  useEffect(() => {
    let isMounted = true;
    
    async function fetchStats() {
      try {
        const stats = await getGlobalStats();
        if (isMounted) {
          setGlobalStats(stats);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchStats();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      icon: <Package className="h-10 w-10 text-blue-600" />,
      title: 'Plastics Documented',
      value: !isLoading ? globalStats.plastics : 0,
      description: 'Pieces of plastic waste tracked and cataloged',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      icon: <Users className="h-10 w-10 text-teal-600" />,
      title: 'Active Contributors',
      value: !isLoading ? globalStats.contributors : 0,
      description: 'People making a difference worldwide',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
    },
    {
      icon: <Factory className="h-10 w-10 text-amber-600" />,
      title: 'Companies Identified',
      value: !isLoading ? globalStats.companies : 0,
      description: 'Brands held accountable for pollution',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
  ];

  // Skeleton loader
  if (isLoading) {
    return (
      <section className="relative py-20 overflow-hidden bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="h-8 w-32 mx-auto bg-gray-200 rounded-full mb-4"></div>
            <div className="h-12 w-64 mx-auto bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-5 w-96 mx-auto bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-24 bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/beach-bones.png')]" />
      </div>
      
      {/* Wave divider at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent -z-10" />

      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4">
            <Waves className="h-4 w-4 mr-2" />
            Making an Impact
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Global Reach
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of environmental champions in our mission to clean up beaches and track plastic pollution worldwide.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat, index) => (
            <div 
              key={stat.title} 
              className={`group relative p-8 rounded-2xl ${stat.bgColor} border ${stat.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
            >
              {/* Decorative corner */}
              <div className={`absolute top-0 right-0 w-16 h-16 overflow-hidden`}>
                <div className={`absolute -right-8 -top-8 w-16 h-16 rotate-45 transform ${stat.bgColor} border-b ${stat.borderColor} border-r`} />
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className={`p-4 rounded-full ${index === 0 ? 'bg-blue-100' : index === 1 ? 'bg-teal-100' : 'bg-amber-100'} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">
                  <AnimatedCounter value={stat.value} />
                  <span className="text-2xl">+</span>
                </h3>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{stat.title}</h4>
                <p className="text-gray-600 text-sm">{stat.description}</p>
                
                {/* Animated underline */}
                <div className="mt-6 w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent transform group-hover:scale-125 transition-transform duration-300" />
              </div>
              
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute rounded-full bg-white/30"
                    style={{
                      width: `${Math.random() * 8 + 4}px`,
                      height: `${Math.random() * 8 + 4}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animation: `float ${Math.random() * 3 + 2}s infinite ease-in-out`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">Be part of the solution. Your contribution matters.</p>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center mx-auto">
            Join Our Community
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Wave divider at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent -z-10" />
      
      {/* Global map pattern */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-10px) translateX(5px); }
        }
      `}</style>
    </section>
  );
}

export default StatsSection;
