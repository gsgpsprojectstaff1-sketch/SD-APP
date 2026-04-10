import React, { createContext, useContext, useEffect, useState } from "react";
import { LiveDMSView_CEMService } from "./generated/services/LiveDMSView_CEMService";
import { Source_Desti_MatrixService } from "./generated/services/Source_Desti_MatrixService";

interface BadgeCounts {
  unregisterCount: number;
  tripCount: number;
  fctCount: number;
  refreshCounts: () => Promise<void>;
}

const BadgeContext = createContext<BadgeCounts>({
  unregisterCount: 0,
  tripCount: 0,
  fctCount: 0,
  refreshCounts: async () => {},
});

export const useBadgeCounts = () => useContext(BadgeContext);

export const BadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unregisterCount, setUnregisterCount] = useState(0);
  const [tripCount, setTripCount] = useState(0);
  const [fctCount, setFctCount] = useState(0);

  const refreshCounts = async () => {
    // Unregister count
    try {
      const [tripRes, matrixRes] = await Promise.all([
        LiveDMSView_CEMService.getAll(),
        Source_Desti_MatrixService.getAll()
      ]);
      // Unregister count logic
      if (
        tripRes.success && tripRes.data &&
        matrixRes.success && matrixRes.data
      ) {
        const registeredSet = new Set(
          matrixRes.data.map((rec: any) => `${rec.SourceName?.toLowerCase()}|${rec.DestinationName?.toLowerCase()}`)
        );
        const uniquePairs = new Set<string>();
        let unregister = 0;
        for (const trip of tripRes.data) {
          const src = trip.Source?.trim() || "";
          const dst = trip.Destination?.trim() || "";
          if (!src || !dst) continue;
          const key = `${src.toLowerCase()}|${dst.toLowerCase()}`;
          if (!uniquePairs.has(key)) {
            uniquePairs.add(key);
            if (!registeredSet.has(key)) {
              unregister++;
            }
          }
        }
        setUnregisterCount(unregister);
      } else {
        setUnregisterCount(0);
      }
    } catch {
      setUnregisterCount(0);
    }
    // Trip count (incomplete trips)
    try {
      const res = await Source_Desti_MatrixService.getAll();
      if (res.success && res.data) {
        setTripCount((res.data as any[]).filter((row: any) =>
          row.TripIndex == null ||
          row.TripKM == null ||
          row.DriverRate == null ||
          row.HelperRate == null
        ).length);
        // FCT count (incomplete FCT details)
        setFctCount((res.data as any[]).filter((row: any) =>
          !row.ApprovedFuelBudget || !row.Trip_LaneCode || !row.FCT_LaneCode
        ).length);
      } else {
        setTripCount(0);
        setFctCount(0);
      }
    } catch {
      setTripCount(0);
      setFctCount(0);
    }
  };

  useEffect(() => {
    refreshCounts();
  }, []);

  return (
    <BadgeContext.Provider value={{ unregisterCount, tripCount, fctCount, refreshCounts }}>
      {children}
    </BadgeContext.Provider>
  );
};
