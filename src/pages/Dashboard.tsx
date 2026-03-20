// function Dashboard() {
//   const user = JSON.parse(localStorage.getItem("user") || "{}");

//   return (
//     <div style={{ padding: "2rem" }}>
//       <h1>Dashboard</h1>
//       <p>Welcome, {user.UserName || "Guest"}!</p>
//     </div>
//   );
// }

// export default Dashboard;

// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { PlusCircle, Truck, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

type Entry = {
  source: string;
  destination: string;
  fuel: string;       // Approved Fuel Budget
  lane: string;       // Lane Code
  index: string;      // Trip Index
  km: string;         // Trip KM
  hauling: string;    // Hauling Rate
  driver: string;     // Driver Rate
  helper: string;     // Helper Rate
};

const Dashboard: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [username, setUsername] = useState<string>("");

  const [form, setForm] = useState<Entry>({
    source: "",
    destination: "",
    fuel: "",
    lane: "",
    index: "",
    km: "",
    hauling: "",
    driver: "",
    helper: "",
  });

  const navigate = useNavigate();

  // Check user login on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      navigate("/login");
    } else {
      setUsername(user.UserName);
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChange = (field: keyof Entry, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleCommit = () => {
    if (!form.source || !form.destination) return;
    setEntries([...entries, form]);
    setForm({
      source: "",
      destination: "",
      fuel: "",
      lane: "",
      index: "",
      km: "",
      hauling: "",
      driver: "",
      helper: "",
    });
  };

  const fieldOrder: (keyof Entry)[] = [
    "source",
    "destination",
    "fuel",
    "lane",
    "index",
    "km",
    "hauling",
    "driver",
    "helper",
  ];

  const fieldLabels: Record<keyof Entry, string> = {
    source: "Source",
    destination: "Destination",
    fuel: "Approved Fuel Budget",
    lane: "Lane Code",
    index: "Trip Index",
    km: "Trip KM",
    hauling: "Hauling Rate",
    driver: "Driver Rate",
    helper: "Helper Rate",
  };

  return (
    <div className="dashboard-container">
      {/* NAVBAR */}
      <div className="dashboard-navbar">
        <div className="brand">
          <Truck size={28} color="#38bdf8" />
          <h2>SD APP</h2>
        </div>
        <div className="user-info">
          <div className="username">
            <User size={16} />
            {username}
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Lane Configuration</h1>
          <p>Manage logistics routes and cost data</p>
        </div>
        <div className="records-count">{entries.length} Records</div>
      </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-main">
        {/* FORM */}
        <div className="dashboard-form">
          <h3>QUICK ADD</h3>
          <div className="form-fields">
            {fieldOrder.map((key) => (
              <input
                key={key}
                className="form-input"
                placeholder={fieldLabels[key]}
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            ))}
            <button className="commit-btn" onClick={handleCommit}>
              <PlusCircle size={18} /> Commit Entry
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="dashboard-table">
          <h3>REGISTRY</h3>
          <table>
            <thead>
              <tr>
                {fieldOrder.map((key) => (
                  <th key={key}>{fieldLabels[key]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={fieldOrder.length} className="no-entries">
                    No entries yet
                  </td>
                </tr>
              ) : (
                entries.map((e, i) => (
                  <tr key={i}>
                    {fieldOrder.map((key) => (
                      <td
                        key={key}
                        className={
                          key === "fuel"
                            ? "fuel"
                            : key === "hauling"
                            ? "hauling"
                            : ""
                        }
                      >
                        {e[key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;