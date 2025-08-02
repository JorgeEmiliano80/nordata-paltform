
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useTracking } from './TrackingProvider';

interface TrackedInputProps extends React.ComponentProps<typeof Input> {
  trackingId?: string;
  trackingName?: string;
}

export const TrackedInput: React.FC<TrackedInputProps> = ({ 
  trackingId, 
  trackingName, 
  onChange,
  placeholder,
  type = 'text',
  ...props 
}) => {
  const { trackInputChange } = useTracking();
  const [hasTrackedChange, setHasTrackedChange] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only track the first change to avoid spam
    if (!hasTrackedChange && event.target.value.length > 0) {
      const inputName = trackingName || trackingId || placeholder || 'input-field';
      trackInputChange(inputName, type);
      setHasTrackedChange(true);
    }

    if (onChange) {
      onChange(event);
    }
  };

  // Reset tracking when input is cleared
  React.useEffect(() => {
    if (props.value === '' || props.value === undefined) {
      setHasTrackedChange(false);
    }
  }, [props.value]);

  return (
    <Input 
      {...props}
      type={type}
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};
