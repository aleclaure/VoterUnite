import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Union } from '../types';

interface UseUnionsParams {
  category?: string;
  scope?: string;
  search?: string;
}

export function useUnions({ category, scope, search }: UseUnionsParams = {}) {
  const [unions, setUnions] = useState<Union[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUnions = async () => {
    try {
      setLoading(true);
      let query = supabase.from('unions').select('*');

      if (category) {
        query = query.eq('category', category);
      }
      if (scope) {
        query = query.eq('scope', scope);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error: fetchError } = await query.order('memberCount', { ascending: false });

      if (fetchError) throw fetchError;
      setUnions(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnions();
  }, [category, scope, search]);

  return {
    unions,
    loading,
    error,
    refetch: fetchUnions,
  };
}
