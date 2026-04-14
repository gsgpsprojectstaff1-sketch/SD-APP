import { SquarePen, Trash2 } from "lucide-react";
import React, { useState } from "react";

import "./TripTable.css";
import type { Entry } from "../../src/components/TripForm.tsx";
import { formatStoredTimestamp } from "../lib/utils";

const fieldOrder: (keyof Entry)[] = [
  "ID",
  "source",
  "destination",
  "fuel",
  "tripLane",
  "fctLane",
  "index",
  "km",
  "hauling",
  "dhset",
  "driver",
  "helper",
  "ltDriverRate",
  "ltHelperRate",
  "tonnerDriverRate",
  "tonnerHelperRate",
  "stDriverRate",
  "stHelperRate",
  "tripCount",
  "modifiedBy",
  "modifiedTime",
  "createdBy",
  "createdtimestamp",
];

const fieldLabels: Record<string, string> = {
  ID: "ID",
  createdtimestamp: "Created Timestamp",
  orderEntry: "Order Entry",
  source: "Source",
  destination: "Destination",
  fuel: "Fuel Budget Approved",
  tripLane: "Trip Lane Code",
  fctLane: "FCT lane code",
  index: "Trip Index",
  km: "Trip KM",
  hauling: "Hauling Rate",
  dhset: "D Set",
  driver: "Driver Rate",
  helper: "helper Rate",
  ltDriverRate: "LT Driver Rate",
  ltHelperRate: "LT Helper Rate",
  tonnerDriverRate: "Tonner Driver Rate",
  tonnerHelperRate: "Tonner Helper Rate",
  stDriverRate: "ST Driver Rate",
  stHelperRate: "ST Helper Rate",
  tripCount: "Trip Count",
  modifiedBy: "Modified By",
  modifiedTime: "Modified Time",
  createdBy: "Created By",
};

interface TripTableProps {
  entries: Entry[];
  onUpdate?: (entry: Entry) => void;
  onDelete?: (entry: Entry) => void;
}

const TripTable = ({ entries, onUpdate, onDelete }: TripTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const totalPages = Math.ceil(entries.length / perPage) || 1;

  const pagedEntries = entries.slice((currentPage - 1) * perPage, currentPage * perPage);
  const visibleRows = pagedEntries.length;

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const changePerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    } else if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  const formatCreatedTimestamp = (value: string) => {
    return formatStoredTimestamp(value);
  };

  return (
    <section className="trip-table-card">
      <div className="trip-table-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <h3 style={{ margin: 0 }}>SAP TRIP RECORDS</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="trip-badge">{entries.length} Records</span>
        </div>
      </div>
      <div className="trip-table-scroll">
        <table className="trip-table">
          <thead>
            <tr>
              {fieldOrder.map((field, columnIndex) => (
                <th key={field} className={columnIndex <= 2 ? `sticky-col sticky-col-${columnIndex + 1}` : undefined}>
                  {fieldLabels[field]}
                </th>
              ))}
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {pagedEntries.length === 0 ? (
              <tr>
                <td colSpan={fieldOrder.length + 2} className="no-entries">
                  No entries yet. Use the form above to add trips.
                </td>
              </tr>
            ) : (
              pagedEntries.map((entry: Entry, i: number) => (
                <tr key={i + (currentPage - 1) * perPage}>
                  {fieldOrder.map((field, columnIndex) => {
                    const value = entry[field];
                    const isTimestampField = field === "createdtimestamp" || field === "modifiedTime";

                    return (
                      <td key={field} className={columnIndex <= 2 ? `sticky-col sticky-col-${columnIndex + 1}` : undefined}>
                        {isTimestampField && typeof value === "string" && value
                          ? formatCreatedTimestamp(value)
                          : value !== undefined && value !== null && value !== ""
                            ? String(value)
                            : "-"}
                      </td>
                    );
                  })}
                  <td>
                    <button
                      aria-label="Update"
                      onClick={() => onUpdate && onUpdate(entry)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        height: 28,
                        width: 28,
                      }}
                    >
                      <SquarePen size={18} />
                    </button>
                  </td>
                  <td>
                    <button
                      aria-label="Delete"
                      onClick={() => onDelete && onDelete(entry)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#e11d48",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        height: 28,
                        width: 28,
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, gap: 12 }}>
        <span style={{ whiteSpace: "nowrap", fontSize: 14, color: "#334155" }}>
          {`${visibleRows} out of ${entries.length}`}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={goToPrevious} disabled={currentPage === 1} style={{ padding: "2px 8px", borderRadius: 4, border: "1px solid #ddd", background: currentPage === 1 ? "#f3f3f3" : "#e0f7fa", color: "#333", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}>
            {"< Previous"}
          </button>
          {getPageNumbers().map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={currentPage === page ? "active" : ""}
                style={{
                  padding: "2px 8px",
                  borderRadius: 4,
                  border: currentPage === page ? "2px solid #3c3f3f" : "1px solid #ddd",
                  background: currentPage === page ? "#414242" : "#fff",
                  color: currentPage === page ? "#fff" : "#333",
                  fontWeight: currentPage === page ? 700 : 400,
                  margin: "0 2px",
                  cursor: "pointer",
                }}
              >
                {page}
              </button>
            ) : (
              <span key={`ellipsis-${idx}`} style={{ margin: "0 4px", color: "#888" }}>
                ...
              </span>
            )
          )}
          <button onClick={goToNext} disabled={currentPage === totalPages} style={{ padding: "2px 8px", borderRadius: 4, border: "1px solid #ddd", background: currentPage === totalPages ? "#f3f3f3" : "#e0f7fa", color: "#333", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}>
            {"Next >"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8 }}>
            <select value={perPage} onChange={changePerPage} style={{ padding: "2px 8px", borderRadius: 4, background: "#ffffff", color: "#000000", border: "1px solid #636060" }}>
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span style={{ whiteSpace: "nowrap", fontSize: 14, color: "#262626" }}>per page</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TripTable;
