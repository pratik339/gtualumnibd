import { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProfileWithRelations } from '@/hooks/useProfiles';
import { ProfilePreviewModal } from './ProfilePreviewModal';
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
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithRelations | null>(null);

  const handleProfileClick = useCallback((profile: ProfileWithRelations) => {
    setSelectedProfile(profile);
  }, []);

  const handlePreviewClose = useCallback((isOpen: boolean) => {
    if (!isOpen) setSelectedProfile(null);
  }, []);

  // Memoize profile items for performance
  const profileItems = useMemo(() => profiles.map((profile) => (
    <div
      key={profile.id}
      onClick={() => handleProfileClick(profile)}
      className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={profile.photo_url || undefined} alt={profile.full_name} />
        <AvatarFallback className="text-sm">
          {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate text-sm">{profile.full_name}</h4>
          <Badge variant="outline" className="shrink-0 text-xs px-1.5 py-0">
            {profile.user_type === 'alumni' ? (
              <><GraduationCap className="h-2.5 w-2.5 mr-0.5" /> Alumni</>
            ) : (
              <><BookOpen className="h-2.5 w-2.5 mr-0.5" /> Student</>
            )}
          </Badge>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
          {profile.branches?.name && (
            <span className="truncate">{profile.branches.name}</span>
          )}
          {(profile.passout_year || profile.expected_passout_year) && (
            <span>
              {profile.user_type === 'alumni' ? '' : 'Exp. '}
              {profile.passout_year || profile.expected_passout_year}
            </span>
          )}
          {(profile.location_city || profile.location_country) && (
            <span className="flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5" />
              {profile.location_country || profile.location_city}
            </span>
          )}
        </div>
      </div>
    </div>
  )), [profiles, handleProfileClick]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {title}
              <Badge variant="secondary" className="ml-2">
                {profiles.length} member{profiles.length !== 1 ? 's' : ''}
              </Badge>
            </DialogTitle>
            {subtitle && (
              <DialogDescription>{subtitle}</DialogDescription>
            )}
          </DialogHeader>
          
          <ScrollArea className="h-[55vh] pr-3">
            {profiles.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No members found
              </div>
            ) : (
              <div className="space-y-2">
                {profileItems}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <ProfilePreviewModal
        open={selectedProfile !== null}
        onOpenChange={handlePreviewClose}
        profile={selectedProfile}
      />
    </>
  );
}
