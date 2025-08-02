
import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useBehaviorTracking } from './useBehaviorTracking';

interface VisualEvent {
  eventType: 'click' | 'scroll' | 'tab_change' | 'hover' | 'input_change' | 'page_view';
  element: string;
  module: string;
  description: string;
  metadata: any;
  timestamp: number;
}

export const useVisualTracking = (module: string) => {
  const { trackBehaviorEvent } = useBehaviorTracking();
  const location = useLocation();
  const eventBuffer = useRef<VisualEvent[]>([]);
  const flushTimer = useRef<NodeJS.Timeout | null>(null);
  const lastScrollPosition = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Buffer configuration
  const BUFFER_SIZE = 10;
  const FLUSH_INTERVAL = 5000; // 5 seconds

  const flushEvents = useCallback(() => {
    if (eventBuffer.current.length === 0) return;

    const events = [...eventBuffer.current];
    eventBuffer.current = [];

    // Send events in batch
    events.forEach(event => {
      trackBehaviorEvent('feature_use', {
        action_type: 'interaction',
        module: event.module,
        event_type: event.eventType,
        element: event.element,
        description: event.description,
        metadata: event.metadata,
        timestamp: new Date(event.timestamp).toISOString()
      });
    });

    console.log(`Visual tracking: Flushed ${events.length} events for module ${module}`);
  }, [trackBehaviorEvent, module]);

  const addEvent = useCallback((event: Omit<VisualEvent, 'timestamp'>) => {
    const visualEvent: VisualEvent = {
      ...event,
      timestamp: Date.now()
    };

    eventBuffer.current.push(visualEvent);

    // Auto-flush if buffer is full
    if (eventBuffer.current.length >= BUFFER_SIZE) {
      flushEvents();
    }

    // Reset flush timer
    if (flushTimer.current) {
      clearTimeout(flushTimer.current);
    }
    flushTimer.current = setTimeout(flushEvents, FLUSH_INTERVAL);
  }, [flushEvents]);

  // Track clicks
  const trackClick = useCallback((elementId: string, elementText?: string) => {
    addEvent({
      eventType: 'click',
      element: elementId,
      module,
      description: `clicou no ${elementText ? `'${elementText}'` : `elemento '${elementId}'`}`,
      metadata: { elementId, elementText, path: location.pathname }
    });
  }, [addEvent, module, location.pathname]);

  // Track tab changes
  const trackTabChange = useCallback((tabName: string, previousTab?: string) => {
    addEvent({
      eventType: 'tab_change',
      element: `tab-${tabName}`,
      module,
      description: `mudou para a aba '${tabName}'${previousTab ? ` (anterior: ${previousTab})` : ''}`,
      metadata: { tabName, previousTab, path: location.pathname }
    });
  }, [addEvent, module, location.pathname]);

  // Track input changes
  const trackInputChange = useCallback((inputName: string, inputType: string = 'text') => {
    addEvent({
      eventType: 'input_change',
      element: inputName,
      module,
      description: `começou a escrever no campo '${inputName}'`,
      metadata: { inputName, inputType, path: location.pathname }
    });
  }, [addEvent, module, location.pathname]);

  // Track hover events
  const trackHover = useCallback((elementId: string, action: 'enter' | 'leave') => {
    if (action === 'enter') {
      addEvent({
        eventType: 'hover',
        element: elementId,
        module,
        description: `hover no elemento '${elementId}'`,
        metadata: { elementId, action, path: location.pathname }
      });
    }
  }, [addEvent, module, location.pathname]);

  // Track scroll events (debounced)
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

        // Only track significant scroll changes (every 10%)
        const significantChange = Math.abs(scrollPercentage - Math.round((lastScrollPosition.current / documentHeight) * 100)) >= 10;
        
        if (significantChange && documentHeight > 0) {
          addEvent({
            eventType: 'scroll',
            element: 'page',
            module,
            description: `scroll até ${scrollPercentage}% da página`,
            metadata: { 
              scrollPercentage, 
              scrollTop, 
              documentHeight,
              path: location.pathname 
            }
          });
          lastScrollPosition.current = scrollTop;
        }
      }, 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [addEvent, module, location.pathname]);

  // Track page views
  useEffect(() => {
    addEvent({
      eventType: 'page_view',
      element: 'page',
      module,
      description: `visitou a página '${location.pathname}'`,
      metadata: { 
        path: location.pathname,
        search: location.search,
        hash: location.hash
      }
    });
  }, [location.pathname, addEvent, module]);

  // Flush events on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushEvents();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (flushTimer.current) {
        clearTimeout(flushTimer.current);
      }
      flushEvents(); // Flush remaining events when component unmounts
    };
  }, [flushEvents]);

  return {
    trackClick,
    trackTabChange,
    trackInputChange,
    trackHover,
    flushEvents
  };
};
