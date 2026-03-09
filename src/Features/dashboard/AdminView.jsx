import StatusBadge from "../../Components/common/StatusBadge";

const ITEMS = [
  { id: 1, name: "Soldering Iron",  code: "EQ-001", qty: 5,  place: "Cupboard A – Shelf 1", status: "instore",  emoji: "🔧" },
  { id: 2, name: "Oscilloscope",    code: "EQ-002", qty: 2,  place: "Cupboard B – Shelf 2", status: "borrowed", emoji: "📡" },
  { id: 3, name: "Arduino Mega",    code: "CM-003", qty: 12, place: "Cupboard A – Shelf 3", status: "instore",  emoji: "🔌" },
  { id: 4, name: "Multimeter",      code: "EQ-004", qty: 1,  place: "Cupboard C – Shelf 1", status: "damaged",  emoji: "⚡" },
  { id: 5, name: "Raspberry Pi 4",  code: "CM-005", qty: 0,  place: "Cupboard B – Shelf 1", status: "missing",  emoji: "💻" },
];

const BORROWS = [
  { id: 1, borrower: "Kasun Perera",   item: "Oscilloscope × 1",   due: "Mar 12, 2026" },
  { id: 2, borrower: "Dilini Silva",   item: "Soldering Iron × 2", due: "Mar 15, 2026" },
  { id: 3, borrower: "Nimal Fernando", item: "Arduino Mega × 3",   due: "Mar 10, 2026" },
];

const AUDIT = [
  { icon: "👤", bg: "#ede9fe", text: "New user <strong>dilini@ceyntics.com</strong> created by Admin",        time: "2 mins ago" },
  { icon: "📦", bg: "#d1fae5", text: "Item <strong>Arduino Mega</strong> quantity updated 10 → 12",           time: "18 mins ago" },
  { icon: "↩️", bg: "#fef3c7", text: "<strong>Kasun Perera</strong> returned Oscilloscope",                   time: "1 hr ago" },
  { icon: "⚠️", bg: "#fee2e2", text: "Item <strong>Multimeter</strong> status changed → Damaged",             time: "3 hrs ago" },
  { icon: "📤", bg: "#fef3c7", text: "<strong>Dilini Silva</strong> borrowed Soldering Iron × 2",             time: "5 hrs ago" },
];

const STORAGES = [
  { name: "Cupboard A", used: 3, total: 4, pct: 75 },
  { name: "Cupboard B", used: 2, total: 3, pct: 66 },
  { name: "Cupboard C", used: 1, total: 5, pct: 20 },
];

const QUICK_ACTIONS = [
  { icon: "👤", label: "Add User"     },
  { icon: "📦", label: "Add Item"     },
  { icon: "📤", label: "Borrow Item"  },
  { icon: "🗄️", label: "Add Cupboard" },
  { icon: "📋", label: "Audit Log"    },
  { icon: "📍", label: "Add Place"    },
];

export default function AdminView() {
  return (
    <>
      {/* Page Greeting */}
      <div className="page-header">
        <div className="page-eyebrow">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
        <h1 className="page-title">Good morning, <span>Admin.</span></h1>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard color="#6366f1" iconBg="#ede9fe" trend="trend-up" trendLabel="+4 today" value="48" label="Total Items">
          <BoxIcon color="#6366f1" />
        </StatCard>
        <StatCard color="#f59e0b" iconBg="#fef3c7" trend="trend-neutral" trendLabel="3 active" value="7" label="Borrowed Items">
          <ArrowIcon color="#f59e0b" />
        </StatCard>
        <StatCard color="#10b981" iconBg="#d1fae5" trend="trend-up" trendLabel="+1 new" value="6" label="Total Users">
          <UsersIcon color="#10b981" />
        </StatCard>
        <StatCard color="#ef4444" iconBg="#fee2e2" trend="trend-down" trendLabel="needs action" value="3" label="Alerts">
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
              <button className="panel-action">View All →</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th><th>Qty</th><th>Location</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ITEMS.map(item => (
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
          </div>

          {/* Active Borrows */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Active Borrows</span>
              <button className="panel-action">Manage →</button>
            </div>
            {BORROWS.map(b => (
              <div className="borrow-item" key={b.id}>
                <div className="avatar" style={{ background: "linear-gradient(135deg,#6366f1,#10b981)" }}>
                  {b.borrower.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="borrow-info">
                  <div className="borrow-name">{b.borrower}</div>
                  <div className="borrow-detail">{b.item} · Due {b.due}</div>
                </div>
                <button className="action-btn btn-return">Return</button>
              </div>
            ))}
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
                <div className="quick-btn" key={i}>
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
              <button className="panel-action">Manage →</button>
            </div>
            <div className="storage-list">
              {STORAGES.map((s, i) => (
                <div className="storage-card" key={i}>
                  <div className="storage-top">
                    <span className="storage-name">🗄️ {s.name}</span>
                    <span className="storage-count">{s.used}/{s.total} places</span>
                  </div>
                  <div className="storage-bar">
                    <div className="storage-fill" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Audit Log</span>
              <button className="panel-action">Full Log →</button>
            </div>
            {AUDIT.map((a, i) => (
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

/* ── Inline SVG icons ── */
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