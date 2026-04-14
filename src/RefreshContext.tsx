import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface RefreshEvent {
  timestamp: number;
  source?: string;
  entity?: string;
  action?: 'created' | 'updated' | 'deleted';
  recordId?: number | string;
  fields?: string[];
  message?: string;
}

export type RefreshEventInput = Omit<RefreshEvent, 'timestamp'>;

interface RefreshContextType {
  triggerRefresh: (event?: RefreshEventInput) => void;
  refreshFlag: number;
  lastRefreshEvent: RefreshEvent | null;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

const REFRESH_EVENT_STORAGE_KEY = 'sdapp:last-refresh-event';

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [lastRefreshEvent, setLastRefreshEvent] = useState<RefreshEvent | null>(null);

  const triggerRefresh = useCallback((event?: RefreshEventInput) => {
    const nextEvent: RefreshEvent = {
      timestamp: Date.now(),
      ...event,
    };

    setLastRefreshEvent(nextEvent);
    setRefreshFlag(f => f + 1);

    try {
      window.localStorage.setItem(REFRESH_EVENT_STORAGE_KEY, JSON.stringify(nextEvent));
    } catch (error) {
      console.error('Unable to persist refresh event', error);
    }
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== REFRESH_EVENT_STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        const nextEvent = JSON.parse(event.newValue) as RefreshEvent;
        setLastRefreshEvent(nextEvent);
        setRefreshFlag(f => f + 1);
      } catch (error) {
        console.error('Unable to read refresh event', error);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <RefreshContext.Provider value={{ triggerRefresh, refreshFlag, lastRefreshEvent }}>
      {children}
    </RefreshContext.Provider>
  );
};
