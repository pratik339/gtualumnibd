import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function Admin() {
  const { profiles: allProfiles, refetch } = useProfiles();
  const { profiles: pendingProfiles } = useProfiles({ status: 'pending' });
  const { toast } = useToast();

  const approvedCount = allProfiles.filter(p => p.status === 'approved').length;
  const pendingCount = pendingProfiles.length;

  const handleApprove = async (profileId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'approved' })
      .eq('id', profileId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile approved!' });
      refetch();
    }
  };

  const handleReject = async (profileId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'rejected' })
      .eq('id', profileId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile rejected' });
      refetch();
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground mb-8">Manage users and platform settings</p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allProfiles.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="all">All Users</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {pendingProfiles.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground">No pending approvals</CardContent></Card>
              ) : (
                <div className="space-y-4">
                  {pendingProfiles.map((profile) => (
                    <Card key={profile.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              {profile.photo_url ? (
                                <img src={profile.photo_url} className="w-12 h-12 rounded-full object-cover" />
                              ) : (
                                <span className="font-bold text-primary">{profile.full_name[0]}</span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">{profile.full_name}</h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                  {profile.user_type === 'alumni' ? 'Alumni' : 'Student'}
                                </Badge>
                                {profile.branches?.name && <span className="text-sm text-muted-foreground">{profile.branches.name}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApprove(profile.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(profile.id)}>
                              <XCircle className="h-4 w-4 mr-1" /> Reject
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
                  <Card key={profile.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary text-sm">{profile.full_name[0]}</span>
                          </div>
                          <div>
                            <h3 className="font-medium">{profile.full_name}</h3>
                            <span className="text-sm text-muted-foreground">{profile.branches?.name}</span>
                          </div>
                        </div>
                        <Badge variant={profile.status === 'approved' ? 'default' : profile.status === 'pending' ? 'secondary' : 'destructive'}>
                          {profile.status}
                        </Badge>
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
