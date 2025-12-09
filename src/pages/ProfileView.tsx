import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Briefcase, Mail, Linkedin, Phone, Facebook, 
  GraduationCap, Building, Calendar, Award, ArrowLeft, Loader2 
} from 'lucide-react';
import type { ProfileWithRelations } from '@/hooks/useProfiles';

export default function ProfileView() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          colleges:college_id(id, name, city),
          branches:branch_id(id, name, code),
          high_commissions:high_commission_id(id, name, country, type)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfile(data as ProfileWithRelations);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <Link to="/directory">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Directory
              </Button>
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8 max-w-4xl">
          <Link to="/directory">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Directory
            </Button>
          </Link>

          <Card className="overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.photo_url || undefined} />
                  <AvatarFallback className="text-4xl">{profile.full_name[0]}</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                    <Badge variant={profile.user_type === 'alumni' ? 'default' : 'secondary'}>
                      {profile.user_type === 'alumni' ? 'Alumni' : profile.user_type === 'scholar' ? 'Scholar' : 'Student'}
                    </Badge>
                    <Badge variant="outline">{profile.status}</Badge>
                  </div>
                  
                  {profile.user_type === 'alumni' && (profile.job_title || profile.company) && (
                    <div className="flex items-center gap-2 mt-3 text-muted-foreground justify-center sm:justify-start">
                      <Briefcase className="h-4 w-4" />
                      <span>{[profile.job_title, profile.company].filter(Boolean).join(' at ')}</span>
                    </div>
                  )}
                  
                  {(profile.location_city || profile.location_country) && (
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground justify-center sm:justify-start">
                      <MapPin className="h-4 w-4" />
                      <span>{[profile.location_city, profile.location_country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <CardContent className="p-8">
              {/* Contact Section */}
              <div className="flex flex-wrap gap-3 mb-8">
                {profile.email_visible && profile.email && (
                  <a href={`mailto:${profile.email}`}>
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                  </a>
                )}
                {profile.linkedin_visible && profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </Button>
                  </a>
                )}
                {profile.whatsapp_visible && profile.whatsapp_number && (
                  <a href={`https://wa.me/${profile.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Phone className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                  </a>
                )}
                {profile.facebook_visible && profile.facebook_url && (
                  <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Facebook className="mr-2 h-4 w-4" />
                      Facebook
                    </Button>
                  </a>
                )}
              </div>

              <Separator className="my-6" />

              {/* Education & Work Section */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Education
                  </h3>
                  <div className="space-y-3">
                    {profile.colleges && (
                      <div className="flex items-start gap-3">
                        <Building className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">{profile.colleges.name}</p>
                          {profile.colleges.city && (
                            <p className="text-sm text-muted-foreground">{profile.colleges.city}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {profile.branches && (
                      <div className="flex items-start gap-3">
                        <GraduationCap className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">{profile.branches.name}</p>
                          {profile.branches.code && (
                            <p className="text-sm text-muted-foreground">Code: {profile.branches.code}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {profile.enrollment_number && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">Enrollment: {profile.enrollment_number}</p>
                      </div>
                    )}
                    {profile.passout_year && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">Class of {profile.passout_year}</p>
                      </div>
                    )}
                    {profile.user_type !== 'alumni' && profile.current_semester && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">Semester {profile.current_semester}</p>
                      </div>
                    )}
                    {profile.user_type !== 'alumni' && profile.expected_passout_year && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">Expected Graduation: {profile.expected_passout_year}</p>
                      </div>
                    )}
                  </div>
                </div>

                {profile.high_commissions && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Scholarship
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Award className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">{profile.high_commissions.name}</p>
                          {profile.high_commissions.country && (
                            <p className="text-sm text-muted-foreground">{profile.high_commissions.country}</p>
                          )}
                        </div>
                      </div>
                      {profile.scholarship_year && (
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">Awarded in {profile.scholarship_year}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Experience & Achievements */}
              {(profile.experience || profile.achievements) && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-6">
                    {profile.experience && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Experience</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{profile.experience}</p>
                      </div>
                    )}
                    {profile.achievements && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Achievements</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{profile.achievements}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
