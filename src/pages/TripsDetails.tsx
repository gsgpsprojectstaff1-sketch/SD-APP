import React, { useState, useEffect, useRef } from "react";
import { useRefresh } from "../RefreshContext";
import { useBadgeCounts } from "../AppBadgeContext";
import { useNavigate } from "react-router-dom";
import "./TripsDetails.css";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";

import { Source_Desti_MatrixService } from "../generated/services/Source_Desti_MatrixService";
import type { Source_Desti_Matrix } from "../generated/models/Source_Desti_MatrixModel";

// Simple modal for update
function UpdateTripModal({ open, onClose, onCommit, trip }: {
  open: boolean;
  onClose: () => void;
  onCommit: (updated: Partial<Source_Desti_Matrix>) => void;
  trip: Source_Desti_Matrix | null;
}) {
  const [form, setForm] = useState<Partial<Source_Desti_Matrix>>({});
  useEffect(() => {
    setForm(trip || {});
  }, [trip]);

  // Helper to handle number fields
  const handleNumberChange = (field: keyof Source_Desti_Matrix) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm(f => ({ ...f, [field]: value === '' ? undefined : Number(value) }));
  };
  if (!open || !trip) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.25)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", borderRadius: 16, minWidth: 480, maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px 0 32px' }}>
          <h2 style={{ fontWeight: 700, fontSize: 24, margin: 0, color: '#22314a', letterSpacing: 0.5 }}>Quick Add Trip</h2>
          <button
            style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#888', lineHeight: 1 }}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <form
          style={{
            display: 'flex', flexDirection: 'column', gap: 0, padding: '16px 32px 32px 32px',
          }}
          onSubmit={e => { e.preventDefault(); onCommit(form); }}
        >
          <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, color: '#22314a' }}>Source</label>
              <input type="text" value={form.SourceName || ''} readOnly style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#f5f7fa', fontWeight: 600, color: '#22314a' }} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, color: '#22314a' }}>Destination</label>
              <input type="text" value={form.DestinationName || ''} readOnly style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#f5f7fa', fontWeight: 600, color: '#22314a' }} />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500, marginBottom: 4, color: '#22314a' }}>Hauling Rate</label>
            <input
              type="text"
              value={form.HaulingRate ?? ''}
              readOnly
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#f5f7fa', color: '#22314a', fontWeight: 600 }}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
            />
          </div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, color: '#22314a' }}>Trip Index</label>
              <input
                type="text"
                value={form.TripIndex ?? ''}
                onChange={e => handleNumberChange('TripIndex')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, color: '#22314a' }}>Trip KM</label>
              <input
                type="text"
                value={form.TripKM ?? ''}
                onChange={e => handleNumberChange('TripKM')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, color: '#22314a' }}>Driver Rate</label>
              <input
                type="text"
                value={form.DriverRate ?? ''}
                onChange={e => handleNumberChange('DriverRate')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, color: '#22314a' }}>Helper Rate</label>
              <input
                type="text"
                value={form.HelperRate ?? ''}
                onChange={e => handleNumberChange('HelperRate')(e)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button
              type="button"
              style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 600, fontSize: 16, cursor: (form.TripIndex && form.TripKM && form.DriverRate && form.HelperRate) ? 'pointer' : 'not-allowed', opacity: (form.TripIndex && form.TripKM && form.DriverRate && form.HelperRate) ? 1 : 0.6 }}
              disabled={!(form.TripIndex && form.TripKM && form.DriverRate && form.HelperRate)}
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
  const username = "Bongolo";
  const [search, setSearch] = useState("");

  // Data state
  const [rows, setRows] = useState<Source_Desti_Matrix[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Source_Desti_Matrix|null>(null);
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
  const { refreshFlag, triggerRefresh } = useRefresh();
  useEffect(() => {
    setLoading(true);
    Source_Desti_MatrixService.getAll().then(res => {
      const data = res.data || [];
      // Filter: show only rows with null/undefined TripIndex, TripKM, DriverRate, HelperRate
      setRows((data as Source_Desti_Matrix[]).filter((row: Source_Desti_Matrix) =>
        row.TripIndex == null ||
        row.TripKM == null ||
        row.DriverRate == null ||
        row.HelperRate == null
      ));
    }).finally(()=>setLoading(false));
  }, [refreshFlag]);

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
    // Prepare update fields (convert to numbers if needed)
    const changedFields: Partial<Source_Desti_Matrix> = {
      TripIndex: form.TripIndex ? Number(form.TripIndex) : undefined,
      TripKM: form.TripKM ? Number(form.TripKM) : undefined,
      DriverRate: form.DriverRate ? Number(form.DriverRate) : undefined,
      HelperRate: form.HelperRate ? Number(form.HelperRate) : undefined,
      HaulingRate: form.HaulingRate ? Number(form.HaulingRate) : undefined,
    };
    await Source_Desti_MatrixService.update(String(selectedTrip.ID), changedFields);
    setModalOpen(false);
    setSelectedTrip(null);
    // Refresh data
    Source_Desti_MatrixService.getAll().then(res => {
      const data = res.data || [];
      setRows((data as Source_Desti_Matrix[]).filter((row: Source_Desti_Matrix) =>
        row.TripIndex == null ||
        row.TripKM == null ||
        row.DriverRate == null ||
        row.HelperRate == null
      ));
      showToast("Trip entry committed successfully!");
      // Trigger refresh for other listeners (like FCTDetails)
      triggerRefresh();
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
          {loading ? (
            <p style={{ marginLeft: 24 }}>Loading...</p>
          ) : rows.length === 0 ? (
            <p style={{ marginLeft: 24, color: '#e11d48' }}>No incomplete trips found or failed to load data.</p>
          ) : (
            <div className="usd-table-card">
              <div className="usd-table-scroll">
                <table className="usd-table">
                  <thead>
                    <tr>
                      <th style={{ width: 48, textAlign: 'center', border: 'none' }}>#</th>
                      <th>Source</th>
                      <th>Destination</th>
                      <th>Trip Index</th>
                      <th>Trip KM</th>
                      <th>Driver Rate</th>
                      <th>Helper Rate</th>
                      <th>Hauling Rate</th>
                      <th style={{ width: 80 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedData.map((row, idx) => (
                      <tr key={row.ID || idx}>
                        <td style={{ textAlign: 'center', fontWeight: 500, border: 'none' }}>{((page - 1) * pageSize) + idx + 1}</td>
                        <td title={row.SourceName}>{row.SourceName}</td>
                        <td title={row.DestinationName}>{row.DestinationName}</td>
                        <td>{row.TripIndex ?? ''}</td>
                        <td>{row.TripKM ?? ''}</td>
                        <td>{row.DriverRate ?? ''}</td>
                        <td>{row.HelperRate ?? ''}</td>
                        <td>{row.HaulingRate ?? ''}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="usd-add-btn"
                            style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 22px', cursor: 'pointer', fontWeight: 500, minWidth: 70, whiteSpace: 'nowrap' }}
                            onClick={() => handleUpdate(row)}
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="usd-pagination">
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
          )}
          <UpdateTripModal open={modalOpen} onClose={()=>{setModalOpen(false);setSelectedTrip(null);}} onCommit={handleCommit} trip={selectedTrip} />
        </main>
      </div>
    </div>
  );
};

export default TripsDetails;
