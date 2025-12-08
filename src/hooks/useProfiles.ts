import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileWithRelations {
  id: string;
  user_id: string;
  full_name: string;
  photo_url: string | null;
  user_type: 'alumni' | 'scholar' | 'student';
  status: 'pending' | 'approved' | 'rejected';
  college_id: string | null;
  branch_id: string | null;
  passout_year: number | null;
  current_semester: number | null;
  expected_passout_year: number | null;
  scholarship_year: number | null;
  high_commission_id: string | null;
  achievements: string | null;
  experience: string | null;
  job_title: string | null;
  company: string | null;
  location_city: string | null;
  location_country: string | null;
  linkedin_url: string | null;
  linkedin_visible: boolean | null;
  whatsapp_number: string | null;
  whatsapp_visible: boolean | null;
  facebook_url: string | null;
  facebook_visible: boolean | null;
  email: string | null;
  email_visible: boolean | null;
  created_at: string;
  updated_at: string;
  colleges: { name: string } | null;
  branches: { name: string; code: string | null } | null;
  high_commissions: { name: string; country: string | null } | null;
}

interface UseProfilesOptions {
  status?: 'pending' | 'approved' | 'rejected';
  userType?: 'alumni' | 'scholar';
}

export const useProfiles = (options: UseProfilesOptions = {}) => {
  const [profiles, setProfiles] = useState<ProfileWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, [options.status, options.userType]);

  const fetchProfiles = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          colleges(name),
          branches(name, code),
          high_commissions(name, country)
        `)
        .order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.userType) {
        query = query.eq('user_type', options.userType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProfiles((data as ProfileWithRelations[]) || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  return { profiles, loading, refetch: fetchProfiles };
};
