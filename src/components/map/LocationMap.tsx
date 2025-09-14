"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationMapProps {
  initialPosition?: [number, number];
  onLocationSelect?: (lat: number, lng: number) => void;
  enableLocateUser?: boolean;
  updateMarkerPosition?: boolean;
}

interface LocationReading {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

// Create a simple div icon for the marker
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="#ef4444">
          <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const defaultIcon = createCustomIcon();

const LocationMap: React.FC<LocationMapProps> = ({
  initialPosition,
  onLocationSelect,
  enableLocateUser = false,
  updateMarkerPosition = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const hasCenteredRef = useRef(false);
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to get multiple location readings
  const getMultipleLocations = (count: number, timeout = 2000): Promise<LocationReading[]> => {
    return new Promise((resolve) => {
      const locations: LocationReading[] = [];
      let completed = 0;
      
      const onSuccess = (position: GeolocationPosition) => {
        const { latitude, longitude, accuracy } = position.coords;
        locations.push({
          lat: latitude,
          lng: longitude,
          accuracy,
          timestamp: position.timestamp || Date.now(),
        });
        completed++;
        
        if (completed >= count) {
          resolve(locations);
        }
      };
      
      const onError = () => {
        completed++;
        if (completed >= count) {
          resolve(locations);
        }
      };
      
      for (let i = 0; i < count; i++) {
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          onError,
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000,
          }
        );
        
        // Add a small delay between requests
        if (i < count - 1) {
          setTimeout(() => {}, i * timeout);
        }
      }
    });
  };

  // Function to get the most accurate location from multiple readings
  const getBestLocation = (locations: LocationReading[]): LocationReading => {
    if (locations.length === 0) {
      throw new Error('No location data available');
    }
    
    // Sort by accuracy (lower is better)
    const sorted = [...locations].sort((a, b) => a.accuracy - b.accuracy);
    
    // Return the most accurate reading
    return sorted[0];
  };

  // Function to handle user location button click
  const handleLocateUser = async () => {
    if (!mapRef.current) return;
    
    setIsLocating(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    try {
      // Get 3 location readings
      const locationReadings = await getMultipleLocations(3);
      
      if (locationReadings.length === 0) {
        throw new Error('Could not get any location readings');
      }
      
      // Get the most accurate reading
      const bestLocation = getBestLocation(locationReadings);
      const { lat, lng, accuracy } = bestLocation;
      
      // Update map view
      mapRef.current.setView([lat, lng], 16);
      
      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], {
          icon: defaultIcon,
          draggable: true,
        }).addTo(mapRef.current);
        
        // Add drag end handler
        markerRef.current.on('dragend', (e: L.LeafletEvent) => {
          const marker = e.target as L.Marker;
          const position = marker.getLatLng();
          if (onLocationSelect) onLocationSelect(position.lat, position.lng);
        });
      }

      // Notify parent component
      if (onLocationSelect) onLocationSelect(lat, lng);
      
      // Show accuracy info to user
      toast({
        title: "Location found",
        description: `Accuracy: ${Math.round(accuracy)} meters`,
        variant: "default",
      });
      
    } catch (err) {
      console.error("Geolocation error:", err);
      setError("Unable to get an accurate location. Please try again in a more open area.");
      
      // Try to fallback to a single reading if multiple readings failed
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve, 
            reject,
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 10000,
            }
          );
        });
        
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            markerRef.current = L.marker([latitude, longitude], {
              icon: defaultIcon,
              draggable: true,
            }).addTo(mapRef.current);
            
            // Add drag end handler
            markerRef.current.on('dragend', (e: L.LeafletEvent) => {
              const marker = e.target as L.Marker;
              const position = marker.getLatLng();
              if (onLocationSelect) onLocationSelect(position.lat, position.lng);
            });
          }
          
          if (onLocationSelect) onLocationSelect(latitude, longitude);
        }
        
      } catch (fallbackError) {
        console.error("Fallback geolocation failed:", fallbackError);
        setError("Failed to get your location. Please ensure location services are enabled.");
      }
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    if (mapRef.current) return; // prevent re-init

    const initMap = async () => {
      try {
        const center = initialPosition || [0, 0];

        const map = L.map(mapContainerRef.current!).setView(
          [center[0], center[1]],
          initialPosition ? 16 : 2
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Add initial marker
        if (initialPosition) {
          markerRef.current = L.marker(initialPosition, { 
            icon: defaultIcon,
            draggable: true
          }).addTo(map);
          
          // Add drag end handler
          markerRef.current.on('dragend', (e: L.LeafletEvent) => {
            const marker = e.target as L.Marker;
            const position = marker.getLatLng();
            if (onLocationSelect) onLocationSelect(position.lat, position.lng);
          });
        }

        // Allow clicking to set location
        map.on("click", (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (onLocationSelect) onLocationSelect(lat, lng);

          if (updateMarkerPosition) {
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            } else {
              markerRef.current = L.marker([lat, lng], { 
                icon: defaultIcon,
                draggable: true
              }).addTo(map);
              
              // Add drag end handler
              markerRef.current.on('dragend', (e: L.LeafletEvent) => {
                const marker = e.target as L.Marker;
                const position = marker.getLatLng();
                if (onLocationSelect) onLocationSelect(position.lat, position.lng);
              });
            }
          }
        });

        // Enable live GPS tracking if enabled
        if (enableLocateUser && navigator.geolocation) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;

              if (!hasCenteredRef.current) {
                map.setView([latitude, longitude], 16); // zoom first time
                hasCenteredRef.current = true;
              } else {
                map.panTo([latitude, longitude]); // smooth follow
              }

              if (markerRef.current) {
                markerRef.current.setLatLng([latitude, longitude]);
              } else {
                markerRef.current = L.marker([latitude, longitude], {
                  icon: defaultIcon,
                  draggable: true,
                }).addTo(map);
                
                // Add drag end handler
                markerRef.current.on('dragend', (e: L.LeafletEvent) => {
                  const marker = e.target as L.Marker;
                  const position = marker.getLatLng();
                  if (onLocationSelect) onLocationSelect(position.lat, position.lng);
                });
              }

              if (onLocationSelect) onLocationSelect(latitude, longitude);
            },
            (err) => {
              console.error("Geolocation error:", err);
              setError("Unable to track your location.");
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 10000,
            }
          );
        }

        // Create custom GPS button control
        const GPSButton = L.Control.extend({
          options: {
            position: 'topright'
          },

          onAdd: function() {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            const button = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', container);
            
            button.href = '#';
            button.title = 'Find my location';
            button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" 
                stroke-linejoin="round">
                <path d="M2 12h3m14 0h3M12 2v3m0 14v3m9-9a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              </svg>
            `;
            
            Object.assign(button.style, {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              backgroundColor: '#fff',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: '0 1px 5px rgba(0,0,0,0.4)'
            });
            
            L.DomEvent.disableClickPropagation(button);
            L.DomEvent.on(button, 'click', async (e) => {
              e.preventDefault();
              await handleLocateUser();
            });
            
            return container;
          }
        });
        
        // Add GPS button to map
        new GPSButton().addTo(map);
        
        mapRef.current = map;
        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to load map. Please refresh the page to try again.");
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      hasCenteredRef.current = false;
    };
  }, [initialPosition, onLocationSelect, updateMarkerPosition, enableLocateUser, toast]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm shadow-lg z-10">
          {error}
        </div>
      )}
      {isLocating && (
        <div className="absolute top-2 right-2 bg-white/90 px-3 py-2 rounded-lg text-sm text-gray-700 flex items-center z-10 shadow-md">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Finding your location...
        </div>
      )}
    </div>
  );
};

export default LocationMap;
