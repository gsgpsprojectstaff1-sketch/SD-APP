import type { Entry } from "../../src/components/TripForm.tsx";

const fieldOrder: (keyof Entry)[] = [
  "source", "destination", "fuel", "tripLane", "fctLane", "index", "km", "hauling", "driver", "helper"
];

const fieldLabels: Record<string, string> = {
  orderEntry: "Order Entry",
  source: "Source",
  destination: "Destination",
  fuel: "Fuel Budget",
  tripLane: "Trip Lane Code",
  fctLane: "FCT Lane Code",
  index: "Trip Index",
  km: "Trip KM",
  hauling: "Hauling Rate",
  driver: "Driver Rate",
  helper: "Helper Rate",
};


import { Trash2 } from "lucide-react";
import React, { useState } from "react";

interface TripTableProps {
  entries: Entry[];
  onDelete?: (entry: Entry) => void;
}





const TripTable = ({ entries, onDelete }: TripTableProps) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const totalPages = Math.ceil(entries.length / perPage) || 1;

  // Slice entries for current page
  const pagedEntries = entries.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Handlers
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

  // Helper for page numbers (show max 7, with ellipsis)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <section className="trip-table-card">
      <div className="trip-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8}}>
        <h3 style={{margin: 0}}>SAP TRIP RECORDS</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="trip-badge">{entries.length} Records</span>
        </div>
      </div>
      <div className="trip-table-scroll">
        <table className="trip-table">
          <thead>
            <tr>
              {fieldOrder.map((field) => (
                <th key={field}>{fieldLabels[field]}</th>
              ))}
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {pagedEntries.length === 0 ? (
              <tr>
                <td colSpan={fieldOrder.length + 1} className="no-entries">
                  No entries yet. Use the form above to add trips.
                </td>
              </tr>
            ) : (
              pagedEntries.map((entry: Entry, i: number) => (
                <tr key={i + (currentPage - 1) * perPage}>
                  {fieldOrder.map((field) => (
                    <td key={field}>{entry[field] || "—"}</td>
                  ))}
                  <td>
                    <button
                      aria-label="Delete"
                      onClick={() => onDelete && onDelete(entry)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#e11d48',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
      {/* Pagination Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
        <button onClick={goToPrevious} disabled={currentPage === 1} style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #ddd', background: currentPage === 1 ? '#f3f3f3' : '#e0f7fa', color: '#333', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>{'< Previous'}</button>
        {getPageNumbers().map((page, idx) =>
          typeof page === 'number' ? (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={currentPage === page ? 'active' : ''}
              style={{
                padding: '2px 8px',
                borderRadius: 4,
                border: currentPage === page ? '2px solid #3c3f3f' : '1px solid #ddd',
                background: currentPage === page ? '#414242' : '#fff',
                color: currentPage === page ? '#fff' : '#333',
                fontWeight: currentPage === page ? 700 : 400,
                margin: '0 2px',
                cursor: 'pointer',
              }}
            >
              {page}
            </button>
          ) : (
            <span key={"ellipsis-" + idx} style={{ margin: '0 4px', color: '#888' }}>...</span>
          )
        )}
        <button onClick={goToNext} disabled={currentPage === totalPages} style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #ddd', background: currentPage === totalPages ? '#f3f3f3' : '#e0f7fa', color: '#333', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>{'Next >'}</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
          <select value={perPage} onChange={changePerPage} style={{ padding: '2px 8px', borderRadius: 4, background: '#ffffff', color: '#000000', border: '1px solid #636060' }}>
            {[10, 20, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span style={{ whiteSpace: 'nowrap', fontSize: 14, color: '#262626' }}>per page</span>
        </div>
      </div>
    </section>
  );
};

export default TripTable;