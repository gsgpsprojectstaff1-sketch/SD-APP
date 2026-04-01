

import { Truck, LogOut, MapPin } from "lucide-react";

import { useState } from "react";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ activeItem, onItemClick, onLogout, isOpen = true }: SidebarProps) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);

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
        {/* Custom Trips button with submenu */}
        <button
          className={`sidebar-nav-item ${activeItem === "Trips" || activeItem.startsWith("Trips-") ? "active" : ""}`}
          onClick={() => {
            onItemClick("Trips");
            setSubmenuOpen((open) => !open);
            closeSidebar();
          }}
        >
          <Truck size={16} /> Trips <span className="badge">8</span>
        </button>
        {submenuOpen && (
          <div style={{ marginLeft: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              className={`nav-btn submenu ${activeItem === "sales-client-management" ? "active" : ""}`}
              onClick={() => {
                onItemClick("sales-client-management");
                closeSidebar();
              }}
            >
              <MapPin size={14} /> Source
            </button>
            <button
              className={`nav-btn submenu ${activeItem === "Trips-Source" ? "active" : ""}`}
              onClick={() => {
                onItemClick("Trips-Source");
                closeSidebar();
              }}
            >
              <MapPin size={14} /> Destinations
            </button>
           
          </div>
        )}

        {/* Removed other nav items as requested */}
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