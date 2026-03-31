import { PlusCircle, Search } from "lucide-react";

export type Entry = {
  orderEntry: string;
  source: string;
  destination: string;
  fuel: string;
  tripLane: string;
  fctLane: string;
  index: string;
  km: string;
  hauling: string;
  driver: string;
  helper: string;
};


interface TripFormProps {
  form: Entry;
  onChange: (field: keyof Entry, value: string) => void;
  onCommit: () => void;
  onCancel?: () => void;
  onLookup?: () => void;
}


const TripForm = ({ form, onChange, onCommit, onCancel, onLookup }: TripFormProps) => {

  return (
    <section className="trip-form">
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        <h3>Quick Add Trip</h3>
      </div>
      <div className="trip-form-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', alignItems: 'start' }}>
        {/* First row: Order Entry (with Lookup below), Source, Destination */}
        <div className="trip-form-field" style={{ gridRow: '1/3', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <label htmlFor="orderEntry" className="trip-label">Order Entry</label>
          <input
            id="orderEntry"
            value={form.orderEntry}
            onChange={e => onChange("orderEntry", e.target.value)}
            className="trip-input"
            placeholder="Type Order Entry"
            style={{ marginBottom: '0.5rem', width: '100%', minHeight: '2.3rem', fontSize: '1rem' }}
          />
          <button
            type="button"
            onClick={onLookup}
            className="commit-btn"
            style={{ width: '60%', alignSelf: 'center', marginTop: '0.2rem' }}
          >
            <Search size={16} style={{ marginRight: 6, marginBottom: -2 }} />
            Lookup
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', gridColumn: '2/4', width: '100%' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="source" className="trip-label">Source</label>
            <input
              id="source"
              value={form.source}
              readOnly
              className="trip-input"
              placeholder="Source"
              title={form.source}
              style={{
                marginBottom: '0.5rem',
                width: '100%',
                fontSize: '0.95rem',
                background: '#f3f4f6',
                fontFamily: 'inherit',
                lineHeight: '1.2',
                padding: '0.45rem 0.75rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="destination" className="trip-label">Destination</label>
            <input
              id="destination"
              value={form.destination}
              readOnly
              className="trip-input"
              placeholder="Destination"
              title={form.destination}
              style={{
                marginBottom: '0.5rem',
                width: '100%',
                fontSize: '0.95rem',
                background: '#f3f4f6',
                fontFamily: 'inherit',
                lineHeight: '1.2',
                padding: '0.45rem 0.75rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            />
          </div>
        </div>
        {/* Next row: Approved Fuel Budget, Trip Lane Code at FCT Lane Code magkatabi */}
        <div className="trip-form-field" style={{ gridColumn: '2/3' }}>
          <label htmlFor="fuel" className="trip-label">Approved Fuel Budget</label>
          <input
            id="fuel"
            type="text"
            placeholder="Approved Fuel Budget"
            value={form.fuel}
            onChange={e => onChange("fuel", e.target.value)}
            className="trip-input"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', gridColumn: '3/4', width: '100%' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="tripLane" className="trip-label">Trip Lane Code</label>
            <input
              id="tripLane"
              type="text"
              placeholder="Trip Lane Code"
              value={form.tripLane}
              onChange={e => onChange("tripLane", e.target.value)}
              className="trip-input"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="fctLane" className="trip-label">FCT Lane Code</label>
            <input
              id="fctLane"
              type="text"
              placeholder="FCT Lane Code"
              value={form.fctLane}
              onChange={e => onChange("fctLane", e.target.value)}
              className="trip-input"
            />
          </div>
        </div>
        {/* Third row: Trip Index, Trip KM, Hauling Rate */}
        <div className="trip-form-field" style={{ gridColumn: '1/2' }}>
          <label htmlFor="index" className="trip-label">Trip Index</label>
          <input
            id="index"
            type="text"
            placeholder="Trip Index"
            value={form.index}
            onChange={e => onChange("index", e.target.value)}
            className="trip-input"
          />
        </div>
        <div className="trip-form-field" style={{ gridColumn: '2/3' }}>
          <label htmlFor="km" className="trip-label">Trip KM</label>
          <input
            id="km"
            type="text"
            placeholder="Trip KM"
            value={form.km}
            onChange={e => onChange("km", e.target.value)}
            className="trip-input"
          />
        </div>
        <div className="trip-form-field" style={{ gridColumn: '3/4' }}>
          <label htmlFor="hauling" className="trip-label">Hauling Rate</label>
          <input
            id="hauling"
            type="text"
            placeholder="Hauling Rate"
            value={form.hauling}
            onChange={e => onChange("hauling", e.target.value)}
            className="trip-input"
          />
        </div>
        {/* Fourth row: Driver Rate, Helper Rate (span 2 columns) */}
        <div className="trip-form-field" style={{ gridColumn: '1/2' }}>
          <label htmlFor="driver" className="trip-label">Driver Rate</label>
          <input
            id="driver"
            type="text"
            placeholder="Driver Rate"
            value={form.driver}
            onChange={e => onChange("driver", e.target.value)}
            className="trip-input"
          />
        </div>
        <div className="trip-form-field" style={{ gridColumn: '2/3' }}>
          <label htmlFor="helper" className="trip-label">Helper Rate</label>
          <input
            id="helper"
            type="text"
            placeholder="Helper Rate"
            value={form.helper}
            onChange={e => onChange("helper", e.target.value)}
            className="trip-input"
          />
        </div>
      </div>
      <div className="trip-form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
         {onCancel && (
          <button onClick={onCancel} style={{ background: '#CB3D43', border: '1px solid #99002ee3',  color: '#ffffff', fontWeight: 500, cursor: 'pointer', fontSize: '1rem', borderRadius: 4, padding: '0.5rem 1.2rem' }}>Cancel</button>
        )}
        <button onClick={onCommit} className="commit-btn">
          <PlusCircle size={16} />
          Commit Entry
        </button>
       
      </div>
    </section>
  );
};

export default TripForm;