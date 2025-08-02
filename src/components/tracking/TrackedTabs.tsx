
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTracking } from './TrackingProvider';

interface TrackedTabsProps extends React.ComponentProps<typeof Tabs> {
  trackingId?: string;
}

interface TrackedTabsTriggerProps extends React.ComponentProps<typeof TabsTrigger> {
  trackingName?: string;
}

export const TrackedTabs: React.FC<TrackedTabsProps> = ({ 
  trackingId,
  onValueChange,
  defaultValue,
  value,
  ...props 
}) => {
  const { trackTabChange } = useTracking();
  const [previousTab, setPreviousTab] = useState(defaultValue || value);

  const handleValueChange = (newValue: string) => {
    trackTabChange(newValue, previousTab);
    setPreviousTab(newValue);
    
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <Tabs 
      {...props}
      defaultValue={defaultValue}
      value={value}
      onValueChange={handleValueChange}
    />
  );
};

export const TrackedTabsTrigger: React.FC<TrackedTabsTriggerProps> = ({ 
  trackingName,
  children,
  value,
  ...props 
}) => {
  const { trackHover } = useTracking();

  const handleMouseEnter = () => {
    const tabName = trackingName || value || 'tab';
    trackHover(`tab-trigger-${tabName}`, 'enter');
  };

  return (
    <TabsTrigger 
      {...props}
      value={value}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </TabsTrigger>
  );
};

// Re-export other tabs components for convenience
export { TabsContent, TabsList } from '@/components/ui/tabs';
