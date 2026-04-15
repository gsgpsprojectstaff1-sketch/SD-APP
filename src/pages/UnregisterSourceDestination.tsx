import { useState, useEffect, useRef, useMemo } from "react";
import { Plus } from "lucide-react";

import { useBadgeCounts } from "../AppBadgeContext";
import type { Entry } from "../components/TripForm";
import "./UnregisterSourceDestination.css";
import Sidebar from "../components/Sidebar";
import { LiveDMSView_CEMService } from "../generated/services/LiveDMSView_CEMService";
import { Source_Desti_MatrixService } from "../generated/services/Source_Desti_MatrixService";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import { createManilaTimestampValue, useCurrentUser } from "../lib/utils";

interface SourceDestPair {
  source: string;
  destination: string;
}

const UNREGISTER_CACHE_TTL_MS = 60_000;
const FETCH_PAGE_SIZE = 5000;
let unregisteredCache: { timestamp: number; data: SourceDestPair[] } | null = null;

const UnregisterSourceDestination = ({ unregisterCount, tripCount, fctCount }: { unregisterCount: number, tripCount: number, fctCount: number }) => {
  const { refreshCounts } = useBadgeCounts();
  const [unregistered, setUnregistered] = useState<SourceDestPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("Unregister-Source-Destination");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  // Use global user hook for consistency
  const username = useCurrentUser();
  const navigate = useNavigate();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  // Removed: selectedPair, not used
  // TripForm state
  // Remove orderEntry for this modal
  const emptyForm: Entry = {
    createdtimestamp: "", // new field for created timestamp
    orderEntry: "", // not used
    source: "",
    destination: "",
    fuel: "",
    tripLane: "",
    fctLane: "",
    index: "",
    km: "",
    hauling: "",
    driver: "",
    helper: "",
  };
  const [form, setForm] = useState<Entry>(emptyForm);
  const [popup, setPopup] = useState<string>("");
  const [haulingError, setHaulingError] = useState<string>("");
  // Notification state
  const [notification, setNotification] = useState<string>("");
  const [showNotification, setShowNotification] = useState(false);
  const [progress, setProgress] = useState(100);
  // Use number for timerRef to avoid NodeJS type error in React
  const timerRef = useRef<number | null>(null);
  // Removed: lookupLoading, not used
  // When opening modal, prefill form
  const handleOpenModal = (pair: SourceDestPair) => {
    setForm({
      ...emptyForm,
      source: pair.source,
      destination: pair.destination,
    });
    setShowModal(true);
  };

  const handleChange = (field: keyof Entry, value: string) => {
    if (field === "hauling") {
      // Only allow numbers
      if (/^\d*$/.test(value)) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setHaulingError("");
      } else {
        setHaulingError("Numbers only are allowed for Hauling Rate.");
      }
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Refetch logic extracted for reuse
  const fetchUnregistered = async (forceRefresh = false) => {
    if (!forceRefresh && unregisteredCache && Date.now() - unregisteredCache.timestamp < UNREGISTER_CACHE_TTL_MS) {
      setUnregistered(unregisteredCache.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [tripRes, matrixRes] = await Promise.all([
        LiveDMSView_CEMService.getAll({
          select: ["Source", "Destination"],
          maxPageSize: FETCH_PAGE_SIZE,
        }),
        Source_Desti_MatrixService.getAll({
          select: ["SourceName", "DestinationName"],
          maxPageSize: FETCH_PAGE_SIZE,
        })
      ]);
      if (
        tripRes.success && tripRes.data &&
        matrixRes.success && matrixRes.data
      ) {
        const registeredSet = new Set(
          matrixRes.data.map((rec) => `${rec.SourceName?.toLowerCase()}|${rec.DestinationName?.toLowerCase()}`)
        );
        const uniquePairs = new Set<string>();
        const unregisteredPairs: SourceDestPair[] = [];
        for (const trip of tripRes.data) {
          const src = trip.Source?.trim() || "";
          const dst = trip.Destination?.trim() || "";
          if (!src || !dst) continue;
          const key = `${src.toLowerCase()}|${dst.toLowerCase()}`;
          if (!uniquePairs.has(key)) {
            uniquePairs.add(key);
            if (!registeredSet.has(key)) {
              unregisteredPairs.push({ source: src, destination: dst });
            }
          }
        }
        setUnregistered(unregisteredPairs);
        unregisteredCache = { timestamp: Date.now(), data: unregisteredPairs };
      } else {
        setUnregistered([]);
        unregisteredCache = { timestamp: Date.now(), data: [] };
      }
    } catch (err) {
      setUnregistered([]);
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Modern Toast Notification logic
  const showToast = (msg: string) => {
    setNotification(msg);
    setShowNotification(true);
    setProgress(100);
    // Animate progress bar
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

  const handleCommit = async () => {
    // Only Hauling Rate is required
    if (!form.hauling || form.hauling.trim() === "") {
      setPopup("Please fill out the Hauling Rate before submitting.");
      return;
    }
    // Prepare Source_Desti_Matrix record from form
    const newRecord = {
      SourceName: form.source,
      DestinationName: form.destination,
      ApprovedFuelBudget: form.fuel ? Number(form.fuel) : undefined,
      Trip_LaneCode: form.tripLane,
      FCT_LaneCode: form.fctLane,
      TripIndex: form.index ? Number(form.index) : undefined,
      TripKM: form.km ? Number(form.km) : undefined,
      HaulingRate: form.hauling ? Number(form.hauling) : undefined,
      DriverRate: form.driver ? Number(form.driver) : undefined,
      HelperRate: form.helper ? Number(form.helper) : undefined,

      CreatedTimeStamp: createManilaTimestampValue(),
      CreatedBy: username?.trim() ? username.trim() : "User"
    };
    try {
      await Source_Desti_MatrixService.create(newRecord);
      setPopup("");
      setShowModal(false);
      setForm(emptyForm);
      // Optimistically remove committed pair from current table for instant feedback.
      setUnregistered((prev) => {
        const next = prev.filter(
          (pair) =>
            pair.source.trim().toLowerCase() !== form.source.trim().toLowerCase() ||
            pair.destination.trim().toLowerCase() !== form.destination.trim().toLowerCase()
        );
        unregisteredCache = { timestamp: Date.now(), data: next };
        return next;
      });
      // Refresh badge counts
      refreshCounts();
      // Show modern toast notification
      showToast("Trip entry committed successfully!");
    } catch (err) {
      setPopup('Error saving record.');
      console.error('Create error:', err);
    }
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

  useEffect(() => {
    fetchUnregistered();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Pagination logic
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalizedSearch) return unregistered;
    return unregistered.filter(
      (pair) =>
        pair.source.toLowerCase().includes(normalizedSearch) ||
        pair.destination.toLowerCase().includes(normalizedSearch)
    );
  }, [unregistered, normalizedSearch]);

  const pagedData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const filteredTotalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const totalPages = filteredTotalPages;
  const visibleCountLabel = `${pagedData.length} out of ${filtered.length}`;

  useEffect(() => {
    setPage((prev) => Math.min(prev, filteredTotalPages));
  }, [filteredTotalPages]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
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
          title="UNREGISTER SD"
          username={username}
          search={search}
          onSearchChange={handleSearchChange}
        />
        <main className="dashboard-content">
          {loading ? (
            <div className="usd-loading-wrap" role="status" aria-live="polite" aria-label="Loading unregistered source destination data">
              <div className="usd-loading-road">
                <div className="usd-loading-lane" />
                <div className="usd-loading-truck" aria-hidden="true">
                  <div className="usd-loading-truck-cabin" />
                  <div className="usd-loading-truck-body" />
                  <div className="usd-loading-wheel usd-loading-wheel-front" />
                  <div className="usd-loading-wheel usd-loading-wheel-back" />
                </div>
              </div>
              <p className="usd-loading-text">Loading data, truck is on the way...</p>
            </div>
          ) : unregistered.length === 0 ? (
            <p style={{ marginLeft: 24, color: '#e11d48' }}>No unregistered source-destination pairs found or failed to load data.</p>
          ) : (
            <div className="usd-table-card">
              <div className="usd-table-scroll">
                <table className="usd-table">
                  <thead>
                    <tr>
                      {/* <th>OE</th> */}
                      <th>Source</th>
                      <th>Destination</th>
                      <th style={{ width: 80 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedData.map((pair) => {
                      const uniqueKey = `${pair.source}|${pair.destination}`;
                      return (
                        <tr key={uniqueKey}>
                          {/* <td title={pair.OE}>{pair.OE || ''}</td> */}
                          <td title={pair.source}>{pair.source}</td>
                          <td title={pair.destination}>{pair.destination}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="usd-add-btn"
                              aria-label="Add trip"
                              title="Add trip"
                              style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => handleOpenModal(pair)}
                            >
                              <Plus size={16} strokeWidth={2.5} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="usd-pagination unregister-pagination">
                <span className="unregister-pagination-count">{visibleCountLabel}</span>
                <div className="unregister-pagination-controls">
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
                      onClick={() => setPage((p) => Math.min(filteredTotalPages, p + 1))}
                      disabled={page === filteredTotalPages}
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

          {/* Modal for Quick Add Trip */}
          {showModal && (
            <div className="usd-modal-overlay" style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div className="usd-modal-content" style={{
                background: '#fff', borderRadius: 12, padding: 0, minWidth: 600, maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px 0 32px' }}>
                  <h2 style={{ fontWeight: 700, fontSize: 22, margin: 0, color: '#22314a', letterSpacing: 0.5 }}>Quick Add Trip</h2>
                  <button
                    style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#888', lineHeight: 1 }}
                    onClick={() => setShowModal(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
                <form
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 0, padding: '16px 32px 32px 32px',
                  }}
                  onSubmit={e => { e.preventDefault(); handleCommit(); }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 18 }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ fontWeight: 500, marginBottom: 4, color: '#22314a' }}>Source</label>
                      <input type="text" value={form.source} readOnly style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#f5f7fa', fontWeight: 600, color: '#22314a' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ fontWeight: 500, marginBottom: 4, color: '#22314a' }}>Destination</label>
                      <input type="text" value={form.destination} readOnly style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#f5f7fa', fontWeight: 600, color: '#22314a' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 18 }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ fontWeight: 500, marginBottom: 4, color: '#22314a' }}>Hauling Rate</label>
                      <input
                        type="text"
                        value={form.hauling}
                        onChange={e => handleChange('hauling', e.target.value)}
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                      />
                      {haulingError && (
                        <div style={{ color: '#e11d48', marginTop: 4, fontWeight: 500, fontSize: 14 }}>{haulingError}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                    <button
                      type="button"
                      style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 600, cursor: form.hauling.trim() ? 'pointer' : 'not-allowed', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, opacity: form.hauling.trim() ? 1 : 0.6 }}
                      disabled={!form.hauling.trim()}
                    >
                      <span style={{ fontSize: 20, fontWeight: 700 }}>+</span> Commit Entry
                    </button>
                  </div>
                  {popup && (
                    <div style={{ color: '#e11d48', marginTop: 12, textAlign: 'center', fontWeight: 500 }}>{popup}</div>
                  )}
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UnregisterSourceDestination;
