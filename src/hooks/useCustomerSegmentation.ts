
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from '@/lib/errorHandler';

export interface CustomerSegment {
  segment_id: string;
  user_id: string;
  segment_name: string;
  segment_description: string;
  segment_updated_at: string;
  profiles: {
    full_name: string;
    company_name: string;
  };
}

export interface AdvancedCustomerSegment {
  id: string;
  user_id: string;
  segment_name: string;
  segment_description: string;
  updated_at: string;
  customers: any[];
  profiles: {
    full_name: string;
    company_name: string;
  };
}

// Raw database segment interface for mapping
interface RawClientSegment {
  id: string;
  user_id: string;
  segment: string;
  activity_level: number;
  revenue_contribution: number;
  risk_level: number;
  score: number;
  segment_updated_at: string;
  profiles: {
    full_name: string;
    company_name: string;
  };
}

// Export alias for backward compatibility
export type ClientSegment = CustomerSegment;

export const useCustomerSegmentation = () => {
  const [loading, setLoading] = useState(false);
  const [clientSegments, setClientSegments] = useState<CustomerSegment[]>([]);

  // Helper function to map raw database data to CustomerSegment interface
  const mapRawSegmentToCustomerSegment = (rawSegment: RawClientSegment): CustomerSegment => {
    return {
      segment_id: rawSegment.id,
      user_id: rawSegment.user_id,
      segment_name: rawSegment.segment,
      segment_description: `Segmento ${rawSegment.segment} com score ${rawSegment.score}`,
      segment_updated_at: rawSegment.segment_updated_at,
      profiles: rawSegment.profiles
    };
  };

  const calculateSegmentation = async (userId?: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('calculate_client_segmentation', {
        target_user_id: userId || null
      });

      if (error) {
        errorHandler.handleError(error, {
          category: 'supabase',
          operation: 'calculate_segmentation',
          userId,
          technicalDetails: { function: 'calculate_client_segmentation' }
        });
        return { success: false };
      }

      errorHandler.showSuccess('Segmentação calculada com sucesso');
      return { success: true, data };
    } catch (error) {
      errorHandler.handleError(error, {
        category: 'unknown',
        operation: 'calculate_segmentation',
        userId
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const getSegmentationData = async (userId?: string) => {
    try {
      setLoading(true);

      const query = supabase
        .from('client_segments')
        .select(`
          *,
          profiles!inner(full_name, company_name)
        `);

      if (userId) {
        query.eq('user_id', userId);
      }

      const { data, error } = await query
        .order('segment_updated_at', { ascending: false });

      if (error) {
        errorHandler.handleError(error, {
          category: 'supabase',
          operation: 'fetch_segmentation_data',
          userId
        });
        return [];
      }

      // Map raw data to CustomerSegment interface
      const mappedData = (data || []).map(mapRawSegmentToCustomerSegment);
      return mappedData;
    } catch (error) {
      errorHandler.handleError(error, {
        category: 'unknown',
        operation: 'fetch_segmentation_data',
        userId
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getAdvancedSegmentation = async (userId?: string) => {
    try {
      setLoading(true);

      const query = supabase
        .from('customer_segments_advanced')
        .select(`
          *,
          customers!inner(*),
          profiles!inner(full_name, company_name)
        `);

      if (userId) {
        query.eq('user_id', userId);
      }

      const { data, error } = await query
        .order('updated_at', { ascending: false });

      if (error) {
        errorHandler.handleError(error, {
          category: 'supabase',
          operation: 'fetch_advanced_segmentation',
          userId
        });
        return [];
      }

      return data || [];
    } catch (error) {
      errorHandler.handleError(error, {
        category: 'unknown',
        operation: 'fetch_advanced_segmentation',
        userId
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchClientSegments = async (userId?: string) => {
    const data = await getSegmentationData(userId);
    setClientSegments(data);
    return data;
  };

  return {
    loading,
    clientSegments,
    calculateSegmentation,
    getSegmentationData,
    getAdvancedSegmentation,
    fetchClientSegments
  };
};
