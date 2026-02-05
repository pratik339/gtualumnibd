import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, MapPin, Briefcase, Mail, Linkedin, Shield, X, Building2, Calendar, BookOpen, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition, staggerContainer, fadeInUp } from '@/components/ui/page-transition';
import { sanitizeExternalUrl } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { SemesterBadge } from '@/components/SemesterBadge';

export default function Directory() {
  const { profiles, loading } = useProfiles({ status: 'approved', useSecureView: true });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());

  // Debounce search for performance
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 150);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch admin user IDs
  useEffect(() => {
    const fetchAdminIds = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      if (data) {
        setAdminUserIds(new Set(data.map(r => r.user_id)));
      }
    };
    fetchAdminIds();
  }, []);

  // Pre-compute searchable text for each profile (memoized)
  const profilesWithSearchText = useMemo(() => {
    return profiles.map(profile => {
      // Combine all searchable fields into one lowercase string
      const searchableText = [
        profile.full_name,
        profile.branches?.name,
        profile.branches?.code,
        profile.colleges?.name,
        profile.colleges?.city,
        profile.high_commissions?.name,
        profile.high_commissions?.country,
        profile.achievements,
        profile.experience,
        profile.projects,
        profile.company,
        profile.job_title,
        profile.location_city,
        profile.location_country,
        profile.enrollment_number,
        profile.passout_year?.toString(),
        profile.expected_passout_year?.toString(),
        profile.scholarship_year?.toString(),
        profile.user_type,
      ].filter(Boolean).join(' ').toLowerCase();
      
      return { ...profile, _searchText: searchableText };
    });
  }, [profiles]);

  // Super efficient filtering with multi-word support
  const filteredProfiles = useMemo(() => {
    const searchTerms = debouncedSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
    
    return profilesWithSearchText.filter(profile => {
      // Multi-word search: ALL terms must match
      const matchesSearch = searchTerms.length === 0 || 
        searchTerms.every(term => profile._searchText.includes(term));
      
      const matchesType = typeFilter === 'all' || 
        profile.user_type === typeFilter || 
        (typeFilter === 'student' && (profile.user_type as string) === 'scholar');
      
      return matchesSearch && matchesType;
    });
  }, [profilesWithSearchText, debouncedSearch, typeFilter]);

  const clearSearch = useCallback(() => setSearch(''), []);

  return (
    <ProtectedRoute>
      <Layout>
        <PageTransition>
          <div className="container py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold mb-2">Directory</h1>
              <p className="text-muted-foreground mb-8">Browse alumni and students</p>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search anything: name, skills, projects, company, city, year..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-10"
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Results count */}
            {!loading && debouncedSearch && (
              <motion.p 
                className="text-sm text-muted-foreground mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Found {filteredProfiles.length} result{filteredProfiles.length !== 1 ? 's' : ''} for "{debouncedSearch}"
              </motion.p>
            )}

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProfiles.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-muted-foreground">No profiles found</p>
              </motion.div>
            ) : (
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filteredProfiles.map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    variants={fadeInUp}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link to={`/profile/${profile.id}`}>
                      <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full border-2 hover:border-primary/20">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 ring-2 ring-primary/10">
                              <AvatarImage src={profile.photo_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {profile.full_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{profile.full_name}</h3>
                              {adminUserIds.has(profile.user_id!) ? (
                                <Badge variant="default" className="mt-1 bg-primary">
                                  <Shield className="mr-1 h-3 w-3" />
                                  Admin
                                </Badge>
                              ) : (
                                <SemesterBadge 
                                  userType={profile.user_type as 'alumni' | 'scholar' | 'student'}
                                  currentSemester={profile.current_semester}
                                  passoutYear={profile.passout_year}
                                  className="mt-1"
                                />
                              )}
                            </div>
                          </div>
                          
                          {/* Details section - same layout for all user types */}
                          <div className="mt-4 space-y-2">
                            {/* Branch info */}
                            {profile.branches?.name && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <BookOpen className="h-4 w-4 shrink-0 text-primary/60" />
                                <span className="truncate">{profile.branches.name}</span>
                                {profile.branches.code && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                                    {profile.branches.code}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {/* College info */}
                            {profile.colleges?.name && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-4 w-4 shrink-0 text-primary/60" />
                                <span className="truncate">{profile.colleges.name}</span>
                              </div>
                            )}
                            
                            {/* Job/Role info - for alumni */}
                            {profile.user_type === 'alumni' && (profile.job_title || profile.company) && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Briefcase className="h-4 w-4 shrink-0 text-primary/60" />
                                <span className="truncate">{[profile.job_title, profile.company].filter(Boolean).join(' at ')}</span>
                              </div>
                            )}
                            
                            {/* Year info */}
                            {(profile.passout_year || profile.expected_passout_year || profile.current_semester) && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 shrink-0 text-primary/60" />
                                <span>
                                  {profile.user_type === 'alumni' 
                                    ? `Class of ${profile.passout_year}`
                                    : profile.current_semester 
                                      ? `Semester ${profile.current_semester}${profile.expected_passout_year ? ` • Expected ${profile.expected_passout_year}` : ''}`
                                      : profile.expected_passout_year 
                                        ? `Expected ${profile.expected_passout_year}`
                                        : ''
                                  }
                                </span>
                              </div>
                            )}
                            
                            {/* Location */}
                            {(profile.location_city || profile.location_country) && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
                                <span className="truncate">{[profile.location_city, profile.location_country].filter(Boolean).join(', ')}</span>
                              </div>
                            )}
                            
                            {/* Achievements preview for students */}
                            {(profile.user_type === 'scholar' || profile.user_type === 'student') && profile.achievements && (
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Award className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                                <span className="line-clamp-1">{profile.achievements}</span>
                              </div>
                            )}
                            </div>

                          <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                            {profile.email_visible && profile.email && (
                              <motion.a 
                                href={`mailto:${profile.email}`} 
                                className="text-primary hover:text-primary/80"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Mail className="h-5 w-5" />
                              </motion.a>
                            )}
                            {profile.linkedin_visible && profile.linkedin_url && (
                              <motion.a 
                                href={sanitizeExternalUrl(profile.linkedin_url)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-primary hover:text-primary/80"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Linkedin className="h-5 w-5" />
                              </motion.a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </PageTransition>
      </Layout>
    </ProtectedRoute>
  );
}
