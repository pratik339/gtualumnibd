import React, { useState, useRef, useCallback } from 'react';
import { useAlumniLocations } from '@/hooks/useAlumniLocations';
import { Globe, Users, MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Country coordinates mapped to SVG viewBox (Mercator-like projection)
const countryPositions: Record<string, { x: number; y: number }> = {
  'India': { x: 680, y: 280 },
  'United States': { x: 180, y: 220 },
  'USA': { x: 180, y: 220 },
  'United Kingdom': { x: 450, y: 170 },
  'UK': { x: 450, y: 170 },
  'Canada': { x: 180, y: 150 },
  'Australia': { x: 820, y: 420 },
  'Germany': { x: 490, y: 180 },
  'France': { x: 465, y: 195 },
  'Singapore': { x: 755, y: 340 },
  'UAE': { x: 600, y: 270 },
  'United Arab Emirates': { x: 600, y: 270 },
  'Dubai': { x: 600, y: 270 },
  'Qatar': { x: 590, y: 265 },
  'Saudi Arabia': { x: 575, y: 265 },
  'Japan': { x: 860, y: 215 },
  'South Korea': { x: 835, y: 215 },
  'China': { x: 770, y: 230 },
  'Netherlands': { x: 475, y: 175 },
  'Switzerland': { x: 480, y: 190 },
  'Ireland': { x: 435, y: 165 },
  'New Zealand': { x: 910, y: 460 },
  'South Africa': { x: 530, y: 430 },
  'Brazil': { x: 300, y: 380 },
  'Mexico': { x: 160, y: 270 },
  'Spain': { x: 450, y: 210 },
  'Italy': { x: 495, y: 205 },
  'Sweden': { x: 505, y: 135 },
  'Norway': { x: 490, y: 125 },
  'Denmark': { x: 485, y: 160 },
  'Finland': { x: 530, y: 125 },
  'Poland': { x: 515, y: 175 },
  'Belgium': { x: 470, y: 180 },
  'Austria': { x: 500, y: 190 },
  'Malaysia': { x: 755, y: 335 },
  'Thailand': { x: 745, y: 300 },
  'Indonesia': { x: 780, y: 360 },
  'Philippines': { x: 810, y: 300 },
  'Vietnam': { x: 760, y: 295 },
  'Russia': { x: 650, y: 140 },
  'Kenya': { x: 560, y: 350 },
  'Nigeria': { x: 485, y: 320 },
  'Egypt': { x: 545, y: 255 },
  'Israel': { x: 555, y: 245 },
  'Turkey': { x: 545, y: 215 },
  'Pakistan': { x: 645, y: 260 },
  'Bangladesh': { x: 710, y: 275 },
  'Sri Lanka': { x: 685, y: 325 },
  'Nepal': { x: 690, y: 260 },
  'Oman': { x: 610, y: 280 },
  'Kuwait': { x: 585, y: 255 },
  'Bahrain': { x: 590, y: 260 },
};

// Detailed continent/country paths for better map visualization
const worldMapPaths = {
  northAmerica: "M30,50 L60,35 L90,30 L130,28 L170,32 L200,30 L240,35 L280,45 L300,60 L310,90 L305,130 L290,170 L270,200 L250,230 L220,260 L190,280 L160,290 L130,285 L100,275 L80,255 L65,230 L55,200 L50,170 L45,140 L40,110 L35,80 Z",
  centralAmerica: "M145,280 L165,275 L180,285 L190,310 L185,340 L175,355 L160,350 L150,335 L145,310 Z",
  southAmerica: "M195,340 L230,325 L270,330 L300,355 L320,400 L330,450 L320,500 L295,530 L260,540 L225,535 L195,510 L175,470 L170,430 L175,390 L185,360 Z",
  europe: "M420,85 L450,75 L480,78 L510,80 L540,85 L565,95 L580,115 L575,145 L560,175 L535,195 L505,205 L475,210 L445,205 L420,190 L405,165 L400,135 L405,105 Z",
  uk: "M432,110 L448,102 L462,108 L468,125 L465,145 L455,160 L440,158 L432,145 L428,128 Z",
  africa: "M440,200 L480,190 L520,195 L560,210 L590,245 L610,300 L620,360 L605,420 L575,465 L530,480 L485,475 L450,450 L425,400 L420,350 L430,290 L425,240 Z",
  middleEast: "M545,190 L580,180 L620,195 L650,230 L660,275 L645,305 L610,315 L575,300 L555,265 L545,230 Z",
  russia: "M560,55 L620,40 L700,35 L780,45 L850,60 L910,85 L940,115 L935,150 L910,175 L860,185 L800,180 L740,170 L680,155 L620,140 L580,120 L565,90 Z",
  asia: "M610,140 L660,125 L720,135 L780,150 L840,175 L890,210 L910,260 L900,310 L870,350 L820,365 L760,355 L700,335 L650,300 L620,255 L600,200 Z",
  india: "M640,245 L680,230 L720,250 L740,295 L735,345 L710,380 L670,390 L640,370 L620,330 L625,285 Z",
  southeastAsia: "M730,300 L770,290 L810,310 L830,355 L820,400 L785,420 L745,405 L725,365 L720,330 Z",
  japan: "M850,175 L875,165 L895,180 L905,210 L900,250 L880,270 L858,265 L845,235 L845,200 Z",
  australia: "M770,370 L830,355 L890,375 L930,410 L945,460 L930,510 L880,530 L820,525 L770,500 L745,455 L750,410 Z",
  newZealand: "M915,455 L940,450 L955,470 L950,500 L935,515 L915,510 L908,485 Z",
  indonesia: "M755,355 L790,345 L830,360 L860,385 L855,415 L820,430 L780,425 L755,400 L750,375 Z",
};

const AlumniWorldMap = () => {
  const { locations, loading, totalAlumni } = useAlumniLocations();
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1000, height: 550 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const getMarkerSize = (count: number) => {
    if (count >= 50) return 18;
    if (count >= 20) return 14;
    if (count >= 10) return 11;
    if (count >= 5) return 9;
    return 7;
  };

  const getMarkerColor = (count: number) => {
    if (count >= 50) return 'hsl(0, 85%, 55%)';
    if (count >= 20) return 'hsl(25, 85%, 55%)';
    if (count >= 10) return 'hsl(45, 85%, 55%)';
    return 'hsl(200, 85%, 55%)';
  };

  const handleZoomIn = useCallback(() => {
    setViewBox(prev => ({
      x: prev.x + prev.width * 0.1,
      y: prev.y + prev.height * 0.1,
      width: prev.width * 0.8,
      height: prev.height * 0.8,
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewBox(prev => ({
      x: Math.max(0, prev.x - prev.width * 0.125),
      y: Math.max(0, prev.y - prev.height * 0.125),
      width: Math.min(1200, prev.width * 1.25),
      height: Math.min(700, prev.height * 1.25),
    }));
  }, []);

  const handleReset = useCallback(() => {
    setViewBox({ x: 0, y: 0, width: 1000, height: 550 });
    setSelectedLocation(null);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.x) * (viewBox.width / 1000);
    const dy = (e.clientY - dragStart.y) * (viewBox.height / 550);
    setViewBox(prev => ({
      ...prev,
      x: Math.max(-200, Math.min(400, prev.x - dx)),
      y: Math.max(-100, Math.min(200, prev.y - dy)),
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, viewBox]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }, [handleZoomIn, handleZoomOut]);

  const focusOnLocation = useCallback((country: string) => {
    const pos = countryPositions[country];
    if (pos) {
      setViewBox({
        x: pos.x - 150,
        y: pos.y - 100,
        width: 300,
        height: 200,
      });
      setSelectedLocation(country);
    }
  }, []);

  return (
    <div className="relative w-full">
      {/* Stats overlay */}
      <motion.div 
        className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 sm:gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg border flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-xs sm:text-sm font-medium">{totalAlumni} Alumni</span>
        </div>
        <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg border flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-xs sm:text-sm font-medium">{locations.length} Countries</span>
        </div>
      </motion.div>

      {/* Zoom controls */}
      <motion.div 
        className="absolute top-4 right-4 z-10 flex flex-col gap-1"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-card/90 backdrop-blur-sm border shadow-lg"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-card/90 backdrop-blur-sm border shadow-lg"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-card/90 backdrop-blur-sm border shadow-lg"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Map container */}
      <div className="w-full rounded-xl overflow-hidden shadow-2xl border bg-card relative">
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          className="w-full h-[350px] sm:h-[450px] md:h-[500px] cursor-grab active:cursor-grabbing select-none"
          preserveAspectRatio="xMidYMid meet"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(210, 60%, 18%)" />
              <stop offset="50%" stopColor="hsl(210, 55%, 14%)" />
              <stop offset="100%" stopColor="hsl(210, 50%, 10%)" />
            </linearGradient>
            <linearGradient id="landGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(140, 25%, 35%)" />
              <stop offset="100%" stopColor="hsl(140, 20%, 28%)" />
            </linearGradient>
            <linearGradient id="landGradientHover" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(140, 30%, 42%)" />
              <stop offset="100%" stopColor="hsl(140, 25%, 35%)" />
            </linearGradient>
            {/* Glow filters */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="dropShadow">
              <feDropShadow dx="2" dy="3" stdDeviation="4" floodOpacity="0.4"/>
            </filter>
            {/* Patterns */}
            <pattern id="gridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(210, 40%, 20%)" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          
          {/* Ocean background */}
          <rect x="-200" y="-100" width="1400" height="750" fill="url(#oceanGradient)" />
          
          {/* Grid overlay */}
          <rect x="-200" y="-100" width="1400" height="750" fill="url(#gridPattern)" />
          
          {/* Latitude lines */}
          {[-50, 0, 100, 200, 300, 400, 500].map((y, i) => (
            <line
              key={`lat-${i}`}
              x1="-200"
              y1={y}
              x2="1200"
              y2={y}
              stroke="hsl(210, 40%, 25%)"
              strokeWidth="0.5"
              strokeDasharray="10,10"
              opacity="0.4"
            />
          ))}
          
          {/* Longitude lines */}
          {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((x, i) => (
            <line
              key={`lng-${i}`}
              x1={x}
              y1="-100"
              x2={x}
              y2="650"
              stroke="hsl(210, 40%, 25%)"
              strokeWidth="0.5"
              strokeDasharray="10,10"
              opacity="0.4"
            />
          ))}

          {/* Continent shapes */}
          <g filter="url(#dropShadow)">
            {Object.entries(worldMapPaths).map(([name, path]) => (
              <path
                key={name}
                d={path}
                fill="url(#landGradient)"
                stroke="hsl(140, 15%, 45%)"
                strokeWidth="1.5"
                className="transition-all duration-300 hover:fill-[url(#landGradientHover)]"
              />
            ))}
          </g>

          {/* Connection lines between locations */}
          {locations.length > 1 && locations.slice(0, 10).map((loc, i) => {
            const pos = countryPositions[loc.country];
            const nextLoc = locations[(i + 1) % Math.min(10, locations.length)];
            const nextPos = countryPositions[nextLoc?.country];
            if (!pos || !nextPos) return null;
            return (
              <motion.line
                key={`connection-${i}`}
                x1={pos.x}
                y1={pos.y}
                x2={nextPos.x}
                y2={nextPos.y}
                stroke="hsl(200, 70%, 50%)"
                strokeWidth="0.5"
                strokeDasharray="4,4"
                opacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: i * 0.1 }}
              />
            );
          })}

          {/* Alumni location markers */}
          {locations.map((location, index) => {
            const pos = countryPositions[location.country];
            if (!pos) return null;
            
            const size = getMarkerSize(location.count);
            const color = getMarkerColor(location.count);
            const isHovered = hoveredLocation === location.country;
            const isSelected = selectedLocation === location.country;
            
            return (
              <g
                key={location.country}
                onMouseEnter={() => setHoveredLocation(location.country)}
                onMouseLeave={() => setHoveredLocation(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  focusOnLocation(location.country);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer pulse ring */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size + 10}
                  fill={color}
                  opacity={0}
                  initial={{ scale: 0.8, opacity: 0.4 }}
                  animate={{ 
                    scale: [0.8, 1.5, 0.8],
                    opacity: [0.4, 0, 0.4]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                />
                {/* Inner pulse */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size + 4}
                  fill={color}
                  opacity={0.3}
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.1, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.15
                  }}
                />
                {/* Main marker */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered || isSelected ? size + 4 : size}
                  fill={color}
                  stroke={isSelected ? "hsl(var(--primary))" : "hsl(0, 0%, 100%)"}
                  strokeWidth={isSelected ? 3 : 1.5}
                  filter="url(#softGlow)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: 0.5 + index * 0.05,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                />
                {/* Count label */}
                {(location.count >= 2 || isHovered) && (
                  <motion.text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize={size > 10 ? "11" : "9"}
                    fontWeight="bold"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                  >
                    {location.count > 999 ? '999+' : location.count}
                  </motion.text>
                )}
                {/* Country label on hover */}
                {(isHovered || isSelected) && (
                  <motion.text
                    x={pos.x}
                    y={pos.y - size - 8}
                    textAnchor="middle"
                    fill="hsl(var(--foreground))"
                    fontSize="11"
                    fontWeight="600"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {location.country}
                  </motion.text>
                )}
              </g>
            );
          })}

          {/* Equator line */}
          <line
            x1="-200"
            y1="275"
            x2="1200"
            y2="275"
            stroke="hsl(45, 70%, 50%)"
            strokeWidth="1"
            strokeDasharray="15,10"
            opacity="0.3"
          />
          <text x="20" y="270" fill="hsl(45, 70%, 50%)" fontSize="10" opacity="0.5">Equator</text>
        </svg>

        {/* Hover tooltip */}
        {hoveredLocation && (() => {
          const location = locations.find(l => l.country === hoveredLocation);
          const pos = location ? countryPositions[location.country] : null;
          if (!location || !pos) return null;
          
          // Calculate percentage position
          const xPercent = ((pos.x - viewBox.x) / viewBox.width) * 100;
          const yPercent = ((pos.y - viewBox.y) / viewBox.height) * 100;
          
          return (
            <motion.div
              className="absolute bg-card/95 backdrop-blur-md border-2 border-primary/30 shadow-xl rounded-xl px-4 py-3 pointer-events-none z-20"
              style={{
                left: `${Math.min(85, Math.max(15, xPercent))}%`,
                top: `${Math.min(80, Math.max(10, yPercent - 15))}%`,
                transform: 'translate(-50%, -100%)'
              }}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-bold text-base flex items-center gap-2 text-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                {location.country}
              </div>
              {location.city && (
                <div className="text-sm text-muted-foreground mt-1">{location.city}</div>
              )}
              <div className="text-lg text-primary font-bold mt-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {location.count} Alumni
              </div>
              <div className="text-xs text-muted-foreground mt-1">Click to focus</div>
            </motion.div>
          );
        })()}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/30 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Loading alumni locations...</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && locations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="text-center p-6">
              <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No alumni locations found</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <motion.div 
        className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4 text-xs sm:text-sm text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(200, 85%, 55%)' }} />
          <span>1-4</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: 'hsl(45, 85%, 55%)' }} />
          <span>5-9</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(25, 85%, 55%)' }} />
          <span>10-19</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: 'hsl(0, 85%, 55%)' }} />
          <span>20+</span>
        </div>
      </motion.div>

      {/* Country list sidebar - shows on selection */}
      {locations.length > 0 && (
        <motion.div 
          className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {locations
            .sort((a, b) => b.count - a.count)
            .slice(0, 12)
            .map((loc) => (
              <button
                key={loc.country}
                onClick={() => focusOnLocation(loc.country)}
                className={`p-2 rounded-lg border text-left transition-all hover:border-primary/50 hover:bg-accent/50 ${
                  selectedLocation === loc.country ? 'border-primary bg-accent' : 'border-border bg-card/50'
                }`}
              >
                <div className="text-xs font-medium truncate">{loc.country}</div>
                <div className="text-sm font-bold text-primary">{loc.count}</div>
              </button>
            ))}
        </motion.div>
      )}
    </div>
  );
};

export default AlumniWorldMap;
