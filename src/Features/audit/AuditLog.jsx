import { useState, useMemo } from "react";

/* ─── Mock Data (replace with GET /api/audit-logs later) ─── */
const INITIAL_LOGS = [
  { id: 1,  action: "USER_CREATED",     entity: "User",    entityName: "Kasun Perera",       performedBy: "Ashan Fernando", role: "admin", timestamp: "2026-03-09T08:12:00", details: { name: "Kasun Perera", email: "kasun@ceyntics.com", role: "staff" } },
  { id: 2,  action: "ITEM_BORROWED",    entity: "Borrow",  entityName: "Soldering Iron × 1", performedBy: "Kasun Perera",   role: "staff", timestamp: "2026-03-09T09:05:00", details: { item: "Soldering Iron", code: "EQ-001", qty: 1, borrower: "Kasun Perera", dueDate: "Mar 12, 2026" } },
  { id: 3,  action: "ITEM_BORROWED",    entity: "Borrow",  entityName: "Arduino Mega × 2",   performedBy: "Kasun Perera",   role: "staff", timestamp: "2026-03-09T09:30:00", details: { item: "Arduino Mega", code: "CM-003", qty: 2, borrower: "Kasun Perera", dueDate: "Mar 14, 2026" } },
  { id: 4,  action: "ITEM_BORROWED",    entity: "Borrow",  entityName: "Heat Gun × 1",       performedBy: "Nimali Silva",   role: "staff", timestamp: "2026-03-08T14:20:00", details: { item: "Heat Gun", code: "EQ-008", qty: 1, borrower: "Nimali Silva", dueDate: "Mar 08, 2026" } },
  { id: 5,  action: "ITEM_RETURNED",    entity: "Borrow",  entityName: "Oscilloscope × 1",   performedBy: "Ruwan Jayasinghe",role:"staff", timestamp: "2026-03-07T11:00:00", details: { item: "Oscilloscope", code: "EQ-002", qty: 1, returnedBy: "Ruwan Jayasinghe", condition: "Good" } },
  { id: 6,  action: "USER_DEACTIVATED", entity: "User",    entityName: "Tharindu Madush",    performedBy: "Ashan Fernando", role: "admin", timestamp: "2026-03-07T10:00:00", details: { name: "Tharindu Madush", email: "tharindu@ceyntics.com", previousStatus: "active", newStatus: "inactive" } },
  { id: 7,  action: "CUPBOARD_CREATED", entity: "Storage", entityName: "Cupboard C",         performedBy: "Ashan Fernando", role: "admin", timestamp: "2026-03-06T09:00:00", details: { name: "Cupboard C", code: "CUP-C", location: "Lab Room 102" } },
  { id: 8,  action: "PLACE_ADDED",      entity: "Storage", entityName: "Shelf 1 → Cupboard C",performedBy:"Ashan Fernando", role: "admin", timestamp: "2026-03-06T09:15:00", details: { place: "Shelf 1", cupboard: "Cupboard C", capacity: 12 } },
  { id: 9,  action: "ITEM_RETURNED",    entity: "Borrow",  entityName: "Breadboard × 3",     performedBy: "Nimali Silva",   role: "staff", timestamp: "2026-03-05T16:00:00", details: { item: "Breadboard", code: "CM-006", qty: 3, returnedBy: "Nimali Silva", condition: "Good" } },
  { id: 10, action: "USER_ROLE_CHANGED",entity: "User",    entityName: "Dilani Wickrama",    performedBy: "Ashan Fernando", role: "admin", timestamp: "2026-03-04T14:30:00", details: { name: "Dilani Wickrama", previousRole: "staff", newRole: "admin" } },
  { id: 11, action: "ITEM_RETURNED",    entity: "Borrow",  entityName: "Logic Analyzer × 1", performedBy: "Tharindu Madush",role: "staff", timestamp: "2026-03-03T10:00:00", details: { item: "Logic Analyzer", code: "EQ-009", qty: 1, returnedBy: "Tharindu Madush", condition: "Fair" } },
  { id: 12, action: "USER_CREATED",     entity: "User",    entityName: "Nimali Silva",       performedBy: "Ashan Fernando", role: "admin", timestamp: "2026-02-28T09:00:00", details: { name: "Nimali Silva", email: "nimali@ceyntics.com", role: "staff" } },
  { id: 13, action: "CUPBOARD_EDITED",  entity: "Storage", entityName: "Cupboard A",         performedBy: "Ashan Fernando", role: "admin", timestamp: "2026-02-25T11:00:00", details: { name: "Cupboard A", changedFields: ["description", "location"] } },
  { id: 14, action: "USER_DELETED",     entity: "User",    entityName: "Old Staff Account",  performedBy: "Ashan Fernando", role: "admin", timestamp: "2026-02-20T15:00:00", details: { name: "Old Staff Account", email: "old@ceyntics.com" } },
  { id: 15, action: "ITEM_BORROWED",    entity: "Borrow",  entityName: "Power Supply × 1",   performedBy: "Ruwan Jayasinghe",role:"staff", timestamp: "2026-03-08T10:00:00", details: { item: "Power Supply", code: "EQ-010", qty: 1, borrower: "Ruwan Jayasinghe", dueDate: "Mar 10, 2026" } },
];

/* ── Action config ── */
const ACTION_CONFIG = {
  ITEM_BORROWED:    { label: "Item Borrowed",    icon: "📤", color: "#f59e0b", bg: "#fef3c7" },
  ITEM_RETURNED:    { label: "Item Returned",    icon: "↩️", color: "#10b981", bg: "#d1fae5" },
  USER_CREATED:     { label: "User Created",     icon: "👤", color: "#6366f1", bg: "#ede9fe" },
  USER_DEACTIVATED: { label: "User Deactivated", icon: "🔒", color: "#ef4444", bg: "#fee2e2" },
  USER_ACTIVATED:   { label: "User Activated",   icon: "🔓", color: "#10b981", bg: "#d1fae5" },
  USER_ROLE_CHANGED:{ label: "Role Changed",     icon: "🔄", color: "#8b5cf6", bg: "#f3e8ff" },
  USER_DELETED:     { label: "User Deleted",     icon: "🗑️", color: "#ef4444", bg: "#fee2e2" },
  CUPBOARD_CREATED: { label: "Cupboard Created", icon: "🗄️", color: "#06b6d4", bg: "#cffafe" },
  CUPBOARD_EDITED:  { label: "Cupboard Edited",  icon: "✏️", color: "#06b6d4", bg: "#cffafe" },
  CUPBOARD_DELETED: { label: "Cupboard Deleted", icon: "🗑️", color: "#ef4444", bg: "#fee2e2" },
  PLACE_ADDED:      { label: "Place Added",      icon: "📍", color: "#06b6d4", bg: "#cffafe" },
  PLACE_EDITED:     { label: "Place Edited",     icon: "✏️", color: "#06b6d4", bg: "#cffafe" },
  PLACE_DELETED:    { label: "Place Deleted",    icon: "🗑️", color: "#ef4444", bg: "#fee2e2" },
};

const ENTITY_FILTERS = ["all", "Borrow", "User", "Storage"];
const ACTION_FILTERS = [
  { value: "all",     label: "All Actions" },
  { value: "borrow",  label: "Borrows"     },
  { value: "user",    label: "Users"       },
  { value: "storage", label: "Storage"     },
];

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60)           return "just now";
  if (diff < 3600)         return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)        return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7)    return `${Math.floor(diff / 86400)}d ago`;
  return formatTime(ts);
}

/* ── Detail Modal ── */
function LogDetail({ log, onClose }) {
  const cfg = ACTION_CONFIG[log.action] || { label: log.action, icon: "📋", color: "#6366f1", bg: "#ede9fe" };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(5px)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: "18px",
        width: "100%", maxWidth: "460px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
        animation: "slideUp 0.25s ease", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "14px",
          background: cfg.bg
        }}>
          <div style={{
            width: "46px", height: "46px", borderRadius: "12px",
            background: cfg.color, fontSize: "20px",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>{cfg.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>{cfg.label}</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{log.entityName}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "22px", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Meta */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
            {[
              { label: "Performed By", value: log.performedBy },
              { label: "Role",         value: log.role.charAt(0).toUpperCase() + log.role.slice(1) },
              { label: "Entity",       value: log.entity },
              { label: "Timestamp",    value: formatTime(log.timestamp) },
            ].map((row, i) => (
              <div key={i} style={{ background: "var(--surface2)", borderRadius: "9px", padding: "10px 13px" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>{row.label}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>{row.value}</div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Change Details</div>
          <div style={{ background: "var(--surface2)", borderRadius: "10px", padding: "14px 16px" }}>
            {Object.entries(log.details).map(([key, val], i, arr) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "6px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", gap: "12px"
              }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", textAlign: "right" }}>
                  {Array.isArray(val) ? val.join(", ") : String(val)}
                </span>
              </div>
            ))}
          </div>

          <button onClick={onClose} style={{
            width: "100%", marginTop: "18px", padding: "11px",
            background: "#0f0f1a", color: "#fff", border: "none",
            borderRadius: "10px", fontFamily: "'Syne',sans-serif",
            fontWeight: 700, fontSize: "13px", cursor: "pointer", transition: "background 0.15s"
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#6366f1"}
            onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
          >Close</button>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN AUDIT LOG PAGE
══════════════════════════════════════════ */
export default function AuditLog() {
  const [logs,         ]         = useState(INITIAL_LOGS);
  const [search,       setSearch]       = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter,   setUserFilter]   = useState("all");
  const [dateFilter,   setDateFilter]   = useState("");
  const [detailLog,    setDetailLog]    = useState(null);

  const allUsers = ["all", ...Array.from(new Set(logs.map(l => l.performedBy)))];

  const filtered = useMemo(() => logs.filter(log => {
    const matchSearch = log.entityName.toLowerCase().includes(search.toLowerCase()) ||
                        log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
                        log.action.toLowerCase().includes(search.toLowerCase());
    const matchEntity = entityFilter === "all" || log.entity === entityFilter;
    const matchUser   = userFilter   === "all" || log.performedBy === userFilter;
    const matchAction = actionFilter === "all"
      || (actionFilter === "borrow"  && (log.action === "ITEM_BORROWED" || log.action === "ITEM_RETURNED"))
      || (actionFilter === "user"    && log.entity === "User")
      || (actionFilter === "storage" && log.entity === "Storage");
    const matchDate   = !dateFilter || log.timestamp.startsWith(dateFilter);
    return matchSearch && matchEntity && matchUser && matchAction && matchDate;
  }), [logs, search, entityFilter, actionFilter, userFilter, dateFilter]);

  /* Group by date */
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return Object.entries(groups);
  }, [filtered]);

  const counts = useMemo(() => ({
    total:   logs.length,
    borrows: logs.filter(l => l.action === "ITEM_BORROWED" || l.action === "ITEM_RETURNED").length,
    users:   logs.filter(l => l.entity === "User").length,
    storage: logs.filter(l => l.entity === "Storage").length,
  }), [logs]);

  return (
    <div style={{ animation: "fadeUp 0.4s ease forwards" }}>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-eyebrow">Admin Panel</div>
        <h1 className="page-title">Audit <span>Log</span></h1>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Events",  value: counts.total,   icon: "📋", bg: "#ede9fe", color: "#6366f1" },
          { label: "Borrow Events", value: counts.borrows, icon: "📤", bg: "#fef3c7", color: "#f59e0b" },
          { label: "User Events",   value: counts.users,   icon: "👤", bg: "#d1fae5", color: "#10b981" },
          { label: "Storage Events",value: counts.storage, icon: "🗄️", bg: "#cffafe", color: "#06b6d4" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "var(--surface)", border: "1.5px solid var(--border)",
            borderRadius: "14px", padding: "16px 18px",
            display: "flex", alignItems: "center", gap: "12px",
            animation: `fadeUp 0.35s ease ${i * 0.06}s forwards`, opacity: 0
          }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: s.bg, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "3px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "var(--surface)", border: "1.5px solid var(--border)",
          borderRadius: "10px", padding: "9px 14px", flex: 1, minWidth: "220px"
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8a8a8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search actions, names, entities..."
            style={{ border: "none", background: "none", outline: "none", fontSize: "13.5px", color: "var(--text-primary)", fontFamily: "'DM Sans',sans-serif", width: "100%" }} />
          {search && <button onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "18px", lineHeight: 1 }}>×</button>}
        </div>

        {/* Action type filter */}
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{
          padding: "9px 14px", borderRadius: "10px", border: "1.5px solid var(--border)",
          background: "var(--surface)", color: "var(--text-primary)",
          fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer"
        }}>
          {ACTION_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        {/* User filter */}
        <select value={userFilter} onChange={e => setUserFilter(e.target.value)} style={{
          padding: "9px 14px", borderRadius: "10px", border: "1.5px solid var(--border)",
          background: "var(--surface)", color: "var(--text-primary)",
          fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer"
        }}>
          {allUsers.map(u => <option key={u} value={u}>{u === "all" ? "All Users" : u}</option>)}
        </select>

        {/* Date filter */}
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{
          padding: "9px 14px", borderRadius: "10px", border: "1.5px solid var(--border)",
          background: "var(--surface)", color: dateFilter ? "var(--text-primary)" : "var(--text-muted)",
          fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer"
        }} />

        {/* Clear filters */}
        {(search || actionFilter !== "all" || userFilter !== "all" || dateFilter) && (
          <button onClick={() => { setSearch(""); setActionFilter("all"); setUserFilter("all"); setEntityFilter("all"); setDateFilter(""); }} style={{
            padding: "9px 14px", borderRadius: "10px",
            border: "1.5px solid #fca5a5", background: "#fee2e2",
            color: "#ef4444", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap"
          }}>✕ Clear Filters</button>
        )}

        <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {filtered.length} event{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>No events found</div>
          <div style={{ fontSize: "13px" }}>Try adjusting your filters or search query</div>
        </div>
      )}

      {/* Grouped Log Entries */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {grouped.map(([date, entries]) => (
          <div key={date}>
            {/* Date separator */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px"
            }}>
              <div style={{
                fontSize: "11px", fontWeight: 700, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "1.2px", whiteSpace: "nowrap"
              }}>{date}</div>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
              <div style={{
                fontSize: "10px", padding: "2px 8px", borderRadius: "100px",
                background: "var(--surface2)", color: "var(--text-muted)", fontWeight: 600
              }}>{entries.length} event{entries.length !== 1 ? "s" : ""}</div>
            </div>

            {/* Log rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {entries.map((log, i) => {
                const cfg = ACTION_CONFIG[log.action] || { label: log.action, icon: "📋", color: "#6366f1", bg: "#ede9fe" };
                return (
                  <div key={log.id} onClick={() => setDetailLog(log)} style={{
                    background: "var(--surface)", border: "1.5px solid var(--border)",
                    borderRadius: "12px", padding: "14px 18px",
                    display: "flex", alignItems: "center", gap: "14px",
                    cursor: "pointer", transition: "all 0.15s",
                    animation: `fadeUp 0.3s ease ${i * 0.04}s forwards`, opacity: 0
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.06)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = ""; }}
                  >
                    {/* Action icon */}
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "10px",
                      background: cfg.bg, fontSize: "17px",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>{cfg.icon}</div>

                    {/* Action badge + entity */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: "11px", padding: "2px 8px", borderRadius: "100px",
                          background: cfg.bg, color: cfg.color, fontWeight: 700, letterSpacing: "0.3px"
                        }}>{cfg.label}</span>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>
                          {log.entityName}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          👤 <span style={{ color: "var(--text-secondary)" }}>{log.performedBy}</span>
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          <span style={{
                            fontSize: "10px", padding: "1px 6px", borderRadius: "100px",
                            background: log.role === "admin" ? "#ede9fe" : "#d1fae5",
                            color: log.role === "admin" ? "#6366f1" : "#10b981",
                            fontWeight: 600, marginRight: "4px"
                          }}>{log.role}</span>
                        </span>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {timeAgo(log.timestamp)}
                      </div>
                    </div>

                    {/* Chevron */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {detailLog && <LogDetail log={detailLog} onClose={() => setDetailLog(null)} />}

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}