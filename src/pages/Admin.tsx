import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Clock, CheckCircle, XCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Admin() {
  const { profiles: allProfiles, refetch } = useProfiles();
  const { profiles: pendingProfiles, refetch: refetchPending } = useProfiles({ status: 'pending' });
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const approvedCount = allProfiles.filter(p => p.status === 'approved').length;
  const rejectedCount = allProfiles.filter(p => p.status === 'rejected').length;
  const pendingCount = pendingProfiles.length;

  const handleApprove = async (profileId: string) => {
    setLoadingId(profileId);
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'approved' })
      .eq('id', profileId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile approved!', description: 'The user can now access the platform.' });
      refetch();
      refetchPending();
    }
    setLoadingId(null);
  };

  const handleReject = async (profileId: string) => {
    setLoadingId(profileId);
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'rejected' })
      .eq('id', profileId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile rejected', description: 'The profile has been rejected.' });
      refetch();
      refetchPending();
    }
    setLoadingId(null);
  };

  const handleApproveAll = async () => {
    if (pendingProfiles.length === 0) {
      toast({ title: 'No pending profiles', description: 'There are no profiles to approve.' });
      return;
    }
    
    setBulkLoading(true);
    const pendingIds = pendingProfiles.map(p => p.id);
    
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'approved' })
      .in('id', pendingIds);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ 
        title: 'All profiles approved!', 
        description: `${pendingIds.length} profiles have been approved.` 
      });
      refetch();
      refetchPending();
    }
    setBulkLoading(false);
  };

  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground mb-8">Manage users and platform settings</p>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{allProfiles.length}</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all border-yellow-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all border-red-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="all">All Users</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingProfiles.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No pending profiles to review</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Approve All Button */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Bulk Action</h3>
                          <p className="text-sm text-muted-foreground">
                            Approve all {pendingCount} pending profiles at once
                          </p>
                        </div>
                        <Button 
                          onClick={handleApproveAll} 
                          disabled={bulkLoading}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {bulkLoading ? 'Approving...' : 'Approve All'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {pendingProfiles.map((profile) => (
                    <Card key={profile.id} className="hover:shadow-md transition-all">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner">
                              {profile.photo_url ? (
                                <img src={profile.photo_url} className="w-14 h-14 rounded-xl object-cover" />
                              ) : (
                                <span className="font-bold text-primary text-lg">{profile.full_name[0]}</span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="capitalize">
                                  {profile.user_type === 'alumni' ? 'Alumni' : 'Student'}
                                </Badge>
                                {profile.branches?.name && (
                                  <span className="text-sm text-muted-foreground">{profile.branches.name}</span>
                                )}
                                {profile.colleges?.name && (
                                  <span className="text-sm text-muted-foreground">• {profile.colleges.name}</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Registered: {new Date(profile.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApprove(profile.id)}
                              disabled={loadingId === profile.id}
                              className="gap-1"
                            >
                              <CheckCircle className="h-4 w-4" /> 
                              {loadingId === profile.id ? 'Loading...' : 'Approve'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleReject(profile.id)}
                              disabled={loadingId === profile.id}
                              className="gap-1"
                            >
                              <XCircle className="h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {allProfiles.map((profile) => (
                  <Card key={profile.id} className="hover:shadow-md transition-all">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner">
                            {profile.photo_url ? (
                              <img src={profile.photo_url} className="w-12 h-12 rounded-xl object-cover" />
                            ) : (
                              <span className="font-bold text-primary">{profile.full_name[0]}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{profile.full_name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground capitalize">{profile.user_type}</span>
                              {profile.branches?.name && (
                                <span className="text-sm text-muted-foreground">• {profile.branches.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              profile.status === 'approved' ? 'default' : 
                              profile.status === 'pending' ? 'secondary' : 'destructive'
                            }
                            className="capitalize"
                          >
                            {profile.status}
                          </Badge>
                          {profile.status === 'pending' && (
                            <Button size="sm" onClick={() => handleApprove(profile.id)} disabled={loadingId === profile.id}>
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
