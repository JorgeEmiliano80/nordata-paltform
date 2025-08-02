
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClientSegment {
  id: string;
  user_id: string;
  segment: 'vip' | 'premium' | 'regular' | 'new' | 'at_risk' | 'inactive';
  score: number;
  revenue_contribution: number;
  activity_level: number;
  risk_level: number;
  last_activity: string;
  segment_updated_at: string;
  criteria: any;
  created_at: string;
  updated_at: string;
  user_profile?: {
    full_name: string;
    company_name: string;
    role: string;
  };
}

export const useCustomerSegmentation = () => {
  const [loading, setLoading] = useState(false);
  const [clientSegments, setClientSegments] = useState<ClientSegment[]>([]);

  const checkIfAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    return profile?.role === 'admin';
  };

  const fetchClientSegments = async () => {
    try {
      setLoading(true);
      const isAdmin = await checkIfAdmin();
      
      let query = supabase.from('client_segments').select('*');
      
      if (!isAdmin) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        query = query.eq('user_id', user.id);
      }
      
      const { data: segments, error: segmentsError } = await query
        .order('segment_updated_at', { ascending: false });

      if (segmentsError) {
        console.error('Error fetching client segments:', segmentsError);
        toast.error('Error al cargar segmentación de clientes');
        return;
      }

      if (segments && segments.length > 0) {
        const userIds = segments.map(s => s.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, company_name, role')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        const segmentsWithProfiles = segments.map(segment => ({
          ...segment,
          user_profile: profiles?.find(p => p.user_id === segment.user_id)
        }));

        setClientSegments(segmentsWithProfiles);
      } else {
        setClientSegments([]);
      }
    } catch (error) {
      console.error('Error fetching client segments:', error);
      toast.error('Error al cargar segmentación de clientes');
    } finally {
      setLoading(false);
    }
  };

  const calculateSegmentation = async (userId?: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.rpc('calculate_client_segmentation', {
        target_user_id: userId || null
      });

      if (error) {
        console.error('Error calculating segmentation:', error);
        toast.error('Error al calcular segmentación');
        return;
      }

      toast.success('Segmentación calculada exitosamente');
      await fetchClientSegments();
    } catch (error) {
      console.error('Error calculating segmentation:', error);
      toast.error('Error al calcular segmentación');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    clientSegments,
    fetchClientSegments,
    calculateSegmentation
  };
};
