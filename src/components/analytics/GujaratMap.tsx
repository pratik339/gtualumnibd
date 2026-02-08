import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CityData {
  name: string;
  value: number;
}

interface GujaratMapProps {
  cityData: CityData[];
  onCityClick?: (city: string) => void;
}

// Gujarat city approximate positions on SVG (percentage-based)
const cityPositions: Record<string, { x: number; y: number }> = {
  'Ahmedabad': { x: 48, y: 48 },
  'Rajkot': { x: 28, y: 50 },
  'Surat': { x: 52, y: 72 },
  'Vadodara': { x: 55, y: 58 },
  'Gandhinagar': { x: 50, y: 44 },
  'Bhavnagar': { x: 38, y: 62 },
  'Jamnagar': { x: 18, y: 45 },
  'Junagadh': { x: 22, y: 62 },
  'Anand': { x: 53, y: 55 },
  'Mehsana': { x: 48, y: 36 },
  'Mehesana': { x: 48, y: 36 },
  'Bharuch': { x: 52, y: 66 },
  'Vapi': { x: 56, y: 82 },
  'Navsari': { x: 54, y: 76 },
  'Morbi': { x: 24, y: 42 },
  'Palanpur': { x: 48, y: 24 },
  'Kutch': { x: 14, y: 28 },
  'Porbandar': { x: 14, y: 58 },
  'Vasad': { x: 54, y: 54 },
  'Vallabh Vidyanagar': { x: 54, y: 55 },
  'Visnagar': { x: 46, y: 34 },
  'Patan': { x: 44, y: 30 },
  'Surendranagar': { x: 34, y: 46 },
  'Amreli': { x: 28, y: 64 },
  'Valsad': { x: 56, y: 80 },
  'Dahod': { x: 64, y: 48 },
  'Godhra': { x: 60, y: 50 },
  'Modasa': { x: 56, y: 38 },
  'Himatnagar': { x: 54, y: 34 },
  'Nadiad': { x: 52, y: 52 },
};

const getMarkerSize = (count: number, maxCount: number) => {
  const minSize = 8;
  const maxSize = 28;
  if (maxCount === 0) return minSize;
  return minSize + ((count / maxCount) * (maxSize - minSize));
};

const getPulseSize = (count: number, maxCount: number) => {
  const base = getMarkerSize(count, maxCount);
  return base + 12;
};

export const GujaratMap = ({ cityData, onCityClick }: GujaratMapProps) => {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const maxCount = Math.max(...cityData.map(c => c.value), 1);
  const totalStudents = cityData.reduce((sum, c) => sum + c.value, 0);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="relative w-full h-full flex flex-col">
        {/* Map Header Stats */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">{cityData.length} cities</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 text-primary" />
            <span className="text-xs font-semibold">{totalStudents} students</span>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 rounded-xl overflow-hidden border border-border/50 bg-gradient-to-br from-muted/30 via-background to-muted/20">
          {/* Background Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gujaratGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gujaratGrid)" />
          </svg>

          {/* Gujarat Outline SVG */}
          <svg
            viewBox="0 0 500 500"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="gujaratFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
                <stop offset="50%" stopColor="hsl(var(--chart-2))" stopOpacity="0.05" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
              </linearGradient>
              <linearGradient id="gujaratStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity="0.3" />
              </linearGradient>
              <filter id="mapGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Gujarat state outline - simplified but recognizable shape */}
            <motion.path
              d={`
                M 70,140 
                C 60,120 55,100 65,80
                L 80,60 Q 100,40 130,30
                L 170,20 Q 200,15 230,20
                L 260,30 Q 290,40 310,55
                L 330,75 Q 350,90 355,110
                L 345,140 Q 340,160 345,180
                L 355,210 Q 360,240 350,270
                L 330,300 Q 310,330 290,350
                L 265,375 Q 250,390 240,410
                L 280,425 Q 290,435 285,445
                L 260,440 Q 240,435 225,420
                L 210,400 Q 200,395 190,400
                L 170,415 Q 150,420 135,410
                L 120,395 Q 105,380 100,360
                L 95,330 Q 90,310 80,295
                L 60,275 Q 40,260 35,240
                L 40,215 Q 45,200 55,185
                L 70,170 Q 80,160 75,150
                Z
              `}
              fill="url(#gujaratFill)"
              stroke="url(#gujaratStroke)"
              strokeWidth="2"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {/* Kutch region */}
            <motion.path
              d={`
                M 70,140 
                Q 60,130 50,135
                L 30,145 Q 15,150 10,140
                L 15,120 Q 20,100 40,90
                L 55,85 Q 60,90 65,80
              `}
              fill="url(#gujaratFill)"
              stroke="url(#gujaratStroke)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            />

            {/* Saurashtra peninsula */}
            <motion.path
              d={`
                M 70,170
                Q 50,180 35,200
                L 25,220 Q 15,240 20,260
                L 30,275 Q 35,285 50,290
                L 65,300 Q 75,305 80,295
              `}
              fill="url(#gujaratFill)"
              stroke="url(#gujaratStroke)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            />

            {/* City markers */}
            {cityData.map((city, index) => {
              const pos = cityPositions[city.name];
              if (!pos) return null;

              const cx = (pos.x / 100) * 500;
              const cy = (pos.y / 100) * 500;
              const size = getMarkerSize(city.value, maxCount);
              const pulseSize = getPulseSize(city.value, maxCount);
              const isHovered = hoveredCity === city.name;

              return (
                <g key={city.name}>
                  {/* Glow effect */}
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={pulseSize}
                    fill="url(#markerGlow)"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: isHovered ? 0.8 : 0.4,
                      scale: isHovered ? 1.3 : 1,
                    }}
                    transition={{ delay: 1.2 + index * 0.15, duration: 0.5 }}
                  />

                  {/* Pulse ring */}
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={size + 4}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0.6, 0],
                      scale: [1, 1.8],
                    }}
                    transition={{
                      delay: 1.5 + index * 0.2,
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />

                  {/* Main marker */}
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={size}
                    fill="hsl(var(--primary))"
                    fillOpacity={isHovered ? 0.9 : 0.7}
                    stroke="hsl(var(--primary-foreground))"
                    strokeWidth={isHovered ? 3 : 2}
                    style={{ cursor: 'pointer', filter: isHovered ? 'url(#mapGlow)' : 'none' }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: isHovered ? 1.2 : 1,
                    }}
                    transition={{ delay: 1.2 + index * 0.15, type: "spring", stiffness: 200 }}
                    onMouseEnter={() => setHoveredCity(city.name)}
                    onMouseLeave={() => setHoveredCity(null)}
                    onClick={() => onCityClick?.(city.name)}
                  />

                  {/* Count label inside marker */}
                  {size >= 14 && (
                    <motion.text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="hsl(var(--primary-foreground))"
                      fontSize={Math.max(9, size * 0.6)}
                      fontWeight="bold"
                      style={{ pointerEvents: 'none' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 + index * 0.15 }}
                    >
                      {city.value}
                    </motion.text>
                  )}

                  {/* City name label */}
                  <motion.text
                    x={cx}
                    y={cy + size + 14}
                    textAnchor="middle"
                    fill="hsl(var(--foreground))"
                    fontSize="11"
                    fontWeight={isHovered ? '700' : '500'}
                    style={{ pointerEvents: 'none' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0.7 }}
                    transition={{ delay: 1.5 + index * 0.15 }}
                  >
                    {city.name}
                  </motion.text>
                </g>
              );
            })}

            {/* "Gujarat" label */}
            <motion.text
              x="180"
              y="475"
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
              fontSize="14"
              fontWeight="600"
              letterSpacing="4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 2 }}
            >
              GUJARAT
            </motion.text>
          </svg>

          {/* Hover tooltip overlay */}
          {hoveredCity && (() => {
            const city = cityData.find(c => c.name === hoveredCity);
            const pos = cityPositions[hoveredCity];
            if (!city || !pos) return null;
            return (
              <motion.div
                className="absolute pointer-events-none z-10 bg-popover border border-border rounded-lg px-3 py-2 shadow-lg"
                style={{
                  left: `${pos.x}%`,
                  top: `${Math.max(pos.y - 12, 5)}%`,
                  transform: 'translate(-50%, -100%)',
                }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-semibold">{city.name}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {city.value} {city.value === 1 ? 'student' : 'students'}
                  </span>
                </div>
              </motion.div>
            );
          })()}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary opacity-50" />
            <span>Fewer</span>
          </div>
          <div className="w-8 h-1.5 rounded-full bg-gradient-to-r from-primary/30 to-primary" />
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary opacity-90" />
            <span>More</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
