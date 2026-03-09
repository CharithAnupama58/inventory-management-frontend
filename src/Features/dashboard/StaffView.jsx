import { useState } from "react";
import StatusBadge from "../../Components/common/StatusBadge";
import BorrowForm  from "../inventory/BorrowForm";
import ReturnForm  from "../inventory/ReturnForm";

const AVAILABLE = [
  { id: 1, name: "Oscilloscope",   code: "EQ-002", qty: 3,  place: "Cupboard B – Shelf 2", emoji: "📡", status: "instore", description: "4-channel 100MHz digital oscilloscope." },
  { id: 2, name: "Raspberry Pi 4", code: "CM-005", qty: 5,  place: "Cupboard A – Shelf 1", emoji: "💻", status: "instore", description: "Raspberry Pi 4 Model B 4GB." },
  { id: 3, name: "Multimeter",     code: "EQ-004", qty: 4,  place: "Cupboard C – Shelf 1", emoji: "⚡", status: "instore", description: "Digital multimeter for voltage, current and resistance." },
  { id: 4, name: "Breadboard",     code: "CM-006", qty: 10, place: "Cupboard A – Shelf 2", emoji: "🔲", status: "instore", description: "830-point solderless breadboard." },
];

const INITIAL_BORROWS = [
  { id: 1, itemName: "Soldering Iron", code: "EQ-001", emoji: "🔧", borrowerName: "Staff User", contact: "+94 77 123 4567", qty: 1, borrowDate: "Mar 05, 2026", dueDate: "2026-03-12", dueDateLabel: "Mar 12, 2026", status: "borrowed", notes: "" },
  { id: 2, itemName: "Arduino Mega",   code: "CM-003", emoji: "🔌", borrowerName: "Staff User", contact: "+94 77 123 4567", qty: 2, borrowDate: "Mar 07, 2026", dueDate: "2026-03-14", dueDateLabel: "Mar 14, 2026", status: "borrowed", notes: "For robotics project" },
];

const MY_ACTIVITY = [
  { icon: "📤", bg: "#fef3c7", text: "You borrowed <strong>Soldering Iron × 1</strong>", time: "Mar 05, 2026" },
  { icon: "📤", bg: "#fef3c7", text: "You borrowed <strong>Arduino Mega × 2</strong>",   time: "Mar 07, 2026" },
  { icon: "↩️", bg: "#d1fae5", text: "You returned <strong>Oscilloscope × 1</strong>",   time: "Feb 28, 2026" },
];

const CUPBOARDS = [
  { name: "Cupboard A", places: ["Shelf 1", "Shelf 2", "Shelf 3"], color: "#ede9fe" },
  { name: "Cupboard B", places: ["Shelf 1", "Shelf 2"],            color: "#d1fae5" },
  { name: "Cupboard C", places: ["Shelf 1"],                       color: "#fef3c7" },
];

export default function StaffView({ onNavigate }) {
  const [borrows,      setBorrows]      = useState(INITIAL_BORROWS);
  const [borrowItem,   setBorrowItem]   = useState(null);
  const [returnBorrow, setReturnBorrow] = useState(null);

  const activeBorrows = borrows.filter(b => b.status === "borrowed");

  const handleReturnSuccess = ({ borrow, condition, notes }) => {
    setBorrows(prev => prev.map(b =>
      b.id === borrow.id ? { ...b, status: "returned", condition, notes } : b
    ));
    setReturnBorrow(null);
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
        <h1 className="page-title">Good morning, <span>Team.</span></h1>
      </div>

      {/* Stats — all clickable */}
      <div className="stats-grid">
        <StatCard color="#6366f1" iconBg="#ede9fe" trend="trend-up" trendLabel="available" value="48" label="Total Items" onClick={() => onNavigate("inventory")}>
          <BoxIcon color="#6366f1" />
        </StatCard>
        <StatCard color="#f59e0b" iconBg="#fef3c7" trend="trend-neutral" trendLabel="my borrows" value={activeBorrows.length} label="Items I Borrowed" onClick={() => onNavigate("borrow")}>
          <ArrowIcon color="#f59e0b" />
        </StatCard>
        <StatCard color="#10b981" iconBg="#d1fae5" trend="trend-up" trendLabel="active" value="3" label="Cupboards" onClick={() => onNavigate("storage")}>
          <StorageIcon color="#10b981" />
        </StatCard>
        <StatCard color="#ef4444" iconBg="#fee2e2" trend="trend-down" trendLabel="due soon" value="1" label="Due This Week" onClick={() => onNavigate("borrow")}>
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
            <table className="data-table">
              <thead>
                <tr><th>Item</th><th>Qty</th><th>Location</th><th>Action</th></tr>
              </thead>
              <tbody>
                {AVAILABLE.map(item => (
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
          </div>

          {/* My Active Borrows */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">My Active Borrows</span>
              <button className="panel-action" onClick={() => onNavigate("borrow")}>History →</button>
            </div>
            {activeBorrows.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                No active borrows
              </div>
            ) : activeBorrows.map(b => (
              <div className="borrow-item" key={b.id}>
                <div style={{ fontSize: "22px" }}>{b.emoji}</div>
                <div className="borrow-info">
                  <div className="borrow-name">
                    {b.itemName}
                    <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: "12px" }}> × {b.qty}</span>
                  </div>
                  <div className="borrow-detail">
                    Borrowed {b.borrowDate} · Due <strong style={{ color: "#f59e0b" }}>{b.dueDateLabel}</strong>
                  </div>
                </div>
                <button className="action-btn btn-return" onClick={() => setReturnBorrow(b)}>
                  Return
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Right col */}
        <div className="col">

          {/* Quick Actions — all wired */}
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

          {/* My Activity */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">My Activity</span>
              <button className="panel-action" onClick={() => onNavigate("borrow")}>View All →</button>
            </div>
            {MY_ACTIVITY.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-icon" style={{ background: a.bg }}>{a.icon}</div>
                <div>
                  <div className="activity-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Storage Locations — clickable cards */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Storage Locations</span>
              <button className="panel-action" onClick={() => onNavigate("storage")}>View Map →</button>
            </div>
            <div className="storage-list">
              {CUPBOARDS.map((c, i) => (
                <div
                  key={i}
                  className="storage-card"
                  onClick={() => onNavigate("storage")}
                  style={{ background: c.color, borderColor: "transparent", cursor: "pointer", transition: "opacity 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  <div className="storage-top">
                    <span className="storage-name">🗄️ {c.name}</span>
                    <span className="storage-count">{c.places.length} places</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                    {c.places.map((p, j) => (
                      <span key={j} style={{
                        fontSize: "10px", padding: "2px 8px",
                        background: "rgba(255,255,255,0.6)",
                        borderRadius: "100px", color: "var(--text-secondary)"
                      }}>{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Borrow Form Modal ── */}
      {borrowItem && (
        <BorrowForm
          item={borrowItem}
          onClose={() => setBorrowItem(null)}
          onSuccess={() => {
            setBorrowItem(null);
            // TODO: POST /api/borrows → refresh data
          }}
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