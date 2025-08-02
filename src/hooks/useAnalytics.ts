
import { useCustomerSegmentation } from './useCustomerSegmentation';
import { useSalesInsights } from './useSalesInsights';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Re-export types for backward compatibility
export type { ClientSegment } from './useCustomerSegmentation';
export type { FinancialMetric, ClientRecommendation } from './useSalesInsights';

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
  const [dataFlowMetrics, setDataFlowMetrics] = useState<DataFlowMetric[]>([]);
  const [behaviorEvents, setBehaviorEvents] = useState<BehaviorEvent[]>([]);

  // Use modular hooks
  const segmentation = useCustomerSegmentation();
  const salesInsights = useSalesInsights();

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
      const isAdmin = await checkIfAdmin();
      const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      let query = supabase
        .from('user_behavior_tracking')
        .select('*')
        .gte('created_at', startTime)
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (!isAdmin) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching behavior events:', error);
        toast.error('Error al cargar eventos de comportamiento');
        return;
      }

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
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error tracking behavior event:', error);
      }
    } catch (error) {
      console.error('Error tracking behavior event:', error);
    }
  };

  return {
    loading: loading || segmentation.loading || salesInsights.loading,
    // Customer Segmentation
    clientSegments: segmentation.clientSegments,
    fetchClientSegments: segmentation.fetchClientSegments,
    calculateSegmentation: segmentation.calculateSegmentation,
    // Sales Insights
    financialMetrics: salesInsights.financialMetrics,
    recommendations: salesInsights.recommendations,
    fetchFinancialMetrics: salesInsights.fetchFinancialMetrics,
    fetchRecommendations: salesInsights.fetchRecommendations,
    generateRecommendations: salesInsights.generateRecommendations,
    updateRecommendationStatus: salesInsights.updateRecommendationStatus,
    // Data Flow & Behavior
    dataFlowMetrics,
    behaviorEvents,
    fetchDataFlowMetrics,
    fetchBehaviorEvents,
    generateDataFlowMetrics,
    trackBehaviorEvent
  };
};
