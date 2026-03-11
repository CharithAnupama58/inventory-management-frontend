import { useState, useMemo, useEffect, useCallback } from "react";
import StatusBadge from "../../Components/common/StatusBadge";
import ReturnForm  from "../inventory/ReturnForm";
import BorrowService from "../../services/borrowService";

const CONDITION_COLORS = { good: "#10b981", fair: "#f59e0b", damaged: "#ef4444" };

const TABS = [
  { id: "all",      label: "All",      icon: "📋" },
  { id: "borrowed", label: "Active",   icon: "📤" },
  { id: "overdue",  label: "Overdue",  icon: "⚠️" },
  { id: "returned", label: "Returned", icon: "↩️" },
];

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

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

function isDue(dueDate)  { return new Date(dueDate) < new Date(); }
function daysLeft(dueDate) {
  return Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
}

/* ── Borrow Detail Modal ── */
function BorrowDetail({ borrow, onClose, onReturn }) {
  const overdue = borrow.status === "borrowed" && isDue(borrow.dueDate);
  const days    = borrow.status === "borrowed" ? daysLeft(borrow.dueDate) : null;
  const cond    = borrow.condition;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(5px)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: "18px",
        width: "100%", maxWidth: "480px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
        animation: "slideUp 0.25s ease", overflow: "hidden",
        maxHeight: "90vh", overflowY: "auto"
      }}>
        <div style={{
          padding: "22px 24px 18px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "14px"
        }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: overdue ? "#fee2e2" : "var(--surface2)", fontSize: "22px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{borrow.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "17px", color: "var(--text-primary)" }}>{borrow.itemName}</div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{borrow.code}</span>
              <StatusBadge status={borrow.status} />
              {overdue && <span style={{ fontSize: "11px", padding: "2px 7px", borderRadius: "100px", background: "#fee2e2", color: "#991b1b", fontWeight: 600 }}>OVERDUE</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "22px", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
            {[
              { label: "Borrowed By",  value: borrow.borrowerName },
              { label: "Contact",      value: borrow.contact },
              { label: "Quantity",     value: `${borrow.qty} unit(s)` },
              { label: "Borrow Date",  value: borrow.borrowDate },
              { label: "Due Date",     value: borrow.dueDateLabel },
              ...(borrow.status === "borrowed" && days !== null ? [{ label: "Days Left", value: overdue ? `${Math.abs(days)}d overdue` : `${days}d remaining` }] : []),
              ...(borrow.returnDate ? [{ label: "Returned On", value: borrow.returnDate }] : []),
              ...(cond ? [{ label: "Condition", value: cond.charAt(0).toUpperCase() + cond.slice(1) }] : []),
            ].map((row, i) => (
              <div key={i} style={{ background: "var(--surface2)", borderRadius: "9px", padding: "11px 13px" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>{row.label}</div>
                <div style={{
                  fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "14px",
                  color: row.label === "Days Left" && overdue ? "#ef4444"
                       : row.label === "Condition"            ? (CONDITION_COLORS[cond] || "var(--text-primary)")
                       : "var(--text-primary)"
                }}>{row.value}</div>
              </div>
            ))}
          </div>

          {borrow.notes && (
            <div style={{ background: "var(--surface2)", borderRadius: "9px", padding: "12px 14px", marginBottom: "18px", fontSize: "13px", color: "var(--text-secondary)", fontStyle: "italic" }}>
              📝 {borrow.notes}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "11px", background: "var(--surface2)",
              border: "1.5px solid var(--border)", borderRadius: "10px",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              fontSize: "13px", color: "var(--text-secondary)"
            }}>Close</button>
            {borrow.status === "borrowed" && (
              <button onClick={() => { onClose(); onReturn(borrow); }} style={{
                flex: 2, padding: "11px", background: overdue ? "#ef4444" : "#0f0f1a",
                color: "#fff", border: "none", borderRadius: "10px",
                fontFamily: "'Syne',sans-serif", fontWeight: 700,
                fontSize: "13px", cursor: "pointer", transition: "background 0.15s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#10b981"}
                onMouseLeave={e => e.currentTarget.style.background = overdue ? "#ef4444" : "#0f0f1a"}
              >↩ Process Return</button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn  { from{opacity:0}to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function BorrowManagement() {
  const [borrows,      setBorrows]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [activeTab,    setActiveTab]    = useState("all");
  const [search,       setSearch]       = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [detailBorrow, setDetailBorrow] = useState(null);
  const [returnBorrow, setReturnBorrow] = useState(null);

  // ── Fetch all borrows from real API ──
  const fetchBorrows = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await BorrowService.getAll();
      const list = (response.data || []).map(b => ({
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
      setBorrows(list);
    } catch (err) {
      setError("Failed to load borrows. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBorrows(); }, [fetchBorrows]);

  // ── Unique users for filter dropdown ──
  const allUsers = ["all", ...Array.from(new Set(borrows.map(b => b.borrowerName)))];

  const filtered = useMemo(() => borrows.filter(b => {
    const matchSearch = b.itemName.toLowerCase().includes(search.toLowerCase()) ||
                        b.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
                        b.code.toLowerCase().includes(search.toLowerCase());
    const matchUser   = selectedUser === "all" || b.borrowerName === selectedUser;
    const isOverdue   = b.status === "borrowed" && isDue(b.dueDate);
    const matchTab    = activeTab === "all"      ? true
                      : activeTab === "borrowed" ? b.status === "borrowed"
                      : activeTab === "overdue"  ? isOverdue
                      : b.status === "returned";
    return matchSearch && matchUser && matchTab;
  }), [borrows, search, selectedUser, activeTab]);

  const counts = useMemo(() => ({
    all:      borrows.length,
    borrowed: borrows.filter(b => b.status === "borrowed").length,
    overdue:  borrows.filter(b => b.status === "borrowed" && isDue(b.dueDate)).length,
    returned: borrows.filter(b => b.status === "returned").length,
  }), [borrows]);

  // ── After return → refresh from API ──
  const handleReturnSuccess = () => {
    setReturnBorrow(null);
    fetchBorrows();
  };

  // ── Loading state ──
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "16px", color: "var(--text-muted)" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid var(--border)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <span style={{ fontSize: "13px" }}>Loading borrows...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  // ── Error state ──
  if (error) return (
    <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-muted)" }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Failed to load</div>
      <div style={{ fontSize: "13px", marginBottom: "20px" }}>{error}</div>
      <button onClick={fetchBorrows} style={{ padding: "10px 24px", borderRadius: "9px", background: "#0f0f1a", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "13px" }}>
        Try Again
      </button>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp 0.4s ease forwards" }}>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-eyebrow">Admin Panel</div>
        <h1 className="page-title">Borrow <span>Management</span></h1>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Borrows", value: counts.all,      icon: "📋", bg: "#ede9fe", color: "#6366f1" },
          { label: "Active",        value: counts.borrowed, icon: "📤", bg: "#fef3c7", color: "#f59e0b" },
          { label: "Overdue",       value: counts.overdue,  icon: "⚠️", bg: "#fee2e2", color: "#ef4444" },
          { label: "Returned",      value: counts.returned, icon: "↩️", bg: "#d1fae5", color: "#10b981" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "var(--surface)", border: "1.5px solid var(--border)",
            borderRadius: "14px", padding: "16px 18px",
            display: "flex", alignItems: "center", gap: "12px",
            animation: `fadeUp 0.35s ease ${i * 0.06}s forwards`, opacity: 0
          }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: s.bg, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "26px", color: s.value > 0 && s.label === "Overdue" ? s.color : "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "3px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--surface2)", padding: "4px", borderRadius: "12px", width: "fit-content" }}>
        {TABS.map(tab => (
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
              color: tab.id === "overdue" && counts.overdue > 0 ? "#ef4444" : "var(--text-muted)",
              fontWeight: 700
            }}>{counts[tab.id]}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "var(--surface)", border: "1.5px solid var(--border)",
          borderRadius: "10px", padding: "9px 14px", flex: 1, minWidth: "220px"
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8a8a8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by item, borrower or code..."
            style={{ border: "none", background: "none", outline: "none", fontSize: "13.5px", color: "var(--text-primary)", fontFamily: "'DM Sans',sans-serif", width: "100%" }} />
          {search && <button onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "18px", lineHeight: 1 }}>×</button>}
        </div>

        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} style={{
          padding: "9px 14px", borderRadius: "10px", border: "1.5px solid var(--border)",
          background: "var(--surface)", color: "var(--text-primary)",
          fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer"
        }}>
          {allUsers.map(u => <option key={u} value={u}>{u === "all" ? "All Users" : u}</option>)}
        </select>

        <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>No records found</div>
          <div style={{ fontSize: "13px" }}>Try adjusting your search or filters</div>
        </div>
      )}

      {/* Borrow Records */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((borrow, i) => {
          const overdue = borrow.status === "borrowed" && isDue(borrow.dueDate);
          const days    = borrow.status === "borrowed" ? daysLeft(borrow.dueDate) : null;

          return (
            <div key={borrow.id} style={{
              background: "var(--surface)",
              border: `1.5px solid ${overdue ? "#fca5a5" : "var(--border)"}`,
              borderRadius: "14px", overflow: "hidden",
              animation: `fadeUp 0.3s ease ${i * 0.05}s forwards`, opacity: 0,
              transition: "box-shadow 0.2s"
            }}>
              {overdue && (
                <div style={{ background: "#fee2e2", padding: "6px 20px", fontSize: "12px", color: "#991b1b", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}>
                  ⚠️ Overdue — due {borrow.dueDateLabel}
                </div>
              )}

              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: "46px", height: "46px", borderRadius: "12px",
                  background: overdue ? "#fee2e2" : "var(--surface2)",
                  fontSize: "20px", display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0
                }}>{borrow.emoji}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{borrow.itemName}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{borrow.code}</span>
                    <StatusBadge status={borrow.status} />
                    {overdue && (
                      <span style={{ fontSize: "11px", padding: "2px 7px", borderRadius: "100px", background: "#fee2e2", color: "#991b1b", fontWeight: 600 }}>
                        {Math.abs(days)}d overdue
                      </span>
                    )}
                    {!overdue && days !== null && days <= 3 && (
                      <span style={{ fontSize: "11px", padding: "2px 7px", borderRadius: "100px", background: "#fef3c7", color: "#92400e", fontWeight: 600 }}>
                        Due in {days}d
                      </span>
                    )}
                    {borrow.status === "returned" && borrow.condition && (
                      <span style={{
                        fontSize: "11px", padding: "2px 8px", borderRadius: "100px",
                        background: `${CONDITION_COLORS[borrow.condition]}20`,
                        color: CONDITION_COLORS[borrow.condition], fontWeight: 500
                      }}>Returned: {borrow.condition.charAt(0).toUpperCase() + borrow.condition.slice(1)}</span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      👤 <strong style={{ color: "var(--text-primary)" }}>{borrow.borrowerName}</strong>
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      📦 Qty: <strong style={{ color: "var(--text-primary)" }}>{borrow.qty}</strong>
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      📅 {borrow.borrowDate}
                    </span>
                    {borrow.status === "borrowed" && (
                      <span style={{ fontSize: "12px", color: overdue ? "#ef4444" : "var(--text-muted)" }}>
                        ⏰ Due: <strong style={{ color: overdue ? "#ef4444" : "var(--text-primary)" }}>{borrow.dueDateLabel}</strong>
                      </span>
                    )}
                    {borrow.status === "returned" && borrow.returnDate && (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        ✅ Returned: <strong style={{ color: "var(--text-primary)" }}>{borrow.returnDate}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button onClick={() => setDetailBorrow(borrow)} style={{
                    padding: "8px 14px", borderRadius: "8px",
                    border: "1.5px solid var(--border)", background: "var(--surface)",
                    cursor: "pointer", fontSize: "12px", fontWeight: 500,
                    color: "var(--text-secondary)", fontFamily: "'DM Sans',sans-serif",
                    transition: "all 0.15s"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                  >Details</button>

                  {borrow.status === "borrowed" && (
                    <button onClick={() => setReturnBorrow(borrow)} style={{
                      padding: "8px 16px", borderRadius: "8px", border: "none",
                      background: overdue ? "#ef4444" : "#0f0f1a",
                      color: "#fff", cursor: "pointer",
                      fontSize: "12px", fontWeight: 600,
                      fontFamily: "'DM Sans',sans-serif", transition: "background 0.15s"
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "#10b981"}
                      onMouseLeave={e => e.currentTarget.style.background = overdue ? "#ef4444" : "#0f0f1a"}
                    >↩ Return</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modals ── */}
      {detailBorrow && (
        <BorrowDetail
          borrow={detailBorrow}
          onClose={() => setDetailBorrow(null)}
          onReturn={(b) => { setDetailBorrow(null); setReturnBorrow(b); }}
        />
      )}
      {returnBorrow && (
        <ReturnForm
          borrow={returnBorrow}
          onClose={() => setReturnBorrow(null)}
          onSuccess={handleReturnSuccess}
        />
      )}

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}