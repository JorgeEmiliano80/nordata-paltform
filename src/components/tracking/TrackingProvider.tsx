
import React, { createContext, useContext, ReactNode } from 'react';
import { useVisualTracking } from '@/hooks/useVisualTracking';

interface TrackingContextType {
  trackClick: (elementId: string, elementText?: string) => void;
  trackTabChange: (tabName: string, previousTab?: string) => void;
  trackInputChange: (inputName: string, inputType?: string) => void;
  trackHover: (elementId: string, action: 'enter' | 'leave') => void;
  flushEvents: () => void;
}

const TrackingContext = createContext<TrackingContextType | null>(null);

interface TrackingProviderProps {
  children: ReactNode;
  module: string;
}

export const TrackingProvider: React.FC<TrackingProviderProps> = ({ 
  children, 
  module 
}) => {
  const tracking = useVisualTracking(module);

  return (
    <TrackingContext.Provider value={tracking}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};
