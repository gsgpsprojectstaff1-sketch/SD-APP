import { Truck, LogOut, FileText, Monitor } from "lucide-react";
import { useBadgeCounts } from "../AppBadgeContext";


interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  unregisterCount?: number;
  tripCount?: number;
  fctCount?: number;
}

const Sidebar = ({ activeItem, onItemClick, onLogout, isOpen = true }: SidebarProps) => {
  const { unregisterCount, tripCount, fctCount } = useBadgeCounts();
  // Submenu is open if Trips is the active item
  // const submenuOpen = activeItem === "Trips" || activeItem === "Unregister-Source-Destination";

  // Helper for closing sidebar if needed (stub, replace if you have a real closeSidebar)
  const closeSidebar = () => {};

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`} style={{ background: '#0f172a' }}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Truck size={32} color="#ffffff" />
        </div>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.35rem', margin: 0 }}>SD Logistics</h2>
          <p style={{ fontWeight: 500, fontSize: '1.05rem', margin: 0, color: '#cbd5e1' }}>Trip Manager</p>
        </div>
      </div>


      <nav className="sidebar-nav">
        {/* Dashboard button */}
        <button
          className={`sidebar-nav-item ${activeItem === "Trips" || activeItem.startsWith("Trips-") ? "active" : ""}`}
          onClick={() => {
            onItemClick("Trips");
            closeSidebar();
          }}
        >
          <Monitor size={16} style={{marginRight: 4}} /> Dashboard <span className="badge"></span>
        </button>

        {/* Unregister Source Destination as main menu item */}
        <button
          className={`sidebar-nav-item ${activeItem === "Unregister-Source-Destination" ? "active" : ""}`}
          onClick={() => {
            onItemClick("Unregister-Source-Destination");
            closeSidebar();
          }}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={16} /> Unregister Source Destination
          </span>
          {typeof unregisterCount === 'number' && unregisterCount > 0 && (
            <span style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#dc2626',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '0.72rem',
              padding: '1px 7px',
              fontWeight: 700,
              minWidth: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              zIndex: 1
            }}>{unregisterCount}</span>
          )}
        </button>

        {/* Trip menu item */}
        <button
          className={`sidebar-nav-item ${activeItem === "Trip" ? "active" : ""}`}
          onClick={() => {
            onItemClick("Trip");
            closeSidebar();
          }}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Truck size={16} /> Trip
          </span>
          {typeof tripCount === 'number' && tripCount > 0 && (
            <span style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#1976d2',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '0.72rem',
              padding: '1px 7px',
              fontWeight: 700,
              minWidth: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              zIndex: 1
            }}>{tripCount}</span>
          )}
        </button>

        {/* FCT menu item */}
        <button
          className={`sidebar-nav-item ${activeItem === "FCT" ? "active" : ""}`}
          onClick={() => {
            onItemClick("FCT");
            closeSidebar();
          }}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={16} /> FCT
          </span>
          {typeof fctCount === 'number' && fctCount > 0 && (
            <span style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#f59e42',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '0.72rem',
              padding: '1px 7px',
              fontWeight: 700,
              minWidth: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              zIndex: 1
            }}>{fctCount}</span>
          )}
        </button>
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="sidebar-logout">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;