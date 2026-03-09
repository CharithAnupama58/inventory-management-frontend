export default function Header({ title }) {
  const role    = localStorage.getItem("role") || "staff";
  const isAdmin = role === "admin";

  return (
    <header className="app-header">

      <div className="header-title">{title}</div>

      {/* Search */}
      <div className="header-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8a8a8" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input placeholder="Search items, users..." />
      </div>

      <div className="header-actions">

        {/* Notification Bell */}
        <div className="icon-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="notif-dot" />
        </div>

        {/* Avatar */}
        <div className="avatar avatar-lg" style={{ cursor: "pointer" }}>
          {isAdmin ? "AD" : "ST"}
        </div>

      </div>
    </header>
  );
}