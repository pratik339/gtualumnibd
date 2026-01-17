import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProfileWithRelations } from '@/hooks/useProfiles';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, MapPin, Building2 } from 'lucide-react';

interface AnalyticsDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  profiles: ProfileWithRelations[];
}

export function AnalyticsDetailModal({
  open,
  onOpenChange,
  title,
  subtitle,
  profiles,
}: AnalyticsDetailModalProps) {
  const navigate = useNavigate();

  const handleProfileClick = (userId: string) => {
    onOpenChange(false);
    navigate(`/profile/${userId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            <Badge variant="secondary" className="ml-2">
              {profiles.length} member{profiles.length !== 1 ? 's' : ''}
            </Badge>
          </DialogTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {profiles.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No members found
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => handleProfileClick(profile.user_id)}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.photo_url || undefined} alt={profile.full_name} />
                    <AvatarFallback>
                      {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{profile.full_name}</h4>
                      <Badge variant="outline" className="shrink-0">
                        {profile.user_type === 'alumni' ? (
                          <><GraduationCap className="h-3 w-3 mr-1" /> Alumni</>
                        ) : (
                          <><BookOpen className="h-3 w-3 mr-1" /> Student</>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                      {profile.branches?.name && (
                        <span className="truncate">{profile.branches.name}</span>
                      )}
                      {(profile.passout_year || profile.expected_passout_year) && (
                        <span>
                          {profile.user_type === 'alumni' ? 'Class of' : 'Expected'}{' '}
                          {profile.passout_year || profile.expected_passout_year}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      {profile.colleges?.name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {profile.colleges.name}
                        </span>
                      )}
                      {(profile.location_city || profile.location_country) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[profile.location_city, profile.location_country].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
