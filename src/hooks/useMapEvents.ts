import { useEffect } from 'react';
import L from 'leaflet';

interface UseMapEventsProps {
  map: L.Map | null;
  onClick?: (e: L.LeafletMouseEvent) => void;
}

export function useMapEvents({ map, onClick }: UseMapEventsProps) {
  useEffect(() => {
    if (!map || !onClick) return;
    
    const handleClick = (e: L.LeafletMouseEvent) => {
      onClick(e);
    };
    
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onClick]);
}
