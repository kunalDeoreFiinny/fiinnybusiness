import { useEffect, useRef } from 'react';
import type { Map, Marker } from 'leaflet';
import type { Retailer, StockResult } from '../demoData';
import { formatDistance } from '../demoData';

interface Props {
  results: StockResult[];
  userLat: number;
  userLng: number;
  onSelect: (retailer: Retailer) => void;
  selected: Retailer | null;
}

export function RetailerMap({ results, userLat, userLng, onSelect, selected }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default marker icon paths broken by bundlers
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!, {
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;

      // User location marker (blue dot with pulse)
      const userIcon = L.divIcon({
        html: `
          <div style="position: relative; width: 16px; height: 16px;">
            <div style="width: 16px; height: 16px; border-radius: 50%; background: #3b82f6; border: 3px solid #fff; box-shadow: 0 0 10px rgba(59,130,246,0.5); position: relative; z-index: 2;"></div>
            <div style="position: absolute; top: -12px; left: -12px; width: 40px; height: 40px; background: rgba(59,130,246,0.2); border-radius: 50%; animation: pulse 2s infinite; z-index: 1;"></div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(0.5); opacity: 0.8; }
              100% { transform: scale(1.5); opacity: 0; }
            }
          </style>
        `,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<strong>Your location</strong>');

      renderMarkers(L, map, results, onSelect);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when results change
  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then((L) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      renderMarkers(L, mapRef.current!, results, onSelect);

      // Fit bounds to include all markers + user
      const latlngs: [number, number][] = [[userLat, userLng], ...results.map((r) => [r.retailer.lat, r.retailer.lng] as [number, number])];
      if (latlngs.length > 1) {
        mapRef.current!.fitBounds(latlngs, { padding: [40, 40] });
      } else {
        mapRef.current!.setView([userLat, userLng], 8);
      }
    });
  }, [results, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  function renderMarkers(L: typeof import('leaflet'), map: Map, data: StockResult[], cb: (r: Retailer) => void) {
    data.forEach(({ retailer, stock, distanceM: d }) => {
      const isInStock = stock.inStock;
      const isSelected = selected?.id === retailer.id;
      
      const icon = L.divIcon({
        html: `
          <div style="display: flex; flex-col; align-items: center; cursor: pointer;">
            <div style="
              background: #fff; 
              padding: 4px 10px; 
              border-radius: 12px; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
              margin-bottom: 4px; 
              white-space: nowrap; 
              border: 2px solid ${isSelected ? '#154212' : '#c2c9bb'};
              transform: translateY(${isSelected ? '0' : '4px'});
              opacity: ${isSelected ? '1' : '0.8'};
              transition: all 0.3s;
            ">
              <span style="font-size: 10px; font-weight: 800; color: #1b1c1b; text-transform: uppercase;">${retailer.businessName}</span>
            </div>
            <div style="
              width: 24px; 
              height: 24px; 
              background: #154212; 
              border-radius: 50%; 
              border: 3px solid #fff; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>
          </div>
        `,
        className: '',
        iconAnchor: [40, 48],
      });

      const marker = L.marker([retailer.lat, retailer.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:200px; font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
            <div style="font-weight: 800; font-size: 14px; color: #1b1c1b; margin-bottom: 2px; text-transform: uppercase; letter-spacing: -0.01em;">${retailer.businessName}</div>
            <div style="font-size: 11px; color: #72796e; margin-bottom: 10px; font-weight: 600;">${retailer.city} · ${formatDistance(d)}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 12px; font-weight: 800; color: ${isInStock ? '#154212' : '#72796e'}">
                ${isInStock ? `₹${stock.price}` : 'Out of Stock'}
              </span>
              <span style="font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; background: ${isInStock ? '#9dd09033' : '#f5f3f1'}; color: ${isInStock ? '#154212' : '#72796e'}; padding: 2px 8px; border-radius: 8px;">
                ${isInStock ? 'In Stock' : 'Unavailable'}
              </span>
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${retailer.lat},${retailer.lng}"
               target="_blank"
               style="display: flex; align-items: center; justify-content: center; background: #154212; color: #fff; padding: 8px; border-radius: 10px; font-size: 11px; font-weight: 800; text-decoration: none; text-transform: uppercase; letter-spacing: 0.02em;">
              Get Directions
            </a>
          </div>
        `, {
          closeButton: false,
          offset: [0, -40]
        })
        .on('click', () => cb(retailer));

      markersRef.current.push(marker);
    });
  }

  return (
    <>
      {/* Inject Leaflet CSS once */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />
    </>
  );
}
