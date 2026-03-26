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
  const [username, setUsername] = useState<string>("Admin");
  const [sourceOptions, setSourceOptions] = useState<{ value: string; label: string }[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.UserName) {
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
  }, []);

  const handleChange = (field: keyof Entry, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCommit = () => {
    if (!form.source || !form.destination) return;
    setEntries((prev) => [...prev, form]);
    setForm(emptyForm);
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
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} onLogout={handleLogout} />
      <div className="dashboard-main">
        <DashboardHeader title="Trips Routes & Cost" username={username} />
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

          <TripForm form={form} onChange={handleChange} onCommit={handleCommit} sourceOptions={sourceOptions} destinationOptions={destinationOptions} />
          <TripTable entries={entries} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard1;