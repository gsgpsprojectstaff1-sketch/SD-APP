import { PlusCircle, Search } from "lucide-react";
import "./TripForm.css";

export type Entry = {
  ID?: number;
  createdtimestamp: string;
  orderEntry: string;
  source: string;
  destination: string;
  fuel: string;
  tripLane: string;
  fctLane: string;
  index: string;
  km: string;
  hauling: string;
  dhset?: string;
  driver: string;
  helper: string;
  ltDriverRate?: string;
  ltHelperRate?: string;
  tonnerDriverRate?: string;
  tonnerHelperRate?: string;
  stDriverRate?: string;
  stHelperRate?: string;
  tripCount?: string;
  modifiedBy?: string;
  modifiedTime?: string;
  createdBy?: string;
};


interface TripFormProps {
  form: Entry;
  onChange: (field: keyof Entry, value: string) => void;
  onCommit: () => void;
  onCancel?: () => void;
  onLookup?: () => void;
  lookupLoading?: boolean;
}


const TripForm = ({ form, onChange, onCommit, onCancel, onLookup, lookupLoading }: TripFormProps) => {
  return (
    <section className="trip-form tf-card">
      <div className="tf-header">
        <h3>Quick Add Trip</h3>
      </div>

      <div className="tf-grid">
        <div className="trip-form-field tf-order">
          <label htmlFor="orderEntry" className="trip-label">Order Entry</label>
          <input
            id="orderEntry"
            value={form.orderEntry}
            onChange={(e) => onChange("orderEntry", e.target.value)}
            className="trip-input"
            placeholder="Type Order Entry"
            autoComplete="off"
          />
          {lookupLoading ? (
            <div className="tf-fetching-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="tf-lookup-spinner">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Fetching...
            </div>
          ) : (
            <button type="button" onClick={onLookup} className="commit-btn tf-lookup-btn">
              <Search size={16} />
              Lookup
            </button>
          )}
        </div>

        <div className="trip-form-field tf-source">
          <label htmlFor="source" className="trip-label">Source</label>
          <input
            id="source"
            value={form.source}
            readOnly
            className="trip-input"
            placeholder="Source"
            title={form.source}
            autoComplete="off"
          />
        </div>

        <div className="trip-form-field tf-destination">
          <label htmlFor="destination" className="trip-label">Destination</label>
          <input
            id="destination"
            value={form.destination}
            readOnly
            className="trip-input"
            placeholder="Destination"
            title={form.destination}
            autoComplete="off"
          />
        </div>

        <div className="trip-form-field tf-fuel">
          <label htmlFor="fuel" className="trip-label">Approved Fuel Budget</label>
          <input
            id="fuel"
            type="text"
            placeholder="Approved Fuel Budget"
            value={form.fuel}
            onChange={(e) => onChange("fuel", e.target.value)}
            className="trip-input"
            autoComplete="off"
          />
        </div>

        <div className="trip-form-field tf-lanes">
          <div className="tf-inline-two">
            <div>
              <label htmlFor="tripLane" className="trip-label">Trip Lane Code</label>
              <input
                id="tripLane"
                type="text"
                placeholder="Trip Lane Code"
                value={form.tripLane}
                onChange={(e) => onChange("tripLane", e.target.value)}
                className="trip-input"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="fctLane" className="trip-label">FCT Lane Code</label>
              <input
                id="fctLane"
                type="text"
                placeholder="FCT Lane Code"
                value={form.fctLane}
                onChange={(e) => onChange("fctLane", e.target.value)}
                className="trip-input"
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <div className="trip-form-field tf-index">
          <label htmlFor="index" className="trip-label">Trip Index</label>
          <input
            id="index"
            type="text"
            placeholder="Trip Index"
            value={form.index}
            onChange={(e) => onChange("index", e.target.value)}
            className="trip-input"
            autoComplete="off"
          />
        </div>

        <div className="trip-form-field tf-km">
          <label htmlFor="km" className="trip-label">Trip KM</label>
          <input
            id="km"
            type="text"
            placeholder="Trip KM"
            value={form.km}
            onChange={(e) => onChange("km", e.target.value)}
            className="trip-input"
            autoComplete="off"
          />
        </div>

        <div className="trip-form-field tf-hauling">
          <label htmlFor="hauling" className="trip-label">Hauling Rate</label>
          <input
            id="hauling"
            type="text"
            placeholder="Hauling Rate"
            value={form.hauling}
            onChange={(e) => onChange("hauling", e.target.value)}
            className="trip-input"
            autoComplete="off"
          />
        </div>

        <div className="trip-form-field tf-driver">
          <label htmlFor="driver" className="trip-label">Driver Rate</label>
          <input
            id="driver"
            type="text"
            placeholder="Driver Rate"
            value={form.driver}
            onChange={(e) => onChange("driver", e.target.value)}
            className="trip-input"
            autoComplete="off"
          />
        </div>

        <div className="trip-form-field tf-helper">
          <label htmlFor="helper" className="trip-label">Helper Rate</label>
          <input
            id="helper"
            type="text"
            placeholder="Helper Rate"
            value={form.helper}
            onChange={(e) => onChange("helper", e.target.value)}
            className="trip-input"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="trip-form-actions tf-actions">
        {onCancel && (
          <button onClick={onCancel} className="tf-cancel-btn">
            Cancel
          </button>
        )}
        <button onClick={onCommit} className="commit-btn tf-commit-btn">
          <PlusCircle size={16} />
          Commit Entry
        </button>
      </div>
    </section>
  );
};

export default TripForm;