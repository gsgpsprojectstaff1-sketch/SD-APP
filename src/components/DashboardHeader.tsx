import { Search, Bell } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  username: string;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DashboardHeader = ({ title, username, search, onSearchChange }: DashboardHeaderProps) => {
  return (
    <header className="dashboard-header" >
      <h1 className="dashboard-title">{title}</h1>
      <div className="dashboard-header-right">
        <div className="dashboard-search-wrapper">
          <Search size={16} className="dashboard-search-icon" />
          <input
            type="text"
            placeholder="Search trips..."
            className="dashboard-search"
            value={search}
            onChange={onSearchChange}
          />
        </div>
        <button className="icon-button" title="Notifications">
          <Bell size={18} />
        </button>
        <div className="user-chip">
          <div className="user-avatar">
            {username
              ? username
                  .split(" ")
                  .filter(Boolean)
                  .map((part) => part[0].toUpperCase())
                  .slice(0, 2)
                  .join("")
              : "U"}
          </div>
          <span>{username || "User"}</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;