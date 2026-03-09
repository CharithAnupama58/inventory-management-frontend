import { useNavigate } from "react-router-dom";

const Icons = {
  Home: () => (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Box: () => (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
  Arrow: () => (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Users: () => (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Storage: () => (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="5" rx="1"/>
      <rect x="2" y="10" width="20" height="5" rx="1"/>
      <rect x="2" y="17" width="20" height="5" rx="1"/>
    </svg>
  ),
  Audit: () => (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Logout: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

const ADMIN_NAV = [
  { id: "dashboard", Icon: Icons.Home,    label: "Dashboard" },
  { id: "inventory", Icon: Icons.Box,     label: "Inventory" },
  { id: "borrow",    Icon: Icons.Arrow,   label: "Borrow / Return", badge: "3" },
  { id: "users",     Icon: Icons.Users,   label: "User Management" },
  { id: "storage",   Icon: Icons.Storage, label: "Storage" },
  { id: "audit",     Icon: Icons.Audit,   label: "Audit Log" },
];

const STAFF_NAV = [
  { id: "dashboard", Icon: Icons.Home,    label: "Dashboard" },
  { id: "inventory", Icon: Icons.Box,     label: "Browse Inventory" },
  { id: "borrow",    Icon: Icons.Arrow,   label: "My Borrows", badge: "2" },
  { id: "storage",   Icon: Icons.Storage, label: "Storage Map" },
];

export default function Sidebar({ activePage, onNavigate }) {
  const navigate = useNavigate();
  const role     = localStorage.getItem("role") || "staff";
  const isAdmin  = role === "admin";
  const navItems = isAdmin ? ADMIN_NAV : STAFF_NAV;

  const handleLogout = () => {
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3"  y="3"  width="7" height="7" rx="1.5" fill="white"/>
              <rect x="14" y="3"  width="7" height="7" rx="1.5" fill="white" fillOpacity="0.5"/>
              <rect x="3"  y="14" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-name">Ceyntics</div>
            <div className="sidebar-logo-sub">Inventory System</div>
          </div>
        </div>

        <div className="role-badge">
          <span className="role-dot" style={{ background: isAdmin ? "#6366f1" : "#10b981" }} />
          <span className="role-text">{isAdmin ? "Administrator" : "Staff"}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">Navigation</div>
        {navItems.map(({ id, Icon, label, badge }) => (
          <div
            key={id}
            className={`nav-item ${activePage === id ? "active" : ""}`}
            onClick={() => onNavigate(id)}
          >
            <Icon />
            {label}
            {badge && <span className="nav-badge">{badge}</span>}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">
            {isAdmin ? "AD" : "ST"}
          </div>
          <div>
            <div className="user-name">{isAdmin ? "Admin User" : "Staff User"}</div>
            <div className="user-email">{isAdmin ? "admin@test.com" : "staff@ceyntics.com"}</div>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <Icons.Logout />
          Sign Out
        </button>
      </div>

    </aside>
  );
}