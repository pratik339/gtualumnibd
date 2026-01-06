import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { BranchSelector } from '@/components/BranchSelector';
import { CollegeSelector } from '@/components/CollegeSelector';
import { useHighCommissions } from '@/hooks/useHighCommissions';
import { Loader2, GraduationCap, BookOpen, Upload } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { linkedinUrlSchema, facebookUrlSchema, whatsappNumberSchema, emailSchema, validateImageFile } from '@/lib/validation';

type UserType = 'alumni' | 'student';

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { highCommissions } = useHighCommissions();

  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    college_id: '',
    branch_id: '',
    enrollment_number: '',
    passout_year: '',
    current_semester: '',
    expected_passout_year: '',
    scholarship_year: '',
    high_commission_id: '',
    achievements: '',
    experience: '',
    projects: '',
    job_title: '',
    company: '',
    location_city: '',
    location_country: '',
    linkedin_url: '',
    linkedin_visible: true,
    whatsapp_number: '',
    whatsapp_visible: true,
    facebook_url: '',
    facebook_visible: true,
    email: user?.email || '',
    email_visible: true,
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast({
          title: 'Invalid file',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !user) return null;

    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, photoFile);

    if (error) {
      console.error('Error uploading photo:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userType) return;

    if (!formData.full_name.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your full name.',
        variant: 'destructive',
      });
      return;
    }

    if (userType === 'student' && !formData.enrollment_number.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your GTU Enrollment Number.',
        variant: 'destructive',
      });
      return;
    }

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

    setLoading(true);

    try {
      let photoUrl = null;
      if (photoFile) {
        photoUrl = await uploadPhoto();
      }

      const profileData = {
        user_id: user.id,
        full_name: formData.full_name,
        photo_url: photoUrl,
        user_type: userType,
        college_id: formData.college_id || null,
        branch_id: formData.branch_id || null,
        enrollment_number: userType === 'student' ? formData.enrollment_number || null : null,
        passout_year: formData.passout_year ? parseInt(formData.passout_year) : null,
        current_semester: formData.current_semester ? parseInt(formData.current_semester) : null,
        expected_passout_year: formData.expected_passout_year ? parseInt(formData.expected_passout_year) : null,
        scholarship_year: formData.scholarship_year ? parseInt(formData.scholarship_year) : null,
        high_commission_id: formData.high_commission_id || null,
        achievements: formData.achievements || null,
        experience: formData.experience || null,
        projects: formData.projects || null,
        job_title: userType === 'alumni' ? formData.job_title || null : null,
        company: userType === 'alumni' ? formData.company || null : null,
        location_city: userType === 'alumni' ? formData.location_city || null : null,
        location_country: userType === 'alumni' ? formData.location_country || null : null,
        linkedin_url: formData.linkedin_url || null,
        linkedin_visible: formData.linkedin_visible,
        whatsapp_number: formData.whatsapp_number || null,
        whatsapp_visible: formData.whatsapp_visible,
        facebook_url: formData.facebook_url || null,
        facebook_visible: formData.facebook_visible,
        email: formData.email || null,
        email_visible: formData.email_visible,
      };

      const { error } = await supabase.from('profiles').insert(profileData);

      if (error) throw error;

      toast({
        title: 'Profile Created!',
        description: 'Your profile is pending approval. You will be notified once approved.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userType) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container py-12">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold text-center mb-8">Choose Your Profile Type</h1>
              <div className="grid md:grid-cols-2 gap-6">
                <Card
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setUserType('alumni')}
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Alumni</CardTitle>
                    <CardDescription>
                      I have completed my studies at GTU
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setUserType('student')}
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Current Student</CardTitle>
                    <CardDescription>
                      I am currently studying at GTU
                    </CardDescription>
                  </CardHeader>
                </Card>
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
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Complete Your Profile</h1>
                <p className="text-muted-foreground">
                  {userType === 'alumni' ? 'Alumni' : 'Current Student'} Registration
                </p>
              </div>
              <Button variant="ghost" onClick={() => setUserType(null)}>
                Change Type
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Photo Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="photo" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>Upload Photo</span>
                        </Button>
                      </Label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Max file size: 5MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <CollegeSelector
                    value={formData.college_id}
                    onChange={(value) => setFormData({ ...formData, college_id: value })}
                  />

                  <BranchSelector
                    value={formData.branch_id}
                    onChange={(value) => setFormData({ ...formData, branch_id: value })}
                  />

                  {userType === 'alumni' ? (
                    <div>
                      <Label htmlFor="passout_year">Passout Year</Label>
                      <Input
                        id="passout_year"
                        type="number"
                        min="1990"
                        max={new Date().getFullYear()}
                        value={formData.passout_year}
                        onChange={(e) => setFormData({ ...formData, passout_year: e.target.value })}
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="enrollment_number">GTU Enrollment Number *</Label>
                        <Input
                          id="enrollment_number"
                          placeholder="e.g., 200120107001"
                          value={formData.enrollment_number}
                          onChange={(e) => setFormData({ ...formData, enrollment_number: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="current_semester">Current Semester</Label>
                        <Input
                          id="current_semester"
                          type="number"
                          min="1"
                          max="8"
                          value={formData.current_semester}
                          onChange={(e) => setFormData({ ...formData, current_semester: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expected_passout_year">Expected Passout Year</Label>
                        <Input
                          id="expected_passout_year"
                          type="number"
                          min={new Date().getFullYear()}
                          max={new Date().getFullYear() + 6}
                          value={formData.expected_passout_year}
                          onChange={(e) => setFormData({ ...formData, expected_passout_year: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Scholarship Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Scholarship Information</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scholarship_year">Scholarship Year</Label>
                    <Input
                      id="scholarship_year"
                      type="number"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={formData.scholarship_year}
                      onChange={(e) => setFormData({ ...formData, scholarship_year: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>High Commission / Sponsor</Label>
                    <Select
                      value={formData.high_commission_id}
                      onValueChange={(value) => setFormData({ ...formData, high_commission_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sponsor" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {highCommissions.map((hc) => (
                          <SelectItem key={hc.id} value={hc.id}>
                            {hc.name} {hc.country && `(${hc.country})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Experience & Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Experience & Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="achievements">Academic Achievements</Label>
                    <Textarea
                      id="achievements"
                      placeholder="List your academic achievements, awards, etc."
                      value={formData.achievements}
                      onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience</Label>
                    <Textarea
                      id="experience"
                      placeholder="Work experience, internships, research..."
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="projects">Projects (If any)</Label>
                    <Textarea
                      id="projects"
                      placeholder="List your academic or personal projects, research work, etc."
                      value={formData.projects}
                      onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Current Status (Alumni only) */}
              {userType === 'alumni' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Current Status</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        value={formData.job_title}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location_city">City</Label>
                      <Input
                        id="location_city"
                        value={formData.location_city}
                        onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location_country">Country</Label>
                      <Input
                        id="location_country"
                        value={formData.location_country}
                        onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Toggle visibility for each contact option
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={formData.email_visible}
                        onCheckedChange={(checked) => setFormData({ ...formData, email_visible: checked })}
                      />
                      <Label className="text-sm">Visible</Label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                      <Input
                        id="linkedin_url"
                        placeholder="https://linkedin.com/in/..."
                        value={formData.linkedin_url}
                        onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={formData.linkedin_visible}
                        onCheckedChange={(checked) => setFormData({ ...formData, linkedin_visible: checked })}
                      />
                      <Label className="text-sm">Visible</Label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                      <Input
                        id="whatsapp_number"
                        placeholder="+91..."
                        value={formData.whatsapp_number}
                        onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={formData.whatsapp_visible}
                        onCheckedChange={(checked) => setFormData({ ...formData, whatsapp_visible: checked })}
                      />
                      <Label className="text-sm">Visible</Label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label htmlFor="facebook_url">Facebook URL</Label>
                      <Input
                        id="facebook_url"
                        placeholder="https://facebook.com/..."
                        value={formData.facebook_url}
                        onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        checked={formData.facebook_visible}
                        onCheckedChange={(checked) => setFormData({ ...formData, facebook_visible: checked })}
                      />
                      <Label className="text-sm">Visible</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit for Approval
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
