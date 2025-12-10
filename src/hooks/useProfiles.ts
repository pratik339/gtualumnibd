import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProfileWithRelations {
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
  enrollment_number: string | null;
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
  colleges: { id: string; name: string; city: string | null } | null;
  branches: { id: string; name: string; code: string | null } | null;
  high_commissions: { id: string; name: string; country: string | null; type: string | null } | null;
}

interface UseProfilesOptions {
  status?: 'pending' | 'approved' | 'rejected';
  userType?: 'alumni' | 'scholar';
  useSecureView?: boolean;
}

export const useProfiles = (options: UseProfilesOptions = {}) => {
  const [profiles, setProfiles] = useState<ProfileWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, [options.status, options.userType, options.useSecureView]);

  const fetchProfiles = async () => {
    try {
      // Use secure view for public-facing queries to respect privacy settings
      const useSecure = options.useSecureView !== false;
      
      const buildQuery = () => {
        if (useSecure) {
          return supabase
            .from('profiles_secure')
            .select(`
              *,
              colleges:college_id(id, name, city),
              branches:branch_id(id, name, code),
              high_commissions:high_commission_id(id, name, country, type)
            `);
        } else {
          return supabase
            .from('profiles')
            .select(`
              *,
              colleges:college_id(id, name, city),
              branches:branch_id(id, name, code),
              high_commissions:high_commission_id(id, name, country, type)
            `);
        }
      };

      let query = buildQuery().order('created_at', { ascending: false });

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (options.userType) {
        query = query.eq('user_type', options.userType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProfiles((data as unknown as ProfileWithRelations[]) || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  return { profiles, loading, refetch: fetchProfiles };
};
