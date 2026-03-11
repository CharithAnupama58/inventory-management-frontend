import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import StatusBadge      from "../../Components/common/StatusBadge";
import ReturnForm       from "../inventory/ReturnForm";
import ItemService      from "../../services/itemService";
import BorrowService    from "../../services/borrowService";
import { UserService, CupboardService, AuditLogService } from "../../services/otherServices";

const getEmoji = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("solder"))       return "🔧";
  if (n.includes("oscilloscope")) return "📡";
  if (n.includes("arduino"))      return "🔌";
  if (n.includes("multimeter"))   return "⚡";
  if (n.includes("raspberry"))    return "💻";
  if (n.includes("breadboard"))   return "🔲";
  if (n.includes("wire"))         return "✂️";
  if (n.includes("heat"))         return "🌡️";
  if (n.includes("logic"))        return "🔍";
  if (n.includes("power"))        return "🔋";
  if (n.includes("esp"))          return "📶";
  if (n.includes("crimp"))        return "🔩";
  return "📦";
};

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  : "—";

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? "s" : ""} ago`;
  return formatDate(dateStr);
};

const getAuditStyle = (action = "") => {
  if (action.includes("borrow"))  return { icon: "📤", bg: "#fef3c7" };
  if (action.includes("return"))  return { icon: "↩️", bg: "#d1fae5" };
  if (action.includes("user"))    return { icon: "👤", bg: "#ede9fe" };
  if (action.includes("item"))    return { icon: "📦", bg: "#d1fae5" };
  if (action.includes("cupboard"))return { icon: "🗄️", bg: "#fef3c7" };
  if (action.includes("damage") || action.includes("alert")) return { icon: "⚠️", bg: "#fee2e2" };
  return { icon: "📋", bg: "#f3f4f6" };
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default function AdminView({ onNavigate }) {
  const { user } = useAuth();

  // ── Data state ──
  const [items,      setItems]      = useState([]);
  const [itemsMeta,  setItemsMeta]  = useState({});
  const [borrows,    setBorrows]    = useState([]);
  const [borrowMeta, setBorrowMeta] = useState({});
  const [cupboards,  setCupboards]  = useState([]);
  const [userCount,  setUserCount]  = useState(0);
  const [auditLogs,  setAuditLogs]  = useState([]);
  const [loading,    setLoading]    = useState(true);

  // ── Modal state ──
  const [returnBorrow, setReturnBorrow] = useState(null);

  // ── Fetch all in parallel ──
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [itemRes, borrowRes, cupboardRes, userRes, auditRes] = await Promise.all([
        ItemService.getAll({ per_page: 5 }),
        BorrowService.getAll({ status: "borrowed" }),
        CupboardService.getAll(),
        UserService.getAll({ per_page: 1 }),   // we only need meta.total
        AuditLogService.getAll({ per_page: 5 }),
      ]);

      // Items
      setItemsMeta(itemRes.meta || {});
      setItems(
        (itemRes.data || []).map(i => ({
          id:     i.id,
          name:   i.name,
          code:   i.code,
          qty:    i.quantity,
          status: i.status,
          emoji:  getEmoji(i.name),
          place:  i.place?.cupboard?.name && i.place?.name
                    ? `${i.place.cupboard.name} – ${i.place.name}`
                    : i.place?.name || "—",
        }))
      );

      // Borrows
      setBorrowMeta(borrowRes.meta || {});
      setBorrows(
        (borrowRes.data || []).slice(0, 4).map(b => ({
          id:          b.id,
          borrower:    b.borrower_name,
          contact:     b.contact,
          itemName:    b.item?.name  || "Unknown Item",
          code:        b.item?.code  || "—",
          emoji:       getEmoji(b.item?.name || ""),
          qty:         b.quantity,
          dueDate:     b.expected_return_date,
          dueDateLabel:formatDate(b.expected_return_date),
          borrowDate:  formatDate(b.borrow_date),
          status:      b.status,
          notes:       b.notes || "",
          condition:   b.return_condition || null,
          returnDate:  formatDate(b.actual_return_date),
          item:        b.item,
        }))
      );

      // Cupboards
      setCupboards(cupboardRes || []);

      // Users — total count from meta
      setUserCount(userRes.meta?.total || 0);

      // Audit logs
      setAuditLogs(
        (auditRes.data || []).slice(0, 5).map(log => {
          const style = getAuditStyle(log.action || "");
          return {
            icon: style.icon,
            bg:   style.bg,
            text: log.description || log.action || "System event",
            time: timeAgo(log.created_at),
          };
        })
      );
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived stats ──
  const firstName   = user?.name?.split(" ")[0] || "Admin";
  const totalItems  = itemsMeta.total   || 0;
  const activeBorrows = borrowMeta.counts?.active   || borrows.length;
  const overdueCount  = borrowMeta.counts?.overdue  || 0;
  const alerts        = overdueCount + (itemsMeta.damaged || 0);

  // ── After return → refresh ──
  const handleReturnSuccess = () => {
    setReturnBorrow(null);
    fetchAll();
  };

  const QUICK_ACTIONS = [
    { icon: "👤", label: "Add User",     action: () => onNavigate?.("users") },
    { icon: "📦", label: "Add Item",     action: () => onNavigate?.("inventory") },
    { icon: "📤", label: "Borrow Item",  action: () => onNavigate?.("inventory") },
    { icon: "🗄️", label: "Add Cupboard", action: () => onNavigate?.("storage-mgmt") },
    { icon: "📋", label: "Audit Log",    action: () => onNavigate?.("audit") },
    { icon: "📍", label: "Add Place",    action: () => onNavigate?.("storage-mgmt") },
  ];

  return (
    <>
      {/* Page Greeting */}
      <div className="page-header">
        <div className="page-eyebrow">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
        <h1 className="page-title">{getGreeting()}, <span>{firstName}.</span></h1>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard color="#6366f1" iconBg="#ede9fe" trend="trend-up" trendLabel="all items" value={loading ? "…" : totalItems} label="Total Items">
          <BoxIcon color="#6366f1" />
        </StatCard>
        <StatCard color="#f59e0b" iconBg="#fef3c7" trend="trend-neutral" trendLabel="active" value={loading ? "…" : activeBorrows} label="Borrowed Items">
          <ArrowIcon color="#f59e0b" />
        </StatCard>
        <StatCard color="#10b981" iconBg="#d1fae5" trend="trend-up" trendLabel="registered" value={loading ? "…" : userCount} label="Total Users">
          <UsersIcon color="#10b981" />
        </StatCard>
        <StatCard color="#ef4444" iconBg="#fee2e2" trend={alerts > 0 ? "trend-down" : "trend-neutral"} trendLabel="needs action" value={loading ? "…" : alerts} label="Alerts">
          <AlertIcon color="#ef4444" />
        </StatCard>
      </div>

      {/* Two column layout */}
      <div className="two-col">

        {/* Left col */}
        <div className="col">

          {/* Inventory Table */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Recent Inventory</span>
              <button className="panel-action" onClick={() => onNavigate?.("inventory")}>View All →</button>
            </div>
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>Loading...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Item</th><th>Qty</th><th>Location</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="item-cell">
                          <div className="item-thumb">{item.emoji}</div>
                          <div>
                            <div>{item.name}</div>
                            <div className="item-sub">{item.code}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>{item.qty}</td>
                      <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.place}</td>
                      <td><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Active Borrows */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Active Borrows</span>
              <button className="panel-action" onClick={() => onNavigate?.("borrows")}>Manage →</button>
            </div>
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>Loading...</div>
            ) : borrows.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>No active borrows</div>
            ) : borrows.map(b => {
              const isOverdue = b.dueDate && new Date(b.dueDate) < new Date();
              return (
                <div className="borrow-item" key={b.id}>
                  <div className="avatar" style={{ background: "linear-gradient(135deg,#6366f1,#10b981)" }}>
                    {b.borrower.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="borrow-info">
                    <div className="borrow-name">
                      {b.borrower}
                      {isOverdue && (
                        <span style={{ fontSize: "10px", marginLeft: "6px", padding: "1px 6px", borderRadius: "100px", background: "#fee2e2", color: "#991b1b", fontWeight: 600 }}>OVERDUE</span>
                      )}
                    </div>
                    <div className="borrow-detail">
                      {b.emoji} {b.itemName} × {b.qty} · Due{" "}
                      <strong style={{ color: isOverdue ? "#ef4444" : "#f59e0b" }}>{b.dueDateLabel}</strong>
                    </div>
                  </div>
                  <button
                    className="action-btn btn-return"
                    onClick={() => setReturnBorrow(b)}
                  >Return</button>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right col */}
        <div className="col">

          {/* Quick Actions */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Quick Actions</span>
            </div>
            <div className="quick-grid">
              {QUICK_ACTIONS.map((a, i) => (
                <div className="quick-btn" key={i} onClick={a.action} style={{ cursor: "pointer" }}>
                  <div className="quick-icon">{a.icon}</div>
                  <span className="quick-label">{a.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Storage Overview */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Storage Overview</span>
              <button className="panel-action" onClick={() => onNavigate?.("storage-mgmt")}>Manage →</button>
            </div>
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>Loading...</div>
            ) : (
              <div className="storage-list">
                {cupboards.map((c, i) => {
                  const places    = c.places || [];
                  const totalPlaces = places.length;
                  const usedPlaces  = places.filter(p => (p.item_count || 0) > 0).length;
                  const pct         = totalPlaces > 0 ? Math.round((usedPlaces / totalPlaces) * 100) : 0;
                  return (
                    <div className="storage-card" key={c.id || i}>
                      <div className="storage-top">
                        <span className="storage-name">🗄️ {c.name}</span>
                        <span className="storage-count">{usedPlaces}/{totalPlaces} places</span>
                      </div>
                      <div className="storage-bar">
                        <div className="storage-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Audit Log */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Audit Log</span>
              <button className="panel-action" onClick={() => onNavigate?.("audit")}>Full Log →</button>
            </div>
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>Loading...</div>
            ) : auditLogs.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>No recent activity</div>
            ) : auditLogs.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-icon" style={{ background: a.bg }}>{a.icon}</div>
                <div>
                  <div className="activity-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Return Form Modal ── */}
      {returnBorrow && (
        <ReturnForm
          borrow={returnBorrow}
          onClose={() => setReturnBorrow(null)}
          onSuccess={handleReturnSuccess}
        />
      )}
    </>
  );
}

/* ── Mini stat card ── */
function StatCard({ color, iconBg, trend, trendLabel, value, label, children }) {
  return (
    <div className="stat-card">
      <div className="stat-card-bg" style={{ background: color }} />
      <div className="stat-card-top">
        <div className="stat-icon" style={{ background: iconBg }}>{children}</div>
        <span className={`trend ${trend}`}>{trendLabel}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function BoxIcon({ color }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>;
}
function ArrowIcon({ color }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>;
}
function UsersIcon({ color }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>;
}
function AlertIcon({ color }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>;
}