import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type HighCommission = Tables<'high_commissions'>;

export const useHighCommissions = () => {
  const [highCommissions, setHighCommissions] = useState<HighCommission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighCommissions();
  }, []);

  const fetchHighCommissions = async () => {
    try {
      const { data, error } = await supabase
        .from('high_commissions')
        .select('*')
        .order('name');

      if (error) throw error;
      setHighCommissions(data || []);
    } catch (error) {
      console.error('Error fetching high commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  return { highCommissions, loading, refetch: fetchHighCommissions };
};
