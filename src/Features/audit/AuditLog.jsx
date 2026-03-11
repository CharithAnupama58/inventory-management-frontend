import { useState, useEffect, useCallback, useMemo } from "react";
import { AuditLogService } from "../../services/otherServices";

const ACTION_CONFIG = {
  ITEM_BORROWED:    { label: "Item Borrowed",    icon: "📤", color: "#f59e0b", bg: "#fef3c7" },
  ITEM_RETURNED:    { label: "Item Returned",    icon: "↩️", color: "#10b981", bg: "#d1fae5" },
  USER_CREATED:     { label: "User Created",     icon: "👤", color: "#6366f1", bg: "#ede9fe" },
  USER_UPDATED:     { label: "User Updated",     icon: "✏️", color: "#6366f1", bg: "#ede9fe" },
  USER_DEACTIVATED: { label: "User Deactivated", icon: "🔒", color: "#ef4444", bg: "#fee2e2" },
  USER_ACTIVATED:   { label: "User Activated",   icon: "🔓", color: "#10b981", bg: "#d1fae5" },
  USER_ROLE_CHANGED:{ label: "Role Changed",     icon: "🔄", color: "#8b5cf6", bg: "#f3e8ff" },
  USER_DELETED:     { label: "User Deleted",     icon: "🗑️", color: "#ef4444", bg: "#fee2e2" },
  CUPBOARD_CREATED: { label: "Cupboard Created", icon: "🗄️", color: "#06b6d4", bg: "#cffafe" },
  CUPBOARD_UPDATED: { label: "Cupboard Edited",  icon: "✏️", color: "#06b6d4", bg: "#cffafe" },
  CUPBOARD_DELETED: { label: "Cupboard Deleted", icon: "🗑️", color: "#ef4444", bg: "#fee2e2" },
  PLACE_CREATED:    { label: "Place Added",      icon: "📍", color: "#06b6d4", bg: "#cffafe" },
  PLACE_UPDATED:    { label: "Place Edited",     icon: "✏️", color: "#06b6d4", bg: "#cffafe" },
  PLACE_DELETED:    { label: "Place Deleted",    icon: "🗑️", color: "#ef4444", bg: "#fee2e2" },
};

const ACTION_FILTERS = [
  { value: "all",     label: "All Actions" },
  { value: "borrow",  label: "Borrows"     },
  { value: "user",    label: "Users"       },
  { value: "storage", label: "Storage"     },
];

function formatTime(ts) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60)        return "just now";
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return formatTime(ts);
}

// Map API log → UI log
const mapLog = (log) => ({
  id:          log.id,
  action:      log.action,
  entity:      log.entity_type  || "System",
  entityName:  log.entity_name  || "—",
  performedBy: log.performed_by_name || log.user?.name || "System",
  role:        log.performed_by_role || log.user?.role || "admin",
  timestamp:   log.created_at,
  details:     {
    ...(log.previous_value ? { previousValue: JSON.stringify(log.previous_value) } : {}),
    ...(log.new_value       ? { newValue:      JSON.stringify(log.new_value)       } : {}),
    description: log.description || log.action,
  },
  rawDetails: log.new_value || log.previous_value || {},
});

/* ── Detail Modal ── */
function LogDetail({ log, onClose }) {
  const cfg = ACTION_CONFIG[log.action] || { label: log.action, icon: "📋", color: "#6366f1", bg: "#ede9fe" };
  const details = log.rawDetails || {};

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
        <div style={{
          padding: "20px 24px 16px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "14px", background: cfg.bg
        }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: cfg.color, fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{cfg.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>{cfg.label}</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{log.entityName}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "22px", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
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

          {Object.keys(details).length > 0 && (
            <>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Change Details</div>
              <div style={{ background: "var(--surface2)", borderRadius: "10px", padding: "14px 16px" }}>
                {Object.entries(details).map(([key, val], i, arr) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    padding: "6px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", gap: "12px"
                  }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "capitalize", flexShrink: 0 }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", textAlign: "right", wordBreak: "break-word" }}>
                      {Array.isArray(val) ? val.join(", ") : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

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
  const [logs,         setLogs]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [totalCount,   setTotalCount]   = useState(0);
  const [search,       setSearch]       = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter,   setUserFilter]   = useState("all");
  const [dateFilter,   setDateFilter]   = useState("");
  const [detailLog,    setDetailLog]    = useState(null);

  // ── Fetch logs ──
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AuditLogService.getAll({ per_page: 100 });
      const mapped = (res.data || []).map(mapLog);
      setLogs(mapped);
      setTotalCount(res.meta?.total || mapped.length);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // ── Unique users for filter ──
  const allUsers = useMemo(() =>
    ["all", ...Array.from(new Set(logs.map(l => l.performedBy)))],
    [logs]
  );

  // ── Client-side filtering ──
  const filtered = useMemo(() => logs.filter(log => {
    const matchSearch = log.entityName.toLowerCase().includes(search.toLowerCase()) ||
                        log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
                        log.action.toLowerCase().includes(search.toLowerCase());
    const matchUser   = userFilter === "all" || log.performedBy === userFilter;
    const matchAction = actionFilter === "all"
      || (actionFilter === "borrow"  && (log.action === "ITEM_BORROWED" || log.action === "ITEM_RETURNED"))
      || (actionFilter === "user"    && log.entity === "User")
      || (actionFilter === "storage" && (log.entity === "Storage" || log.entity === "Cupboard" || log.entity === "Place"));
    const matchDate   = !dateFilter || log.timestamp?.startsWith(dateFilter);
    return matchSearch && matchUser && matchAction && matchDate;
  }), [logs, search, actionFilter, userFilter, dateFilter]);

  // ── Group by date ──
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return Object.entries(groups);
  }, [filtered]);

  // ── Stats ──
  const counts = useMemo(() => ({
    total:   totalCount,
    borrows: logs.filter(l => l.action === "ITEM_BORROWED" || l.action === "ITEM_RETURNED").length,
    users:   logs.filter(l => l.entity === "User").length,
    storage: logs.filter(l => ["Storage","Cupboard","Place"].includes(l.entity)).length,
  }), [logs, totalCount]);

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
          { label: "Total Events",   value: counts.total,   icon: "📋", bg: "#ede9fe", color: "#6366f1" },
          { label: "Borrow Events",  value: counts.borrows, icon: "📤", bg: "#fef3c7", color: "#f59e0b" },
          { label: "User Events",    value: counts.users,   icon: "👤", bg: "#d1fae5", color: "#10b981" },
          { label: "Storage Events", value: counts.storage, icon: "🗄️", bg: "#cffafe", color: "#06b6d4" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "var(--surface)", border: "1.5px solid var(--border)",
            borderRadius: "14px", padding: "16px 18px",
            display: "flex", alignItems: "center", gap: "12px",
            animation: `fadeUp 0.35s ease ${i * 0.06}s forwards`, opacity: 0
          }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: s.bg, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--text-primary)", lineHeight: 1 }}>
                {loading ? "…" : s.value}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "3px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
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

        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ padding: "9px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer" }}>
          {ACTION_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <select value={userFilter} onChange={e => setUserFilter(e.target.value)} style={{ padding: "9px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer" }}>
          {allUsers.map(u => <option key={u} value={u}>{u === "all" ? "All Users" : u}</option>)}
        </select>

        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ padding: "9px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "var(--surface)", color: dateFilter ? "var(--text-primary)" : "var(--text-muted)", fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer" }} />

        {(search || actionFilter !== "all" || userFilter !== "all" || dateFilter) && (
          <button onClick={() => { setSearch(""); setActionFilter("all"); setUserFilter("all"); setDateFilter(""); }} style={{ padding: "9px 14px", borderRadius: "10px", border: "1.5px solid #fca5a5", background: "#fee2e2", color: "#ef4444", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>✕ Clear</button>
        )}

        <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {loading ? "Loading..." : `${filtered.length} event${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>No events found</div>
          <div style={{ fontSize: "13px" }}>Try adjusting your filters or search query</div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-muted)", fontSize: "13px" }}>Loading audit log...</div>
      )}

      {/* Grouped log entries */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {grouped.map(([date, entries]) => (
          <div key={date}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.2px", whiteSpace: "nowrap" }}>{date}</div>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
              <div style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "100px", background: "var(--surface2)", color: "var(--text-muted)", fontWeight: 600 }}>
                {entries.length} event{entries.length !== 1 ? "s" : ""}
              </div>
            </div>

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
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: cfg.bg, fontSize: "17px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{cfg.icon}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "100px", background: cfg.bg, color: cfg.color, fontWeight: 700, letterSpacing: "0.3px" }}>{cfg.label}</span>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>{log.entityName}</span>
                      </div>
                      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          👤 <span style={{ color: "var(--text-secondary)" }}>{log.performedBy}</span>
                        </span>
                        <span style={{
                          fontSize: "10px", padding: "1px 6px", borderRadius: "100px",
                          background: log.role === "admin" ? "#ede9fe" : "#d1fae5",
                          color: log.role === "admin" ? "#6366f1" : "#10b981",
                          fontWeight: 600
                        }}>{log.role}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{timeAgo(log.timestamp)}</div>
                    </div>

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

      {detailLog && <LogDetail log={detailLog} onClose={() => setDetailLog(null)} />}
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}