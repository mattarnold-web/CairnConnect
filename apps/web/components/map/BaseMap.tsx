'use client';

import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ---------------------------------------------------------------------------
// Fix Leaflet default marker icons (broken by webpack bundling)
// ---------------------------------------------------------------------------
const DEFAULT_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DEFAULT_ICON;

// ---------------------------------------------------------------------------
// Custom colored markers
// ---------------------------------------------------------------------------
function coloredIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="#fff"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

export const MARKER_COLORS = {
  trail: '#10B981',      // canopy green
  business: '#3B82F6',   // blue
  user: '#F59E0B',       // amber
  activity: '#8B5CF6',   // purple
  danger: '#EF4444',     // red
} as const;

export const trailIcon = coloredIcon(MARKER_COLORS.trail);
export const businessIcon = coloredIcon(MARKER_COLORS.business);
export const userIcon = coloredIcon(MARKER_COLORS.user);
export const activityIcon = coloredIcon(MARKER_COLORS.activity);

// ---------------------------------------------------------------------------
// Tile layer options
// ---------------------------------------------------------------------------
export const TILE_LAYERS = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
} as const;

export type TileLayerStyle = keyof typeof TILE_LAYERS;

// ---------------------------------------------------------------------------
// Map marker data types
// ---------------------------------------------------------------------------
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sublabel?: string;
  type: 'trail' | 'business' | 'user' | 'activity' | 'danger';
  href?: string;
}

export interface MapTrack {
  points: Array<{ lat: number; lng: number }>;
  color?: string;
}

// ---------------------------------------------------------------------------
// FitBounds helper component
// ---------------------------------------------------------------------------
function FitBoundsHelper({ markers, track }: { markers: MapMarker[]; track?: MapTrack }) {
  const map = useMap();

  useEffect(() => {
    const allPoints: L.LatLngExpression[] = [];
    markers.forEach((m) => allPoints.push([m.lat, m.lng]));
    if (track) track.points.forEach((p) => allPoints.push([p.lat, p.lng]));

    if (allPoints.length > 1) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [30, 30] });
    } else if (allPoints.length === 1) {
      map.setView(allPoints[0], 13);
    }
  }, [map, markers, track]);

  return null;
}

// ---------------------------------------------------------------------------
// Base Map component
// ---------------------------------------------------------------------------
export interface BaseMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  track?: MapTrack;
  tileStyle?: TileLayerStyle;
  height?: string;
  className?: string;
  fitBounds?: boolean;
}

export function BaseMap({
  center = [38.5733, -109.5498], // Moab, UT default
  zoom = 12,
  markers = [],
  track,
  tileStyle = 'topo',
  height = '400px',
  className = '',
  fitBounds = true,
}: BaseMapProps) {
  const tile = TILE_LAYERS[tileStyle];

  const iconMap = {
    trail: trailIcon,
    business: businessIcon,
    user: userIcon,
    activity: activityIcon,
    danger: coloredIcon(MARKER_COLORS.danger),
  };

  return (
    <div className={`rounded-2xl overflow-hidden border border-cairn-border ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer url={tile.url} attribution={tile.attribution} />

        {fitBounds && (markers.length > 0 || track) && (
          <FitBoundsHelper markers={markers} track={track} />
        )}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={iconMap[marker.type]}
          >
            <Popup>
              <div className="text-sm">
                <strong>{marker.label}</strong>
                {marker.sublabel && (
                  <p className="text-gray-600 mt-0.5">{marker.sublabel}</p>
                )}
                {marker.href && (
                  <a href={marker.href} className="text-blue-600 underline mt-1 block">
                    View details
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {track && track.points.length > 1 && (
          <Polyline
            positions={track.points.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{ color: track.color || MARKER_COLORS.trail, weight: 3, opacity: 0.8 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
