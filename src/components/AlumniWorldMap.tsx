import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAlumniLocations } from '@/hooks/useAlumniLocations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const AlumniWorldMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { locations, loading, totalAlumni } = useAlumniLocations();
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInput, setTokenInput] = useState('');
  const [mapReady, setMapReady] = useState(false);

  // Try to get token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      localStorage.setItem('mapbox_token', tokenInput.trim());
      setMapboxToken(tokenInput.trim());
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe',
        zoom: 1.5,
        center: [78, 20], // Center on India
        pitch: 20,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      map.current.scrollZoom.disable();

      map.current.on('style.load', () => {
        map.current?.setFog({
          color: 'rgb(20, 20, 30)',
          'high-color': 'rgb(40, 40, 60)',
          'horizon-blend': 0.2,
        });
        setMapReady(true);
      });

      // Slow rotation animation
      const secondsPerRevolution = 240;
      let userInteracting = false;

      function spinGlobe() {
        if (!map.current) return;
        const zoom = map.current.getZoom();
        if (!userInteracting && zoom < 3) {
          const center = map.current.getCenter();
          center.lng -= 360 / secondsPerRevolution;
          map.current.easeTo({ center, duration: 1000, easing: (n) => n });
        }
      }

      map.current.on('mousedown', () => { userInteracting = true; });
      map.current.on('mouseup', () => { userInteracting = false; spinGlobe(); });
      map.current.on('touchend', () => { userInteracting = false; spinGlobe(); });
      map.current.on('moveend', spinGlobe);

      spinGlobe();

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add markers for alumni locations
  useEffect(() => {
    if (!map.current || !mapReady || locations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    locations.forEach(location => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'alumni-marker';
      el.innerHTML = `
        <div class="relative group cursor-pointer">
          <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-lg transform transition-transform hover:scale-125" style="background-color: hsl(350, 70%, 50%);">
            ${location.count > 99 ? '99+' : location.count}
          </div>
          <div class="absolute w-3 h-3 rounded-full animate-ping opacity-75" style="background-color: hsl(350, 70%, 50%); top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: -1;"></div>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(`
        <div style="padding: 8px; min-width: 120px;">
          <div style="font-weight: 600; font-size: 14px; color: #333;">${location.country}</div>
          ${location.city ? `<div style="font-size: 12px; color: #666;">${location.city}</div>` : ''}
          <div style="font-size: 13px; color: hsl(350, 70%, 50%); font-weight: 500; margin-top: 4px;">
            ${location.count} ${location.count === 1 ? 'Alumni' : 'Alumni'}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat(location.coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      // Show popup on hover
      el.addEventListener('mouseenter', () => marker.togglePopup());
      el.addEventListener('mouseleave', () => marker.togglePopup());

      markersRef.current.push(marker);
    });
  }, [locations, mapReady]);

  if (!mapboxToken) {
    return (
      <Card className="w-full bg-card/50 backdrop-blur-sm border-2 border-dashed">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="font-serif text-2xl">Alumni World Map</CardTitle>
          <p className="text-muted-foreground">
            Enter your Mapbox public token to view the interactive alumni map
          </p>
        </CardHeader>
        <CardContent className="max-w-md mx-auto space-y-4">
          <Input
            type="text"
            placeholder="pk.eyJ1Ijoi..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full"
          />
          <Button onClick={handleTokenSubmit} className="w-full">
            <MapPin className="w-4 h-4 mr-2" />
            Load Map
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Get your free public token from{' '}
            <a 
              href="https://mapbox.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full">
      {/* Stats overlay */}
      <motion.div 
        className="absolute top-4 left-4 z-10 flex gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{totalAlumni} Alumni</span>
        </div>
        <div className="bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{locations.length} Countries</span>
        </div>
      </motion.div>

      {/* Map container */}
      <div 
        ref={mapContainer} 
        className="w-full h-[500px] rounded-xl overflow-hidden shadow-2xl border-2 border-border"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading alumni locations...</span>
          </div>
        </div>
      )}

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none rounded-b-xl" />
    </div>
  );
};

export default AlumniWorldMap;
