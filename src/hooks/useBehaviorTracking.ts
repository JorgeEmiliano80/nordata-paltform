
import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/context/AuthContext';

export const useBehaviorTracking = () => {
  const { trackBehaviorEvent } = useAnalytics();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Track login event
      trackBehaviorEvent('login', {
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer
      });
    }
  }, [user]);

  const trackFileUpload = (fileId: string, fileName: string, fileSize: number) => {
    trackBehaviorEvent('file_upload', {
      file_name: fileName,
      file_size: fileSize,
      timestamp: new Date().toISOString()
    }, fileId);
  };

  const trackFileProcess = (fileId: string, status: string) => {
    trackBehaviorEvent('file_process', {
      status,
      timestamp: new Date().toISOString()
    }, fileId);
  };

  const trackChatMessage = (message: string, fileId?: string) => {
    trackBehaviorEvent('chat_message', {
      message_length: message.length,
      timestamp: new Date().toISOString()
    }, fileId);
  };

  const trackDashboardView = (dashboardType: string) => {
    trackBehaviorEvent('dashboard_view', {
      dashboard_type: dashboardType,
      timestamp: new Date().toISOString()
    });
  };

  const trackResultDownload = (fileId: string, resultType: string) => {
    trackBehaviorEvent('result_download', {
      result_type: resultType,
      timestamp: new Date().toISOString()
    }, fileId);
  };

  const trackFeatureUse = (featureName: string, context?: any) => {
    trackBehaviorEvent('feature_use', {
      feature_name: featureName,
      context,
      timestamp: new Date().toISOString()
    });
  };

  return {
    trackFileUpload,
    trackFileProcess,
    trackChatMessage,
    trackDashboardView,
    trackResultDownload,
    trackFeatureUse
  };
};
