import React, { useState, useRef, useCallback } from 'react';
import { useAlumniLocations } from '@/hooks/useAlumniLocations';
import { Globe, Users, MapPin, ZoomIn, ZoomOut, RotateCcw, Sparkles } from 'lucide-react';
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

// Detailed continent paths for clear visualization
const worldMapPaths = {
  // North America - larger and more detailed
  northAmerica: "M50,80 C60,60 100,40 150,35 C200,30 250,35 280,50 C310,65 320,100 315,140 C310,180 290,210 260,240 C230,270 200,290 170,300 C140,295 110,280 90,260 C70,240 55,210 50,180 C45,150 45,110 50,80 Z",
  
  // Greenland
  greenland: "M320,50 C340,45 370,50 385,70 C400,90 395,120 380,140 C365,155 340,160 320,150 C300,140 290,115 295,90 C300,70 310,55 320,50 Z",
  
  // Central America  
  centralAmerica: "M150,295 C165,290 180,295 190,315 C200,335 195,360 180,375 C165,385 145,380 140,360 C135,340 140,310 150,295 Z",
  
  // South America - larger
  southAmerica: "M200,370 C230,355 270,360 300,385 C330,410 345,455 340,500 C335,545 310,580 270,590 C230,595 190,575 170,540 C150,505 155,460 170,420 C185,385 195,375 200,370 Z",
  
  // Europe - more visible
  europe: "M420,100 C450,90 490,95 520,105 C550,115 575,135 580,165 C585,195 570,220 545,235 C520,250 485,255 455,245 C425,235 405,210 400,180 C395,150 400,120 420,100 Z",
  
  // UK & Ireland
  uk: "M430,120 C445,110 465,115 475,135 C485,155 480,180 465,195 C450,205 430,200 420,185 C410,170 415,145 430,120 Z",
  
  // Africa - prominent
  africa: "M445,230 C480,215 530,220 565,245 C600,270 625,320 635,375 C645,430 630,485 595,520 C560,555 510,565 465,545 C420,525 395,480 390,425 C385,370 400,310 420,270 C435,245 445,230 445,230 Z",
  
  // Middle East
  middleEast: "M555,210 C590,200 625,215 650,245 C675,275 680,315 665,345 C650,375 615,390 580,380 C545,370 520,340 520,300 C520,260 535,225 555,210 Z",
  
  // Russia - spans across
  russia: "M560,70 C620,55 700,50 780,60 C860,70 920,95 950,130 C980,165 970,200 930,220 C890,240 820,245 750,235 C680,225 620,200 580,165 C540,130 530,95 560,70 Z",
  
  // Central/East Asia
  asia: "M650,180 C700,165 760,175 810,200 C860,225 895,270 900,320 C905,370 880,410 835,430 C790,450 730,445 680,420 C630,395 600,350 600,300 C600,250 615,205 650,180 Z",
  
  // India subcontinent
  india: "M630,260 C665,245 705,255 730,285 C755,315 765,360 755,400 C745,440 715,465 680,470 C645,475 615,455 600,420 C585,385 590,340 610,300 C625,270 630,260 630,260 Z",
  
  // Southeast Asia
  southeastAsia: "M735,320 C770,310 810,325 835,355 C860,385 865,425 845,455 C825,485 785,495 750,480 C715,465 700,430 705,395 C710,360 720,335 735,320 Z",
  
  // Japan
  japan: "M855,190 C875,180 900,190 915,215 C930,240 930,275 915,300 C900,320 875,325 855,310 C835,295 830,260 840,235 C850,210 855,195 855,190 Z",
  
  // Australia - larger
  australia: "M765,395 C815,375 875,385 920,415 C965,445 985,495 975,545 C965,595 920,625 865,630 C810,635 755,610 725,565 C695,520 700,465 730,425 C755,400 765,395 765,395 Z",
  
  // New Zealand
  newZealand: "M920,480 C940,475 960,490 965,515 C970,540 960,565 940,575 C920,585 900,575 895,555 C890,535 900,505 920,480 Z",
  
  // Indonesia archipelago
  indonesia: "M750,375 C785,365 830,375 865,400 C900,425 910,460 895,485 C880,510 840,520 800,510 C760,500 735,475 735,445 C735,415 745,390 750,375 Z",
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
    if (count >= 50) return 20;
    if (count >= 20) return 16;
    if (count >= 10) return 13;
    if (count >= 5) return 10;
    return 8;
  };

  const getMarkerGradientId = (count: number) => {
    if (count >= 50) return 'markerGradientHot';
    if (count >= 20) return 'markerGradientWarm';
    if (count >= 10) return 'markerGradientMedium';
    return 'markerGradientCool';
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
        className="absolute top-3 left-3 z-10 flex flex-wrap gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-gradient-to-r from-primary/90 to-primary/70 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg flex items-center gap-2 text-primary-foreground">
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-bold">{totalAlumni}</span>
          <span className="text-xs hidden sm:inline opacity-80">Alumni</span>
        </div>
        <div className="bg-gradient-to-r from-secondary/90 to-secondary/70 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg flex items-center gap-2 text-secondary-foreground">
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-bold">{locations.length}</span>
          <span className="text-xs hidden sm:inline opacity-80">Countries</span>
        </div>
      </motion.div>

      {/* Zoom controls */}
      <motion.div 
        className="absolute top-3 right-3 z-10 flex flex-col gap-1"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full bg-card/95 backdrop-blur-sm border-2 border-primary/20 shadow-lg hover:border-primary/50 hover:scale-110 transition-all"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full bg-card/95 backdrop-blur-sm border-2 border-primary/20 shadow-lg hover:border-primary/50 hover:scale-110 transition-all"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full bg-card/95 backdrop-blur-sm border-2 border-primary/20 shadow-lg hover:border-primary/50 hover:scale-110 transition-all"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Map container */}
      <div className="w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/10 bg-gradient-to-br from-[hsl(210,60%,8%)] via-[hsl(210,55%,12%)] to-[hsl(220,50%,10%)] relative">
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          className="w-full h-[300px] sm:h-[400px] md:h-[480px] cursor-grab active:cursor-grabbing select-none"
          preserveAspectRatio="xMidYMid meet"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <defs>
            {/* Ocean gradient - deep space feel */}
            <radialGradient id="oceanGradient" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="hsl(210, 60%, 15%)" />
              <stop offset="50%" stopColor="hsl(210, 55%, 10%)" />
              <stop offset="100%" stopColor="hsl(220, 50%, 6%)" />
            </radialGradient>
            
            {/* Land gradients - brighter and more visible */}
            <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(145, 40%, 45%)" />
              <stop offset="50%" stopColor="hsl(140, 35%, 38%)" />
              <stop offset="100%" stopColor="hsl(135, 30%, 32%)" />
            </linearGradient>
            
            <linearGradient id="landGradientHover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(145, 45%, 52%)" />
              <stop offset="100%" stopColor="hsl(140, 40%, 42%)" />
            </linearGradient>
            
            {/* Land stroke/border */}
            <linearGradient id="landStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(145, 35%, 55%)" />
              <stop offset="100%" stopColor="hsl(140, 30%, 45%)" />
            </linearGradient>

            {/* Marker gradients - beautiful color scheme */}
            <radialGradient id="markerGradientHot" cx="30%" cy="30%">
              <stop offset="0%" stopColor="hsl(350, 90%, 65%)" />
              <stop offset="100%" stopColor="hsl(350, 80%, 50%)" />
            </radialGradient>
            
            <radialGradient id="markerGradientWarm" cx="30%" cy="30%">
              <stop offset="0%" stopColor="hsl(25, 95%, 60%)" />
              <stop offset="100%" stopColor="hsl(15, 85%, 50%)" />
            </radialGradient>
            
            <radialGradient id="markerGradientMedium" cx="30%" cy="30%">
              <stop offset="0%" stopColor="hsl(45, 95%, 60%)" />
              <stop offset="100%" stopColor="hsl(40, 85%, 50%)" />
            </radialGradient>
            
            <radialGradient id="markerGradientCool" cx="30%" cy="30%">
              <stop offset="0%" stopColor="hsl(200, 90%, 60%)" />
              <stop offset="100%" stopColor="hsl(210, 80%, 50%)" />
            </radialGradient>

            {/* Connection line gradient */}
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(200, 80%, 60%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(200, 80%, 60%)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(200, 80%, 60%)" stopOpacity="0" />
            </linearGradient>

            {/* Glow filters */}
            <filter id="markerGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="landShadow">
              <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="hsl(0, 0%, 0%)" floodOpacity="0.4"/>
            </filter>

            {/* Animated gradient for connection lines */}
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(200, 80%, 60%)" stopOpacity="0">
                <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite"/>
              </stop>
              <stop offset="20%" stopColor="hsl(200, 80%, 60%)" stopOpacity="0.6">
                <animate attributeName="offset" values="0.2;1.2" dur="2s" repeatCount="indefinite"/>
              </stop>
              <stop offset="40%" stopColor="hsl(200, 80%, 60%)" stopOpacity="0">
                <animate attributeName="offset" values="0.4;1.4" dur="2s" repeatCount="indefinite"/>
              </stop>
            </linearGradient>
          </defs>
          
          {/* Ocean background */}
          <rect x="-200" y="-100" width="1400" height="750" fill="url(#oceanGradient)" />
          
          {/* Subtle grid - more elegant */}
          {[0, 100, 200, 300, 400, 500].map((y, i) => (
            <line
              key={`lat-${i}`}
              x1="-200"
              y1={y}
              x2="1200"
              y2={y}
              stroke="hsl(210, 40%, 20%)"
              strokeWidth="0.5"
              strokeDasharray="4,8"
              opacity="0.3"
            />
          ))}
          {[0, 200, 400, 600, 800, 1000].map((x, i) => (
            <line
              key={`lng-${i}`}
              x1={x}
              y1="-100"
              x2={x}
              y2="600"
              stroke="hsl(210, 40%, 20%)"
              strokeWidth="0.5"
              strokeDasharray="4,8"
              opacity="0.3"
            />
          ))}

          {/* Continent shapes with shadow */}
          <g filter="url(#landShadow)">
            {Object.entries(worldMapPaths).map(([name, path]) => (
              <motion.path
                key={name}
                d={path}
                fill="url(#landGradient)"
                stroke="url(#landStroke)"
                strokeWidth="2"
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                style={{ transformOrigin: 'center' }}
              />
            ))}
          </g>

          {/* Connection lines between major locations */}
          {locations.length > 1 && locations.slice(0, 8).map((loc, i) => {
            const pos = countryPositions[loc.country];
            const nextLoc = locations[(i + 1) % Math.min(8, locations.length)];
            const nextPos = countryPositions[nextLoc?.country];
            if (!pos || !nextPos) return null;
            
            const midX = (pos.x + nextPos.x) / 2;
            const midY = Math.min(pos.y, nextPos.y) - 30;
            
            return (
              <motion.path
                key={`connection-${i}`}
                d={`M ${pos.x} ${pos.y} Q ${midX} ${midY} ${nextPos.x} ${nextPos.y}`}
                stroke="url(#connectionGradient)"
                strokeWidth="1.5"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 1 + i * 0.15 }}
              />
            );
          })}

          {/* Alumni location markers */}
          {locations.map((location, index) => {
            const pos = countryPositions[location.country];
            if (!pos) return null;
            
            const size = getMarkerSize(location.count);
            const gradientId = getMarkerGradientId(location.count);
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
                  r={size + 15}
                  fill={`url(#${gradientId})`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: [0.8, 1.8, 0.8],
                    opacity: [0.3, 0, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                />
                
                {/* Inner glow ring */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size + 6}
                  fill={`url(#${gradientId})`}
                  opacity={0.25}
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.25, 0.1, 0.25]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: index * 0.15
                  }}
                />
                
                {/* Main marker */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered || isSelected ? size + 5 : size}
                  fill={`url(#${gradientId})`}
                  stroke="white"
                  strokeWidth={isSelected ? 3 : 2}
                  filter="url(#markerGlow)"
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
                    fontSize={size > 12 ? "12" : "10"}
                    fontWeight="bold"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                  >
                    {location.count > 999 ? '999+' : location.count}
                  </motion.text>
                )}
                
                {/* Country label on hover */}
                {(isHovered || isSelected) && (
                  <motion.g
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <rect
                      x={pos.x - 40}
                      y={pos.y - size - 25}
                      width="80"
                      height="18"
                      rx="9"
                      fill="hsl(var(--card))"
                      stroke="hsl(var(--primary))"
                      strokeWidth="1"
                      opacity="0.95"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - size - 12}
                      textAnchor="middle"
                      fill="hsl(var(--foreground))"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {location.country.length > 12 ? location.country.slice(0, 12) + '...' : location.country}
                    </text>
                  </motion.g>
                )}
              </g>
            );
          })}

          {/* Equator line - subtle */}
          <line
            x1="-200"
            y1="275"
            x2="1200"
            y2="275"
            stroke="hsl(45, 60%, 50%)"
            strokeWidth="0.8"
            strokeDasharray="10,15"
            opacity="0.2"
          />
        </svg>

        {/* Hover tooltip */}
        {hoveredLocation && (() => {
          const location = locations.find(l => l.country === hoveredLocation);
          const pos = location ? countryPositions[location.country] : null;
          if (!location || !pos) return null;
          
          const xPercent = ((pos.x - viewBox.x) / viewBox.width) * 100;
          const yPercent = ((pos.y - viewBox.y) / viewBox.height) * 100;
          
          return (
            <motion.div
              className="absolute bg-card/98 backdrop-blur-xl border-2 border-primary/40 shadow-2xl rounded-2xl px-4 py-3 pointer-events-none z-20"
              style={{
                left: `${Math.min(80, Math.max(20, xPercent))}%`,
                top: `${Math.min(75, Math.max(15, yPercent - 18))}%`,
                transform: 'translate(-50%, -100%)'
              }}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">{location.country}</div>
                  {location.city && (
                    <div className="text-xs text-muted-foreground">{location.city}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-lg font-bold text-primary">{location.count}</span>
                <span className="text-xs text-muted-foreground">alumni</span>
              </div>
            </motion.div>
          );
        })()}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <Globe className="absolute inset-0 m-auto w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Loading global network...</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && locations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="text-center p-6">
              <Globe className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No alumni locations found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Data will appear as members join</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend - more visual */}
      <motion.div 
        className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-5 px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        {[
          { min: 1, max: 4, gradient: 'markerGradientCool', label: '1-4' },
          { min: 5, max: 9, gradient: 'markerGradientMedium', label: '5-9' },
          { min: 10, max: 19, gradient: 'markerGradientWarm', label: '10-19' },
          { min: 20, max: null, gradient: 'markerGradientHot', label: '20+' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-full border border-border/50">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <defs>
                <radialGradient id={`legend-${item.gradient}`} cx="30%" cy="30%">
                  <stop offset="0%" stopColor={
                    item.gradient === 'markerGradientHot' ? 'hsl(350, 90%, 65%)' :
                    item.gradient === 'markerGradientWarm' ? 'hsl(25, 95%, 60%)' :
                    item.gradient === 'markerGradientMedium' ? 'hsl(45, 95%, 60%)' :
                    'hsl(200, 90%, 60%)'
                  } />
                  <stop offset="100%" stopColor={
                    item.gradient === 'markerGradientHot' ? 'hsl(350, 80%, 50%)' :
                    item.gradient === 'markerGradientWarm' ? 'hsl(15, 85%, 50%)' :
                    item.gradient === 'markerGradientMedium' ? 'hsl(40, 85%, 50%)' :
                    'hsl(210, 80%, 50%)'
                  } />
                </radialGradient>
              </defs>
              <circle cx="8" cy="8" r="6" fill={`url(#legend-${item.gradient})`} stroke="white" strokeWidth="1" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Country quick access - cleaner design */}
      {locations.length > 0 && (
        <motion.div 
          className="mt-5 flex flex-wrap justify-center gap-2 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {locations
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map((loc) => (
              <motion.button
                key={loc.country}
                onClick={() => focusOnLocation(loc.country)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedLocation === loc.country 
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                    : 'bg-card/80 border border-border/50 text-foreground hover:border-primary/50 hover:bg-accent/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="truncate max-w-[80px]">{loc.country}</span>
                <span className={`font-bold ${selectedLocation === loc.country ? 'text-primary-foreground' : 'text-primary'}`}>
                  {loc.count}
                </span>
              </motion.button>
            ))}
        </motion.div>
      )}
    </div>
  );
};

export default AlumniWorldMap;
