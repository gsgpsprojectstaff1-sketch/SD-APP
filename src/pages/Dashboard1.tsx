  
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../src/components/Sidebar";
import DashboardHeader from "../../src/components/DashboardHeader.tsx";
import TripForm, { type Entry } from "../../src/components/TripForm.tsx";

import TripTable from "../../src/components/TripTable.tsx";
import { Truck, MapPin, Route, TrendingUp } from "lucide-react";
import { SDSourceService } from "../generated/services/SDSourceService";
import { SDDestinationService } from "../generated/services/SDDestinationService";
import type { SDSource } from "../generated/models/SDSourceModel";
import type { SDDestination } from "../generated/models/SDDestinationModel";
import "./Dashboard.css";

const emptyForm: Entry = {
  source: "", destination: "", fuel: "", lane: "",
  index: "", km: "", hauling: "", driver: "", helper: "",
};

const Dashboard1 = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("trips");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState<Entry>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const [username, setUsername] = useState<string>("Admin");
  const [sourceOptions, setSourceOptions] = useState<{ value: string; label: string }[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<{ value: string; label: string }[]>([]);
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

    const fetchDropdowns = async () => {
      try {
        const sourceResult = await SDSourceService.getAll();
        if (sourceResult.success && sourceResult.data) {
          const unique = [
            ...new Set(
              sourceResult.data
                .filter((r: SDSource) => r.U_Active === "Y" && r.Name)
                .map((r: SDSource) => r.Name!)
            ),
          ];
          setSourceOptions(unique.map((s) => ({ value: s, label: s })));
        }

        const destResult = await SDDestinationService.getAll();
        if (destResult.success && destResult.data) {
          const unique = [
            ...new Set(
              destResult.data
                .filter((r: SDDestination) => r.U_Active === "Y" && r.Name)
                .map((r: SDDestination) => r.Name!)
            ),
          ];
          setDestinationOptions(unique.map((d) => ({ value: d, label: d })));
        }
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      }
    };

    fetchDropdowns();

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
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleChange = (field: keyof Entry, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCommit = () => {
    if (!form.source || !form.destination) return;
    setEntries((prev) => [...prev, form]);
    setForm(emptyForm);
    setShowForm(false);
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

  return (
    <div className="dashboard-container">
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} onLogout={handleLogout} isOpen={sidebarOpen} />
      <div className={`dashboard-main ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
        <div className="mobile-menu-bar">
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            ☰
          </button>
        </div>
        <DashboardHeader
          title="Trips Routes & Cost"
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
              sourceOptions={sourceOptions}
              destinationOptions={destinationOptions}
              onCancel={() => setShowForm(false)}
            />
          )}
          {/* Filter entries by search */}
          <TripTable
            entries={entries.filter((entry) =>
              Object.values(entry).some(val =>
                val && val.toLowerCase().includes(search.toLowerCase())
              )
            )}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard1;