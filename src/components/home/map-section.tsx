'use client';

import dynamic from 'next/dynamic';

// Dynamically import the BeachMap component with no SSR
const BeachMap = dynamic(
  () => import('@/components/maps/beach-map').then((mod) => mod.default),
  { 
    ssr: false, // Disable server-side rendering for the map
    loading: () => (
      <div className="h-[600px] w-full bg-muted/30 rounded-lg flex items-center justify-center">
        <p>Loading map...</p>
      </div>
    ),
  }
);

export default function MapSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <BeachMap />
      </div>
    </section>
  );
}
