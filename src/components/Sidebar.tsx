import { Truck, MapPin, Route, Heart, BarChart3, Settings, LogOut } from "lucide-react";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
}

const navItems = [
  { id: "trips", label: "Trips", icon: Route },
  { id: "sources", label: "Sources", icon: MapPin },
  { id: "destinations", label: "Destinations", icon: MapPin },
  //{ id: "health", label: "Health", icon: Heart },
  //{ id: "analytics", label: "Analytics", icon: BarChart3 },
  //{ id: "settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ activeItem, onItemClick, onLogout, isOpen = true }: SidebarProps) => {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Truck size={18} />
        </div>
        <div>
          <h2>SD Logistics</h2>
          <p>Trip Manager</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
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