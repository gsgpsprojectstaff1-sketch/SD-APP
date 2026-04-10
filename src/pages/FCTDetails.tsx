import React, { useState, useEffect } from "react";
import { useRefresh } from "../RefreshContext";
// Modal for updating FCT details
function UpdateFCTModal({ open, onClose, onCommit, row }: {
  open: boolean;
  onClose: () => void;
  onCommit: (updated: Partial<Source_Desti_Matrix>) => void;
  row: Source_Desti_Matrix | null;
}) {
  const [form, setForm] = useState<Partial<Source_Desti_Matrix>>({});
  useEffect(() => {
    setForm(row || {});
  }, [row]);

  const handleChange = (field: keyof Source_Desti_Matrix) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
  };
  const handleNumberChange = (field: keyof Source_Desti_Matrix) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value === '' ? undefined : Number(e.target.value) }));
  };
  if (!open || !row) return null;
  // Disable commit if any required field is empty
  const isCommitDisabled =
    form.ApprovedFuelBudget === undefined ||
    form.ApprovedFuelBudget === null ||
    (typeof form.ApprovedFuelBudget === 'string' ? (form.ApprovedFuelBudget as string).trim() === '' : false) ||
    (typeof form.ApprovedFuelBudget === 'number' && Number.isNaN(form.ApprovedFuelBudget)) ||
    String(form.Trip_LaneCode ?? '').trim() === '' ||
    String(form.FCT_LaneCode ?? '').trim() === '';

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.25)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, minWidth: 480, maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px 0 32px' }}>
          <h2 style={{ fontWeight: 700, fontSize: 24, margin: 0, color: '#22314a', letterSpacing: 0.5 }}>Update FCT Details</h2>
          <button
            style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#888', lineHeight: 1 }}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '16px 32px 32px 32px' }}
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
            <input type="text" value={form.HaulingRate ?? ''} readOnly style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#f5f7fa', color: '#22314a', fontWeight: 600 }} inputMode="numeric" pattern="[0-9]*" autoComplete="off" />
          </div>
          <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, color: '#22314a' }}>Fuel Budget</label>
              <input type="number" value={form.ApprovedFuelBudget ?? ''} onChange={handleNumberChange('ApprovedFuelBudget')} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }} autoComplete="off" />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, color: '#22314a' }}>Trip lane code</label>
              <input type="text" value={form.Trip_LaneCode ?? ''} onChange={handleChange('Trip_LaneCode')} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }} autoComplete="off" />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontWeight: 500, marginBottom: 4, color: '#22314a' }}>FCT lane code</label>
              <input type="text" value={form.FCT_LaneCode ?? ''} onChange={handleChange('FCT_LaneCode')} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff', color: '#22314a', fontWeight: 600 }} autoComplete="off" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 600, cursor: 'pointer', fontSize: 16 }} onClick={onClose}>Cancel</button>
            <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 32px', fontWeight: 600, fontSize: 16, cursor: isCommitDisabled ? 'not-allowed' : 'pointer', opacity: isCommitDisabled ? 0.6 : 1 }} disabled={isCommitDisabled}>Commit Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useBadgeCounts } from "../AppBadgeContext";
import DashboardHeader from "../components/DashboardHeader";
import { Source_Desti_MatrixService } from "../generated/services/Source_Desti_MatrixService";
import type { Source_Desti_Matrix } from "../generated/models/Source_Desti_MatrixModel";
import "./FCTDetails.css";

interface FCTDetailsProps {
  unregisterCount?: number;
  tripCount?: number;
  fctCount?: number;
}

const FCTDetails: React.FC<FCTDetailsProps> = ({ unregisterCount = 0, tripCount = 0, fctCount = 0 }) => {
  const { refreshCounts } = useBadgeCounts();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("FCT");
  const navigate = useNavigate();
  const username = "Bongolo";
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Source_Desti_Matrix[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Source_Desti_Matrix | null>(null);
  // Commit update
  const handleCommit = async (form: Partial<Source_Desti_Matrix>) => {
    if (!selectedRow || !selectedRow.ID) return;
    setLoading(true);
    const changedFields: Partial<Source_Desti_Matrix> = {
      ApprovedFuelBudget: form.ApprovedFuelBudget ? Number(form.ApprovedFuelBudget) : undefined,
      Trip_LaneCode: form.Trip_LaneCode ?? undefined,
      FCT_LaneCode: form.FCT_LaneCode ?? undefined,
    };
    await Source_Desti_MatrixService.update(String(selectedRow.ID), changedFields);
    setModalOpen(false);
    setSelectedRow(null);
    // Refresh data and badge
    Source_Desti_MatrixService.getAll().then(res => {
      const data = res.data || [];
      setRows((data as Source_Desti_Matrix[]).filter((row: Source_Desti_Matrix) =>
        !row.ApprovedFuelBudget || !row.Trip_LaneCode || !row.FCT_LaneCode
      ));
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

  // Fetch data
  const { refreshFlag } = useRefresh();
  useEffect(() => {
    setLoading(true);
    Source_Desti_MatrixService.getAll().then(res => {
      const data = res.data || [];
      // Filter: show only rows where Fuel Budget, Trip lane code, or FCT lane code are empty
      setRows((data as Source_Desti_Matrix[]).filter((row: Source_Desti_Matrix) =>
        !row.ApprovedFuelBudget || !row.Trip_LaneCode || !row.FCT_LaneCode
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

  // Helper to render page numbers
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
            background: page === i ? '#1976d2' : '#fff',
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

  return (
    <div style={{ display: "flex" }}>
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
          title="FCT DETAILS"
          username={username}
          search={search}
          onSearchChange={handleSearchChange}
        />
        <main className="dashboard-content">
          {loading ? (
            <p style={{ marginLeft: 24 }}>Loading...</p>
          ) : rows.length === 0 ? (
            <p style={{ marginLeft: 24, color: '#e11d48' }}>No incomplete FCT details found or failed to load data.</p>
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
                      <th>Fuel Budget</th>
                      <th>Trip lane code</th>
                      <th>FCT lane code</th>
                      <th>Actions</th>
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
                        <td>{row.ApprovedFuelBudget ?? ''}</td>
                        <td>{row.Trip_LaneCode ?? ''}</td>
                        <td>{row.FCT_LaneCode ?? ''}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="usd-add-btn"
                            style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 22px', cursor: 'pointer', fontWeight: 500, minWidth: 70, whiteSpace: 'nowrap' }}
                            onClick={() => { setSelectedRow(row); setModalOpen(true); }}
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
          <UpdateFCTModal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedRow(null); }} onCommit={handleCommit} row={selectedRow} />
        </main>
      </div>
    </div>
  );
};

export default FCTDetails;
