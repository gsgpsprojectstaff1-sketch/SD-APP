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
import { Truck, MapPin, Route} from "lucide-react";
import { Source_Desti_MatrixService } from "../generated/services/Source_Desti_MatrixService";
import { createManilaTimestampValue } from "../lib/utils";
import "./Dashboard1.css";

const getUpdatedDashboardFields = (previousEntry: Entry, nextEntry: Entry) => {
  const fields: string[] = [];

  if ((previousEntry.fuel ?? "") !== (nextEntry.fuel ?? "")) fields.push("ApprovedFuelBudget");
  if ((previousEntry.tripLane ?? "") !== (nextEntry.tripLane ?? "")) fields.push("Trip_LaneCode");
  if ((previousEntry.fctLane ?? "") !== (nextEntry.fctLane ?? "")) fields.push("FCT_LaneCode");
  if ((previousEntry.index ?? "") !== (nextEntry.index ?? "")) fields.push("TripIndex");
  if ((previousEntry.km ?? "") !== (nextEntry.km ?? "")) fields.push("TripKM");
  if ((previousEntry.hauling ?? "") !== (nextEntry.hauling ?? "")) fields.push("HaulingRate");
  if ((previousEntry.driver ?? "") !== (nextEntry.driver ?? "")) fields.push("DriverRate");
  if ((previousEntry.helper ?? "") !== (nextEntry.helper ?? "")) fields.push("HelperRate");

  return fields;
};





const Dashboard1 = ({ unregisterCount, tripCount, fctCount }: { unregisterCount: number, tripCount: number, fctCount: number }) => {
  const [entries, setEntries] = useState<Entry[]>([]);


  const [search, setSearch] = useState("");
  const [popup, setPopup] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);


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
      triggerRefresh({
        source: 'dashboard1',
        entity: 'Source_Desti_Matrix',
        action: 'deleted',
        recordId: entryToDelete.ID,
        message: `SAP Trip Table deleted a row for ${entryToDelete.source || 'the selected source'} to ${entryToDelete.destination || 'destination'}.`,
      });
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

  const handleOpenUpdate = (entry: Entry) => {
    setEditEntry({ ...entry });
    setEditOpen(true);
  };

  const closeUpdateModal = () => {
    setEditOpen(false);
    setEditEntry(null);
  };

  const handleNumberEditChange = (field: "index" | "km" | "hauling" | "driver" | "helper") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setEditEntry((prev) => (prev ? { ...prev, [field]: value } : prev));
    }
  };

  const handleFuelEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setEditEntry((prev) => (prev ? { ...prev, fuel: value } : prev));
    }
  };

  const handleTextEditChange = (field: "tripLane" | "fctLane") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditEntry((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveUpdate = async () => {
    if (!editEntry || typeof editEntry.ID !== "number") {
      toast.error("Cannot update: missing record ID.");
      return;
    }

    const previousEntry = entries.find((entry) => entry.ID === editEntry.ID);

    const toNumberOrUndefined = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      const parsed = Number(trimmed);
      return Number.isNaN(parsed) ? undefined : parsed;
    };

    const changedFields = {
      ApprovedFuelBudget: toNumberOrUndefined(editEntry.fuel),
      Trip_LaneCode: editEntry.tripLane || undefined,
      FCT_LaneCode: editEntry.fctLane || undefined,
      TripIndex: toNumberOrUndefined(editEntry.index),
      TripKM: toNumberOrUndefined(editEntry.km),
      HaulingRate: toNumberOrUndefined(editEntry.hauling),
      DriverRate: toNumberOrUndefined(editEntry.driver),
      HelperRate: toNumberOrUndefined(editEntry.helper),
      TripNeedsReview: previousEntry && previousEntry.hauling !== editEntry.hauling ? "1" : undefined,
      FCTNeedsReview: previousEntry && previousEntry.hauling !== editEntry.hauling ? "1" : undefined,
      ModifiedTime: createManilaTimestampValue(),
      ModifiedBy: username?.trim() || "Unknown User",
    };

    try {
      await Source_Desti_MatrixService.update(String(editEntry.ID), changedFields);
      closeUpdateModal();
      await handleRefresh();
      const changedFieldNames = previousEntry ? getUpdatedDashboardFields(previousEntry, editEntry) : [];
      triggerRefresh({
        source: 'dashboard1',
        entity: 'Source_Desti_Matrix',
        action: 'updated',
        recordId: editEntry.ID,
        fields: changedFieldNames,
        message: changedFieldNames.includes('HaulingRate')
          ? `SAP Trip Table updated the Hauling Rate for ${editEntry.source} to ${editEntry.destination}.`
          : `SAP Trip Table updated ${editEntry.source} to ${editEntry.destination}.`,
      });
      await refreshCounts();
      toast.success("Record updated successfully.");
    } catch (err) {
      toast.error("Error updating record.");
      console.error("Update error:", err);
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
    { label: "Trips", value: entries.length, icon: Route },
    { label: "Sources", value: new Set(entries.map((e) => e.source)).size, icon: MapPin },
    { label: "Destinations", value: new Set(entries.map((e) => e.destination)).size, icon: Truck },
    /*{ label: "Total KM", value: entries.reduce((sum, e) => sum + (parseFloat(e.km) || 0), 0).toFixed(0), icon: TrendingUp },*/
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Refresh SAP Trip Records from SQL
  const handleRefresh = async () => {
    const response = await Source_Desti_MatrixService.getAll({ top: 2000, maxPageSize: 2000 });
    if (response.success && response.data) {
      // Log all raw CreatedTimeStamp values for debugging
      console.log('Raw CreatedTimeStamp values:', response.data.map((rec: any) => rec.CreatedTimeStamp));
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
        ltDriverRate: rec.LTDriverRate ? String(rec.LTDriverRate) : '',
        ltHelperRate: rec.LTHelperRate ? String(rec.LTHelperRate) : '',
        tonnerDriverRate: rec.TonnerDriverRate ? String(rec.TonnerDriverRate) : '',
        tonnerHelperRate: rec.TonnerHelperRate ? String(rec.TonnerHelperRate) : '',
        stDriverRate: rec.STDriverRate ? String(rec.STDriverRate) : '',
        stHelperRate: rec.STHelperRate ? String(rec.STHelperRate) : '',
        tripCount: rec.TripCount ? String(rec.TripCount) : '',
        modifiedBy: rec.ModifiedBy || '',
        modifiedTime: rec.ModifiedTime ? String(rec.ModifiedTime) : '',
        fctApprovedBy: rec.FCTApprovedBy || '',
        fctApprovedTimeStamp: rec.FCTApprovedTimeStamp ? String(rec.FCTApprovedTimeStamp) : '',
        createdBy: rec.CreatedBy || '',
        orderEntry: '',
        createdtimestamp: rec.CreatedTimeStamp? String(rec.CreatedTimeStamp): '',
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
                  <div className="stat-copy">
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
            onUpdate={handleOpenUpdate}
            onDelete={handleDelete}
          />
          {editOpen && editEntry && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.25)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  minWidth: 480,
                  maxWidth: "95vw",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  padding: 0,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px 0 32px" }}>
                  <h2 style={{ fontWeight: 700, fontSize: 24, margin: 0, color: "#22314a", letterSpacing: 0.5 }}>Update Trip Record</h2>
                  <button
                    style={{ background: "none", border: "none", fontSize: 28, cursor: "pointer", color: "#888", lineHeight: 1 }}
                    onClick={closeUpdateModal}
                    aria-label="Close update modal"
                  >
                    &times;
                  </button>
                </div>

                <form
                  style={{ display: "flex", flexDirection: "column", gap: 0, padding: "16px 32px 32px 32px" }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveUpdate();
                  }}
                >
                  <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ fontWeight: 500, marginBottom: 4, color: "#22314a" }}>Source</label>
                      <input type="text" value={editEntry.source || ""} readOnly style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cfd8dc", background: "#f5f7fa", fontWeight: 600, color: "#22314a" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ fontWeight: 500, marginBottom: 4, color: "#22314a" }}>Destination</label>
                      <input type="text" value={editEntry.destination || ""} readOnly style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cfd8dc", background: "#f5f7fa", fontWeight: 600, color: "#22314a" }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontWeight: 500, marginBottom: 4, color: "#22314a" }}>Hauling Rate</label>
                    <input
                      type="text"
                      value={editEntry.hauling || ""}
                      onChange={handleNumberEditChange("hauling")}
                      style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cfd8dc", background: "#fff", color: "#22314a", fontWeight: 600 }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                    />
                  </div>
                  <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ fontWeight: 500, marginBottom: 4, color: "#22314a" }}>Fuel Budget</label>
                      <input
                        type="text"
                        value={editEntry.fuel || ""}
                        onChange={handleFuelEditChange}
                        style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cfd8dc", background: "#fff", color: "#22314a", fontWeight: 600 }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ fontWeight: 500, marginBottom: 4, color: "#22314a" }}>Trip Lane Code</label>
                      <input
                        type="text"
                        value={editEntry.tripLane || ""}
                        onChange={handleTextEditChange("tripLane")}
                        style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cfd8dc", background: "#fff", color: "#22314a", fontWeight: 600 }}
                        autoComplete="off"
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ fontWeight: 500, marginBottom: 4, color: "#22314a" }}>FCT Lane Code</label>
                      <input
                        type="text"
                        value={editEntry.fctLane || ""}
                        onChange={handleTextEditChange("fctLane")}
                        style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cfd8dc", background: "#fff", color: "#22314a", fontWeight: 600 }}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ fontWeight: 500, marginBottom: 4, color: "#22314a" }}>Trip Index</label>
                      <input
                        type="text"
                        value={editEntry.index || ""}
                        onChange={handleNumberEditChange("index")}
                        style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cfd8dc", background: "#fff", color: "#22314a", fontWeight: 600 }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ fontWeight: 500, marginBottom: 4, color: "#22314a" }}>Trip KM</label>
                      <input
                        type="text"
                        value={editEntry.km || ""}
                        onChange={handleNumberEditChange("km")}
                        style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cfd8dc", background: "#fff", color: "#22314a", fontWeight: 600 }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 18, marginBottom: 18 }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ fontWeight: 500, marginBottom: 4, color: "#22314a" }}>Driver Rate</label>
                      <input
                        type="text"
                        value={editEntry.driver || ""}
                        onChange={handleNumberEditChange("driver")}
                        style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cfd8dc", background: "#fff", color: "#22314a", fontWeight: 600 }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label style={{ fontWeight: 500, marginBottom: 4, color: "#22314a" }}>Helper Rate</label>
                      <input
                        type="text"
                        value={editEntry.helper || ""}
                        onChange={handleNumberEditChange("helper")}
                        style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #cfd8dc", background: "#fff", color: "#22314a", fontWeight: 600 }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                    <button
                      type="button"
                      style={{ background: "#e11d48", color: "#fff", border: "none", borderRadius: 6, padding: "10px 32px", fontWeight: 600, cursor: "pointer", fontSize: 16 }}
                      onClick={closeUpdateModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        background: "#1976d2",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "10px 32px",
                        fontWeight: 600,
                        fontSize: 16,
                        cursor: editEntry.index?.trim() && editEntry.km?.trim() && editEntry.driver?.trim() && editEntry.helper?.trim() ? "pointer" : "not-allowed",
                        opacity: editEntry.index?.trim() && editEntry.km?.trim() && editEntry.driver?.trim() && editEntry.helper?.trim() ? 1 : 0.6,
                      }}
                      disabled={!(editEntry.index?.trim() && editEntry.km?.trim() && editEntry.driver?.trim() && editEntry.helper?.trim())}
                    >
                      Save Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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