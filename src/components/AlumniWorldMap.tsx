import React, { useState } from 'react';
import { useAlumniLocations } from '@/hooks/useAlumniLocations';
import { Globe, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

// Country coordinates mapped to SVG viewBox (simplified world map projection)
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

const AlumniWorldMap = () => {
  const { locations, loading, totalAlumni } = useAlumniLocations();
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  // Calculate marker size based on count
  const getMarkerSize = (count: number) => {
    if (count >= 50) return 16;
    if (count >= 20) return 13;
    if (count >= 10) return 10;
    if (count >= 5) return 8;
    return 6;
  };

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

      {/* Map container - increased height and better aspect ratio */}
      <div className="w-full aspect-[2/1] min-h-[300px] max-h-[600px] rounded-xl overflow-hidden shadow-2xl border-2 border-border bg-[hsl(220,30%,12%)] dark:bg-[hsl(220,30%,8%)] relative">
        <svg 
          viewBox="0 0 1000 500" 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* World map simplified paths */}
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(220, 30%, 20%)" />
              <stop offset="100%" stopColor="hsl(220, 30%, 15%)" />
            </linearGradient>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(210, 50%, 15%)" />
              <stop offset="100%" stopColor="hsl(210, 40%, 12%)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="continentShadow">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Ocean background */}
          <rect width="1000" height="500" fill="url(#oceanGradient)" />
          
          {/* Grid lines - more subtle */}
          {[...Array(9)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={(i + 1) * 50}
              x2="1000"
              y2={(i + 1) * 50}
              stroke="hsl(220, 30%, 25%)"
              strokeWidth="0.3"
              strokeDasharray="5,5"
              opacity="0.2"
            />
          ))}
          {[...Array(19)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={(i + 1) * 50}
              y1="0"
              x2={(i + 1) * 50}
              y2="500"
              stroke="hsl(220, 30%, 25%)"
              strokeWidth="0.3"
              strokeDasharray="5,5"
              opacity="0.2"
            />
          ))}

          {/* Improved continent shapes */}
          {/* North America */}
          <path
            d="M50,80 Q80,60 120,70 L180,65 Q220,60 260,75 L290,90 Q300,120 290,160 L275,200 Q250,240 220,270 L180,290 Q140,300 100,280 L70,250 Q50,210 60,170 L55,130 Q45,100 50,80 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
            filter="url(#continentShadow)"
          />
          {/* Central America */}
          <path
            d="M150,285 Q170,280 180,300 L185,330 Q175,350 160,345 L150,320 Q145,300 150,285 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
          />
          {/* South America */}
          <path
            d="M200,330 Q250,310 280,340 L300,400 Q310,450 290,490 L250,500 Q200,495 180,460 L170,400 Q175,360 200,330 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
            filter="url(#continentShadow)"
          />
          {/* Europe */}
          <path
            d="M430,100 Q460,80 500,90 L540,95 Q570,90 590,110 L585,140 Q570,170 540,185 L500,190 Q460,185 440,165 L425,130 Q420,110 430,100 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
            filter="url(#continentShadow)"
          />
          {/* UK */}
          <path
            d="M440,120 Q450,110 460,120 L458,140 Q450,150 442,145 L440,130 Q438,125 440,120 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
          />
          {/* Africa */}
          <path
            d="M450,210 Q500,195 550,215 L590,260 Q610,320 600,380 L580,430 Q550,470 500,460 L460,430 Q430,380 440,320 L435,260 Q440,230 450,210 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
            filter="url(#continentShadow)"
          />
          {/* Middle East */}
          <path
            d="M560,200 Q590,190 620,210 L640,250 Q635,280 610,290 L575,275 Q555,250 560,200 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
          />
          {/* Russia/Northern Asia */}
          <path
            d="M580,80 Q650,60 750,70 L850,90 Q890,100 900,130 L890,160 Q860,180 800,175 L720,165 Q650,160 600,145 L580,120 Q570,95 580,80 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
            filter="url(#continentShadow)"
          />
          {/* Asia */}
          <path
            d="M620,150 Q680,140 750,160 L820,180 Q870,200 880,250 L870,300 Q840,330 780,325 L720,310 Q660,290 630,250 L610,200 Q610,170 620,150 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
            filter="url(#continentShadow)"
          />
          {/* India subcontinent */}
          <path
            d="M650,250 Q690,240 720,270 L725,320 Q710,360 680,365 L650,350 Q630,310 650,250 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
          />
          {/* Southeast Asia */}
          <path
            d="M740,310 Q770,300 790,320 L800,360 Q790,390 760,385 L740,360 Q730,335 740,310 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
          />
          {/* Japan */}
          <path
            d="M860,180 Q875,170 885,185 L890,220 Q880,250 865,245 L855,220 Q850,195 860,180 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
          />
          {/* Australia */}
          <path
            d="M780,380 Q840,365 890,390 L920,440 Q910,485 860,490 L800,480 Q760,455 765,420 Q765,395 780,380 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
            filter="url(#continentShadow)"
          />
          {/* New Zealand */}
          <path
            d="M920,460 Q935,455 940,470 L935,490 Q925,495 920,485 L920,470 Z"
            fill="hsl(220, 20%, 32%)"
            stroke="hsl(220, 20%, 45%)"
            strokeWidth="0.8"
          />

          {/* Alumni location markers */}
          {locations.map((location, index) => {
            const pos = countryPositions[location.country];
            if (!pos) return null;
            
            const size = getMarkerSize(location.count);
            const isHovered = hoveredLocation === location.country;
            
            return (
              <g
                key={location.country}
                onMouseEnter={() => setHoveredLocation(location.country)}
                onMouseLeave={() => setHoveredLocation(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse animation */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size + 6}
                  fill="hsl(350, 70%, 50%)"
                  opacity={0.3}
                  initial={{ scale: 1, opacity: 0.3 }}
                  animate={{ 
                    scale: [1, 1.8, 1],
                    opacity: [0.3, 0, 0.3]
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
                  r={isHovered ? size + 3 : size}
                  fill="hsl(350, 70%, 50%)"
                  filter="url(#glow)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: index * 0.08,
                    type: "spring",
                    stiffness: 200
                  }}
                />
                {/* Count label for larger markers */}
                {location.count >= 3 && (
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {location.count > 99 ? '99+' : location.count}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip - positioned outside SVG */}
        {hoveredLocation && (() => {
          const location = locations.find(l => l.country === hoveredLocation);
          const pos = location ? countryPositions[location.country] : null;
          if (!location || !pos) return null;
          
          return (
            <motion.div
              className="absolute bg-card/95 backdrop-blur-sm border shadow-lg rounded-lg px-3 py-2 pointer-events-none z-20"
              style={{
                left: `${(pos.x / 1000) * 100}%`,
                top: `${(pos.y / 500) * 100}%`,
                transform: 'translate(-50%, -120%)'
              }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="font-semibold flex items-center gap-1 text-foreground">
                <MapPin className="w-3 h-3 text-primary" />
                {location.country}
              </div>
              {location.city && (
                <div className="text-xs text-muted-foreground">{location.city}</div>
              )}
              <div className="text-sm text-primary font-medium mt-1">
                {location.count} Alumni
              </div>
            </motion.div>
          );
        })()}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Loading alumni locations...</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <motion.div 
        className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 text-xs sm:text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[hsl(350,70%,50%)]" />
          <span>1-2 Alumni</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[hsl(350,70%,50%)]" />
          <span>3-9 Alumni</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[hsl(350,70%,50%)]" />
          <span>10+ Alumni</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AlumniWorldMap;
