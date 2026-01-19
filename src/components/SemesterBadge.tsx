import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, Sparkles, Trophy, Star, Award, Rocket, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SemesterBadgeProps {
  userType: 'alumni' | 'scholar' | 'student';
  currentSemester?: number | null;
  passoutYear?: number | null;
  className?: string;
  showLabel?: boolean;
}

export const getSemesterConfig = (semester: number | null | undefined) => {
  switch (semester) {
    case 1:
      return { 
        icon: Rocket, 
        label: '1st Sem', 
        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
        description: 'Freshman'
      };
    case 2:
      return { 
        icon: BookOpen, 
        label: '2nd Sem', 
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
        description: 'Sophomore'
      };
    case 3:
      return { 
        icon: Sparkles, 
        label: '3rd Sem', 
        color: 'bg-violet-500/10 text-violet-600 border-violet-500/30',
        description: 'Rising'
      };
    case 4:
      return { 
        icon: Star, 
        label: '4th Sem', 
        color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
        description: 'Intermediate'
      };
    case 5:
      return { 
        icon: Award, 
        label: '5th Sem', 
        color: 'bg-pink-500/10 text-pink-600 border-pink-500/30',
        description: 'Pre-Senior'
      };
    case 6:
      return { 
        icon: Trophy, 
        label: '6th Sem', 
        color: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
        description: 'Junior'
      };
    case 7:
      return { 
        icon: Crown, 
        label: '7th Sem', 
        color: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
        description: 'Senior'
      };
    case 8:
      return { 
        icon: GraduationCap, 
        label: '8th Sem', 
        color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
        description: 'Final Year'
      };
    default:
      return { 
        icon: BookOpen, 
        label: 'Student', 
        color: 'bg-secondary text-secondary-foreground border-border',
        description: 'Current Student'
      };
  }
};

export const getAlumniConfig = () => ({
  icon: GraduationCap,
  label: 'Alumni',
  color: 'bg-primary/10 text-primary border-primary/30',
  description: 'Graduate'
});

export function SemesterBadge({ 
  userType, 
  currentSemester, 
  passoutYear,
  className,
  showLabel = true 
}: SemesterBadgeProps) {
  const isAlumni = userType === 'alumni';
  const config = isAlumni ? getAlumniConfig() : getSemesterConfig(currentSemester);
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'gap-1 font-medium border',
        config.color,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {showLabel && (
        <span>
          {isAlumni 
            ? passoutYear ? `Alumni '${String(passoutYear).slice(-2)}` : 'Alumni'
            : config.label
          }
        </span>
      )}
    </Badge>
  );
}
