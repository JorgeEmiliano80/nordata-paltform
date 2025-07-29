
import { useState, useEffect } from 'react';
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
}

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
}

export interface DataFlowMetric {
  id: string;
  timestamp: string;
  files_uploaded_count: number;
  files_processing_count: number;
  files_completed_count: number;
  files_failed_count: number;
  total_data_volume_mb: number;
  active_users_count: number;
  databricks_jobs_running: number;
  avg_processing_time_minutes: number;
  period_start: string;
  period_end: string;
}

export interface BehaviorEvent {
  id: string;
  user_id: string;
  event_type: 'login' | 'file_upload' | 'file_process' | 'chat_message' | 'dashboard_view' | 'result_download' | 'feature_use';
  event_data: any;
  session_id: string;
  ip_address: string;
  user_agent: string;
  file_id: string;
  duration_seconds: number;
  created_at: string;
}

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [clientSegments, setClientSegments] = useState<ClientSegment[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric[]>([]);
  const [recommendations, setRecommendations] = useState<ClientRecommendation[]>([]);
  const [dataFlowMetrics, setDataFlowMetrics] = useState<DataFlowMetric[]>([]);
  const [behaviorEvents, setBehaviorEvents] = useState<BehaviorEvent[]>([]);

  const fetchClientSegments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_segments')
        .select(`
          *,
          profiles!inner(full_name, company_name, role)
        `)
        .order('segment_updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching client segments:', error);
        toast.error('Error al cargar segmentación de clientes');
        return;
      }

      setClientSegments(data || []);
    } catch (error) {
      console.error('Error fetching client segments:', error);
      toast.error('Error al cargar segmentación de clientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialMetrics = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('financial_metrics')
        .select('*')
        .order('metric_date', { ascending: false });

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
      const { data, error } = await supabase
        .from('client_recommendations')
        .select(`
          *,
          profiles!inner(full_name, company_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recommendations:', error);
        toast.error('Error al cargar recomendaciones');
        return;
      }

      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        action_items: Array.isArray(item.action_items) ? 
          item.action_items.filter((item: any) => typeof item === 'string') : 
          typeof item.action_items === 'string' ? [item.action_items] : [],
        priority: item.priority || 'medium',
        potential_impact: item.potential_impact || '',
        implementation_effort: item.implementation_effort || '',
        is_implemented: item.is_implemented || false,
        expires_at: item.expires_at || '',
        metadata: item.metadata || {}
      }));

      setRecommendations(transformedData);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Error al cargar recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchDataFlowMetrics = async (hours: number = 24) => {
    try {
      setLoading(true);
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('data_flow_metrics')
        .select('*')
        .gte('timestamp', startTime)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching data flow metrics:', error);
        toast.error('Error al cargar métricas de flujo de datos');
        return;
      }

      setDataFlowMetrics(data || []);
    } catch (error) {
      console.error('Error fetching data flow metrics:', error);
      toast.error('Error al cargar métricas de flujo de datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchBehaviorEvents = async (days: number = 30) => {
    try {
      setLoading(true);
      const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('user_behavior_tracking')
        .select('*')
        .gte('created_at', startTime)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching behavior events:', error);
        toast.error('Error al cargar eventos de comportamiento');
        return;
      }

      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        ip_address: (item.ip_address || '127.0.0.1') as string,
        session_id: item.session_id || '',
        user_agent: item.user_agent || '',
        file_id: item.file_id || '',
        duration_seconds: item.duration_seconds || 0,
        event_data: item.event_data || {}
      }));

      setBehaviorEvents(transformedData);
    } catch (error) {
      console.error('Error fetching behavior events:', error);
      toast.error('Error al cargar eventos de comportamiento');
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

  const generateDataFlowMetrics = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.rpc('generate_data_flow_metrics');

      if (error) {
        console.error('Error generating data flow metrics:', error);
        toast.error('Error al generar métricas de flujo');
        return;
      }

      toast.success('Métricas de flujo generadas exitosamente');
      await fetchDataFlowMetrics();
    } catch (error) {
      console.error('Error generating data flow metrics:', error);
      toast.error('Error al generar métricas de flujo');
    } finally {
      setLoading(false);
    }
  };

  const trackBehaviorEvent = async (
    eventType: BehaviorEvent['event_type'],
    eventData: any = {},
    fileId?: string,
    sessionId?: string,
    duration?: number
  ) => {
    try {
      const { error } = await supabase
        .from('user_behavior_tracking')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          event_type: eventType,
          event_data: eventData,
          file_id: fileId,
          session_id: sessionId,
          duration_seconds: duration || 0,
          ip_address: '127.0.0.1', // Would be populated server-side in production
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error tracking behavior event:', error);
      }
    } catch (error) {
      console.error('Error tracking behavior event:', error);
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
    clientSegments,
    financialMetrics,
    recommendations,
    dataFlowMetrics,
    behaviorEvents,
    fetchClientSegments,
    fetchFinancialMetrics,
    fetchRecommendations,
    fetchDataFlowMetrics,
    fetchBehaviorEvents,
    calculateSegmentation,
    generateRecommendations,
    generateDataFlowMetrics,
    trackBehaviorEvent,
    updateRecommendationStatus
  };
};
