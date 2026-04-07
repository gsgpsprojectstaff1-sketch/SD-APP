import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../src/components/Sidebar";
// Removed duplicate imports for LiveDMSView_CEMService and Source_Desti_MatrixService
import DashboardHeader from "../../src/components/DashboardHeader.tsx";
import TripForm, { type Entry } from "../../src/components/TripForm.tsx";
import TripTable from "../../src/components/TripTable.tsx";
import ConfirmDialog from "../../src/components/ConfirmDialog";
import { Truck, MapPin, Route, TrendingUp } from "lucide-react";
import { LiveDMSView_CEMService } from "../generated/services/LiveDMSView_CEMService";
import { Source_Desti_MatrixService } from "../generated/services/Source_Desti_MatrixService";
import "./Dashboard.css";

const emptyForm: Entry = {
  orderEntry: "",
  source: "", destination: "", fuel: "", tripLane: "", fctLane: "",
  index: "", km: "", hauling: "", driver: "", helper: "",
};



const Dashboard1 = () => {
  // State for unregister count
  const [unregisterCount, setUnregisterCount] = useState<number>(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState<Entry>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [popup, setPopup] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<any>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Delete handler for TripTable
  const handleDelete = (entry: any) => {
    setEntryToDelete(entry);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete || typeof entryToDelete.ID !== 'number') {
      toast.error('Cannot delete: missing record ID.');
      setConfirmOpen(false);
      return;
    }
    try {
      await Source_Desti_MatrixService.delete(entryToDelete.ID);
      setEntries((prev: any[]) => prev.filter((e) => e.ID !== entryToDelete.ID));
      toast.success('Record deleted successfully.');
    } catch (err) {
      toast.error('Error deleting record.');
      console.error('Delete error:', err);
    }
    setConfirmOpen(false);
    setEntryToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setEntryToDelete(null);
    toast.info('Delete cancelled.');
  };

  // Load unregister count
  const loadUnregisterCount = async () => {
    try {
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
        let count = 0;
        for (const trip of tripRes.data) {
          const src = trip.Source?.trim() || "";
          const dst = trip.Destination?.trim() || "";
          if (!src || !dst) continue;
          const key = `${src.toLowerCase()}|${dst.toLowerCase()}`;
          if (!uniquePairs.has(key)) {
            uniquePairs.add(key);
            if (!registeredSet.has(key)) {
              count++;
            }
          }
        }
        setUnregisterCount(count);
      } else {
        setUnregisterCount(0);
      }
    } catch (err) {
      setUnregisterCount(0);
    }
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
    loadUnregisterCount();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleChange = (field: keyof Entry, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  } 

  const handleCommit = async () => {
    // Check all required fields
    const requiredFields = [
      form.source,
      form.destination,
      form.fuel,
      form.tripLane,
      form.fctLane,
      form.index,
      form.km,
      form.hauling,
      form.driver,
      form.helper
    ];
    if (requiredFields.some(f => !f || f.trim() === "")) {
      setPopup("Please fill out all fields from Source to Helper Rate before submitting.");
      return;
    }

    // Check if source and destination already exist in SAP Trip Records
    const duplicate = entries.some(
      (e) =>
        e.source.trim().toLowerCase() === form.source.trim().toLowerCase() &&
        e.destination.trim().toLowerCase() === form.destination.trim().toLowerCase()
    );
    if (duplicate) {
      setPopup("Source and destination already in the SAP TRIP RECORDS.");
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
    };
    try {
      await Source_Desti_MatrixService.create(newRecord);
      // Refresh table after create
      const response = await Source_Desti_MatrixService.getAll();
      if (response.success && response.data) {
        setEntries(response.data.map((rec: any) => ({
          ID: rec.ID, // Include the ID property for TripTable selection/delete
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
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setPopup('Error saving record.');
      console.error('Create error:', err);
    }
  };

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
      <Sidebar activeItem={activeItem} onItemClick={handleSidebarItemClick} onLogout={handleLogout} isOpen={sidebarOpen} onClose={toggleSidebar} unregisterCount={unregisterCount} />
      <div className={`dashboard-main ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
        <div className={`mobile-menu-bar${sidebarOpen ? " mobile-menu-bar--hidden" : ""}`}>
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            ☰
          </button>
        </div>
        <DashboardHeader
          title="Trips, Routes & Cost"
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

          {/* Add Trip Button */}
          {!showForm && (
            <div style={{ margin: '0.5rem 0 1rem 0', textAlign: 'left' }}>
              <button className="quick-add-btn" onClick={() => setShowForm(true)}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle"><circle cx="9" cy="9" r="8"/><line x1="9" x2="9" y1="6" y2="12"/><line x1="6" x2="12" y1="9" y2="9"/></svg>
                  Add Trip
                </span>
              </button>
            </div>
          )}
          {/* Quick Add Trip Form */}
          {showForm && (
            <TripForm
              form={form}
              onChange={handleChange}
              onCommit={handleCommit}
              lookupLoading={lookupLoading}
              onLookup={async () => {
                if (!form.orderEntry) return;
                setLookupLoading(true);
                try {
                  // Fetch all records with matching OE
                  const response = await LiveDMSView_CEMService.getAll({
                    filter: `OE eq '${form.orderEntry.replace(/'/g, "''")}'`,
                    top: 1
                  });
                  if (response.success && response.data && response.data.length > 0) {
                    const record = response.data[0];
                    setForm((prev) => ({
                      ...prev,
                      source: record.Source || '',
                      destination: record.Destination || ''
                    }));
                  } else {
                    setForm((prev) => ({ ...prev, source: '', destination: '' }));
                    setPopup('No record found for this Order Entry.');
                  }
                } catch (err) {
                  setForm((prev) => ({ ...prev, source: '', destination: '' }));
                  setPopup('Error looking up Order Entry.');
                  console.error('Lookup error:', err);
                } finally {
                  setLookupLoading(false);
                }
              }}
              onCancel={() => {
                setForm(emptyForm);
                setShowForm(false);
              }}
            />
          )}
          {/* Filter entries by search */}
          <TripTable
            entries={entries.filter((entry) =>
              Object.values(entry).some(val =>
                typeof val === 'string' && val.toLowerCase().includes(search.toLowerCase())
              )
            )}
            onRefresh={handleRefresh}
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