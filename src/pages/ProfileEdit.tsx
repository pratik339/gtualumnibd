import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useColleges } from '@/hooks/useColleges';
import { useBranches } from '@/hooks/useBranches';
import { useHighCommissions } from '@/hooks/useHighCommissions';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, Save, ArrowLeft, XCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { linkedinUrlSchema, facebookUrlSchema, whatsappNumberSchema, emailSchema } from '@/lib/validation';

export default function ProfileEdit() {
  const { user } = useAuth();
  const { profile, loading: profileLoading, refetch } = useProfile();
  const { colleges } = useColleges();
  const { branches } = useBranches();
  const { highCommissions } = useHighCommissions();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    college_id: '',
    branch_id: '',
    passout_year: '',
    current_semester: '',
    expected_passout_year: '',
    enrollment_number: '',
    high_commission_id: '',
    scholarship_year: '',
    job_title: '',
    company: '',
    location_city: '',
    location_country: '',
    experience: '',
    achievements: '',
    linkedin_url: '',
    whatsapp_number: '',
    facebook_url: '',
    photo_url: '',
    email_visible: true,
    linkedin_visible: true,
    whatsapp_visible: true,
    facebook_visible: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        college_id: profile.college_id || '',
        branch_id: profile.branch_id || '',
        passout_year: profile.passout_year?.toString() || '',
        current_semester: profile.current_semester?.toString() || '',
        expected_passout_year: profile.expected_passout_year?.toString() || '',
        enrollment_number: profile.enrollment_number || '',
        high_commission_id: profile.high_commission_id || '',
        scholarship_year: profile.scholarship_year?.toString() || '',
        job_title: profile.job_title || '',
        company: profile.company || '',
        location_city: profile.location_city || '',
        location_country: profile.location_country || '',
        experience: profile.experience || '',
        achievements: profile.achievements || '',
        linkedin_url: profile.linkedin_url || '',
        whatsapp_number: profile.whatsapp_number || '',
        facebook_url: profile.facebook_url || '',
        photo_url: profile.photo_url || '',
        email_visible: profile.email_visible ?? true,
        linkedin_visible: profile.linkedin_visible ?? true,
        whatsapp_visible: profile.whatsapp_visible ?? true,
        facebook_visible: profile.facebook_visible ?? true,
      });
    }
  }, [profile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum 5MB allowed', variant: 'destructive' });
      return;
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a valid image file', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, photo_url: publicUrl }));
      toast({ title: 'Photo uploaded successfully' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Validate URLs before submission
    if (formData.linkedin_url) {
      const result = linkedinUrlSchema.safeParse(formData.linkedin_url);
      if (!result.success) {
        toast({ title: 'Invalid LinkedIn URL', description: 'Please enter a valid LinkedIn URL', variant: 'destructive' });
        return;
      }
    }

    if (formData.facebook_url) {
      const result = facebookUrlSchema.safeParse(formData.facebook_url);
      if (!result.success) {
        toast({ title: 'Invalid Facebook URL', description: 'Please enter a valid Facebook URL', variant: 'destructive' });
        return;
      }
    }

    if (formData.whatsapp_number) {
      const result = whatsappNumberSchema.safeParse(formData.whatsapp_number);
      if (!result.success) {
        toast({ title: 'Invalid WhatsApp Number', description: 'Please enter a valid phone number with country code', variant: 'destructive' });
        return;
      }
    }

    if (formData.email) {
      const result = emailSchema.safeParse(formData.email);
      if (!result.success) {
        toast({ title: 'Invalid Email', description: 'Please enter a valid email address', variant: 'destructive' });
        return;
      }
    }

    setSaving(true);
    try {
      const updateData = {
        full_name: formData.full_name,
        email: formData.email,
        college_id: formData.college_id || null,
        branch_id: formData.branch_id || null,
        passout_year: formData.passout_year ? parseInt(formData.passout_year) : null,
        current_semester: formData.current_semester ? parseInt(formData.current_semester) : null,
        expected_passout_year: formData.expected_passout_year ? parseInt(formData.expected_passout_year) : null,
        enrollment_number: formData.enrollment_number || null,
        high_commission_id: formData.high_commission_id || null,
        scholarship_year: formData.scholarship_year ? parseInt(formData.scholarship_year) : null,
        job_title: formData.job_title || null,
        company: formData.company || null,
        location_city: formData.location_city || null,
        location_country: formData.location_country || null,
        experience: formData.experience || null,
        achievements: formData.achievements || null,
        linkedin_url: formData.linkedin_url || null,
        whatsapp_number: formData.whatsapp_number || null,
        facebook_url: formData.facebook_url || null,
        photo_url: formData.photo_url || null,
        email_visible: formData.email_visible,
        linkedin_visible: formData.linkedin_visible,
        whatsapp_visible: formData.whatsapp_visible,
        facebook_visible: formData.facebook_visible,
        status: 'pending' as const, // Reset to pending for admin review
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      toast({ 
        title: 'Profile updated successfully', 
        description: 'Your changes are pending admin approval.' 
      });
      
      refetch();
      navigate('/dashboard');
    } catch (error) {
      console.error('Update error:', error);
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
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
            <h1 className="text-2xl font-bold mb-4">No Profile Found</h1>
            <p className="text-muted-foreground mb-4">Please complete your registration first.</p>
            <Link to="/register">
              <Button>Complete Registration</Button>
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const isAlumni = profile.user_type === 'alumni';
  const isStudent = profile.user_type === 'scholar' || profile.user_type === 'student';

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8 max-w-3xl">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          {profile.status === 'rejected' && (
            <Alert variant="destructive" className="mb-6">
              <XCircle className="h-5 w-5" />
              <AlertTitle>Profile Rejected</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Your profile was not approved. Please review the feedback below and make the necessary changes.</p>
                {profile.rejection_reason && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm mb-1">Admin Feedback:</p>
                        <p className="text-sm">{profile.rejection_reason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your profile information. Changes will require admin approval.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload */}
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.photo_url || undefined} />
                    <AvatarFallback>{formData.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Label htmlFor="photo-upload">
                      <Button type="button" variant="outline" disabled={uploading} asChild>
                        <span>
                          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                          {uploading ? 'Uploading...' : 'Change Photo'}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Education */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="college">College</Label>
                    <Select
                      value={formData.college_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, college_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select college" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {colleges.map((college) => (
                          <SelectItem key={college.id} value={college.id}>{college.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select
                      value={formData.branch_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, branch_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isStudent && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="enrollment_number">Enrollment Number</Label>
                        <Input
                          id="enrollment_number"
                          value={formData.enrollment_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, enrollment_number: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current_semester">Current Semester</Label>
                        <Input
                          id="current_semester"
                          type="number"
                          min="1"
                          max="8"
                          value={formData.current_semester}
                          onChange={(e) => setFormData(prev => ({ ...prev, current_semester: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expected_passout_year">Expected Graduation Year</Label>
                      <Input
                        id="expected_passout_year"
                        type="number"
                        min="2024"
                        max="2035"
                        value={formData.expected_passout_year}
                        onChange={(e) => setFormData(prev => ({ ...prev, expected_passout_year: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                {isAlumni && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="passout_year">Passout Year</Label>
                        <Input
                          id="passout_year"
                          type="number"
                          min="1960"
                          max="2024"
                          value={formData.passout_year}
                          onChange={(e) => setFormData(prev => ({ ...prev, passout_year: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job_title">Job Title</Label>
                        <Input
                          id="job_title"
                          value={formData.job_title}
                          onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location_city">City</Label>
                        <Input
                          id="location_city"
                          value={formData.location_city}
                          onChange={(e) => setFormData(prev => ({ ...prev, location_city: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location_country">Country</Label>
                      <Input
                        id="location_country"
                        value={formData.location_country}
                        onChange={(e) => setFormData(prev => ({ ...prev, location_country: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                        rows={4}
                      />
                    </div>
                  </>
                )}

                {/* Scholarship */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="high_commission">High Commission</Label>
                    <Select
                      value={formData.high_commission_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, high_commission_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select high commission" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {highCommissions.map((hc) => (
                          <SelectItem key={hc.id} value={hc.id}>{hc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scholarship_year">Scholarship Year</Label>
                    <Input
                      id="scholarship_year"
                      type="number"
                      min="1960"
                      max="2030"
                      value={formData.scholarship_year}
                      onChange={(e) => setFormData(prev => ({ ...prev, scholarship_year: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Achievements */}
                <div className="space-y-2">
                  <Label htmlFor="achievements">Achievements</Label>
                  <Textarea
                    id="achievements"
                    value={formData.achievements}
                    onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="font-medium">Contact Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                      <Input
                        id="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                      <Input
                        id="whatsapp_number"
                        value={formData.whatsapp_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook_url">Facebook URL</Label>
                    <Input
                      id="facebook_url"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Visibility Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium">Privacy Settings</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email_visible">Show Email</Label>
                      <Switch
                        id="email_visible"
                        checked={formData.email_visible}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_visible: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="linkedin_visible">Show LinkedIn</Label>
                      <Switch
                        id="linkedin_visible"
                        checked={formData.linkedin_visible}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, linkedin_visible: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="whatsapp_visible">Show WhatsApp</Label>
                      <Switch
                        id="whatsapp_visible"
                        checked={formData.whatsapp_visible}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, whatsapp_visible: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="facebook_visible">Show Facebook</Label>
                      <Switch
                        id="facebook_visible"
                        checked={formData.facebook_visible}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, facebook_visible: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
