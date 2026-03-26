import { Search, Bell } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  username: string;
}

const DashboardHeader = ({ title, username }: DashboardHeaderProps) => {
  return (
    <header className="dashboard-header" >
      <h1 style={{ color: "#0c0d0e" }}>{title}</h1>
      <div className="dashboard-header-right">
        <div className="dashboard-search-wrapper">
          <Search size={16} className="dashboard-search-icon" />
          <input type="text" placeholder="Search trips..." className="dashboard-search" />
        </div>
        <button className="icon-button" title="Notifications">
          <Bell size={18} />
        </button>
        <div className="user-chip">
          <div className="user-avatar">{username ? username.slice(0, 2).toUpperCase() : "U"}</div>
          <span>{username || "User"}</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;