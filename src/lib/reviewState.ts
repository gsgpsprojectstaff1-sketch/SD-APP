import type { Source_Desti_Matrix } from "../generated/models/Source_Desti_MatrixModel";

type ReviewStage = "trip" | "fct";

interface ReviewSnapshot {
  signature: string;
  acknowledgedAt: string;
}

const REVIEW_STORAGE_PREFIX = "sdapp:review-state";

const storageKey = (stage: ReviewStage, rowId: number) => `${REVIEW_STORAGE_PREFIX}:${stage}:${rowId}`;

const createTripSignature = (row: Source_Desti_Matrix) => JSON.stringify({
  HaulingRate: row.HaulingRate ?? null,
  TripIndex: row.TripIndex ?? null,
  TripKM: row.TripKM ?? null,
  DriverRate: row.DriverRate ?? null,
  HelperRate: row.HelperRate ?? null,
  TripCount: row.TripCount ?? null,
  LTDriverRate: row.LTDriverRate ?? null,
  LTHelperRate: row.LTHelperRate ?? null,
  TonnerDriverRate: row.TonnerDriverRate ?? null,
  TonnerHelperRate: row.TonnerHelperRate ?? null,
  STDriverRate: row.STDriverRate ?? null,
  STHelperRate: row.STHelperRate ?? null,
  ModifiedTime: row.ModifiedTime ?? null,
});

const createFCTSignature = (row: Source_Desti_Matrix) => JSON.stringify({
  HaulingRate: row.HaulingRate ?? null,
  ApprovedFuelBudget: row.ApprovedFuelBudget ?? null,
  Trip_LaneCode: row.Trip_LaneCode ?? null,
  FCT_LaneCode: row.FCT_LaneCode ?? null,
  ModifiedTime: row.ModifiedTime ?? null,
});

const createSignature = (stage: ReviewStage, row: Source_Desti_Matrix) => {
  return stage === "trip" ? createTripSignature(row) : createFCTSignature(row);
};

const readSnapshot = (stage: ReviewStage, rowId: number): ReviewSnapshot | null => {
  try {
    const rawValue = window.localStorage.getItem(storageKey(stage, rowId));
    return rawValue ? (JSON.parse(rawValue) as ReviewSnapshot) : null;
  } catch (error) {
    console.error("Unable to read review snapshot", error);
    return null;
  }
};

const writeSnapshot = (stage: ReviewStage, row: Source_Desti_Matrix) => {
  if (typeof row.ID !== "number") {
    return;
  }

  const snapshot: ReviewSnapshot = {
    signature: createSignature(stage, row),
    acknowledgedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(storageKey(stage, row.ID), JSON.stringify(snapshot));
  } catch (error) {
    console.error("Unable to save review snapshot", error);
  }
};

export const ensureRowReviewBaseline = (stage: ReviewStage, row: Source_Desti_Matrix) => {
  if (typeof row.ID !== "number") {
    return;
  }

  const existingSnapshot = readSnapshot(stage, row.ID);
  if (!existingSnapshot) {
    writeSnapshot(stage, row);
  }
};

export const markRowReviewed = (stage: ReviewStage, row: Source_Desti_Matrix) => {
  writeSnapshot(stage, row);
};

export const isRowReviewOutdated = (stage: ReviewStage, row: Source_Desti_Matrix) => {
  if (typeof row.ID !== "number") {
    return false;
  }

  const existingSnapshot = readSnapshot(stage, row.ID);
  if (!existingSnapshot) {
    return false;
  }

  return existingSnapshot.signature !== createSignature(stage, row);
};