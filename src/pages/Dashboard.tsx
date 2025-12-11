import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useProfile } from '@/hooks/useProfile';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, BookOpen, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Dashboard() {
  const { profile, loading } = useProfile();
  const { profiles } = useProfiles({ status: 'approved' });

  const alumniCount = profiles.filter(p => p.user_type === 'alumni').length;
  const studentCount = profiles.filter(p => (p.user_type as string) === 'student' || p.user_type === 'scholar').length;

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded"></div>)}
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-serif">Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}!</h1>
            <p className="text-muted-foreground">Your GTU Alumni Database Dashboard</p>
          </div>

          {!profile && (
            <Card className="mb-8 border-primary artistic-card">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Complete Your Profile</h3>
                    <p className="text-sm text-muted-foreground">Create your profile to connect with the community</p>
                  </div>
                  <Button asChild>
                    <Link to="/register">Create Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {profile && profile.status === 'pending' && (
            <Card className="mb-8 border-yellow-500 bg-yellow-500/5">
              <CardContent className="py-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold">Profile Pending Approval</h3>
                    <p className="text-sm text-muted-foreground">Your profile is being reviewed by an admin. You'll be notified once it's approved.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {profile && profile.status === 'rejected' && (
            <Alert variant="destructive" className="mb-8">
              <XCircle className="h-5 w-5" />
              <AlertTitle className="flex items-center gap-2">
                Profile Rejected
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-3">Your profile was not approved. Please review the feedback below and update your profile accordingly.</p>
                {profile.rejection_reason && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm mb-1">Admin Feedback:</p>
                        <p className="text-sm">{profile.rejection_reason}</p>
                      </div>
                    </div>
                  </div>
                )}
                <Button asChild className="mt-4" size="sm">
                  <Link to="/profile/edit">Edit Profile</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {profile && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {profile.photo_url ? (
                    <img src={profile.photo_url} alt={profile.full_name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{profile.full_name[0]}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{profile.full_name}</h3>
                    <Badge variant={profile.user_type === 'alumni' ? 'default' : 'secondary'}>
                      {profile.user_type === 'alumni' ? 'Alumni' : 'Current Student'}
                    </Badge>
                  </div>
                  <Button variant="outline" className="ml-auto" asChild>
                    <Link to="/profile/edit">Edit Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profiles.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Alumni</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alumniCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Current Students</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentCount}</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex gap-4">
            <Button asChild>
              <Link to="/directory">Browse Directory</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/analytics">View Analytics</Link>
            </Button>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
