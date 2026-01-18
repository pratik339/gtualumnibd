import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProfileWithRelations } from '@/hooks/useProfiles';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, BookOpen, MapPin, Building2, Briefcase, 
  Mail, Linkedin, Phone, Facebook, Calendar, Award, ExternalLink 
} from 'lucide-react';
import { sanitizeExternalUrl, sanitizeWhatsAppNumber } from '@/lib/validation';

interface ProfilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileWithRelations | null;
}

export function ProfilePreviewModal({
  open,
  onOpenChange,
  profile,
}: ProfilePreviewModalProps) {
  const navigate = useNavigate();

  if (!profile) return null;

  const handleViewFullProfile = () => {
    onOpenChange(false);
    navigate(`/profile/${profile.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Profile Preview</DialogTitle>
          <DialogDescription className="sr-only">
            Preview of {profile.full_name}'s profile
          </DialogDescription>
        </DialogHeader>
        
        {/* Header */}
        <div className="flex items-start gap-4 pt-2">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src={profile.photo_url || undefined} alt={profile.full_name} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{profile.full_name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Badge variant={profile.user_type === 'alumni' ? 'default' : 'secondary'}>
                {profile.user_type === 'alumni' ? (
                  <><GraduationCap className="h-3 w-3 mr-1" /> Alumni</>
                ) : (
                  <><BookOpen className="h-3 w-3 mr-1" /> Student</>
                )}
              </Badge>
            </div>
            
            {profile.user_type === 'alumni' && (profile.job_title || profile.company) && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                <span className="truncate">{[profile.job_title, profile.company].filter(Boolean).join(' at ')}</span>
              </div>
            )}
            
            {(profile.location_city || profile.location_country) && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{[profile.location_city, profile.location_country].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="flex flex-wrap gap-2 mt-2">
          {profile.email_visible && profile.email && (
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${profile.email}`}>
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                Email
              </a>
            </Button>
          )}
          {profile.linkedin_visible && profile.linkedin_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={sanitizeExternalUrl(profile.linkedin_url)} target="_blank" rel="noopener noreferrer">
                <Linkedin className="mr-1.5 h-3.5 w-3.5" />
                LinkedIn
              </a>
            </Button>
          )}
          {profile.whatsapp_visible && profile.whatsapp_number && (
            <Button variant="outline" size="sm" asChild>
              <a href={`https://wa.me/${sanitizeWhatsAppNumber(profile.whatsapp_number)}`} target="_blank" rel="noopener noreferrer">
                <Phone className="mr-1.5 h-3.5 w-3.5" />
                WhatsApp
              </a>
            </Button>
          )}
          {profile.facebook_visible && profile.facebook_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={sanitizeExternalUrl(profile.facebook_url)} target="_blank" rel="noopener noreferrer">
                <Facebook className="mr-1.5 h-3.5 w-3.5" />
                Facebook
              </a>
            </Button>
          )}
        </div>

        <Separator className="my-3" />

        {/* Education Info */}
        <div className="space-y-3 text-sm">
          {profile.colleges && (
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{profile.colleges.name}</p>
                {profile.colleges.city && <p className="text-muted-foreground">{profile.colleges.city}</p>}
              </div>
            </div>
          )}
          
          {profile.branches && (
            <div className="flex items-start gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{profile.branches.name}</p>
                {profile.branches.code && <p className="text-muted-foreground">Code: {profile.branches.code}</p>}
              </div>
            </div>
          )}
          
          {(profile.passout_year || profile.expected_passout_year) && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {profile.user_type === 'alumni' ? 'Class of' : 'Expected'}{' '}
                {profile.passout_year || profile.expected_passout_year}
              </span>
            </div>
          )}
          
          {profile.high_commissions && (
            <div className="flex items-start gap-2">
              <Award className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{profile.high_commissions.name}</p>
                {profile.scholarship_year && <p className="text-muted-foreground">Awarded in {profile.scholarship_year}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Achievements Preview */}
        {profile.achievements && (
          <>
            <Separator className="my-3" />
            <div>
              <h4 className="font-medium mb-1.5">Achievements</h4>
              <p className="text-sm text-muted-foreground line-clamp-3">{profile.achievements}</p>
            </div>
          </>
        )}

        {/* View Full Profile Button */}
        <Button onClick={handleViewFullProfile} className="w-full mt-4">
          <ExternalLink className="mr-2 h-4 w-4" />
          View Full Profile
        </Button>
      </DialogContent>
    </Dialog>
  );
}
