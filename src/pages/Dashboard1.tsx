import { useState, useEffect } from "react";
import { useRefresh } from "../RefreshContext";
import { useBadgeCounts } from "../AppBadgeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../src/components/Sidebar";
import DashboardHeader from "../../src/components/DashboardHeader.tsx";
import { type Entry } from "../../src/components/TripForm.tsx";
import TripTable from "../../src/components/TripTable.tsx";
import ConfirmDialog from "../../src/components/ConfirmDialog";
import { Truck, MapPin, Route, TrendingUp } from "lucide-react";
import { Source_Desti_MatrixService } from "../generated/services/Source_Desti_MatrixService";
import "./Dashboard1.css";





const Dashboard1 = ({ unregisterCount, tripCount, fctCount }: { unregisterCount: number, tripCount: number, fctCount: number }) => {
  const [entries, setEntries] = useState<Entry[]>([]);


  const [search, setSearch] = useState("");
  const [popup, setPopup] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<any>(null);


  // Delete handler for TripTable
  const handleDelete = (entry: any) => {
    setEntryToDelete(entry);
    setConfirmOpen(true);
  };

  const { triggerRefresh } = useRefresh();
  const { refreshCounts } = useBadgeCounts();
  const handleConfirmDelete = async () => {
    if (!entryToDelete || typeof entryToDelete.ID !== 'number') {
      toast.error('Cannot delete: missing record ID.');
      setConfirmOpen(false);
      return;
    }
    // Close modal immediately for better UX
    setConfirmOpen(false);
    setEntryToDelete(null);
    try {
      await Source_Desti_MatrixService.delete(entryToDelete.ID);
      setEntries((prev: any[]) => prev.filter((e) => e.ID !== entryToDelete.ID));
      toast.success('Record deleted successfully.');
      triggerRefresh(); // Notify other components to refresh
      await refreshCounts(); // Update badges
    } catch (err) {
      toast.error('Error deleting record.');
      console.error('Delete error:', err);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setEntryToDelete(null);
    toast.info('Delete cancelled.');
  };

  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("trips");

  // Custom handler to navigate when Trips is clicked
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
  // ...existing code...
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const [username, setUsername] = useState<string>("Admin");
  // Removed sourceOptions and destinationOptions state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);


  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const fullName = [parsedUser?.FirstName, parsedUser?.LastName]
          .filter((part: string | undefined) => !!part)
          .join(" ");

        if (fullName) {
          setUsername(fullName);
        } else if (parsedUser?.UserName) {
          setUsername(parsedUser.UserName);
        }
      } catch (err) {
        console.error("Invalid user data in storage", err);
      }
    }

    // Auto-show sidebar on desktop/fullscreen
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    // Set initial sidebar state based on screen size
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }


    // Load SAP Trip Records table on initial page load
    handleRefresh();
    // refreshBadgeCounts();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);





  const stats = [
    { label: "Total Trips", value: entries.length, icon: Route },
    { label: "Active Sources", value: new Set(entries.map((e) => e.source)).size, icon: MapPin },
    { label: "Destinations", value: new Set(entries.map((e) => e.destination)).size, icon: Truck },
    { label: "Total KM", value: entries.reduce((sum, e) => sum + (parseFloat(e.km) || 0), 0).toFixed(0), icon: TrendingUp },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Refresh SAP Trip Records from SQL
  const handleRefresh = async () => {
    const response = await Source_Desti_MatrixService.getAll();
    if (response.success && response.data) {
      setEntries(response.data.map((rec: any) => ({
        ID: rec.ID, // Ensure ID is included for deletion
        source: rec.SourceName || '',
        destination: rec.DestinationName || '',
        fuel: rec.ApprovedFuelBudget ? String(rec.ApprovedFuelBudget) : '',
        tripLane: rec.Trip_LaneCode || '',
        fctLane: rec.FCT_LaneCode || '',
        index: rec.TripIndex ? String(rec.TripIndex) : '',
        km: rec.TripKM ? String(rec.TripKM) : '',
        hauling: rec.HaulingRate ? String(rec.HaulingRate) : '',
        driver: rec.DriverRate ? String(rec.DriverRate) : '',
        helper: rec.HelperRate ? String(rec.HelperRate) : '',
        orderEntry: '',
      })));
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="dashboard-container">
      {/* Popup Modal */}
      {popup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            padding: '2rem 2.5rem',
            borderRadius: 12,
            boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
            minWidth: 320,
            textAlign: 'center',
            fontSize: '1.1rem',
            fontWeight: 500,
          }}>
            <div style={{ marginBottom: 18 }}>{popup}</div>
            <button
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '0.5rem 1.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={() => setPopup(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} aria-hidden="true" />
      )}
      <Sidebar activeItem={activeItem} onItemClick={handleSidebarItemClick} onLogout={handleLogout} isOpen={sidebarOpen} onClose={toggleSidebar} unregisterCount={unregisterCount} tripCount={tripCount} fctCount={fctCount} />
      <div className={`dashboard-main ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
        <div className={`mobile-menu-bar${sidebarOpen ? " mobile-menu-bar--hidden" : ""}`}>
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            ☰
          </button>
        </div>
        <DashboardHeader
          title="SD DASHBOARD"
          username={username}
          search={search}
          onSearchChange={handleSearchChange}
        />
        <main className="dashboard-content">
          <div className="stats-grid">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="stat-card">
                  <div className="stat-icon">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="stat-value">{stat.value}</p>
                    <p className="stat-label">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filter entries by search */}
          <TripTable
            entries={entries.filter((entry) =>
              Object.values(entry).some(val =>
                typeof val === 'string' && val.toLowerCase().includes(search.toLowerCase())
              )
            )}
            onDelete={handleDelete}
          />
          <ConfirmDialog
            open={confirmOpen}
            title="Confirm Delete"
            message="Are you sure you want to delete this trip record?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </main>
      </div>
    </div>
    </>
  );
};

export default Dashboard1;