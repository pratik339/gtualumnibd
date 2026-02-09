import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Clock, CheckCircle, XCircle, AlertTriangle, Sparkles, Download, Trash2, Eye, ShieldAlert, Newspaper } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ProfileWithRelations } from '@/hooks/useProfiles';
import * as XLSX from 'xlsx';
import { PostModeration } from '@/components/admin/PostModeration';

export default function Admin() {
  const { profiles: allProfiles, refetch } = useProfiles();
  const { profiles: pendingProfiles, refetch: refetchPending } = useProfiles({ status: 'pending' });
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectProfileId, setRejectProfileId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);
  const [deleteProfileName, setDeleteProfileName] = useState<string>('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewProfile, setViewProfile] = useState<ProfileWithRelations | null>(null);

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

  const openRejectDialog = (profileId: string) => {
    setRejectProfileId(profileId);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectProfileId) return;
    
    setLoadingId(rejectProfileId);
    const { error } = await supabase
      .from('profiles')
      .update({ 
        status: 'rejected',
        rejection_reason: rejectReason.trim() || null
      })
      .eq('id', rejectProfileId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ 
        title: 'Profile rejected', 
        description: rejectReason ? 'Feedback has been sent to the user.' : 'The profile has been rejected.' 
      });
      refetch();
      refetchPending();
    }
    setLoadingId(null);
    setRejectDialogOpen(false);
    setRejectProfileId(null);
    setRejectReason('');
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

  const openExportDialog = () => {
    setExportDialogOpen(true);
  };

  const handleExportToExcel = async () => {
    setExportDialogOpen(false);
    setExportLoading(true);
    try {
      // Fetch all profiles with relations for export
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          colleges:college_id(name, city),
          branches:branch_id(name, code),
          high_commissions:high_commission_id(name, country)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({ title: 'No data', description: 'No profiles found to export.' });
        setExportLoading(false);
        return;
      }

      // Transform data for Excel - respect visibility flags for sensitive data
      const excelData = data.map(profile => ({
        'Full Name': profile.full_name,
        'Email': profile.email_visible ? (profile.email || '') : '[Hidden by user]',
        'User Type': profile.user_type,
        'Status': profile.status,
        'College': profile.colleges?.name || '',
        'College City': profile.colleges?.city || '',
        'Branch': profile.branches?.name || '',
        'Branch Code': profile.branches?.code || '',
        'Passout Year': profile.passout_year || '',
        'Current Semester': profile.current_semester || '',
        'Expected Passout Year': profile.expected_passout_year || '',
        'Scholarship Year': profile.scholarship_year || '',
        'High Commission': profile.high_commissions?.name || '',
        'Country': profile.location_country || '',
        'City': profile.location_city || '',
        'Company': profile.company || '',
        'Job Title': profile.job_title || '',
        'LinkedIn': profile.linkedin_visible ? (profile.linkedin_url || '') : '[Hidden by user]',
        'WhatsApp': profile.whatsapp_visible ? (profile.whatsapp_number || '') : '[Hidden by user]',
        'Facebook': profile.facebook_visible ? (profile.facebook_url || '') : '[Hidden by user]',
        'Enrollment Number': profile.enrollment_number || '',
        'Achievements': profile.achievements || '',
        'Experience': profile.experience || '',
        'Created At': new Date(profile.created_at).toLocaleDateString(),
        'Updated At': new Date(profile.updated_at).toLocaleDateString(),
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-width columns
      const colWidths = Object.keys(excelData[0]).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'All Profiles');

      // Export
      const fileName = `GTU_Alumni_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({ title: 'Export successful', description: `${data.length} profiles exported to ${fileName}` });
    } catch (error: any) {
      toast({ title: 'Export failed', description: error.message, variant: 'destructive' });
    }
    setExportLoading(false);
  };

  const openDeleteDialog = (profileId: string, profileName: string) => {
    setDeleteProfileId(profileId);
    setDeleteProfileName(profileName);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (profile: ProfileWithRelations) => {
    setViewProfile(profile);
    setViewDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteProfileId) return;
    
    setLoadingId(deleteProfileId);
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', deleteProfileId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ 
        title: 'Profile deleted', 
        description: `${deleteProfileName}'s profile has been permanently deleted.` 
      });
      refetch();
      refetchPending();
    }
    setLoadingId(null);
    setDeleteDialogOpen(false);
    setDeleteProfileId(null);
    setDeleteProfileName('');
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="pending" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="posts" className="gap-2">
                  <Newspaper className="h-4 w-4" />
                  Posts
                </TabsTrigger>
              </TabsList>
              
              {/* Export Button */}
              <Button 
                onClick={openExportDialog} 
                disabled={exportLoading}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {exportLoading ? 'Exporting...' : 'Export to Excel'}
              </Button>
            </div>

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
                          <div 
                            className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                            onClick={() => openViewDialog(profile)}
                          >
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner flex-shrink-0">
                              {profile.photo_url ? (
                                <img src={profile.photo_url} className="w-14 h-14 rounded-xl object-cover" />
                              ) : (
                                <span className="font-bold text-primary text-lg">{profile.full_name[0]}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-lg hover:text-primary transition-colors">{profile.full_name}</h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="capitalize">
                                  {profile.user_type === 'alumni' ? 'Alumni' : 'Student'}
                                </Badge>
                                {profile.branches?.name && (
                                  <span className="text-sm text-muted-foreground">{profile.branches.name}</span>
                                )}
                                {profile.colleges?.name && (
                                  <span className="text-sm text-muted-foreground truncate">• {profile.colleges.name}</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Registered: {new Date(profile.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openViewDialog(profile)}
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" /> View
                            </Button>
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
                              onClick={() => openRejectDialog(profile.id)}
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
                        <div 
                          className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                          onClick={() => openViewDialog(profile)}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner flex-shrink-0">
                            {profile.photo_url ? (
                              <img src={profile.photo_url} className="w-12 h-12 rounded-xl object-cover" />
                            ) : (
                              <span className="font-bold text-primary">{profile.full_name[0]}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium hover:text-primary transition-colors">{profile.full_name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground capitalize">{profile.user_type}</span>
                              {profile.branches?.name && (
                                <span className="text-sm text-muted-foreground">• {profile.branches.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openViewDialog(profile)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => openDeleteDialog(profile.id, profile.full_name)}
                            disabled={loadingId === profile.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              <PostModeration />
            </TabsContent>
          </Tabs>

          {/* Reject Dialog */}
          <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Profile</DialogTitle>
                <DialogDescription>
                  Provide feedback to help the user understand why their profile is being rejected.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="e.g., Profile photo is missing, incomplete work experience details, etc."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={loadingId === rejectProfileId}
                >
                  {loadingId === rejectProfileId ? 'Rejecting...' : 'Reject Profile'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Profile</DialogTitle>
                <DialogDescription>
                  Are you sure you want to permanently delete <strong>{deleteProfileName}</strong>'s profile? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={loadingId === deleteProfileId}
                >
                  {loadingId === deleteProfileId ? 'Deleting...' : 'Delete Profile'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Export Warning Dialog */}
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  Export Sensitive Data
                </DialogTitle>
                <DialogDescription className="space-y-3 pt-2">
                  <p>
                    You are about to export user profile data. This export includes:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>User names, colleges, and branches</li>
                    <li>Contact information (respecting user privacy settings)</li>
                    <li>Enrollment numbers and profile details</li>
                  </ul>
                  <p className="font-medium text-amber-600 dark:text-amber-400">
                    ⚠️ This data is sensitive. Please handle it responsibly and do not share it with unauthorized parties.
                  </p>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleExportToExcel}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Proceed with Export
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Profile Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Profile Details</DialogTitle>
                <DialogDescription>
                  Complete profile information for verification
                </DialogDescription>
              </DialogHeader>
              {viewProfile && (
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20 border-2">
                        <AvatarImage src={viewProfile.photo_url || undefined} />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                          {viewProfile.full_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold">{viewProfile.full_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={viewProfile.user_type === 'alumni' ? 'default' : 'secondary'}>
                            {viewProfile.user_type === 'alumni' ? 'Admin' : 'Student'}
                          </Badge>
                          <Badge variant={
                            viewProfile.status === 'approved' ? 'default' : 
                            viewProfile.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {viewProfile.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Contact Info */}
                    <div>
                      <h4 className="font-semibold mb-3">Contact Information</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="font-medium">{viewProfile.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">WhatsApp:</span>
                          <p className="font-medium">{viewProfile.whatsapp_number || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">LinkedIn:</span>
                          <p className="font-medium break-all">{viewProfile.linkedin_url || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Facebook:</span>
                          <p className="font-medium break-all">{viewProfile.facebook_url || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Education */}
                    <div>
                      <h4 className="font-semibold mb-3">Education</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">College:</span>
                          <p className="font-medium">{viewProfile.colleges?.name || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Branch:</span>
                          <p className="font-medium">{viewProfile.branches?.name || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Enrollment Number:</span>
                          <p className="font-medium">{viewProfile.enrollment_number || 'Not provided'}</p>
                        </div>
                        {viewProfile.user_type === 'alumni' ? (
                          <div>
                            <span className="text-muted-foreground">Passout Year:</span>
                            <p className="font-medium">{viewProfile.passout_year || 'Not provided'}</p>
                          </div>
                        ) : (
                          <>
                            <div>
                              <span className="text-muted-foreground">Current Semester:</span>
                              <p className="font-medium">{viewProfile.current_semester || 'Not provided'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expected Passout:</span>
                              <p className="font-medium">{viewProfile.expected_passout_year || 'Not provided'}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Scholarship */}
                    {(viewProfile.high_commissions || viewProfile.scholarship_year) && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-3">Scholarship</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">High Commission:</span>
                              <p className="font-medium">{viewProfile.high_commissions?.name || 'Not provided'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Scholarship Year:</span>
                              <p className="font-medium">{viewProfile.scholarship_year || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Work (Alumni only) */}
                    {viewProfile.user_type === 'alumni' && (viewProfile.job_title || viewProfile.company || viewProfile.location_city) && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-3">Current Work</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Job Title:</span>
                              <p className="font-medium">{viewProfile.job_title || 'Not provided'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Company:</span>
                              <p className="font-medium">{viewProfile.company || 'Not provided'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">City:</span>
                              <p className="font-medium">{viewProfile.location_city || 'Not provided'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Country:</span>
                              <p className="font-medium">{viewProfile.location_country || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Experience & Achievements */}
                    {(viewProfile.experience || viewProfile.achievements || (viewProfile as any).projects) && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          {viewProfile.experience && (
                            <div>
                              <h4 className="font-semibold mb-2">Experience</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewProfile.experience}</p>
                            </div>
                          )}
                          {viewProfile.achievements && (
                            <div>
                              <h4 className="font-semibold mb-2">Achievements</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewProfile.achievements}</p>
                            </div>
                          )}
                          {(viewProfile as any).projects && (
                            <div>
                              <h4 className="font-semibold mb-2">Projects</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{(viewProfile as any).projects}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Metadata */}
                    <Separator />
                    <div className="text-xs text-muted-foreground">
                      <p>Created: {new Date(viewProfile.created_at).toLocaleString()}</p>
                      <p>Updated: {new Date(viewProfile.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                </ScrollArea>
              )}
              <DialogFooter>
                {viewProfile?.status === 'pending' && (
                  <>
                    <Button 
                      onClick={() => {
                        handleApprove(viewProfile.id);
                        setViewDialogOpen(false);
                      }}
                      disabled={loadingId === viewProfile?.id}
                      className="gap-1"
                    >
                      <CheckCircle className="h-4 w-4" /> Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        setViewDialogOpen(false);
                        openRejectDialog(viewProfile.id);
                      }}
                      className="gap-1"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
