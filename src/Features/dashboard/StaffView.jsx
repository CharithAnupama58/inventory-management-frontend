import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import StatusBadge   from "../../Components/common/StatusBadge";
import BorrowForm    from "../inventory/BorrowForm";
import ReturnForm    from "../inventory/ReturnForm";
import ItemService   from "../../services/itemService";
import BorrowService from "../../services/borrowService";
import { CupboardService } from "../../services/otherServices";

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

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default function StaffView({ onNavigate }) {
  const { user } = useAuth();

  // ── Data state ──
  const [items,      setItems]      = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [borrows,    setBorrows]    = useState([]);
  const [cupboards,  setCupboards]  = useState([]);
  const [loading,    setLoading]    = useState(true);

  // ── Modal state ──
  const [borrowItem,   setBorrowItem]   = useState(null);
  const [returnBorrow, setReturnBorrow] = useState(null);

  // ── Fetch all dashboard data in parallel ──
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [itemRes, borrowRes, cupboardRes] = await Promise.all([
        ItemService.getAll({ per_page: 6 }),
        BorrowService.getMyBorrows(),
        CupboardService.getAll(),
      ]);

      // Items — store total count from meta, display top 4 available
      setTotalItems(itemRes.meta?.total || 0);
      const allItems = itemRes.data || [];
      setItems(
        allItems
          .filter(i => i.status === "instore" && i.quantity > 0)
          .slice(0, 4)
          .map(i => ({
            id:          i.id,
            name:        i.name,
            code:        i.code,
            qty:         i.quantity,
            status:      i.status,
            description: i.description || "",
            emoji:       getEmoji(i.name),
            place:       i.place?.cupboard?.name && i.place?.name
                           ? `${i.place.cupboard.name} – ${i.place.name}`
                           : i.place?.name || "—",
          }))
      );

      // Borrows
      const allBorrows = (borrowRes.data || []).map(b => ({
        ...b,
        emoji:        getEmoji(b.item?.name || ""),
        itemName:     b.item?.name  || "Unknown Item",
        code:         b.item?.code  || "—",
        qty:          b.quantity,
        borrowerName: b.borrower_name,
        contact:      b.contact,
        borrowDate:   formatDate(b.borrow_date),
        dueDate:      b.expected_return_date,
        dueDateLabel: formatDate(b.expected_return_date),
        returnDate:   formatDate(b.actual_return_date),
        condition:    b.return_condition || null,
      }));
      setBorrows(allBorrows);

      // Cupboards
      setCupboards(cupboardRes || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived stats ──
  const activeBorrows = borrows.filter(b => b.status === "borrowed");
  const firstName     = user?.name?.split(" ")[0] || "Team";

  const dueSoon = activeBorrows.filter(b => {
    if (!b.dueDate) return false;
    const days = Math.ceil((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 7;
  }).length;

  // ── My Activity — derived from borrows (most recent 3) ──
  const myActivity = borrows.slice(0, 3).map(b => ({
    icon: b.status === "returned" ? "↩️" : "📤",
    bg:   b.status === "returned" ? "#d1fae5" : "#fef3c7",
    text: b.status === "returned"
      ? `You returned <strong>${b.itemName} × ${b.qty}</strong>`
      : `You borrowed <strong>${b.itemName} × ${b.qty}</strong>`,
    time: b.status === "returned" ? b.returnDate : b.borrowDate,
  }));

  // ── After borrow → refresh ──
  const handleBorrowSuccess = () => {
    setBorrowItem(null);
    fetchAll();
  };

  // ── After return → refresh ──
  const handleReturnSuccess = () => {
    setReturnBorrow(null);
    fetchAll();
  };

  const QUICK_ACTIONS = [
    { icon: "📦", label: "Browse Items", action: () => onNavigate("inventory") },
    { icon: "📤", label: "Borrow Item",  action: () => onNavigate("inventory") },
    { icon: "↩️", label: "Return Item",  action: () => onNavigate("borrow")    },
    { icon: "🗄️", label: "View Storage", action: () => onNavigate("storage")   },
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
        <StatCard color="#6366f1" iconBg="#ede9fe" trend="trend-up" trendLabel="available" value={loading ? "…" : totalItems} label="Total Items" onClick={() => onNavigate("inventory")}>
          <BoxIcon color="#6366f1" />
        </StatCard>
        <StatCard color="#f59e0b" iconBg="#fef3c7" trend="trend-neutral" trendLabel="my borrows" value={loading ? "…" : activeBorrows.length} label="Items I Borrowed" onClick={() => onNavigate("borrow")}>
          <ArrowIcon color="#f59e0b" />
        </StatCard>
        <StatCard color="#10b981" iconBg="#d1fae5" trend="trend-up" trendLabel="active" value={loading ? "…" : cupboards.length} label="Cupboards" onClick={() => onNavigate("storage")}>
          <StorageIcon color="#10b981" />
        </StatCard>
        <StatCard color="#ef4444" iconBg="#fee2e2" trend={dueSoon > 0 ? "trend-down" : "trend-neutral"} trendLabel="due soon" value={loading ? "…" : dueSoon} label="Due This Week" onClick={() => onNavigate("borrow")}>
          <AlertIcon color="#ef4444" />
        </StatCard>
      </div>

      {/* Two column layout */}
      <div className="two-col">

        {/* Left col */}
        <div className="col">

          {/* Available Inventory */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Available Inventory</span>
              <button className="panel-action" onClick={() => onNavigate("inventory")}>Browse All →</button>
            </div>
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>Loading...</div>
            ) : items.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>No items available</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Item</th><th>Qty</th><th>Location</th><th>Action</th></tr>
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
                      <td>
                        <button className="action-btn btn-borrow" onClick={() => setBorrowItem(item)}>
                          Borrow
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* My Active Borrows */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">My Active Borrows</span>
              <button className="panel-action" onClick={() => onNavigate("borrow")}>History →</button>
            </div>
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>Loading...</div>
            ) : activeBorrows.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                No active borrows
              </div>
            ) : activeBorrows.map(b => {
              const isOverdue = b.dueDate && new Date(b.dueDate) < new Date();
              return (
                <div className="borrow-item" key={b.id}>
                  <div style={{ fontSize: "22px" }}>{b.emoji}</div>
                  <div className="borrow-info">
                    <div className="borrow-name">
                      {b.itemName}
                      <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: "12px" }}> × {b.qty}</span>
                    </div>
                    <div className="borrow-detail">
                      Borrowed {b.borrowDate} · Due{" "}
                      <strong style={{ color: isOverdue ? "#ef4444" : "#f59e0b" }}>
                        {b.dueDateLabel} {isOverdue && "(Overdue)"}
                      </strong>
                    </div>
                  </div>
                  <button className="action-btn btn-return" onClick={() => setReturnBorrow(b)}>
                    Return
                  </button>
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

          {/* My Activity — derived from real borrows */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">My Activity</span>
              <button className="panel-action" onClick={() => onNavigate("borrow")}>View All →</button>
            </div>
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>Loading...</div>
            ) : myActivity.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>No activity yet</div>
            ) : myActivity.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-icon" style={{ background: a.bg }}>{a.icon}</div>
                <div>
                  <div className="activity-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Storage Locations — from real API */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Storage Locations</span>
              <button className="panel-action" onClick={() => onNavigate("storage")}>View Map →</button>
            </div>
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>Loading...</div>
            ) : (
              <div className="storage-list">
                {cupboards.map((c, i) => (
                  <div
                    key={c.id || i}
                    className="storage-card"
                    onClick={() => onNavigate("storage")}
                    style={{ background: c.bg_color || "#ede9fe", borderColor: "transparent", cursor: "pointer", transition: "opacity 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    <div className="storage-top">
                      <span className="storage-name">🗄️ {c.name}</span>
                      <span className="storage-count">{(c.places || []).length} places</span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      {(c.places || []).map((p, j) => (
                        <span key={j} style={{
                          fontSize: "10px", padding: "2px 8px",
                          background: "rgba(255,255,255,0.6)",
                          borderRadius: "100px", color: "var(--text-secondary)"
                        }}>{p.name || p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Borrow Form Modal ── */}
      {borrowItem && (
        <BorrowForm
          item={borrowItem}
          onClose={() => setBorrowItem(null)}
          onSuccess={handleBorrowSuccess}
        />
      )}

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
function StatCard({ color, iconBg, trend, trendLabel, value, label, onClick, children }) {
  return (
    <div className="stat-card" onClick={onClick} style={{ cursor: "pointer" }}>
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
function StorageIcon({ color }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="2" y="3" width="20" height="5" rx="1"/>
    <rect x="2" y="10" width="20" height="5" rx="1"/>
    <rect x="2" y="17" width="20" height="5" rx="1"/>
  </svg>;
}
function AlertIcon({ color }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>;
}