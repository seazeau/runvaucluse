'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useMap } from 'react-leaflet';
import styles from './GPXViewer.module.css';

// Dynamically import Leaflet components (no SSR)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });

// Helper component to update map view when bounds change
const ChangeView = ({ bounds }: { bounds: [[number, number], [number, number]] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, bounds]);
  return null;
};

// Leaflet CSS needs to be imported somewhere
import 'leaflet/dist/leaflet.css';

interface GPXViewerProps {
  gpxLink: string;
}

interface ElevationPoint {
  dist: string;
  elev: number;
}

// Helper to calculate distance between two points (Haversine formula)
const calculateDistance = (p1: { lat: number, lon: number }, p2: { lat: number, lon: number }) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = p1.lat * Math.PI / 180;
  const φ2 = p2.lat * Math.PI / 180;
  const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
  const Δλ = (p2.lon - p1.lon) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const GPXViewer: React.FC<GPXViewerProps> = ({ gpxLink }) => {
  const [positions, setPositions] = useState<[number, number][]>([]);
  const [elevationData, setElevationData] = useState<ElevationPoint[]>([]);
  const [center, setCenter] = useState<[number, number]>([44, 5]);
  const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchGPX = async () => {
      try {
        const response = await fetch(gpxLink);
        const gpxText = await response.text();
        const { default: gpxParser } = await import('gpxparser');
        const gpx = new gpxParser();
        gpx.parse(gpxText);

        const track = gpx.tracks[0];
        if (track && track.points.length > 0) {
          const coords = track.points.map(p => [p.lat, p.lon] as [number, number]);
          setPositions(coords);

          // Prepare elevation data for Recharts
          let cumulativeDist = 0;
          const elevData: ElevationPoint[] = track.points.map((p, i) => {
            if (i > 0) {
              const prev = track.points[i - 1];
              cumulativeDist += calculateDistance(prev, p);
            }
            return {
              dist: (cumulativeDist / 1000).toFixed(2),
              elev: p.ele
            };
          });
          setElevationData(elevData);

          // Find center and bounds
          const lats = coords.map(p => p[0]);
          const lons = coords.map(p => p[1]);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLon = Math.min(...lons);
          const maxLon = Math.max(...lons);
          
          setCenter([(minLat + maxLat) / 2, (minLon + maxLon) / 2]);
          setBounds([[minLat, minLon], [maxLat, maxLon]]);
        }
      } catch (error) {
        console.error("Error parsing GPX:", error);
      }
    };

    fetchGPX();
  }, [gpxLink, isMounted]);

  if (!isMounted) return <div className={styles.loading}>Chargement de la carte...</div>;

  return (
    <div className={styles.viewerContainer}>
      {/* 1. PROFILE FIRST */}
      <div className={styles.profileSection}>
        <h4 className={styles.sectionTitle}>PROFIL ALTIMÉTRIQUE</h4>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={elevationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="dist" 
                tick={{ fill: '#9ca3af', fontSize: 10 }} 
                label={{ value: 'Distance (km)', position: 'insideBottomRight', offset: -5, fill: '#9ca3af', fontSize: 10 }} 
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 10 }} 
                label={{ value: 'Alt (m)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 10 }}
                domain={['dataMin - 50', 'dataMax + 50']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '4px' }}
                itemStyle={{ color: '#facc15' }}
                labelStyle={{ color: '#9ca3af' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => {
                  const numValue = typeof value === 'string' ? parseFloat(value) : value;
                  return [`${numValue?.toFixed(0)} m`, 'Altitude'];
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={(label: any) => `Km ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="elev" 
                stroke="#facc15" 
                fillOpacity={1} 
                fill="url(#colorElev)" 
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. MAP BELOW */}
      <div className={styles.mapSection}>
        <MapContainer 
          center={center} 
          zoom={13} 
          scrollWheelZoom={false} 
          className={styles.map}
          bounds={bounds || undefined}
        >
          <ChangeView bounds={bounds} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {positions.length > 0 && (
            <Polyline positions={positions} color="#facc15" weight={3} opacity={0.8} />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default GPXViewer;

