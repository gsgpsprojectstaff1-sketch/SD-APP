import React, { createContext, useContext, useState, useCallback } from 'react';

interface RefreshContextType {
  triggerRefresh: () => void;
  refreshFlag: number;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshFlag, setRefreshFlag] = useState(0);
  const triggerRefresh = useCallback(() => {
    setRefreshFlag(f => f + 1);
  }, []);
  return (
    <RefreshContext.Provider value={{ triggerRefresh, refreshFlag }}>
      {children}
    </RefreshContext.Provider>
  );
};
