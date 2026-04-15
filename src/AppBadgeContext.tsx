import React, { createContext, useContext, useEffect, useState } from "react";
import { LiveDMSView_CEMService } from "./generated/services/LiveDMSView_CEMService";
import { Source_Desti_MatrixService } from "./generated/services/Source_Desti_MatrixService";
import { useRefresh } from "./RefreshContext";

const isReviewFlagOn = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "y" || normalized === "review" || normalized === "needs review";
  }
  return false;
};

const isTripIncomplete = (row: any) => (
  row.TripIndex == null ||
  row.TripKM == null ||
  row.DriverRate == null ||
  row.HelperRate == null
);

const isFCTIncomplete = (row: any) => (
  !row.ApprovedFuelBudget ||
  !row.Trip_LaneCode ||
  !row.FCT_LaneCode
);

interface BadgeCounts {
  unregisterCount: number;
  tripCount: number;
  tripNeedsReview: number;
  fctCount: number;
  fctNeedsReview: number;
  refreshCounts: () => Promise<void>;
}

const BadgeContext = createContext<BadgeCounts>({
  unregisterCount: 0,
  tripCount: 0,
  tripNeedsReview: 0,
  fctCount: 0,
  fctNeedsReview: 0,
  refreshCounts: async () => {},
});

export const useBadgeCounts = () => useContext(BadgeContext);

export const BadgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { refreshFlag } = useRefresh();
  const [unregisterCount, setUnregisterCount] = useState(0);
  const [tripCount, setTripCount] = useState(0);
  const [tripNeedsReview, setTripNeedsReview] = useState(0);
  const [fctCount, setFctCount] = useState(0);
  const [fctNeedsReview, setFctNeedsReview] = useState(0);

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
        const rows = res.data as any[];

        const tripNeedsReviewCount = rows.filter((row: any) =>
          isReviewFlagOn(row.TripNeedsReview)
        ).length;

        const tripIncompleteCount = rows.filter((row: any) =>
          isTripIncomplete(row) && !isReviewFlagOn(row.TripNeedsReview)
        ).length;

        setTripNeedsReview(tripNeedsReviewCount);
        setTripCount(tripIncompleteCount);

        // FCT count (incomplete FCT details)
        const fctNeedsReviewCount = rows.filter((row: any) =>
          isReviewFlagOn(row.FCTNeedsReview)
        ).length;

        const fctIncompleteCount = rows.filter((row: any) =>
          isFCTIncomplete(row) && !isReviewFlagOn(row.FCTNeedsReview)
        ).length;

        setFctNeedsReview(fctNeedsReviewCount);
        setFctCount(fctIncompleteCount);
      } else {
        setTripCount(0);
        setTripNeedsReview(0);
        setFctCount(0);
        setFctNeedsReview(0);
      }
    } catch {
      setTripCount(0);
      setTripNeedsReview(0);
      setFctCount(0);
      setFctNeedsReview(0);
    }
  };

  useEffect(() => {
    refreshCounts();
  }, [refreshFlag]);

  return (
    <BadgeContext.Provider value={{ unregisterCount, tripCount, tripNeedsReview, fctCount, fctNeedsReview, refreshCounts }}>
      {children}
    </BadgeContext.Provider>
  );
};
