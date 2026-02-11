import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Download, GraduationCap, Building, MapPin, Briefcase, Calendar } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import type { ProfileWithRelations } from '@/hooks/useProfiles';
import gtuLogo from '@/assets/gtu-logo.png';

interface IdCardProps {
  profile: ProfileWithRelations;
}

function getSessionYears(profile: ProfileWithRelations): string | null {
  const isAlumni = profile.user_type === 'alumni';

  if (isAlumni && profile.passout_year) {
    const start = profile.passout_year - 4;
    return `${start}-${profile.passout_year}`;
  }

  if (!isAlumni) {
    if ((profile as any).joining_year && profile.expected_passout_year) {
      return `${(profile as any).joining_year}-${profile.expected_passout_year}`;
    }
    if (profile.expected_passout_year) {
      const start = profile.expected_passout_year - 4;
      return `${start}-${profile.expected_passout_year}`;
    }
    if (profile.scholarship_year) {
      return `${profile.scholarship_year}-${profile.scholarship_year + 4}`;
    }
  }

  return null;
}

export function IdCard({ profile }: IdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });
    const link = document.createElement('a');
    link.download = `${profile.full_name.replace(/\s+/g, '_')}_ID_Card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const isAlumni = profile.user_type === 'alumni';
  const isScholar = profile.user_type === 'scholar';
  const sessionYears = getSessionYears(profile);

  // Build profile URL for QR code
  const profileUrl = `https://gtualumnibd.lovable.app/profile/${profile.id}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">
          {isAlumni ? 'Alumni' : 'Student'} ID Card
        </h3>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Card
        </Button>
      </div>

      {/* The actual card */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          className="w-[420px] rounded-2xl overflow-hidden shadow-xl"
          style={{
            background: isAlumni
              ? 'linear-gradient(135deg, hsl(220 50% 20%), hsl(220 50% 30%))'
              : 'linear-gradient(135deg, hsl(350 70% 45%), hsl(350 70% 55%))',
          }}
        >
          {/* Top bar */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-3">
            <img
              src={gtuLogo}
              alt="GTU Logo"
              className="h-12 w-12 rounded-full bg-white p-1 object-contain"
              crossOrigin="anonymous"
            />
            <div className="text-white flex-1">
              <p className="text-[11px] font-medium opacity-80 uppercase tracking-wider">
                Gujarat Technological University
              </p>
              <p className="text-base font-bold leading-tight">
                {isAlumni ? 'Alumni Card' : isScholar ? 'Scholar Card' : 'Student Card'}
              </p>
            </div>
            {sessionYears && (
              <div
                className="text-white text-center px-2 py-1 rounded-md"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                <p className="text-[9px] uppercase tracking-wider opacity-70 leading-none mb-0.5">Session</p>
                <p className="text-sm font-bold leading-none">{sessionYears}</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-white/20" />

          {/* Body */}
          <div className="px-5 py-4 flex gap-4">
            {/* Photo */}
            <div className="shrink-0">
              <Avatar className="h-24 w-24 border-2 border-white/30 shadow-md">
                <AvatarImage src={profile.photo_url || undefined} />
                <AvatarFallback className="text-2xl bg-white/20 text-white">
                  {profile.full_name[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-white space-y-1.5">
              <p className="text-lg font-bold truncate leading-tight">{profile.full_name}</p>

              <Badge
                className="text-[10px] px-2 py-0.5"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                {isAlumni ? 'Alumni' : isScholar ? 'ICCR Scholar' : 'Student'}
              </Badge>

              {profile.enrollment_number && (
                <p className="text-xs opacity-80 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  EN: {profile.enrollment_number}
                </p>
              )}

              {profile.branches && (
                <p className="text-xs opacity-80 flex items-center gap-1.5 truncate">
                  <GraduationCap className="h-3 w-3 shrink-0" />
                  {profile.branches.name}
                </p>
              )}

              {profile.colleges && (
                <p className="text-xs opacity-80 flex items-center gap-1.5 truncate">
                  <Building className="h-3 w-3 shrink-0" />
                  {profile.colleges.name}
                </p>
              )}
            </div>

            {/* QR Code */}
            <div className="shrink-0 flex flex-col items-center justify-center">
              <div className="bg-white rounded-lg p-1.5">
                <QRCodeSVG
                  value={profileUrl}
                  size={72}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <p className="text-[8px] text-white/60 mt-1 text-center leading-tight">
                Scan for<br />full profile
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-5 py-3 flex items-center justify-between text-white text-[11px]"
            style={{ background: 'rgba(0,0,0,0.15)' }}
          >
            <div className="flex items-center gap-3">
              {isAlumni && profile.passout_year && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Class of {profile.passout_year}
                </span>
              )}
              {!isAlumni && profile.current_semester && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Semester {profile.current_semester}
                </span>
              )}
              {isAlumni && (profile.job_title || profile.company) && (
                <span className="flex items-center gap-1 truncate max-w-[180px]">
                  <Briefcase className="h-3 w-3 shrink-0" />
                  {[profile.job_title, profile.company].filter(Boolean).join(' @ ')}
                </span>
              )}
              {(profile.location_city || profile.location_country) && (
                <span className="flex items-center gap-1 truncate max-w-[140px]">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {[profile.location_city, profile.location_country].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
