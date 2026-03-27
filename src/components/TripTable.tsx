import type { Entry } from "../../src/components/TripForm.tsx";

const fieldOrder: (keyof Entry)[] = [
  "source", "destination", "fuel", "lane", "index", "km", "hauling", "driver", "helper",
];

const fieldLabels: Record<keyof Entry, string> = {
  source: "Source",
  destination: "Destination",
  fuel: "Fuel Budget",
  lane: "Lane Code",
  index: "Trip Index",
  km: "Trip KM",
  hauling: "Hauling Rate",
  driver: "Driver Rate",
  helper: "Helper Rate",
};

interface TripTableProps {
  entries: Entry[];
}

const TripTable = ({ entries }: TripTableProps) => {
  return (
    <section className="trip-table-card">
      <div className="trip-table-header">
        <h3>SAP Trip Records</h3>
        <span className="trip-badge">{entries.length} Records</span>
      </div>
      <div className="trip-table-scroll">
        <table className="trip-table">
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
                  No entries yet. Use the form above to add trips.
                </td>
              </tr>
            ) : (
              entries.slice(0, 5).map((entry, i) => (
                <tr key={i}>
                  {fieldOrder.map((key) => (
                    <td key={key}>{entry[key] || "—"}</td>
                  ))}
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