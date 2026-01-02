import React, { useState, useEffect } from 'react';
import { useAlumniLocations } from '@/hooks/useAlumniLocations';
import { Globe, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
      <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-2xl border-2 border-border bg-[hsl(220,30%,12%)] dark:bg-[hsl(220,30%,8%)] relative">
        <svg 
          viewBox="0 0 1000 500" 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* World map simplified paths */}
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(220, 30%, 20%)" />
              <stop offset="100%" stopColor="hsl(220, 30%, 15%)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Ocean background */}
          <rect width="1000" height="500" fill="url(#mapGradient)" />
          
          {/* Simplified continent outlines */}
          {/* North America */}
          <path
            d="M80,100 Q100,80 150,90 Q200,85 250,100 Q280,90 300,120 Q290,150 280,180 Q260,200 240,220 Q220,260 180,280 Q140,300 100,280 Q80,250 90,220 Q70,180 80,140 Z"
            fill="hsl(220, 20%, 30%)"
            stroke="hsl(220, 20%, 40%)"
            strokeWidth="0.5"
            opacity="0.8"
          />
          {/* South America */}
          <path
            d="M220,300 Q260,290 280,320 Q300,360 310,400 Q300,450 280,480 Q250,490 230,470 Q200,430 210,380 Q200,340 220,300 Z"
            fill="hsl(220, 20%, 30%)"
            stroke="hsl(220, 20%, 40%)"
            strokeWidth="0.5"
            opacity="0.8"
          />
          {/* Europe */}
          <path
            d="M420,120 Q450,100 480,110 Q520,100 550,120 Q560,150 540,180 Q510,200 470,200 Q440,190 420,170 Q410,140 420,120 Z"
            fill="hsl(220, 20%, 30%)"
            stroke="hsl(220, 20%, 40%)"
            strokeWidth="0.5"
            opacity="0.8"
          />
          {/* Africa */}
          <path
            d="M450,220 Q500,210 540,230 Q580,260 590,320 Q580,380 550,420 Q510,450 470,430 Q440,390 450,340 Q430,280 450,220 Z"
            fill="hsl(220, 20%, 30%)"
            stroke="hsl(220, 20%, 40%)"
            strokeWidth="0.5"
            opacity="0.8"
          />
          {/* Asia */}
          <path
            d="M560,100 Q620,80 700,90 Q780,100 850,140 Q880,180 870,230 Q850,280 800,300 Q740,320 680,300 Q620,280 580,240 Q550,190 560,140 Q555,120 560,100 Z"
            fill="hsl(220, 20%, 30%)"
            stroke="hsl(220, 20%, 40%)"
            strokeWidth="0.5"
            opacity="0.8"
          />
          {/* India subcontinent */}
          <path
            d="M640,240 Q680,230 710,260 Q720,300 700,340 Q670,360 640,340 Q620,300 640,240 Z"
            fill="hsl(220, 20%, 30%)"
            stroke="hsl(220, 20%, 40%)"
            strokeWidth="0.5"
            opacity="0.8"
          />
          {/* Australia */}
          <path
            d="M780,380 Q830,360 880,380 Q910,420 890,460 Q850,480 800,470 Q760,450 770,410 Q765,390 780,380 Z"
            fill="hsl(220, 20%, 30%)"
            stroke="hsl(220, 20%, 40%)"
            strokeWidth="0.5"
            opacity="0.8"
          />
          {/* Japan */}
          <path
            d="M850,180 Q870,170 880,190 Q885,220 870,240 Q855,250 850,230 Q845,200 850,180 Z"
            fill="hsl(220, 20%, 30%)"
            stroke="hsl(220, 20%, 40%)"
            strokeWidth="0.5"
            opacity="0.8"
          />

          {/* Grid lines */}
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
              opacity="0.3"
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
              opacity="0.3"
            />
          ))}

          {/* Alumni location markers */}
          <TooltipProvider>
            {locations.map((location, index) => {
              const pos = countryPositions[location.country];
              if (!pos) return null;
              
              const size = getMarkerSize(location.count);
              
              return (
                <Tooltip key={location.country}>
                  <TooltipTrigger asChild>
                    <g
                      onMouseEnter={() => setHoveredLocation(location.country)}
                      onMouseLeave={() => setHoveredLocation(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Pulse animation */}
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r={size + 4}
                        fill="hsl(350, 70%, 50%)"
                        opacity={0.3}
                        initial={{ scale: 1, opacity: 0.3 }}
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 0, 0.3]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2
                        }}
                      />
                      {/* Main marker */}
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r={hoveredLocation === location.country ? size + 2 : size}
                        fill="hsl(350, 70%, 50%)"
                        filter="url(#glow)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 200
                        }}
                      />
                      {/* Count label for larger markers */}
                      {location.count >= 5 && (
                        <text
                          x={pos.x}
                          y={pos.y + 4}
                          textAnchor="middle"
                          fill="white"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          {location.count > 99 ? '99+' : location.count}
                        </text>
                      )}
                    </g>
                  </TooltipTrigger>
                  <TooltipContent className="bg-card border shadow-lg">
                    <div className="p-1">
                      <div className="font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        {location.country}
                      </div>
                      {location.city && (
                        <div className="text-xs text-muted-foreground">{location.city}</div>
                      )}
                      <div className="text-sm text-primary font-medium mt-1">
                        {location.count} {location.count === 1 ? 'Alumni' : 'Alumni'}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </svg>

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
        className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(350,70%,50%)]" />
          <span>1-4 Alumni</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[hsl(350,70%,50%)]" />
          <span>5-9 Alumni</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[hsl(350,70%,50%)]" />
          <span>10+ Alumni</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AlumniWorldMap;
