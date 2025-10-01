import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Pledge } from '../types';

export function usePledges(userId?: string) {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPledges = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('pledges')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (fetchError) throw fetchError;
      setPledges(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createPledge = async (pledgeData: {
    unionId: string;
    candidateId?: string;
    isPublic: boolean;
    conditions?: any;
  }) => {
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('pledges')
      .insert({ ...pledgeData, userId })
      .select()
      .single();

    if (error) throw error;
    
    setPledges(prev => [data, ...prev]);
    return data;
  };

  const withdrawPledge = async (pledgeId: string) => {
    const { data, error } = await supabase
      .from('pledges')
      .update({ status: 'withdrawn' })
      .eq('id', pledgeId)
      .select()
      .single();

    if (error) throw error;
    
    setPledges(prev => prev.map(p => p.id === pledgeId ? data : p));
    return data;
  };

  useEffect(() => {
    fetchPledges();
  }, [userId]);

  return {
    pledges,
    loading,
    error,
    createPledge,
    withdrawPledge,
    refetch: fetchPledges,
  };
}
