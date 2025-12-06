import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Search, MapPin, Briefcase, Mail, Linkedin } from 'lucide-react';

export default function Directory() {
  const { profiles, loading } = useProfiles({ status: 'approved' });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
      profile.branches?.name?.toLowerCase().includes(search.toLowerCase()) ||
      profile.colleges?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || profile.user_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-2">Directory</h1>
          <p className="text-muted-foreground mb-8">Browse alumni and scholars</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, branch, or college..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
                <SelectItem value="scholar">Scholars</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            <div className="text-center py-12">
              <p className="text-muted-foreground">No profiles found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <Card key={profile.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profile.photo_url || undefined} />
                        <AvatarFallback>{profile.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{profile.full_name}</h3>
                        <Badge variant={profile.user_type === 'alumni' ? 'default' : 'secondary'} className="mt-1">
                          {profile.user_type === 'alumni' ? 'Alumni' : 'Scholar'}
                        </Badge>
                        {profile.branches?.name && (
                          <p className="text-sm text-muted-foreground mt-2">{profile.branches.name}</p>
                        )}
                        {profile.user_type === 'alumni' && profile.passout_year && (
                          <p className="text-sm text-muted-foreground">Class of {profile.passout_year}</p>
                        )}
                      </div>
                    </div>
                    
                    {profile.user_type === 'alumni' && (profile.job_title || profile.company) && (
                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{[profile.job_title, profile.company].filter(Boolean).join(' at ')}</span>
                      </div>
                    )}
                    
                    {profile.location_city && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{[profile.location_city, profile.location_country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      {profile.email_visible && profile.email && (
                        <a href={`mailto:${profile.email}`} className="text-primary hover:text-primary/80">
                          <Mail className="h-5 w-5" />
                        </a>
                      )}
                      {profile.linkedin_visible && profile.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
