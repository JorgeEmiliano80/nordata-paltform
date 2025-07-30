
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdvancedCustomerSegment {
  id: string;
  user_id: string;
  customer_id: string;
  age_segment: string;
  location_segment: string;
  industry_segment: string;
  value_segment: string;
  activity_segment: string;
  created_at: string;
  updated_at: string;
  customer?: {
    name: string;
    email: string;
    age: number;
    location: string;
    industry: string;
    total_spent: number;
    total_orders: number;
  };
}

export interface SegmentationSummary {
  age_distribution: { [key: string]: number };
  location_distribution: { [key: string]: number };
  industry_distribution: { [key: string]: number };
  value_distribution: { [key: string]: number };
  activity_distribution: { [key: string]: number };
}

export const useAdvancedCustomerSegmentation = () => {
  const [segments, setSegments] = useState<AdvancedCustomerSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SegmentationSummary | null>(null);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuario no autenticado');
        return;
      }

      const { data: segmentsData, error: segmentsError } = await supabase
        .from('customer_segments_advanced')
        .select(`
          *,
          customer:customers(
            name,
            email,
            age,
            location,
            industry,
            total_spent,
            total_orders
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (segmentsError) {
        console.error('Error fetching segments:', segmentsError);
        toast.error('Error al cargar segmentación de clientes');
        return;
      }

      setSegments(segmentsData || []);
      calculateSummary(segmentsData || []);
    } catch (error) {
      console.error('Error fetching segments:', error);
      toast.error('Error al cargar segmentación de clientes');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (segmentsData: AdvancedCustomerSegment[]) => {
    const summary: SegmentationSummary = {
      age_distribution: {},
      location_distribution: {},
      industry_distribution: {},
      value_distribution: {},
      activity_distribution: {}
    };

    segmentsData.forEach(segment => {
      // Distribución por edad
      summary.age_distribution[segment.age_segment] = 
        (summary.age_distribution[segment.age_segment] || 0) + 1;
      
      // Distribución por ubicación
      summary.location_distribution[segment.location_segment] = 
        (summary.location_distribution[segment.location_segment] || 0) + 1;
      
      // Distribución por industria
      summary.industry_distribution[segment.industry_segment] = 
        (summary.industry_distribution[segment.industry_segment] || 0) + 1;
      
      // Distribución por valor
      summary.value_distribution[segment.value_segment] = 
        (summary.value_distribution[segment.value_segment] || 0) + 1;
      
      // Distribución por actividad
      summary.activity_distribution[segment.activity_segment] = 
        (summary.activity_distribution[segment.activity_segment] || 0) + 1;
    });

    setSummary(summary);
  };

  const calculateSegmentation = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuario no autenticado');
        return;
      }

      const { error } = await supabase.rpc('calculate_advanced_customer_segmentation', {
        target_user_id: user.id
      });

      if (error) {
        console.error('Error calculating segmentation:', error);
        toast.error('Error al calcular segmentación');
        return;
      }

      toast.success('Segmentación calculada exitosamente');
      await fetchSegments();
    } catch (error) {
      console.error('Error calculating segmentation:', error);
      toast.error('Error al calcular segmentación');
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerSegmentInfo = async (
    customerId: string, 
    updates: {
      location?: string;
      industry?: string;
      age_group?: string;
    }
  ) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', customerId);

      if (error) {
        console.error('Error updating customer:', error);
        toast.error('Error al actualizar información del cliente');
        return;
      }

      toast.success('Información del cliente actualizada');
      await calculateSegmentation();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Error al actualizar información del cliente');
    }
  };

  return {
    segments,
    summary,
    loading,
    fetchSegments,
    calculateSegmentation,
    updateCustomerSegmentInfo
  };
};
