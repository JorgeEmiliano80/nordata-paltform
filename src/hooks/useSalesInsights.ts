
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FinancialMetric {
  id: string;
  user_id: string;
  metric_date: string;
  revenue: number;
  costs: number;
  profit: number;
  mrr: number;
  ltv: number;
  cac: number;
  processing_cost: number;
  storage_cost: number;
  created_at: string;
  updated_at: string;
}

export interface ClientRecommendation {
  id: string;
  user_id: string;
  recommendation_type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action_items: string[];
  potential_impact: string;
  implementation_effort: string;
  is_implemented: boolean;
  created_at: string;
  expires_at: string;
  metadata: any;
  user_profile?: {
    full_name: string;
    company_name: string;
  };
}

export const useSalesInsights = () => {
  const [loading, setLoading] = useState(false);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric[]>([]);
  const [recommendations, setRecommendations] = useState<ClientRecommendation[]>([]);

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

  const fetchFinancialMetrics = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const isAdmin = await checkIfAdmin();
      
      let query = supabase
        .from('financial_metrics')
        .select('*')
        .order('metric_date', { ascending: false });

      if (!isAdmin) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        query = query.eq('user_id', user.id);
      }

      if (startDate) {
        query = query.gte('metric_date', startDate);
      }
      if (endDate) {
        query = query.lte('metric_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching financial metrics:', error);
        toast.error('Error al cargar métricas financieras');
        return;
      }

      setFinancialMetrics(data || []);
    } catch (error) {
      console.error('Error fetching financial metrics:', error);
      toast.error('Error al cargar métricas financieras');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const isAdmin = await checkIfAdmin();
      
      let query = supabase
        .from('client_recommendations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!isAdmin) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        query = query.eq('user_id', user.id);
      }

      const { data: recommendations, error: recommendationsError } = await query;

      if (recommendationsError) {
        console.error('Error fetching recommendations:', recommendationsError);
        toast.error('Error al cargar recomendaciones');
        return;
      }

      if (recommendations && recommendations.length > 0) {
        const userIds = recommendations.map(r => r.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, company_name')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        const recommendationsWithProfiles = recommendations.map(rec => ({
          ...rec,
          action_items: Array.isArray(rec.action_items) ? 
            rec.action_items.filter((item: any) => typeof item === 'string') : 
            typeof rec.action_items === 'string' ? [rec.action_items] : [],
          priority: rec.priority || 'medium',
          potential_impact: rec.potential_impact || '',
          implementation_effort: rec.implementation_effort || '',
          is_implemented: rec.is_implemented || false,
          expires_at: rec.expires_at || '',
          metadata: rec.metadata || {},
          user_profile: profiles?.find(p => p.user_id === rec.user_id)
        }));

        setRecommendations(recommendationsWithProfiles);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Error al cargar recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.rpc('generate_client_recommendations');

      if (error) {
        console.error('Error generating recommendations:', error);
        toast.error('Error al generar recomendaciones');
        return;
      }

      toast.success('Recomendaciones generadas exitosamente');
      await fetchRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Error al generar recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  const updateRecommendationStatus = async (recommendationId: string, isImplemented: boolean) => {
    try {
      const { error } = await supabase
        .from('client_recommendations')
        .update({ is_implemented: isImplemented })
        .eq('id', recommendationId);

      if (error) {
        console.error('Error updating recommendation:', error);
        toast.error('Error al actualizar recomendación');
        return;
      }

      toast.success('Recomendación actualizada');
      await fetchRecommendations();
    } catch (error) {
      console.error('Error updating recommendation:', error);
      toast.error('Error al actualizar recomendación');
    }
  };

  return {
    loading,
    financialMetrics,
    recommendations,
    fetchFinancialMetrics,
    fetchRecommendations,
    generateRecommendations,
    updateRecommendationStatus
  };
};
