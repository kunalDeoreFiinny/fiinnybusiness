/**
 * LeafletMap — client-only Leaflet + OpenStreetMap component.
 * Renders user marker, store markers, fits bounds, and highlights selected store.
 *
 * Must be loaded via next/dynamic with ssr: false.
 */

'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLng } from '../app/utils/haversine';
import { StoreWithDistance } from '../app/utils/nearby';

// Fix Leaflet default marker icons missing in bundled apps
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const SelectedStoreIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49],
  className: 'leaflet-marker-selected',
});

// Pre-encoded SVG for user location marker (blue dot with white border)
// SVG: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="white"/></svg>
const USER_MARKER_SVG_B64 = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgZmlsbD0iIzNCODJGNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=';

const UserIcon = L.icon({
  iconUrl: `data:image/svg+xml;base64,${USER_MARKER_SVG_B64}`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapProps {
  userLocation: LatLng;
  stores: StoreWithDistance[];
  selectedStoreId: string | null;
  onStoreSelect?: (storeId: string) => void;
}

/** Sub-component that auto-fits bounds whenever markers change */
function FitBoundsController({
  userLocation,
  stores,
}: {
  userLocation: LatLng;
  stores: StoreWithDistance[];
}) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = [
      [userLocation.lat, userLocation.lng],
    ];
    stores.forEach((s) => {
      if (s.location?.lat && s.location?.lng) {
        points.push([s.location.lat, s.location.lng]);
      }
    });

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (points.length === 1) {
      map.setView(points[0], 12);
    }
  }, [map, userLocation, stores]);

  return null;
}

export default function LeafletMap({
  userLocation,
  stores,
  selectedStoreId,
  onStoreSelect,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={12}
      scrollWheelZoom={true}
      className="w-full h-full z-0"
      style={{ minHeight: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBoundsController userLocation={userLocation} stores={stores} />

      {/* User location marker */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
        <Popup>
          <strong>Your Location</strong>
        </Popup>
      </Marker>

      {/* Store markers */}
      {stores.map((store) => {
        if (!store.location?.lat || !store.location?.lng) return null;
        const isSelected = store.id === selectedStoreId;
        return (
          <Marker
            key={store.id}
            position={[store.location.lat, store.location.lng]}
            icon={isSelected ? SelectedStoreIcon : DefaultIcon}
            eventHandlers={{
              click: () => onStoreSelect?.(store.id),
            }}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong style={{ fontSize: 14 }}>{store.name}</strong>
                <br />
                <span style={{ fontSize: 12, color: '#666' }}>
                  {store.distanceLabel}
                </span>
                <br />
                <span style={{ fontSize: 11, color: store.status?.includes('Open') ? '#16a34a' : '#dc2626' }}>
                  {store.status}
                </span>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
