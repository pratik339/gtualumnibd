import React, { useState, useRef, useCallback } from 'react';
import { useAlumniLocations } from '@/hooks/useAlumniLocations';
import { Globe, Users, MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Accurate Mercator-projected country positions (x: 0-1000, y: 0-550)
const countryPositions: Record<string, { x: number; y: number }> = {
  'India': { x: 670, y: 285 },
  'United States': { x: 175, y: 210 },
  'USA': { x: 175, y: 210 },
  'United Kingdom': { x: 448, y: 155 },
  'UK': { x: 448, y: 155 },
  'Canada': { x: 185, y: 140 },
  'Australia': { x: 825, y: 425 },
  'Germany': { x: 488, y: 168 },
  'France': { x: 465, y: 185 },
  'Singapore': { x: 752, y: 340 },
  'UAE': { x: 600, y: 275 },
  'United Arab Emirates': { x: 600, y: 275 },
  'Dubai': { x: 600, y: 275 },
  'Qatar': { x: 590, y: 270 },
  'Saudi Arabia': { x: 572, y: 270 },
  'Japan': { x: 855, y: 205 },
  'South Korea': { x: 830, y: 210 },
  'China': { x: 770, y: 225 },
  'Netherlands': { x: 472, y: 165 },
  'Switzerland': { x: 478, y: 182 },
  'Ireland': { x: 435, y: 155 },
  'New Zealand': { x: 910, y: 460 },
  'South Africa': { x: 530, y: 430 },
  'Brazil': { x: 295, y: 380 },
  'Mexico': { x: 155, y: 275 },
  'Spain': { x: 452, y: 200 },
  'Italy': { x: 492, y: 195 },
  'Sweden': { x: 500, y: 125 },
  'Norway': { x: 485, y: 118 },
  'Denmark': { x: 484, y: 153 },
  'Finland': { x: 525, y: 118 },
  'Poland': { x: 510, y: 165 },
  'Belgium': { x: 470, y: 170 },
  'Austria': { x: 498, y: 180 },
  'Malaysia': { x: 752, y: 335 },
  'Thailand': { x: 740, y: 300 },
  'Indonesia': { x: 780, y: 355 },
  'Philippines': { x: 810, y: 300 },
  'Vietnam': { x: 758, y: 295 },
  'Russia': { x: 650, y: 130 },
  'Kenya': { x: 560, y: 345 },
  'Nigeria': { x: 480, y: 320 },
  'Egypt': { x: 545, y: 255 },
  'Israel': { x: 555, y: 240 },
  'Turkey': { x: 545, y: 210 },
  'Pakistan': { x: 640, y: 260 },
  'Bangladesh': { x: 705, y: 275 },
  // Bangladesh cities (zoomed-in positions, offset from Bangladesh center)
  'Bangladesh:Dhaka': { x: 706, y: 276 },
  'Bangladesh:Chittagong': { x: 712, y: 282 },
  'Bangladesh:Chattogram': { x: 712, y: 282 },
  'Bangladesh:Khulna': { x: 700, y: 280 },
  'Bangladesh:Rajshahi': { x: 698, y: 273 },
  'Bangladesh:Sylhet': { x: 712, y: 271 },
  'Bangladesh:Rangpur': { x: 700, y: 268 },
  'Bangladesh:Barishal': { x: 706, y: 282 },
  'Bangladesh:Barisal': { x: 706, y: 282 },
  'Bangladesh:Comilla': { x: 710, y: 277 },
  'Bangladesh:Cumilla': { x: 710, y: 277 },
  'Bangladesh:Mymensingh': { x: 706, y: 271 },
  'Bangladesh:Habiganj': { x: 712, y: 274 },
  'Bangladesh:Jessore': { x: 699, y: 278 },
  'Bangladesh:Jashore': { x: 699, y: 278 },
  'Bangladesh:Bogra': { x: 700, y: 271 },
  'Bangladesh:Bogura': { x: 700, y: 271 },
  'Bangladesh:Narayanganj': { x: 707, y: 277 },
  'Bangladesh:Gazipur': { x: 706, y: 274 },
  'Bangladesh:Dinajpur': { x: 698, y: 268 },
  'Bangladesh:Cox\'s Bazar': { x: 713, y: 286 },
  'Sri Lanka': { x: 682, y: 325 },
  'Nepal': { x: 688, y: 258 },
  'Oman': { x: 610, y: 280 },
  'Kuwait': { x: 585, y: 255 },
  'Bahrain': { x: 590, y: 262 },
  'Myanmar': { x: 730, y: 290 },
  'Afghanistan': { x: 635, y: 240 },
  'Iran': { x: 600, y: 240 },
  'Iraq': { x: 572, y: 235 },
  'Jordan': { x: 555, y: 245 },
  'Lebanon': { x: 552, y: 235 },
  'Bhutan': { x: 700, y: 260 },
  'Maldives': { x: 665, y: 340 },
};

// Accurate simplified world map SVG paths (Robinson-like projection)
// These are recognizable continent outlines
const continentPaths = {
  // North America
  northAmerica: `M45,55 L55,45 L68,38 L85,35 L110,32 L135,30 L160,32 L180,38 
    L205,48 L225,58 L240,72 L248,90 L252,110 L255,135 L258,155 L255,175 
    L248,195 L238,210 L225,225 L210,238 L195,248 L178,255 L165,258 
    L155,262 L148,268 L142,278 L138,290 L135,298 L130,295 L122,288 
    L115,278 L108,268 L100,260 L92,255 L85,252 L78,250 L70,250 
    L62,252 L55,258 L48,268 L42,255 L38,240 L35,220 L35,195 
    L38,170 L42,148 L45,128 L48,110 L48,90 L46,72 Z`,
  
  // Greenland
  greenland: `M310,42 L325,35 L345,32 L360,35 L372,45 L378,58 L380,75 
    L378,95 L372,112 L362,125 L348,132 L332,135 L318,128 L308,115 
    L302,98 L300,80 L302,62 Z`,
  
  // South America
  southAmerica: `M195,320 L210,310 L228,308 L245,312 L260,320 L272,332 
    L282,348 L290,368 L295,388 L298,410 L296,432 L290,452 L282,468 
    L272,482 L258,492 L242,498 L228,500 L215,495 L205,485 L198,470 
    L192,452 L188,432 L185,408 L185,388 L188,365 L192,345 Z`,
  
  // Europe
  europe: `M420,92 L435,88 L452,85 L468,88 L485,92 L498,98 L512,105 
    L525,115 L535,128 L540,142 L538,158 L532,172 L522,185 L510,195 
    L498,202 L485,205 L472,208 L458,210 L448,205 L438,198 L428,188 
    L420,178 L415,165 L412,150 L412,135 L415,118 L418,105 Z`,
  
  // Africa
  africa: `M438,215 L455,210 L475,208 L495,212 L515,218 L532,228 
    L548,242 L562,258 L572,278 L580,300 L585,322 L588,345 L586,368 
    L582,392 L575,412 L565,432 L552,448 L535,458 L518,465 L498,468 
    L478,465 L460,458 L445,445 L435,428 L428,408 L424,385 L422,362 
    L424,338 L428,315 L432,295 L435,272 L435,248 L436,230 Z`,
  
  // Asia (mainland)
  asia: `M540,80 L570,72 L605,65 L645,62 L685,65 L725,72 L762,82 
    L798,95 L830,112 L855,132 L870,155 L875,178 L872,200 L862,218 
    L848,232 L830,242 L808,248 L788,252 L770,258 L755,265 L742,275 
    L732,288 L722,298 L712,305 L698,308 L682,305 L668,298 L655,288 
    L642,275 L632,262 L622,248 L612,235 L600,222 L588,212 L575,205 
    L562,200 L552,195 L542,188 L538,178 L535,165 L532,148 L530,128 
    L532,108 L535,92 Z`,
  
  // Indian subcontinent (separate for better visibility)
  india: `M630,252 L645,245 L660,242 L672,245 L685,252 L695,262 
    L702,275 L706,290 L708,308 L705,325 L698,340 L688,352 L675,358 
    L662,355 L650,345 L640,332 L635,315 L632,298 L630,278 L628,262 Z`,
  
  // Bangladesh (highlighted separately)
  bangladesh: `M698,262 L708,258 L715,262 L718,270 L716,280 L710,288 
    L702,285 L698,278 L696,270 Z`,
  
  // Southeast Asia
  southeastAsia: `M725,285 L742,278 L758,280 L772,288 L785,300 
    L795,315 L802,332 L805,350 L800,368 L790,382 L775,390 L758,388 
    L742,382 L730,370 L722,355 L718,338 L718,318 L720,300 Z`,
  
  // Japan & Korea
  japan: `M845,178 L855,172 L865,175 L872,185 L878,198 L880,212 
    L878,228 L872,240 L862,248 L852,245 L845,235 L840,222 L838,208 
    L840,192 Z`,
  
  // Australia
  australia: `M765,388 L792,378 L822,375 L852,380 L878,392 L900,408 
    L918,428 L928,452 L932,478 L928,502 L918,522 L902,535 L882,542 
    L858,545 L835,542 L812,535 L792,522 L778,505 L768,485 L762,462 
    L760,438 L762,412 Z`,
  
  // New Zealand
  newZealand: `M915,465 L925,460 L935,465 L940,478 L938,492 L932,505 
    L922,510 L912,505 L908,492 L910,478 Z`,
  
  // Indonesia islands
  indonesia: `M748,368 L768,362 L790,365 L812,372 L832,382 L848,395 
    L858,410 L855,425 L842,432 L825,430 L805,425 L785,418 L768,408 
    L755,395 L748,382 Z`,
  
  // Middle East
  middleEast: `M548,205 L568,200 L588,202 L608,210 L622,222 L632,238 
    L638,255 L635,268 L625,278 L612,285 L598,288 L582,285 L568,278 
    L558,268 L550,255 L545,240 L542,225 L545,212 Z`,
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
      x: Math.max(-100, prev.x - prev.width * 0.125),
      y: Math.max(-50, prev.y - prev.height * 0.125),
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
      x: Math.max(-200, Math.min(500, prev.x - dx)),
      y: Math.max(-100, Math.min(200, prev.y - dy)),
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, viewBox]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
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
          <span className="text-xs hidden sm:inline opacity-80">Members</span>
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
        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-card/95 backdrop-blur-sm border-2 border-primary/20 shadow-lg hover:border-primary/50 hover:scale-110 transition-all" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-card/95 backdrop-blur-sm border-2 border-primary/20 shadow-lg hover:border-primary/50 hover:scale-110 transition-all" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-card/95 backdrop-blur-sm border-2 border-primary/20 shadow-lg hover:border-primary/50 hover:scale-110 transition-all" onClick={handleReset}>
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
            <radialGradient id="oceanGradient" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="hsl(210, 60%, 15%)" />
              <stop offset="50%" stopColor="hsl(210, 55%, 10%)" />
              <stop offset="100%" stopColor="hsl(220, 50%, 6%)" />
            </radialGradient>
            
            <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(145, 40%, 45%)" />
              <stop offset="50%" stopColor="hsl(140, 35%, 38%)" />
              <stop offset="100%" stopColor="hsl(135, 30%, 32%)" />
            </linearGradient>

            <linearGradient id="indiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(145, 45%, 50%)" />
              <stop offset="100%" stopColor="hsl(140, 40%, 40%)" />
            </linearGradient>

            <linearGradient id="bangladeshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(120, 50%, 50%)" />
              <stop offset="100%" stopColor="hsl(120, 45%, 40%)" />
            </linearGradient>
            
            <linearGradient id="landStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(145, 35%, 55%)" />
              <stop offset="100%" stopColor="hsl(140, 30%, 45%)" />
            </linearGradient>

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

            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(200, 80%, 60%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(200, 80%, 60%)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(200, 80%, 60%)" stopOpacity="0" />
            </linearGradient>

            <filter id="markerGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="landShadow">
              <feDropShadow dx="2" dy="3" stdDeviation="5" floodColor="hsl(0, 0%, 0%)" floodOpacity="0.35"/>
            </filter>
          </defs>
          
          {/* Ocean */}
          <rect x="-200" y="-100" width="1400" height="750" fill="url(#oceanGradient)" />
          
          {/* Grid lines */}
          {[0, 110, 220, 330, 440, 550].map((y, i) => (
            <line key={`lat-${i}`} x1="-200" y1={y} x2="1200" y2={y} stroke="hsl(210, 40%, 20%)" strokeWidth="0.5" strokeDasharray="4,8" opacity="0.25" />
          ))}
          {[0, 167, 333, 500, 667, 833, 1000].map((x, i) => (
            <line key={`lng-${i}`} x1={x} y1="-100" x2={x} y2="600" stroke="hsl(210, 40%, 20%)" strokeWidth="0.5" strokeDasharray="4,8" opacity="0.25" />
          ))}

          {/* Continent shapes */}
          <g filter="url(#landShadow)">
            {Object.entries(continentPaths).map(([name, path]) => {
              // Use special gradient for India and Bangladesh
              let fill = "url(#landGradient)";
              let strokeColor = "url(#landStroke)";
              let strokeW = 1.5;
              
              if (name === 'india') {
                fill = "url(#indiaGradient)";
                strokeW = 2;
              } else if (name === 'bangladesh') {
                fill = "url(#bangladeshGradient)";
                strokeW = 2;
              }

              return (
                <motion.path
                  key={name}
                  d={path}
                  fill={fill}
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  strokeLinejoin="round"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  style={{ transformOrigin: 'center' }}
                />
              );
            })}
          </g>

          {/* Connection arcs between top locations */}
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

          {/* Country labels for key regions (subtle) */}
          {[
            { name: 'INDIA', x: 665, y: 310 },
            { name: 'BD', x: 708, y: 278 },
          ].map((label) => (
            <motion.text
              key={label.name}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              fill="hsl(145, 30%, 65%)"
              fontSize="8"
              fontWeight="600"
              letterSpacing="2"
              opacity="0.4"
              style={{ pointerEvents: 'none' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.5 }}
            >
              {label.name}
            </motion.text>
          ))}

          {/* Alumni location markers */}
          {locations.map((location, index) => {
            // For city-level Bangladesh markers, use city-specific position
            const posKey = location.isCityLevel && location.city 
              ? `Bangladesh:${location.city}` 
              : location.country;
            const pos = countryPositions[posKey] || countryPositions[location.country];
            if (!pos) return null;
            
            const markerKey = location.isCityLevel ? `${location.country}-${location.city}` : location.country;
            const displayLabel = location.isCityLevel && location.city ? location.city : location.country;
            
            const size = getMarkerSize(location.count);
            const gradientId = getMarkerGradientId(location.count);
            const isHovered = hoveredLocation === markerKey;
            const isSelected = selectedLocation === markerKey;
            
            return (
              <g
                key={markerKey}
                onMouseEnter={() => setHoveredLocation(markerKey)}
                onMouseLeave={() => setHoveredLocation(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  // For city-level, zoom into Bangladesh region
                  if (location.isCityLevel) {
                    setViewBox({ x: 680, y: 255, width: 60, height: 45 });
                    setSelectedLocation(markerKey);
                  } else {
                    focusOnLocation(location.country);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer pulse */}
                <motion.circle
                  cx={pos.x} cy={pos.y} r={size + 15}
                  fill={`url(#${gradientId})`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [0.8, 1.8, 0.8], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                />
                
                {/* Inner glow */}
                <motion.circle
                  cx={pos.x} cy={pos.y} r={size + 6}
                  fill={`url(#${gradientId})`}
                  opacity={0.25}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.25, 0.1, 0.25] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.15 }}
                />
                
                {/* Main marker */}
                <motion.circle
                  cx={pos.x} cy={pos.y}
                  r={isHovered || isSelected ? size + 5 : size}
                  fill={`url(#${gradientId})`}
                  stroke="white"
                  strokeWidth={isSelected ? 3 : 2}
                  filter="url(#markerGlow)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.05, type: "spring", stiffness: 200, damping: 15 }}
                />
                
                {/* Count */}
                {(location.count >= 2 || isHovered) && (
                  <motion.text
                    x={pos.x} y={pos.y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize={size > 12 ? "12" : "10"}
                    fontWeight="bold"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)', pointerEvents: 'none' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                  >
                    {location.count > 999 ? '999+' : location.count}
                  </motion.text>
                )}
                
                {/* Hover label */}
                {(isHovered || isSelected) && (
                  <motion.g initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                    <rect
                      x={pos.x - 45}
                      y={pos.y - size - 28}
                      width="90"
                      height="20"
                      rx="10"
                      fill="hsl(var(--card))"
                      stroke="hsl(var(--primary))"
                      strokeWidth="1.5"
                      opacity="0.95"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - size - 14}
                      textAnchor="middle"
                      fill="hsl(var(--foreground))"
                      fontSize="10"
                      fontWeight="700"
                    >
                      {displayLabel.length > 14 ? displayLabel.slice(0, 14) + '…' : displayLabel}
                    </text>
                  </motion.g>
                )}
              </g>
            );
          })}

          {/* Equator */}
          <line x1="-200" y1="275" x2="1200" y2="275" stroke="hsl(45, 60%, 50%)" strokeWidth="0.8" strokeDasharray="10,15" opacity="0.15" />
        </svg>

        {/* Hover tooltip */}
        {hoveredLocation && (() => {
          const location = locations.find(l => {
            const key = l.isCityLevel ? `${l.country}-${l.city}` : l.country;
            return key === hoveredLocation;
          });
          if (!location) return null;
          const posKey = location.isCityLevel && location.city 
            ? `Bangladesh:${location.city}` 
            : location.country;
          const pos = countryPositions[posKey] || countryPositions[location.country];
          if (!pos) return null;
          
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
                  <div className="font-bold text-sm text-foreground">
                    {location.isCityLevel && location.city ? location.city : location.country}
                  </div>
                  {location.isCityLevel ? (
                    <div className="text-xs text-muted-foreground">Bangladesh</div>
                  ) : location.city ? (
                    <div className="text-xs text-muted-foreground">{location.city}</div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-lg font-bold text-primary">{location.count}</span>
                <span className="text-xs text-muted-foreground">members</span>
              </div>
            </motion.div>
          );
        })()}

        {/* Loading */}
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

      {/* Legend */}
      <motion.div 
        className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-5 px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        {[
          { gradient: 'markerGradientCool', label: '1-4', color1: 'hsl(200, 90%, 60%)', color2: 'hsl(210, 80%, 50%)' },
          { gradient: 'markerGradientMedium', label: '5-9', color1: 'hsl(45, 95%, 60%)', color2: 'hsl(40, 85%, 50%)' },
          { gradient: 'markerGradientWarm', label: '10-19', color1: 'hsl(25, 95%, 60%)', color2: 'hsl(15, 85%, 50%)' },
          { gradient: 'markerGradientHot', label: '20+', color1: 'hsl(350, 90%, 65%)', color2: 'hsl(350, 80%, 50%)' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-full border border-border/50">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <defs>
                <radialGradient id={`legend-${item.gradient}`} cx="30%" cy="30%">
                  <stop offset="0%" stopColor={item.color1} />
                  <stop offset="100%" stopColor={item.color2} />
                </radialGradient>
              </defs>
              <circle cx="8" cy="8" r="6" fill={`url(#legend-${item.gradient})`} stroke="white" strokeWidth="1" />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Country quick access */}
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
