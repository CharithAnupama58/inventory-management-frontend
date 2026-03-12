import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import ItemService from "../../services/itemService";
import BorrowService from "../../services/borrowService";
import { UserService, AuditLogService } from "../../services/otherServices";

/* ─── Notification fetch ─── */
async function fetchNotifications(isAdmin) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const notifs = [];

  try {
    if (isAdmin) {
      /* ══ ADMIN notifications ══ */

      // Single fetch — split overdue vs due today/tomorrow client-side
      const borrowRes = await BorrowService.getAll({ status: "borrowed", per_page: 100 });
      (borrowRes.data || []).forEach(b => {
        const due = new Date(b.expected_return_date);
        due.setHours(0, 0, 0, 0);
        const isOverdue  = due < today;
        const isToday    = due.getTime() === today.getTime();
        const isTomorrow = due.getTime() === tomorrow.getTime();

        if (isOverdue) {
          notifs.push({
            id:    `overdue-${b.id}`,
            type:  "overdue",
            icon:  "⚠️",
            color: "#ef4444",
            bg:    "#fee2e2",
            title: `Overdue: ${b.item?.name || "Item"}`,
            desc:  `${b.borrower_name} — was due ${b.expected_return_date}`,
            time:  b.expected_return_date,
          });
        } else if (isToday || isTomorrow) {
          notifs.push({
            id:    `due-${b.id}`,
            type:  "due",
            icon:  isToday ? "🔔" : "📅",
            color: "#f59e0b",
            bg:    "#fef3c7",
            title: `Due ${isToday ? "Today" : "Tomorrow"}: ${b.item?.name || "Item"}`,
            desc:  `Borrowed by ${b.borrower_name}`,
            time:  b.expected_return_date,
          });
        }
      });

      // 3. New audit log events (last 60s — new since last poll)
      const auditRes = await AuditLogService.getAll({ per_page: 5 });
      (auditRes.data || []).forEach(log => {
        const logTime = new Date(log.created_at);
        const ageSeconds = (Date.now() - logTime) / 1000;
        if (ageSeconds <= 120) { // show events from last 2 minutes as "new"
          notifs.push({
            id:    `audit-${log.id}`,
            type:  "audit",
            icon:  "📋",
            color: "#6366f1",
            bg:    "#ede9fe",
            title: `New Activity: ${log.action?.replace(/_/g, " ") || "Event"}`,
            desc:  `${log.performed_by?.name || "System"} — ${log.entity_name || ""}`,
            time:  log.created_at,
          });
        }
      });

    } else {
      /* ══ STAFF notifications — own borrows only ══ */

      const myRes = await BorrowService.getMyBorrows({ status: "borrowed", per_page: 50 });
      (myRes.data || []).forEach(b => {
        const due = new Date(b.expected_return_date);
        due.setHours(0, 0, 0, 0);
        const isOverdue  = due < today;
        const isToday    = due.getTime() === today.getTime();
        const isTomorrow = due.getTime() === tomorrow.getTime();

        if (isOverdue) {
          notifs.push({
            id:    `my-overdue-${b.id}`,
            type:  "overdue",
            icon:  "⚠️",
            color: "#ef4444",
            bg:    "#fee2e2",
            title: `Overdue: ${b.item?.name || "Item"}`,
            desc:  `Was due on ${b.expected_return_date} — please return`,
            time:  b.expected_return_date,
          });
        } else if (isToday || isTomorrow) {
          notifs.push({
            id:    `my-due-${b.id}`,
            type:  "due",
            icon:  isToday ? "🔔" : "📅",
            color: "#f59e0b",
            bg:    "#fef3c7",
            title: `Due ${isToday ? "Today" : "Tomorrow"}: ${b.item?.name || "Item"}`,
            desc:  `Qty: ${b.quantity} — please return on time`,
            time:  b.expected_return_date,
          });
        }
      });
    }

  } catch (e) {
    console.error("Notification fetch error:", e);
  }

  // Deduplicate by id
  const seen = new Set();
  return notifs.filter(n => {
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });
}

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60)        return "just now";
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ═══════════════════════════════════════════
   HEADER
═══════════════════════════════════════════ */
export default function Header({ title, onNavigate }) {
  const { user, isAdmin } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "??";

  /* ── Search state ── */
  const [query,         setQuery]         = useState("");
  const [searchResults, setSearchResults] = useState({ items: [], users: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const searchRef  = useRef(null);
  const searchTimer = useRef(null);

  /* ── Notification state ── */
  const [notifs,     setNotifs]     = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const prevCountRef  = useRef(0);
  const notifRef      = useRef(null);

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ── Debounced search ── */
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults({ items: [], users: [] });
      setShowDropdown(false);
      return;
    }

    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      setShowDropdown(true);
      try {
        const [itemsRes, usersRes] = await Promise.all([
          ItemService.getAll({ search: query, per_page: 5 }),
          isAdmin ? UserService.getAll({ search: query, per_page: 5 }) : Promise.resolve({ data: [] }),
        ]);
        setSearchResults({
          items: itemsRes.data || [],
          users: usersRes.data || [],
        });
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(searchTimer.current);
  }, [query, isAdmin]);

  /* ── Poll every 60s ── */
  const loadNotifs = useCallback(async () => {
    const data = await fetchNotifications(isAdmin);
    setNotifs(data);
    if (data.length > prevCountRef.current) {
      setUnseenCount(data.length);
    }
    prevCountRef.current = data.length;
  }, [isAdmin]);

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 60_000);
    return () => clearInterval(interval);
  }, [loadNotifs]);

  const handleBellClick = () => {
    setShowNotifs(v => !v);
    setUnseenCount(0); // mark as seen when opened
  };

  const unreadCount = unseenCount;

  /* ── Navigate from search result ── */
  const handleItemClick = (item) => {
    setQuery("");
    setShowDropdown(false);
    if (onNavigate) onNavigate("inventory");
  };

  const handleUserClick = (u) => {
    setQuery("");
    setShowDropdown(false);
    if (onNavigate) onNavigate("users");
  };

  const hasResults = searchResults.items.length > 0 || searchResults.users.length > 0;

  return (
    <header className="app-header">

      <div className="header-title">{title}</div>

      {/* ── Search ── */}
      <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
        <div className="header-search" style={{ position: "relative" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8a8a8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowDropdown(true)}
            placeholder="Search items, users..."
            style={{ width: "100%" }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setShowDropdown(false); }} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", fontSize: "16px", lineHeight: 1, padding: "0 2px"
            }}>×</button>
          )}
        </div>

        {/* Search Dropdown */}
        {showDropdown && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
            background: "var(--surface)", border: "1.5px solid var(--border)",
            borderRadius: "14px", boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
            zIndex: 300, overflow: "hidden",
            animation: "slideDown 0.18s ease"
          }}>
            {searchLoading && (
              <div style={{ padding: "18px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                Searching...
              </div>
            )}

            {!searchLoading && !hasResults && (
              <div style={{ padding: "18px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                No results for "{query}"
              </div>
            )}

            {!searchLoading && searchResults.items.length > 0 && (
              <div>
                <div style={{ padding: "10px 16px 6px", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Items
                </div>
                {searchResults.items.map(item => (
                  <div key={item.id} onClick={() => handleItemClick(item)} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 16px", cursor: "pointer", transition: "background 0.12s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>📦</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.code} · Qty: {item.quantity}</div>
                    </div>
                    <span style={{
                      fontSize: "10px", padding: "2px 8px", borderRadius: "100px", fontWeight: 600,
                      background: item.status === "instore" ? "#d1fae5" : item.status === "borrowed" ? "#fef3c7" : "#fee2e2",
                      color:      item.status === "instore" ? "#10b981" : item.status === "borrowed" ? "#f59e0b" : "#ef4444",
                    }}>{item.status}</span>
                  </div>
                ))}
              </div>
            )}

            {!searchLoading && isAdmin && searchResults.users.length > 0 && (
              <div style={{ borderTop: searchResults.items.length > 0 ? "1px solid var(--border)" : "none" }}>
                <div style={{ padding: "10px 16px 6px", fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Users
                </div>
                {searchResults.users.map(u => (
                  <div key={u.id} onClick={() => handleUserClick(u)} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 16px", cursor: "pointer", transition: "background 0.12s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {u.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>{u.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
                    </div>
                    <span style={{
                      fontSize: "10px", padding: "2px 8px", borderRadius: "100px", fontWeight: 600,
                      background: u.role === "admin" ? "#ede9fe" : "#d1fae5",
                      color:      u.role === "admin" ? "#6366f1" : "#10b981",
                    }}>{u.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="header-actions">

        {/* ── Notification Bell ── */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <div className="icon-btn" onClick={handleBellClick} style={{ cursor: "pointer", position: "relative" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: "-4px", right: "-4px",
                background: "#ef4444", color: "#fff",
                fontSize: "9px", fontWeight: 800,
                minWidth: "16px", height: "16px", borderRadius: "100px",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 4px", lineHeight: 1, border: "2px solid var(--surface)"
              }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </div>

          {/* Notification Panel */}
          {showNotifs && (
            <div style={{
              position: "absolute", top: "calc(100% + 12px)", right: 0,
              width: "340px", background: "var(--surface)",
              border: "1.5px solid var(--border)", borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.16)",
              zIndex: 300, overflow: "hidden",
              animation: "slideDown 0.18s ease"
            }}>
              {/* Panel Header */}
              <div style={{
                padding: "16px 18px 12px", borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "14px", color: "var(--text-primary)" }}>
                  Notifications
                  {unreadCount > 0 && (
                    <span style={{ marginLeft: "8px", fontSize: "11px", padding: "2px 8px", borderRadius: "100px", background: "#fee2e2", color: "#ef4444", fontWeight: 700 }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button onClick={() => { setNotifs([]); }} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "11px", color: "var(--text-muted)", fontFamily: "'DM Sans',sans-serif"
                }}>Clear all</button>
              </div>

              {/* Notif list */}
              <div style={{ maxHeight: "380px", overflowY: "auto" }}>
                {notifs.length === 0 && (
                  <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎉</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>All caught up!</div>
                    <div style={{ fontSize: "12px", marginTop: "4px" }}>No new notifications</div>
                  </div>
                )}

                {notifs.map((n, i) => (
                  <div key={n.id} style={{
                    display: "flex", alignItems: "flex-start", gap: "12px",
                    padding: "13px 18px",
                    borderBottom: i < notifs.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.12s", cursor: "default"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: n.bg, fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "12.5px", color: "var(--text-primary)", marginBottom: "2px" }}>{n.title}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>{n.desc}</div>
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0, marginTop: "2px" }}>{timeAgo(n.time)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="avatar avatar-lg" style={{ cursor: "pointer" }} title={user?.name || ""}>
          {initials}
        </div>

      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}