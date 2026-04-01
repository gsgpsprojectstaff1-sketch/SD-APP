import type { Entry } from "../../src/components/TripForm.tsx";
import { RefreshCw } from "lucide-react";


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

const leftAlignedColumns: (keyof Entry)[] = ["source", "destination"];



interface TripTableProps {
  entries: Entry[];
  onRefresh?: () => void;
}


import React, { useRef, useState } from "react";

const TripTable = ({ entries, onRefresh }: TripTableProps) => {
  // Column resizing state
  const [colWidths, setColWidths] = useState<number[]>(
    () => fieldOrder.map(() => 120)
  );
  // Column order state for moving
  const [colOrder, setColOrder] = useState<number[]>(
    () => fieldOrder.map((_, i) => i)
  );
  const headerRefs = useRef<(HTMLTableHeaderCellElement | null)[]>([]);
  // Drag state for moving columns
  const dragCol = useRef<number | null>(null);

  // Column resizing logic
  const initResize = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = headerRefs.current[index]?.offsetWidth || 120;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      setColWidths((prev) => {
        const updated = [...prev];
        updated[index] = newWidth > 50 ? newWidth : 50;
        return updated;
      });
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // Column moving logic (improved for sticky header)
  const [dragOverCol, setDragOverCol] = useState<number | null>(null);
  const handleDragStart = (index: number) => {
    dragCol.current = index;
  };
  const handleDragOver = (e: React.DragEvent<HTMLTableHeaderCellElement>, overIndex: number) => {
    e.preventDefault();
    setDragOverCol(overIndex);
  };
  const handleDrop = (overIndex: number) => {
    if (dragCol.current === null || dragCol.current === overIndex) {
      setDragOverCol(null);
      dragCol.current = null;
      return;
    }
    setColOrder((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(dragCol.current!, 1);
      updated.splice(overIndex, 0, removed);
      return updated;
    });
    setDragOverCol(null);
    dragCol.current = null;
  };
  const handleDragEnd = () => {
    setDragOverCol(null);
    dragCol.current = null;
  };

  return (
    <section className="trip-table-card">
      <div className="trip-table-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h3>SAP Trip Records</h3>
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
          <RefreshCw size={18} />
        </button>
        <span className="trip-badge">{entries.length} Records</span>
      </div>
      <div className="trip-table-scroll">
        <table className="trip-table">
          <thead>
            <tr>
              {colOrder.map((colIdx, i) => (
                <th
                  key={fieldOrder[colIdx]}
                  ref={el => { headerRefs.current[colIdx] = el; }}
                  style={{
                    width: colWidths[colIdx],
                    minWidth: 50,
                    textAlign: leftAlignedColumns.includes(fieldOrder[colIdx]) ? "left" : undefined,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    background: dragOverCol === i ? '#e0e7ff' : '#fff',
                    opacity: dragCol.current === i ? 0.6 : 1,
                    transition: 'background 0.2s',
                    cursor: 'grab',
                  }}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={e => handleDragOver(e, i)}
                  onDrop={() => handleDrop(i)}
                  onDragEnd={handleDragEnd}
                >
                  <span style={{ display: 'block', textAlign: leftAlignedColumns.includes(fieldOrder[colIdx]) ? 'left' : undefined }}>
                    {fieldLabels[fieldOrder[colIdx]]}
                  </span>
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      width: 8,
                      cursor: 'col-resize',
                      zIndex: 2,
                      userSelect: 'none',
                    }}
                    onMouseDown={e => initResize(e, colIdx)}
                  />
                </th>
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
              entries.map((entry: Entry, i: number) => (
                <tr key={i}>
                  {colOrder.map((colIdx) => (
                    <td
                      key={fieldOrder[colIdx]}
                      style={{
                        width: colWidths[colIdx],
                        minWidth: 50,
                        textAlign: leftAlignedColumns.includes(fieldOrder[colIdx]) ? 'left' : undefined,
                      }}
                    >
                      {entry[fieldOrder[colIdx]] || "—"}
                    </td>
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