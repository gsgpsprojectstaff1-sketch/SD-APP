
import { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import "./UnregisterSourceDestination.css";
import Sidebar from "../components/Sidebar";
import { LiveDMSView_CEMService } from "../generated/services/LiveDMSView_CEMService";
import { Source_Desti_MatrixService } from "../generated/services/Source_Desti_MatrixService";
import { useNavigate } from "react-router-dom";

interface SourceDestPair {
  source: string;
  destination: string;
  OE?: string;
}

const UnregisterSourceDestination = () => {
  const [unregistered, setUnregistered] = useState<SourceDestPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("Unregister-Source-Destination");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  // For demo, static username. Replace with real user if available.
  const username = "Bongolo";
  const navigate = useNavigate();

  const handleSidebarItemClick = (item: string) => {
    setActiveItem(item);
    if (item === "Trips") {
      navigate("/dashboard1");
    } else if (item === "Unregister-Source-Destination") {
      navigate("/unregister-source-destination");
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Parallel fetching
        const [tripRes, matrixRes] = await Promise.all([
          LiveDMSView_CEMService.getAll(),
          Source_Desti_MatrixService.getAll()
        ]);
        if (
          tripRes.success && tripRes.data &&
          matrixRes.success && matrixRes.data
        ) {
          const registeredSet = new Set(
            matrixRes.data.map((rec: any) => `${rec.SourceName?.toLowerCase()}|${rec.DestinationName?.toLowerCase()}`)
          );
          const uniquePairs = new Set<string>();
          const unregisteredPairs: SourceDestPair[] = [];
          for (const trip of tripRes.data) {
            const src = trip.Source?.trim() || "";
            const dst = trip.Destination?.trim() || "";
            const oe = trip.OE || "";
            if (!src || !dst) continue;
            const key = `${src.toLowerCase()}|${dst.toLowerCase()}`;
            if (!uniquePairs.has(key)) {
              uniquePairs.add(key);
              if (!registeredSet.has(key)) {
                unregisteredPairs.push({ source: src, destination: dst, OE: oe });
              }
            }
          }
          if (isMounted) setUnregistered(unregisteredPairs);
        } else {
          // API error
          if (isMounted) setUnregistered([]);
        }
      } catch (err) {
        // Network or unexpected error
        if (isMounted) setUnregistered([]);
        console.error("Failed to fetch data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Pagination logic
  const totalPages = Math.ceil(unregistered.length / pageSize);
  const filtered = unregistered.filter(
    (pair) =>
      pair.source.toLowerCase().includes(search.toLowerCase()) ||
      pair.destination.toLowerCase().includes(search.toLowerCase())
  );
  const pagedData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const filteredTotalPages = Math.ceil(filtered.length / pageSize);

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

  return (
    <div className="usd-container">
      <Sidebar
        activeItem={activeItem}
        onItemClick={handleSidebarItemClick}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unregisterCount={unregistered.length}
      />
      <div className={`usd-main ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
        <main className="dashboard-content">
          <header className="dashboard-header" style={{marginBottom: 12}}>
            <h1 className="dashboard-title" style={{fontSize: '1.15rem', fontWeight: 600, color: '#22314a', letterSpacing: 0.5, margin: 0}}>Unregister SD</h1>
            <div className="dashboard-header-right">
              <div className="dashboard-search-wrapper">
                <Search size={16} className="dashboard-search-icon" />
                <input
                  type="text"
                  placeholder="Search source or destination..."
                  className="dashboard-search"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <button className="icon-button" title="Notifications">
                <Bell size={18} />
              </button>
              <div className="user-chip">
                <div className="user-avatar">{username[0].toUpperCase()}</div>
                <span>{username}</span>
              </div>
            </div>
          </header>
          {loading ? (
            <p style={{ marginLeft: 24 }}>Loading...</p>
          ) : unregistered.length === 0 ? (
            <p style={{ marginLeft: 24, color: '#e11d48' }}>No unregistered source-destination pairs found or failed to load data.</p>
          ) : (
            <div className="usd-table-card">
              <div className="usd-table-scroll">
                <table className="usd-table">
                  <thead>
                    <tr>
                      <th style={{ width: 48, textAlign: 'center', border: 'none' }}>#</th>
                      <th>OE</th>
                      <th>Source</th>
                      <th>Destination</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedData.map((pair, idx) => {
                      const uniqueKey = `${pair.source}|${pair.destination}|${pair.OE ?? ''}`;
                      return (
                        <tr key={uniqueKey}>
                          <td style={{ textAlign: 'center', fontWeight: 500, border: 'none' }}>
                            {((page - 1) * pageSize) + idx + 1}
                          </td>
                          <td title={pair.OE}>{pair.OE || ''}</td>
                          <td title={pair.source}>{pair.source}</td>
                          <td title={pair.destination}>{pair.destination}</td>
                        </tr>
                      );
                    })}
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
          )}
        </main>
      </div>
    </div>
  );
};

export default UnregisterSourceDestination;
