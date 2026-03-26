import { PlusCircle } from "lucide-react";
import Select from "react-select";

export type Entry = {
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

const fieldOrder: (keyof Entry)[] = [
  "source", "destination", "fuel", "lane", "index", "km", "hauling", "driver", "helper",
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

interface TripFormProps {
  form: Entry;
  onChange: (field: keyof Entry, value: string) => void;
  onCommit: () => void;
  sourceOptions?: { value: string; label: string }[];
  destinationOptions?: { value: string; label: string }[];
}

const TripForm = ({ form, onChange, onCommit, sourceOptions = [], destinationOptions = [] }: TripFormProps) => {
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      width: "100%",
      padding: 0,
      backgroundColor: "#f5f5f5",
      borderColor: state.isFocused ? "#2563eb" : "#cbd5e1",
      borderRadius: "0.55rem",
      border: `1px solid ${state.isFocused ? "#2563eb" : "#cbd5e1"}`,
      minHeight: "auto",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(37, 99, 235, 0.18)" : "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0.58rem 0.65rem",
    }),
    input: (provided: any) => ({
      ...provided,
      padding: 0,
      margin: 0,
      color: "#0f172a",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#94a3b8",
      fontWeight: 500,
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#0f172a",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: "#cbd5e1",
      padding: "0.4rem 0.65rem",
      "&:hover": {
        color: "#64748b",
      },
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      color: "#cbd5e1",
      padding: "0.4rem 0.4rem",
    }),
    menuList: (provided: any) => ({
      ...provided,
      maxHeight: "200px",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? "#e0e7ff" : "white",
      color: state.isSelected ? "white" : "#334155",
      padding: "0.58rem 0.65rem",
      cursor: "pointer",
    }),
  };

  return (
    <section className="trip-form">
      <h3>Quick Add Trip</h3>
      <div className="trip-form-grid">
        {fieldOrder.map((key) => {
          if (key === "source") {
            return (
              <div key={key} className="trip-form-field">
                <label htmlFor={key} className="trip-label">
                  {fieldLabels[key]}
                </label>
                <Select
                  styles={selectStyles}
                  options={sourceOptions}
                  value={sourceOptions.find((o) => o.value === form.source) || null}
                  onChange={(val) => onChange("source", val?.value ?? "")}
                  placeholder="Type or select source"
                  isSearchable
                  isClearable
                />
              </div>
            );
          }

          if (key === "destination") {
            return (
              <div key={key} className="trip-form-field">
                <label htmlFor={key} className="trip-label">
                  {fieldLabels[key]}
                </label>
                <Select
                  styles={selectStyles}
                  options={destinationOptions}
                  value={destinationOptions.find((o) => o.value === form.destination) || null}
                  onChange={(val) => onChange("destination", val?.value ?? "")}
                  placeholder="Type or select destination"
                  isSearchable
                  isClearable
                />
              </div>
            );
          }

          return (
            <div key={key} className="trip-form-field">
              <label htmlFor={key} className="trip-label">
                {fieldLabels[key]}
              </label>
              <input
                id={key}
                type="text"
                placeholder={fieldLabels[key]}
                value={form[key]}
                onChange={(e) => onChange(key, e.target.value)}
                className="trip-input"
              />
            </div>
          );
        })}
      </div>
      <div className="trip-form-actions">
        <button onClick={onCommit} className="commit-btn">
          <PlusCircle size={16} />
          Commit Entry
        </button>
      </div>
    </section>
  );
};

export default TripForm;