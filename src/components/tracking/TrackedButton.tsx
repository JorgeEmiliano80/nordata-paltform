
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTracking } from './TrackingProvider';

interface TrackedButtonProps extends React.ComponentProps<typeof Button> {
  trackingId?: string;
  trackingText?: string;
}

export const TrackedButton: React.FC<TrackedButtonProps> = ({ 
  trackingId, 
  trackingText, 
  onClick, 
  children,
  ...props 
}) => {
  const { trackClick } = useTracking();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonText = trackingText || (typeof children === 'string' ? children : 'button');
    const elementId = trackingId || `button-${buttonText.toLowerCase().replace(/\s+/g, '-')}`;
    
    trackClick(elementId, buttonText);
    
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Button 
      {...props} 
      onClick={handleClick}
      onMouseEnter={() => {
        const buttonText = trackingText || (typeof children === 'string' ? children : 'button');
        const elementId = trackingId || `button-${buttonText.toLowerCase().replace(/\s+/g, '-')}`;
        useTracking().trackHover(elementId, 'enter');
      }}
    >
      {children}
    </Button>
  );
};
