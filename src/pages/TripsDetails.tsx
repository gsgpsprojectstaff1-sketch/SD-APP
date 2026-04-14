import React, { useState, useEffect, useRef } from "react";
import { SquarePen } from "lucide-react";
import { useRefresh } from "../RefreshContext";
import { useBadgeCounts } from "../AppBadgeContext";
import { useNavigate } from "react-router-dom";
import "./TripsDetails.css";

import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import { useCurrentUser } from "../lib/utils";
import { ensureRowReviewBaseline, isRowReviewOutdated, markRowReviewed } from "../lib/reviewState";

import { Source_Desti_MatrixService } from "../generated/services/Source_Desti_MatrixService";
import type { Source_Desti_Matrix } from "../generated/models/Source_Desti_MatrixModel";

const isTripRowIncomplete = (row: Source_Desti_Matrix) => (
  row.TripIndex == null ||
  row.TripKM == null ||
  row.DriverRate == null ||
  row.HelperRate == null
);

const getUpdatedTripFields = (previousRow: Source_Desti_Matrix, nextRow: Partial<Source_Desti_Matrix>) => {
  const fields: string[] = [];

  if (previousRow.TripIndex !== nextRow.TripIndex) fields.push("TripIndex");
  if (previousRow.TripKM !== nextRow.TripKM) fields.push("TripKM");
  if (previousRow.DriverRate !== nextRow.DriverRate) fields.push("DriverRate");
  if (previousRow.HelperRate !== nextRow.HelperRate) fields.push("HelperRate");
  if (previousRow.HaulingRate !== nextRow.HaulingRate) fields.push("HaulingRate");
  if (previousRow.TripCount !== nextRow.TripCount) fields.push("TripCount");
  if (previousRow.LTDriverRate !== nextRow.LTDriverRate) fields.push("LTDriverRate");
  if (previousRow.LTHelperRate !== nextRow.LTHelperRate) fields.push("LTHelperRate");
  if (previousRow.TonnerDriverRate !== nextRow.TonnerDriverRate) fields.push("TonnerDriverRate");
  if (previousRow.TonnerHelperRate !== nextRow.TonnerHelperRate) fields.push("TonnerHelperRate");
  if (previousRow.STDriverRate !== nextRow.STDriverRate) fields.push("STDriverRate");
  if (previousRow.STHelperRate !== nextRow.STHelperRate) fields.push("STHelperRate");

  return fields;
};

// Simple modal for update
function UpdateTripModal({ open, onClose, onCommit, trip }: {
  open: boolean;
  onClose: () => void;
  onCommit: (updated: Partial<Source_Desti_Matrix>) => void;
  trip: Source_Desti_Matrix | null;
}) {
  const [form, setForm] = useState<Partial<Source_Desti_Matrix>>({});
  const hasNumber = (value: unknown) => typeof value === "number" && !isNaN(value);
  useEffect(() => {
    setForm(trip || {});
  }, [trip]);

  // Helper to handle number fields
  const handleNumberChange = (field: keyof Source_Desti_Matrix) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only set number if valid, else ignore (keep last valid value)
    if (value === '') {
      setForm(f => ({ ...f, [field]: undefined }));
    } else if (/^\d+$/.test(value)) {
      setForm(f => ({ ...f, [field]: Number(value) }));
    } else {
      // Ignore invalid input: do not update state
      // Optionally, you can show a warning or shake effect here
    }
  };
  if (!open || !trip) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15,23,42,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box"
    }}>
      <div style={{ background: "#fff", borderRadius: 16, width: 'min(980px, 96vw)', maxHeight: '92vh', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontWeight: 700, fontSize: 24, margin: 0, color: '#22314a', letterSpacing: 0.5 }}>Trip Details Update</h2>
          <button
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: 24, cursor: 'pointer', color: '#475569', lineHeight: 1, borderRadius: 8, width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <form
          className="trip-update-form"
          style={{
            display: 'flex', flexDirection: 'column', gap: 0, padding: '16px 24px 24px 24px', overflowY: 'auto',
          }}
          onSubmit={e => { e.preventDefault(); onCommit(form); }}
        >
          <div style={{ display: 'flex', gap: 18, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block' }}>Source</label>
              <input type="text" value={form.SourceName || ''} readOnly style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#f5f7fa', fontWeight: 600, color: '#22314a' }} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block' }}>Destination</label>
              <input type="text" value={form.DestinationName || ''} readOnly style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#f5f7fa', fontWeight: 600, color: '#22314a' }} />
            </div>
          </div>
          <div style={{ marginBottom: 14, width: '100%', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
            <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block', textAlign: 'center' }}>Hauling Rate</label>
            <input
              type="text"
              value={form.HaulingRate ?? ''}
              readOnly
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#f5f7fa', color: '#22314a', fontWeight: 600, textAlign: 'center' }}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
            />
          </div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block' }}>Trip Index</label>
              <input
                type="text"
                value={typeof form.TripIndex === 'number' && !isNaN(form.TripIndex) ? form.TripIndex : ''}
                onChange={e => handleNumberChange('TripIndex')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block' }}>Trip KM</label>
              <input
                type="text"
                value={typeof form.TripKM === 'number' && !isNaN(form.TripKM) ? form.TripKM : ''}
                onChange={e => handleNumberChange('TripKM')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block' }}>Driver Rate</label>
              <input
                type="text"
                value={typeof form.DriverRate === 'number' && !isNaN(form.DriverRate) ? form.DriverRate : ''}
                onChange={e => handleNumberChange('DriverRate')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block' }}>Helper Rate</label>
              <input
                type="text"
                value={typeof form.HelperRate === 'number' && !isNaN(form.HelperRate) ? form.HelperRate : ''}
                onChange={e => handleNumberChange('HelperRate')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block' }}>Trip Count</label>
              <input
                type="text"
                value={hasNumber(form.TripCount) ? form.TripCount : ''}
                onChange={e => handleNumberChange('TripCount')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block' }}>LT Driver Rate</label>
              <input
                type="text"
                value={hasNumber(form.LTDriverRate) ? form.LTDriverRate : ''}
                onChange={e => handleNumberChange('LTDriverRate')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block' }}>LT Helper Rate</label>
              <input
                type="text"
                value={hasNumber(form.LTHelperRate) ? form.LTHelperRate : ''}
                onChange={e => handleNumberChange('LTHelperRate')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block' }}>Tonner Driver Rate</label>
              <input
                type="text"
                value={hasNumber(form.TonnerDriverRate) ? form.TonnerDriverRate : ''}
                onChange={e => handleNumberChange('TonnerDriverRate')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block' }}>Tonner Helper Rate</label>
              <input
                type="text"
                value={hasNumber(form.TonnerHelperRate) ? form.TonnerHelperRate : ''}
                onChange={e => handleNumberChange('TonnerHelperRate')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block' }}>ST Driver Rate</label>
              <input
                type="text"
                value={hasNumber(form.STDriverRate) ? form.STDriverRate : ''}
                onChange={e => handleNumberChange('STDriverRate')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, color: '#22314a', display: 'block' }}>ST Helper Rate</label>
              <input
                type="text"
                value={hasNumber(form.STHelperRate) ? form.STHelperRate : ''}
                onChange={e => handleNumberChange('STHelperRate')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 600, fontSize: 16, cursor: (hasNumber(form.TripIndex) && hasNumber(form.TripKM)) ? 'pointer' : 'not-allowed', opacity: (hasNumber(form.TripIndex) && hasNumber(form.TripKM)) ? 1 : 0.6 }}
              disabled={!(hasNumber(form.TripIndex) && hasNumber(form.TripKM))}
            >
              Commit Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


const TripsDetails: React.FC<{ unregisterCount: number, tripCount: number, fctCount: number }> = ({ unregisterCount, tripCount, fctCount }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("Trip");
  const navigate = useNavigate();
  const username = useCurrentUser();
  const [search, setSearch] = useState("");

  // Data state
  const [rows, setRows] = useState<Source_Desti_Matrix[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Source_Desti_Matrix|null>(null);
  const [staleRowIds, setStaleRowIds] = useState<Set<number>>(new Set());
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Toast state
  const [notification, setNotification] = useState<string>("");
  const [showNotification, setShowNotification] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<number | null>(null);
  // Badge context
  const { refreshCounts } = useBadgeCounts();
  // Fetch data
  const { refreshFlag, triggerRefresh, lastRefreshEvent } = useRefresh();
  useEffect(() => {
    setLoading(true);
    Source_Desti_MatrixService.getAll().then(res => {
      const data = res.data || [];
      const nextRows = data as Source_Desti_Matrix[];
      const nextStaleRowIds = new Set<number>();

      nextRows.forEach((row) => {
        if (!isTripRowIncomplete(row)) {
          ensureRowReviewBaseline("trip", row);
          if (typeof row.ID === "number" && isRowReviewOutdated("trip", row)) {
            nextStaleRowIds.add(row.ID);
          }
        }
      });

      setStaleRowIds(nextStaleRowIds);
      setRows(nextRows.filter((row) => isTripRowIncomplete(row) || (typeof row.ID === "number" && nextStaleRowIds.has(row.ID))));
    }).finally(()=>setLoading(false));
  }, [refreshFlag]);

  useEffect(() => {
    if (!lastRefreshEvent || lastRefreshEvent.source === "trips-details") {
      return;
    }

    if (lastRefreshEvent.fields?.includes("HaulingRate") && lastRefreshEvent.message) {
      showToast(lastRefreshEvent.message);
    }
  }, [lastRefreshEvent]);

  // Pagination logic
  const filtered = rows.filter(
    (row) =>
      (row.SourceName?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (row.DestinationName?.toLowerCase() || "").includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const pagedData = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Helper to render page numbers (with ellipsis if needed)
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 7;
    let startPage = Math.max(1, page - 3);
    let endPage = Math.min(totalPages, page + 3);
    if (endPage - startPage < maxPagesToShow - 1) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
    }
    if (startPage > 1) {
      pageNumbers.push(
        <button key={1} onClick={() => setPage(1)} className={page === 1 ? 'active' : ''}>1</button>
      );
      if (startPage > 2) pageNumbers.push(<span key="start-ellipsis">...</span>);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={page === i ? 'active' : ''}
          style={{
            margin: '0 2px',
            padding: '6px 12px',
            borderRadius: 4,
            border: 'none',
            background: page === i ? '#00bcd4' : '#fff',
            color: page === i ? '#fff' : '#222',
            fontWeight: page === i ? 'bold' : 'normal',
            cursor: 'pointer',
            boxShadow: 'none',
          }}
        >
          {i}
        </button>
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push(<span key="end-ellipsis">...</span>);
      pageNumbers.push(
        <button key={totalPages} onClick={() => setPage(totalPages)} className={page === totalPages ? 'active' : ''}>{totalPages}</button>
      );
    }
    return pageNumbers;
  };

  // Open modal for update
  const handleUpdate = (trip: Source_Desti_Matrix) => {
    setSelectedTrip(trip);
    setModalOpen(true);
  };
  // Toast logic
  const showToast = (msg: string) => {
    setNotification(msg);
    setShowNotification(true);
    setProgress(100);
    let start = Date.now();
    let duration = 3000;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      let elapsed = Date.now() - start;
      let percent = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(percent);
      if (percent <= 0) {
        setShowNotification(false);
        setNotification("");
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 30);
  };
  const closeToast = () => {
    setShowNotification(false);
    setNotification("");
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Commit update
  const handleCommit = async (form: Partial<Source_Desti_Matrix>) => {
    if (!selectedTrip || !selectedTrip.ID) return;
    setLoading(true);
    const toNumberOrUndefined = (value: unknown): number | undefined => {
      return typeof value === "number" && !isNaN(value) ? value : undefined;
    };
    // Prepare update fields (convert to numbers if needed)
    const changedFields: Partial<Source_Desti_Matrix> = {
      TripIndex: toNumberOrUndefined(form.TripIndex),
      TripKM: toNumberOrUndefined(form.TripKM),
      DriverRate: toNumberOrUndefined(form.DriverRate),
      HelperRate: toNumberOrUndefined(form.HelperRate),
      HaulingRate: toNumberOrUndefined(form.HaulingRate),
      TripCount: toNumberOrUndefined(form.TripCount),
      LTDriverRate: toNumberOrUndefined(form.LTDriverRate),
      LTHelperRate: toNumberOrUndefined(form.LTHelperRate),
      TonnerDriverRate: toNumberOrUndefined(form.TonnerDriverRate),
      TonnerHelperRate: toNumberOrUndefined(form.TonnerHelperRate),
      STDriverRate: toNumberOrUndefined(form.STDriverRate),
      STHelperRate: toNumberOrUndefined(form.STHelperRate),
    };
    const changedFieldNames = getUpdatedTripFields(selectedTrip, changedFields);
    await Source_Desti_MatrixService.update(String(selectedTrip.ID), changedFields);
    setModalOpen(false);
    setSelectedTrip(null);
    // Refresh data
    Source_Desti_MatrixService.getAll().then(res => {
      const data = res.data || [];
      const nextRow = { ...selectedTrip, ...changedFields };
      markRowReviewed("trip", nextRow);

      const nextRows = data as Source_Desti_Matrix[];
      const nextStaleRowIds = new Set<number>();

      nextRows.forEach((row) => {
        if (!isTripRowIncomplete(row)) {
          ensureRowReviewBaseline("trip", row);
          if (typeof row.ID === "number" && isRowReviewOutdated("trip", row)) {
            nextStaleRowIds.add(row.ID);
          }
        }
      });

      setStaleRowIds(nextStaleRowIds);
      setRows(nextRows.filter((row) => isTripRowIncomplete(row) || (typeof row.ID === "number" && nextStaleRowIds.has(row.ID))));
      showToast("Trip entry committed successfully!");
      triggerRefresh({
        source: 'trips-details',
        entity: 'Source_Desti_Matrix',
        action: 'updated',
        recordId: selectedTrip.ID,
        fields: changedFieldNames,
        message: changedFieldNames.includes('HaulingRate')
          ? `Trip Details updated the Hauling Rate for ${selectedTrip.SourceName} to ${selectedTrip.DestinationName}.`
          : `Trip Details updated ${selectedTrip.SourceName} to ${selectedTrip.DestinationName}.`,
      });
      // Update badge counts globally
      refreshCounts();
    }).finally(()=>setLoading(false));
  };

  const handleSidebarItemClick = (item: string) => {
    setActiveItem(item);
    if (item === "Trips") {
      navigate("/dashboard1");
    } else if (item === "Unregister-Source-Destination") {
      navigate("/unregister-source-destination");
    } else if (item === "Trip") {
      navigate("/trips-details");
    } else if (item === "FCT") {
      navigate("/fct-details");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Modern Toast Notification */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          color: '#222',
          padding: 0,
          borderRadius: 10,
          boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
          zIndex: 3000,
          minWidth: 340,
          maxWidth: 400,
          fontWeight: 500,
          fontSize: 17,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '18px 22px 14px 18px', gap: 12 }}>
            {/* Green check icon */}
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#22c55e', borderRadius: '50%', width: 28, height: 28 }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#22c55e"/><path d="M6.5 10.5L9 13L14 8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span style={{ flex: 1, color: '#222', fontWeight: 500 }}>{notification}</span>
            {/* Close button */}
            <button onClick={closeToast} style={{ background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer', marginLeft: 8, lineHeight: 1 }} aria-label="Close notification">&times;</button>
          </div>
          {/* Progress bar */}
          <div style={{ height: 4, width: '100%', background: '#e5e7eb', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#22c55e', transition: 'width 0.1s linear' }} />
          </div>
        </div>
      )}
      <Sidebar
        activeItem={activeItem}
        onItemClick={handleSidebarItemClick}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unregisterCount={unregisterCount}
        tripCount={tripCount}
        fctCount={fctCount}
      />
      <div className={`dashboard-main ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
        <DashboardHeader
          title="TRIP DETAILS"
          username={username}
          search={search}
          onSearchChange={handleSearchChange}
        />
        <main className="dashboard-content">
          {staleRowIds.size > 0 && (
            <div style={{
              margin: '0 24px 16px 24px',
              padding: '12px 16px',
              borderRadius: 10,
              background: '#fff7ed',
              border: '1px solid #fdba74',
              color: '#9a3412',
              fontWeight: 500,
            }}>
              {`${staleRowIds.size} completed trip row(s) need review again because a source record was modified.`}
            </div>
          )}
          {loading ? (
            <div className="truck-loading-wrap" role="status" aria-live="polite" aria-label="Loading trip details data">
              <div className="truck-loading-road">
                <div className="truck-loading-lane" />
                <div className="truck-loading-truck" aria-hidden="true">
                  <div className="truck-loading-truck-cabin" />
                  <div className="truck-loading-truck-body" />
                  <div className="truck-loading-wheel truck-loading-wheel-front" />
                  <div className="truck-loading-wheel truck-loading-wheel-back" />
                </div>
              </div>
              <p className="truck-loading-text">Loading data, truck is on the way...</p>
            </div>
          ) : rows.length === 0 ? (
            <p style={{ marginLeft: 24, color: '#e11d48' }}>No incomplete or outdated trips found.</p>
          ) : (
            <div className="usd-table-card trip-details-card">
              <div className="usd-table-scroll trip-details-scroll">
                <table className="usd-table trip-details-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Source</th>
                      <th>Destination</th>
                      <th>Hauling Rate</th>
                      <th>Trip Count</th>
                      <th>Trip Index</th>
                      <th>Trip KM</th>
                      <th>Driver Rate</th>
                      <th>Helper Rate</th>
                      <th>LT Driver Rate</th>
                      <th>LT Helper Rate</th>
                      <th>Tonner Driver Rate</th>
                      <th>Tonner Helper Rate</th>
                      <th>ST Driver Rate</th>
                      <th>ST Helper Rate</th>
                      <th style={{ width: 80 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedData.map((row, idx) => (
                      <tr key={row.ID || idx} style={typeof row.ID === 'number' && staleRowIds.has(row.ID) ? { background: '#fffaf0' } : undefined}>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 110,
                            padding: '4px 10px',
                            borderRadius: 999,
                            background: typeof row.ID === 'number' && staleRowIds.has(row.ID) ? '#fed7aa' : '#dbeafe',
                            color: typeof row.ID === 'number' && staleRowIds.has(row.ID) ? '#9a3412' : '#1d4ed8',
                            fontSize: 12,
                            fontWeight: 700,
                          }}>
                            {typeof row.ID === 'number' && staleRowIds.has(row.ID) ? 'Needs review' : 'Incomplete'}
                          </span>
                        </td>
                        <td title={row.SourceName}>{row.SourceName}</td>
                        <td title={row.DestinationName}>{row.DestinationName}</td>
                        <td>{row.HaulingRate ?? ''}</td>
                        <td>{row.TripCount ?? ''}</td>
                        <td>{row.TripIndex ?? ''}</td>
                        <td>{row.TripKM ?? ''}</td>
                        <td>{row.DriverRate ?? ''}</td>
                        <td>{row.HelperRate ?? ''}</td>
                        <td>{row.LTDriverRate ?? ''}</td>
                        <td>{row.LTHelperRate ?? ''}</td>
                        <td>{row.TonnerDriverRate ?? ''}</td>
                        <td>{row.TonnerHelperRate ?? ''}</td>
                        <td>{row.STDriverRate ?? ''}</td>
                        <td>{row.STHelperRate ?? ''}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="usd-add-btn"
                            aria-label="Update trip"
                            title="Update trip"
                            style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => handleUpdate(row)}
                          >
                            <SquarePen size={16} strokeWidth={2.4} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="usd-pagination trip-details-pagination">
                <span className="trip-details-count">{`${pagedData.length} out of ${filtered.length}`}</span>
                <div className="trip-details-pagination-controls">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      className="usd-pagination-btn"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      &lt; Previous
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {renderPageNumbers()}
                    </div>
                    <button
                      className="usd-pagination-btn"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next &gt;
                    </button>
                  </div>
                  <div className="usd-per-page-wrapper">
                    <select
                      className="usd-per-page-select"
                      value={pageSize}
                      onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                    >
                      {[10, 20, 50, 100].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <span className="usd-per-page-label">per page</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <UpdateTripModal open={modalOpen} onClose={()=>{setModalOpen(false);setSelectedTrip(null);}} onCommit={handleCommit} trip={selectedTrip} />
        </main>
      </div>
    </div>
  );
};

export default TripsDetails;
