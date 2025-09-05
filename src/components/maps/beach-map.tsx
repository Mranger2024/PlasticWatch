'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase/client';

interface BrandCount {
  name: string;
  count: number;
}

interface BeachData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  plastic_count: number;
  top_brands: BrandCount[];
}

interface Contribution {
  beach_name: string | null;
  latitude: number | null;
  longitude: number | null;
  brand: string | null;
}

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Default center (can be set to a common location or first beach's location)
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // Center of India

// Custom marker icon
const createMarkerIcon = (count: number) => {
  const size = 40 + Math.min(count / 5, 30); // Scale size based on count
  const color = count > 50 ? '#ef4444' : count > 20 ? '#f59e0b' : '#10b981';
  
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 0.7,
    strokeWeight: 2,
    strokeColor: '#ffffff',
    scale: Math.sqrt(size) * 0.7,
    label: {
      text: count.toString(),
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: '12px',
    },
  };
};

export default function BeachMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [beaches, setBeaches] = useState<BeachData[]>([]);
  const [selectedBeach, setSelectedBeach] = useState<BeachData | null>(null);
  const [loading, setLoading] = useState(true);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Fetch beach data from Supabase
  useEffect(() => {
    const fetchBeachData = async () => {
      try {
        // Fetch contributions with location data
        const { data, error } = await supabase
          .from('contributions')
          .select('beach_name, latitude, longitude, brand')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) throw error;

        // Process data to group by beach and count plastic
        const beachMap = new Map<string, {
          name: string;
          latitude: number;
          longitude: number;
          plastic_count: number;
          brands: Map<string, number>;
        }>();
        
        (data as unknown as Contribution[]).forEach(contribution => {
          if (!contribution.latitude || !contribution.longitude) return;
          
          const key = `${contribution.latitude},${contribution.longitude}`;
          
          if (!beachMap.has(key)) {
            beachMap.set(key, {
              name: contribution.beach_name || 'Unnamed Beach',
              latitude: contribution.latitude,
              longitude: contribution.longitude,
              plastic_count: 0,
              brands: new Map<string, number>()
            });
          }
          
          const beach = beachMap.get(key);
          if (!beach) return;
          
          beach.plastic_count += 1;
          
          if (contribution.brand) {
            const currentCount = beach.brands.get(contribution.brand) || 0;
            beach.brands.set(contribution.brand, currentCount + 1);
          }
        });

        // Convert to array and sort by plastic count
        const beachesData: BeachData[] = Array.from(beachMap.entries())
          .map(([_, beach]) => {
            const topBrands: BrandCount[] = Array.from(beach.brands.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([name, count]) => ({ name, count }));
            
            return {
              id: `${beach.latitude},${beach.longitude}`,
              name: beach.name,
              latitude: beach.latitude,
              longitude: beach.longitude,
              plastic_count: beach.plastic_count,
              top_brands: topBrands
            };
          })
          .sort((a, b) => b.plastic_count - a.plastic_count);

        setBeaches(beachesData);
      } catch (error) {
        console.error('Error fetching beach data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeachData();
  }, []);

  // Initialize map when component mounts and when beach data is loaded
  useEffect(() => {
    if (loading || !mapRef.current || beaches.length === 0) return;

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();

        // Create map instance
        mapInstance.current = new google.maps.Map(mapRef.current!, {
          center: {
            lat: beaches[0]?.latitude || DEFAULT_CENTER.lat,
            lng: beaches[0]?.longitude || DEFAULT_CENTER.lng,
          },
          zoom: 5,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'transit',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        // Create info window
        infoWindowRef.current = new google.maps.InfoWindow({
          maxWidth: 300,
        });

        // Add markers for each beach
        markersRef.current = beaches.map(beach => {
          const marker = new google.maps.Marker({
            position: { lat: beach.latitude, lng: beach.longitude },
            map: mapInstance.current,
            title: beach.name,
            icon: createMarkerIcon(beach.plastic_count),
          });

          // Add click event to show info window
          marker.addListener('click', () => {
            setSelectedBeach(beach);
            
            const content = `
              <div class="p-2">
                <h3 class="font-bold text-lg mb-1">${beach.name}</h3>
                <p class="text-sm text-gray-600 mb-2">Total items: ${beach.plastic_count}</p>
                ${beach.top_brands.length > 0 ? `
                  <div class="mt-2">
                    <p class="text-sm font-medium">Top Brands:</p>
                    <ul class="text-sm">
                      ${beach.top_brands.map(brand => 
                        `<li>• ${brand.name}: ${brand.count} items</li>`
                      ).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            `;
            
            infoWindowRef.current?.setContent(content);
            infoWindowRef.current?.open({
              anchor: marker,
              map: mapInstance.current,
            });
          });

          return marker;
        });

        // Close info window when clicking the map
        mapInstance.current.addListener('click', () => {
          infoWindowRef.current?.close();
          setSelectedBeach(null);
        });

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    // Clean up
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [loading, beaches]);

  if (loading) {
    return (
      <Card className="h-[500px] w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-[400px] w-full mt-4" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
          Pollution Hotspots
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed mt-3">
          Interactive map showing plastic waste collection data. Click on a beach to see detailed statistics.
        </p>
      </div>

      <Card className="overflow-hidden border-0 shadow-lg">
        <div ref={mapRef} className="w-full h-[600px] rounded-lg" />
      </Card>

     
    </div>
  );
}
