


// import React, { useState, useEffect } from "react";
// import { PlusCircle, Truck, LogOut, User } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import "./Dashboard.css";
// import { SDSourceService } from "../generated/services/SDSourceService";
// import { SDDestinationService } from "../generated/services/SDDestinationService";
// import type { SDSource } from "../generated/models/SDSourceModel";
// import type { SDDestination } from "../generated/models/SDDestinationModel";

// type Entry = {
//   source: string;
//   destination: string;
//   fuel: string;       
//   lane: string;       
//   index: string;      
//   km: string;         
//   hauling: string;    
//   driver: string;     
//   helper: string;     
// };

// const Dashboard: React.FC = () => {
//   const [entries, setEntries] = useState<Entry[]>([]);
//   const [username, setUsername] = useState<string>("");

//   const [form, setForm] = useState<Entry>({
//     source: "",
//     destination: "",
//     fuel: "",
//     lane: "",
//     index: "",
//     km: "",
//     hauling: "",
//     driver: "",
//     helper: "",
//   });

//   const [sourceOptions, setSourceOptions] = useState<string[]>([]);
//   const [destinationOptions, setDestinationOptions] = useState<string[]>([]);

//   const navigate = useNavigate();

//   // Check login and fetch dropdown options
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user") || "null");
//     if (!user) {
//       navigate("/login");
//     } else {
//       setUsername(user.UserName);
//     }

//     async function loadMyData() {
//       try {
//         const result = await SDSourceService.getAll();
//         if (result.success) {
//             console.log(result.data); // Now you have your table!
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     };
//     loadMyData();


//     // Fetch sources
//     // Sources
//     // Fetch sources with U_Active === 'Y'
//       SDSourceService.getAll()
//         .then((res) => {
//           console.log("Sources fetched: ", res);
//           const records = res as unknown as SDSource[];
//           const activeSources = records
//             .filter((r) => r.U_Active === "Y")  // filter active only
//             .map((r) => r.Name)                 // use Name for dropdown
//             .filter((n): n is string => !!n);   // remove undefined/null
//           setSourceOptions(activeSources);
//       })
//       .catch((err) => console.error(err));

//     // Destinations
//     SDDestinationService.getAll()
//   .then((res) => {
//     const records = res as unknown as SDDestination[];
//     const activeDestinations = records
//       .filter((r) => r.U_Active === "Y")
//       .map((r) => r.Name)
//       .filter((n): n is string => !!n);
//     setDestinationOptions(activeDestinations);
//   })
//   .catch((err) => console.error(err));
//   }, [navigate]);

//   const logout = () => {
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const handleChange = (field: keyof Entry, value: string) => {
//     setForm({ ...form, [field]: value });
//   };

//   const handleCommit = () => {
//     if (!form.source || !form.destination) return;
//     setEntries([...entries, form]);
//     setForm({
//       source: "",
//       destination: "",
//       fuel: "",
//       lane: "",
//       index: "",
//       km: "",
//       hauling: "",
//       driver: "",
//       helper: "",
//     });
//   };

//   const fieldOrder: (keyof Entry)[] = [
//     "source",
//     "destination",
//     "fuel",
//     "lane",
//     "index",
//     "km",
//     "hauling",
//     "driver",
//     "helper",
//   ];

//   const fieldLabels: Record<keyof Entry, string> = {
//     source: "Source",
//     destination: "Destination",
//     fuel: "Approved Fuel Budget",
//     lane: "Lane Code",
//     index: "Trip Index",
//     km: "Trip KM",
//     hauling: "Hauling Rate",
//     driver: "Driver Rate",
//     helper: "Helper Rate",
//   };

//   return (
//     <div className="dashboard-container">
//       {/* NAVBAR */}
//       <div className="dashboard-navbar">
//         <div className="brand">
//           <Truck size={28} color="#38bdf8" />
//           <h2>SD APP</h2>
//         </div>
//         <div className="user-info">
//           <div className="username">
//             <User size={16} />
//             {username}
//           </div>
//           <button className="logout-btn" onClick={logout}>
//             <LogOut size={16} /> Logout
//           </button>
//         </div>
//       </div>

//       {/* HEADER */}
//       <div className="dashboard-header">
//         <div>
//           <h1>Lane Configuration</h1>
//           <p>Manage logistics routes and cost data</p>
//         </div>
//         <div className="records-count">{entries.length} Records</div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="dashboard-main">
//         {/* FORM */}
//         <div className="dashboard-form">
//           <h3>QUICK ADD</h3>
//           <div className="form-fields">
//             {fieldOrder.map((key) => {
//               if (key === "source") {
//                 return (
//                   <select
//                     key={key}
//                     className="form-input"
//                     value={form.source}
//                     onChange={(e) => handleChange(key, e.target.value)}
//                   >
//                     <option value="">Select Source</option>
//                     {sourceOptions.map((s) => (
//                       <option key={s} value={s}>
//                         {s}
//                       </option>
//                     ))}
//                   </select>
//                 );
//               }

//               if (key === "destination") {
//                 return (
//                   <select
//                     key={key}
//                     className="form-input"
//                     value={form.destination}
//                     onChange={(e) => handleChange(key, e.target.value)}
//                   >
//                     <option value="">Select Destination</option>
//                     {destinationOptions.map((d) => (
//                       <option key={d} value={d}>
//                         {d}
//                       </option>
//                     ))}
//                   </select>
//                 );
//               }

//               // Other fields remain as input
//               return (
//                 <input
//                   key={key}
//                   className="form-input"
//                   placeholder={fieldLabels[key]}
//                   value={form[key]}
//                   onChange={(e) => handleChange(key, e.target.value)}
//                 />
//               );
//             })}
//             <button className="commit-btn" onClick={handleCommit}>
//               <PlusCircle size={18} /> Commit Entry
//             </button>
//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="dashboard-table">
//           <h3>REGISTRY</h3>
//           <table>
//             <thead>
//               <tr>
//                 {fieldOrder.map((key) => (
//                   <th key={key}>{fieldLabels[key]}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {entries.length === 0 ? (
//                 <tr>
//                   <td colSpan={fieldOrder.length} className="no-entries">
//                     No entries yet
//                   </td>
//                 </tr>
//               ) : (
//                 entries.map((e, i) => (
//                   <tr key={i}>
//                     {fieldOrder.map((key) => (
//                       <td
//                         key={key}
//                         className={
//                           key === "fuel"
//                             ? "fuel"
//                             : key === "hauling"
//                             ? "hauling"
//                             : ""
//                         }
//                       >
//                         {e[key]}
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



//Test
import React, { useState, useEffect } from "react";
import { PlusCircle, Truck, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { SDSourceService } from "../generated/services/SDSourceService";
import { SDDestinationService } from "../generated/services/SDDestinationService";
import type { SDSource } from "../generated/models/SDSourceModel";
import type { SDDestination } from "../generated/models/SDDestinationModel";

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

  const [sourceOptions, setSourceOptions] = useState<string[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<string[]>([]);

  const navigate = useNavigate();

  // Check login and fetch dropdown options
  useEffect(() => {
  const fetchDropdowns = async () => {
    try {
      // --- CHECK LOGIN ---
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) {
        navigate("/login");
        return;
      } else {
        setUsername(user.UserName);
      }

      // --- FETCH SOURCES ---
      const sourceResult = await SDSourceService.getAll();
      if (sourceResult.success && sourceResult.data) {
        const activeSources = sourceResult.data
          .filter((r: SDSource) => r.U_Active === "Y" && r.Name)
          .map((r: SDSource) => r.Name!);

        const uniqueSources = [...new Set(activeSources)].sort();
        setSourceOptions(uniqueSources);
        console.log("Sources for dropdown:", uniqueSources);
      }

      // --- FETCH DESTINATIONS ---
      const destResult = await SDDestinationService.getAll();
      if (destResult.success && destResult.data) {
        const activeDestinations = destResult.data
          .filter((r: SDDestination) => r.U_Active === "Y" && r.Name)
          .map((r: SDDestination) => r.Name!);

        const uniqueDestinations = [...new Set(activeDestinations)].sort();
        setDestinationOptions(uniqueDestinations);
        console.log("Destinations for dropdown:", uniqueDestinations);
      }
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
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
            {fieldOrder.map((key) => {
              if (key === "source") {
                return (
                  <select
                    key={key}
                    className="form-input"
                    value={form.source}
                    onChange={(e) => handleChange(key, e.target.value)}
                  >
                    <option value="">Select Source</option>
                    {sourceOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                );
              }

              if (key === "destination") {
                return (
                  <select
                    key={key}
                    className="form-input"
                    value={form.destination}
                    onChange={(e) => handleChange(key, e.target.value)}
                  >
                    <option value="">Select Destination</option>
                    {destinationOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                );
              }

              // Other fields remain as input
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