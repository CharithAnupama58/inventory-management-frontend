import { useState } from "react";
import StatusBadge from "../../Components/common/StatusBadge";
import ReturnForm  from "./ReturnForm";

/* ─── Mock Data (replace with GET /api/borrows?user=me later) ─── */
const INITIAL_BORROWS = [
  {
    id: 1, itemName: "Soldering Iron", code: "EQ-001", emoji: "🔧",
    borrowerName: "Staff User", contact: "+94 77 123 4567",
    qty: 1, borrowDate: "Mar 05, 2026", dueDate: "2026-03-12",
    dueDateLabel: "Mar 12, 2026", status: "borrowed", notes: ""
  },
  {
    id: 2, itemName: "Arduino Mega", code: "CM-003", emoji: "🔌",
    borrowerName: "Staff User", contact: "+94 77 123 4567",
    qty: 2, borrowDate: "Mar 07, 2026", dueDate: "2026-03-14",
    dueDateLabel: "Mar 14, 2026", status: "borrowed", notes: "For robotics project"
  },
  {
    id: 3, itemName: "Oscilloscope", code: "EQ-002", emoji: "📡",
    borrowerName: "Staff User", contact: "+94 77 123 4567",
    qty: 1, borrowDate: "Feb 20, 2026", dueDate: "2026-02-28",
    dueDateLabel: "Feb 28, 2026", status: "returned", notes: "", returnDate: "Feb 27, 2026", condition: "good"
  },
  {
    id: 4, itemName: "Heat Gun", code: "EQ-008", emoji: "🌡️",
    borrowerName: "Staff User", contact: "+94 77 123 4567",
    qty: 1, borrowDate: "Feb 10, 2026", dueDate: "2026-02-15",
    dueDateLabel: "Feb 15, 2026", status: "returned", notes: "", returnDate: "Feb 14, 2026", condition: "fair"
  },
];

const TABS = [
  { id: "active",   label: "Active",   icon: "📤" },
  { id: "returned", label: "Returned", icon: "↩️" },
  { id: "all",      label: "All",      icon: "📋" },
];

const CONDITION_COLORS = { good: "#10b981", fair: "#f59e0b", damaged: "#ef4444" };

function isDue(dueDate) {
  return new Date(dueDate) < new Date();
}

function daysLeft(dueDate) {
  const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function MyBorrows() {
  const [borrows,    setBorrows]    = useState(INITIAL_BORROWS);
  const [activeTab,  setActiveTab]  = useState("active");
  const [returnItem, setReturnItem] = useState(null);

  const filtered = borrows.filter(b => {
    if (activeTab === "active")   return b.status === "borrowed";
    if (activeTab === "returned") return b.status === "returned";
    return true;
  });

  const activeCnt  = borrows.filter(b => b.status === "borrowed").length;
  const returnedCnt = borrows.filter(b => b.status === "returned").length;
  const overdueCnt  = borrows.filter(b => b.status === "borrowed" && isDue(b.dueDate)).length;

  const handleReturnSuccess = ({ borrow, condition, notes }) => {
    setBorrows(prev => prev.map(b =>
      b.id === borrow.id
        ? { ...b, status: "returned", condition, notes, returnDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) }
        : b
    ));
    setReturnItem(null);
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease forwards" }}>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-eyebrow">Staff Portal</div>
        <h1 className="page-title">My <span>Borrows</span></h1>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Active Borrows", value: activeCnt,  color: "#6366f1", bg: "#ede9fe", icon: "📤" },
          { label: "Overdue",        value: overdueCnt, color: "#ef4444", bg: "#fee2e2", icon: "⚠️" },
          { label: "Returned",       value: returnedCnt,color: "#10b981", bg: "#d1fae5", icon: "↩️" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "var(--surface)", border: "1.5px solid var(--border)",
            borderRadius: "14px", padding: "18px 20px",
            display: "flex", alignItems: "center", gap: "14px",
            animation: `fadeUp 0.35s ease ${i * 0.07}s forwards`, opacity: 0
          }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: s.bg, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "3px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--surface2)", padding: "4px", borderRadius: "12px", width: "fit-content" }}>
        {TABS.map(tab => {
          const cnt = tab.id === "active" ? activeCnt : tab.id === "returned" ? returnedCnt : borrows.length;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "8px 18px", borderRadius: "9px", border: "none", cursor: "pointer",
              background: activeTab === tab.id ? "var(--surface)" : "transparent",
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
              fontFamily: "'DM Sans',sans-serif", fontSize: "13px", fontWeight: 500,
              transition: "all 0.15s",
              boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              display: "flex", alignItems: "center", gap: "6px"
            }}>
              {tab.icon} {tab.label}
              <span style={{
                fontSize: "10px", padding: "1px 6px", borderRadius: "100px",
                background: activeTab === tab.id ? "var(--surface2)" : "transparent",
                color: "var(--text-muted)", fontWeight: 600
              }}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
            No {activeTab === "active" ? "active borrows" : activeTab === "returned" ? "returned items" : "records"} found
          </div>
          <div style={{ fontSize: "13px" }}>
            {activeTab === "active" ? "You have no items currently borrowed." : "Your return history will appear here."}
          </div>
        </div>
      )}

      {/* Borrow Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((borrow, i) => {
          const overdue = borrow.status === "borrowed" && isDue(borrow.dueDate);
          const days    = borrow.status === "borrowed" ? daysLeft(borrow.dueDate) : null;

          return (
            <div key={borrow.id} style={{
              background: "var(--surface)",
              border: `1.5px solid ${overdue ? "#fca5a5" : "var(--border)"}`,
              borderRadius: "14px", overflow: "hidden",
              animation: `fadeUp 0.35s ease ${i * 0.06}s forwards`, opacity: 0,
              transition: "box-shadow 0.2s"
            }}>
              {/* Overdue banner */}
              {overdue && (
                <div style={{
                  background: "#fee2e2", padding: "7px 20px",
                  fontSize: "12px", color: "#991b1b", fontWeight: 500,
                  display: "flex", alignItems: "center", gap: "6px"
                }}>
                  ⚠️ This item is overdue — please return it as soon as possible
                </div>
              )}

              <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px" }}>

                {/* Emoji icon */}
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: overdue ? "#fee2e2" : "var(--surface2)",
                  fontSize: "22px", display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0
                }}>{borrow.emoji}</div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>
                      {borrow.itemName}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{borrow.code}</span>
                    <StatusBadge status={borrow.status} />
                    {borrow.status === "returned" && borrow.condition && (
                      <span style={{
                        fontSize: "11px", padding: "2px 8px", borderRadius: "100px",
                        background: `${CONDITION_COLORS[borrow.condition]}20`,
                        color: CONDITION_COLORS[borrow.condition], fontWeight: 500
                      }}>
                        Returned: {borrow.condition.charAt(0).toUpperCase() + borrow.condition.slice(1)}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      📦 Qty: <strong style={{ color: "var(--text-primary)" }}>{borrow.qty}</strong>
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      📅 Borrowed: <strong style={{ color: "var(--text-primary)" }}>{borrow.borrowDate}</strong>
                    </span>
                    {borrow.status === "borrowed" && (
                      <span style={{ fontSize: "12px", color: overdue ? "#ef4444" : "var(--text-muted)" }}>
                        ⏰ Due: <strong style={{ color: overdue ? "#ef4444" : "var(--text-primary)" }}>{borrow.dueDateLabel}</strong>
                        {days !== null && (
                          <span style={{ marginLeft: "6px", fontSize: "11px", padding: "1px 7px", borderRadius: "100px", background: overdue ? "#fee2e2" : days <= 3 ? "#fef3c7" : "#d1fae5", color: overdue ? "#991b1b" : days <= 3 ? "#92400e" : "#065f46", fontWeight: 600 }}>
                            {overdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                          </span>
                        )}
                      </span>
                    )}
                    {borrow.status === "returned" && borrow.returnDate && (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        ✅ Returned: <strong style={{ color: "var(--text-primary)" }}>{borrow.returnDate}</strong>
                      </span>
                    )}
                  </div>

                  {borrow.notes && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px", fontStyle: "italic" }}>
                      📝 {borrow.notes}
                    </div>
                  )}
                </div>

                {/* Action */}
                {borrow.status === "borrowed" && (
                  <button
                    onClick={() => setReturnItem(borrow)}
                    style={{
                      padding: "9px 20px", borderRadius: "9px", border: "none",
                      background: overdue ? "#ef4444" : "#0f0f1a",
                      color: "#fff", fontSize: "12px", fontWeight: 600,
                      fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
                      transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#10b981"}
                    onMouseLeave={e => e.currentTarget.style.background = overdue ? "#ef4444" : "#0f0f1a"}
                  >↩ Return</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Return Form Modal */}
      {returnItem && (
        <ReturnForm
          borrow={returnItem}
          onClose={() => setReturnItem(null)}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
}