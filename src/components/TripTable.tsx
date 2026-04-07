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

interface TripTableProps {
  entries: Entry[];
  onRefresh?: () => void;
  onDelete?: (entry: Entry) => void;
}




const TripTable = ({ entries, onRefresh, onDelete }: TripTableProps) => {
  return (
    <section className="trip-table-card">
      <div className="trip-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{margin: 0}}>SAP TRIP RECORDS</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            aria-label="Refresh"
            onClick={onRefresh}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginRight: 8,
              display: 'flex',
              alignItems: 'center',
              height: 28,
            }}
          >
            Refresh
          </button>
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
            {entries.length === 0 ? (
              <tr>
                <td colSpan={fieldOrder.length + 1} className="no-entries">
                  No entries yet. Use the form above to add trips.
                </td>
              </tr>
            ) : (
              entries.map((entry: Entry, i: number) => (
                <tr key={i}>
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
    </section>
  );
};

export default TripTable;