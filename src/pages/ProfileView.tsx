import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Briefcase, Mail, Linkedin, Phone, Facebook, 
  GraduationCap, Building, Calendar, Award, ArrowLeft, Loader2, Shield, Pencil 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/ui/page-transition';
import { sanitizeExternalUrl, sanitizeWhatsAppNumber } from '@/lib/validation';
import { ConnectionButton } from '@/components/connections/ConnectionButton';
import type { ProfileWithRelations } from '@/hooks/useProfiles';

export default function ProfileView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileAdmin, setIsProfileAdmin] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      // Use secure view to respect privacy settings
      const { data, error } = await supabase
        .from('profiles_secure')
        .select(`
          *,
          colleges:college_id(id, name, city),
          branches:branch_id(id, name, code),
          high_commissions:high_commission_id(id, name, country, type)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data as ProfileWithRelations);
      
      // Check if this is the current user's own profile
      if (user && data?.user_id === user.id) {
        setIsOwnProfile(true);
      }

      // Check if profile user is an admin
      if (data?.user_id) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user_id)
          .eq('role', 'admin')
          .maybeSingle();
        setIsProfileAdmin(!!roleData);
      }
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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-8 w-8 text-primary" />
            </motion.div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <Layout>
          <PageTransition>
            <div className="container py-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
                <Link to="/directory">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Directory
                  </Button>
                </Link>
              </motion.div>
            </div>
          </PageTransition>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <PageTransition>
          <div className="container py-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <Link to="/directory">
                  <Button variant="ghost" className="hover:bg-primary/10">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Directory
                  </Button>
                </Link>
                {isOwnProfile ? (
                  <Link to="/profile/edit">
                    <Button variant="outline">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                ) : profile?.user_id ? (
                  <ConnectionButton userId={profile.user_id} />
                ) : null}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="overflow-hidden border-2">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    >
                      <Avatar className="h-32 w-32 border-4 border-background shadow-lg ring-4 ring-primary/20">
                        <AvatarImage src={profile.photo_url || undefined} />
                        <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                          {profile.full_name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <motion.div 
                      className="text-center sm:text-left"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                      <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                        {isProfileAdmin ? (
                          <Badge variant="default" className="bg-primary">
                            <Shield className="mr-1 h-3 w-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant={profile.user_type === 'alumni' ? 'default' : 'secondary'}>
                            {profile.user_type === 'alumni' ? 'Alumni' : profile.user_type === 'scholar' ? 'Scholar' : 'Student'}
                          </Badge>
                        )}
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
                    </motion.div>
                  </div>
                </div>

                <CardContent className="p-8">
                  {/* Contact Section */}
                  <motion.div 
                    className="flex flex-wrap gap-3 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    {profile.email_visible && profile.email && (
                      <motion.a href={`mailto:${profile.email}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm" className="transition-all hover:bg-primary hover:text-primary-foreground">
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </Button>
                      </motion.a>
                    )}
                    {profile.linkedin_visible && profile.linkedin_url && (
                      <motion.a 
                        href={sanitizeExternalUrl(profile.linkedin_url)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" size="sm" className="transition-all hover:bg-primary hover:text-primary-foreground">
                          <Linkedin className="mr-2 h-4 w-4" />
                          LinkedIn
                        </Button>
                      </motion.a>
                    )}
                    {profile.whatsapp_visible && profile.whatsapp_number && (
                      <motion.a 
                        href={`https://wa.me/${sanitizeWhatsAppNumber(profile.whatsapp_number)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" size="sm" className="transition-all hover:bg-primary hover:text-primary-foreground">
                          <Phone className="mr-2 h-4 w-4" />
                          WhatsApp
                        </Button>
                      </motion.a>
                    )}
                    {profile.facebook_visible && profile.facebook_url && (
                      <motion.a 
                        href={sanitizeExternalUrl(profile.facebook_url)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" size="sm" className="transition-all hover:bg-primary hover:text-primary-foreground">
                          <Facebook className="mr-2 h-4 w-4" />
                          Facebook
                        </Button>
                      </motion.a>
                    )}
                  </motion.div>

                  <Separator className="my-6" />

                  {/* Education & Work Section */}
                  <motion.div 
                    className="grid md:grid-cols-2 gap-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
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
                  </motion.div>

                  {/* Experience & Achievements & Projects */}
                  {(profile.experience || profile.achievements || (profile as any).projects) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
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
                        {(profile as any).projects && (
                          <div>
                            <h3 className="font-semibold text-lg mb-3">Projects (If any)</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{(profile as any).projects}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </PageTransition>
      </Layout>
    </ProtectedRoute>
  );
}
