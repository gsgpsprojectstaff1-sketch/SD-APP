import React, { useState, useEffect } from "react";
import { PlusCircle, Truck, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { SDSourceService } from "../generated/services/SDSourceService";
import { SDDestinationService } from "../generated/services/SDDestinationService";
import type { SDSource } from "../generated/models/SDSourceModel";
import type { SDDestination } from "../generated/models/SDDestinationModel";
import Select from "react-select";

type Entry = {
  source: string;
  destination: string;
  fuel: string;
  lane: string;
  index: string;
  km: string;
  hauling: string;
  driver: string;
  helper: string;
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

  const [sourceOptions, setSourceOptions] = useState<{ value: string; label: string }[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<{ value: string; label: string }[]>([]);

  const navigate = useNavigate();

  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      width: "100%",
      backgroundColor: "#ffffff",
      borderColor: state.isFocused ? "#38bdf8" : "#334155",
      borderRadius: "10px",
      minHeight: "40px",
      boxShadow: state.isFocused ? "0 0 6px #38bdf8" : "none",
      "&:hover": { borderColor: "#38bdf8" },
      marginBottom: "12px",
    }),
  };

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user) {
          navigate("/login");
          return;
        } else {
          setUsername(user.UserName);
        }

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
        console.error(err);
      }
    };

    fetchDropdowns();
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
    <div className="app-body">
      <div className="dashboard-container">

        {/* NAVBAR */}
        <div className="dashboard-navbar">
          <div className="brand">
            <Truck size={24} />
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
          <h1>Trips Routes and Cost</h1>
          <div className="records-count">{entries.length} Records</div>
        </div>

        {/* MAIN */}
        <div className="dashboard-main">

          {/* FORM */}
          <div className="dashboard-form">
            <h3>QUICK ADD</h3>

            <div className="form-fields">
              {fieldOrder.map((key) => {
                if (key === "source") {
                  return (
                    <Select
                      key={key}
                      styles={selectStyles}
                      options={sourceOptions}
                      value={sourceOptions.find((o) => o.value === form.source) || null}
                      onChange={(val) => handleChange("source", val?.value ?? "")}
                      placeholder="Source..."
                      isSearchable
                      isClearable
                    />
                  );
                }

                if (key === "destination") {
                  return (
                    <Select
                      key={key}
                      styles={selectStyles}
                      options={destinationOptions}
                      value={destinationOptions.find((o) => o.value === form.destination) || null}
                      onChange={(val) => handleChange("destination", val?.value ?? "")}
                      placeholder="Destination..."
                      isSearchable
                      isClearable
                    />
                  );
                }

                return (
                  <input
                    key={key}
                    className="form-input"
                    placeholder={fieldLabels[key]}
                    value={form[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                );
              })}

              <button className="commit-btn" onClick={handleCommit}>
                <PlusCircle size={16} /> Commit Entry
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="dashboard-table">
            <h3>SAP TRIP RECORDS</h3>

            <div className="table-scroll-container">
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
                          <td key={key}>{e[key]}</td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;