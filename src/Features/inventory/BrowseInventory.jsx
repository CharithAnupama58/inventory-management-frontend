import { useState, useMemo, useEffect, useCallback } from "react";
import StatusBadge from "../../Components/common/StatusBadge";
import BorrowForm  from "./BorrowForm";
import ItemService from "../../services/itemService";
import { CupboardService } from "../../services/otherServices";

const STATUSES      = ["all", "instore", "borrowed", "damaged", "missing"];
const STATUS_LABELS = { all: "All Status", instore: "In Store", borrowed: "Borrowed", damaged: "Damaged", missing: "Missing" };

// Map item name to emoji (backend doesn't store emoji)
const getEmoji = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("solder"))    return "🔧";
  if (n.includes("oscilloscope")) return "📡";
  if (n.includes("arduino"))   return "🔌";
  if (n.includes("multimeter")) return "⚡";
  if (n.includes("raspberry")) return "💻";
  if (n.includes("breadboard")) return "🔲";
  if (n.includes("wire"))      return "✂️";
  if (n.includes("heat"))      return "🌡️";
  if (n.includes("logic"))     return "🔍";
  if (n.includes("power"))     return "🔋";
  if (n.includes("esp"))       return "📶";
  if (n.includes("crimp"))     return "🔩";
  return "📦";
};

export default function BrowseInventory() {
  const [items,        setItems]       = useState([]);
  const [cupboards,    setCupboards]   = useState([]);
  const [loading,      setLoading]     = useState(true);  // only for initial load
  const [searching,    setSearching]   = useState(false); // for search/filter updates
  const [error,        setError]       = useState("");
  const [search,    setSearch]    = useState("");
  const [statusF,   setStatusF]   = useState("all");
  const [cupboardF, setCupboardF] = useState("all");
  const [viewMode,  setViewMode]  = useState("grid");
  const [selected,  setSelected]  = useState(null);
  const [borrowItem,setBorrowItem]= useState(null);

  // ── Fetch items from real API ──
  const fetchItems = useCallback(async (searchValue = "", isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setSearching(true);
      setError("");
      const params = {};
      if (statusF        !== "all") params.status     = statusF;
      if (cupboardF      !== "all") params.cupboard_id = cupboardF;
      if (searchValue)              params.search      = searchValue;

      const response = await ItemService.getAll(params);
      const mapped = (response.data || []).map(item => {
        const cupboardName = item.place?.cupboard?.name || "—";
        const shelfName    = item.place?.name || null;
        return {
          ...item,
          emoji:    getEmoji(item.name),
          place:    shelfName ? `${cupboardName} – ${shelfName}` : cupboardName,
          cupboard: cupboardName,
        };
      });
      setItems(mapped);
    } catch (err) {
      setError("Failed to load items. Please try again.");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [statusF, cupboardF]);

  // ── Fetch cupboards for filter dropdown ──
  useEffect(() => {
    CupboardService.getAll().then(setCupboards).catch(() => {});
  }, []);

  // ── Initial load + status/cupboard filter change ──
  useEffect(() => {
    fetchItems(search, true);
  }, [fetchItems]);

  // ── Debounce search input separately — no loading on every keystroke ──
  useEffect(() => {
    const delay = setTimeout(() => fetchItems(search), 500);
    return () => clearTimeout(delay);
  }, [search]);

  // ── Counts for filter tabs ──
  const counts = useMemo(() => ({
    all:      items.length,
    instore:  items.filter(i => i.status === "instore").length,
    borrowed: items.filter(i => i.status === "borrowed").length,
    damaged:  items.filter(i => i.status === "damaged").length,
    missing:  items.filter(i => i.status === "missing").length,
  }), [items]);

  // ── Client-side filter (status + search already sent to API but still filter locally) ──
  const filtered = useMemo(() => items.filter(item => {
    const matchSearch   = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = statusF   === "all" || item.status   === statusF;
    const matchCupboard = cupboardF === "all" || String(item.place?.cupboard?.id) === String(cupboardF);
    return matchSearch && matchStatus && matchCupboard;
  }), [items, search, statusF, cupboardF]);

  const canBorrow = (item) => item.quantity > 0 && item.status !== "damaged" && item.status !== "missing";

  // ── After successful borrow → refresh items ──
  const handleBorrowSuccess = () => {
    setBorrowItem(null);
    fetchItems();
  };

  // ── Loading state ──
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "16px", color: "var(--text-muted)" }}>
      <div style={{ width: "36px", height: "36px", border: "3px solid var(--border)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <span style={{ fontSize: "13px" }}>Loading inventory...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  // ── Error state ──
  if (error) return (
    <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-muted)" }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚠️</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Failed to load</div>
      <div style={{ fontSize: "13px", marginBottom: "20px" }}>{error}</div>
      <button onClick={fetchItems} style={{ padding: "10px 24px", borderRadius: "9px", background: "#0f0f1a", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "13px" }}>
        Try Again
      </button>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp 0.4s ease forwards" }}>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-eyebrow">Staff Portal</div>
        <h1 className="page-title">Browse <span>Inventory</span></h1>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusF(s)} style={{
            padding: "7px 16px", borderRadius: "100px", border: "1.5px solid",
            borderColor: statusF === s ? "#6366f1" : "var(--border)",
            background: statusF === s ? "#6366f1" : "var(--surface)",
            color: statusF === s ? "#fff" : "var(--text-secondary)",
            fontSize: "12px", fontWeight: 500, cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
            display: "flex", alignItems: "center", gap: "6px"
          }}>
            {STATUS_LABELS[s]}
            <span style={{
              background: statusF === s ? "rgba(255,255,255,0.25)" : "var(--surface2)",
              color: statusF === s ? "#fff" : "var(--text-muted)",
              fontSize: "10px", padding: "1px 6px", borderRadius: "100px", fontWeight: 600
            }}>{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "var(--surface)", border: "1.5px solid var(--border)",
          borderRadius: "10px", padding: "9px 14px", flex: 1, minWidth: "220px"
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8a8a8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or code..."
            style={{ border: "none", background: "none", outline: "none", fontSize: "13.5px", color: "var(--text-primary)", fontFamily: "'DM Sans',sans-serif", width: "100%" }} />
          {search && <button onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "18px", lineHeight: 1 }}>×</button>}
        </div>

        {/* Cupboard filter — from real API */}
        <select value={cupboardF} onChange={e => setCupboardF(e.target.value)} style={{
          padding: "9px 14px", borderRadius: "10px", border: "1.5px solid var(--border)",
          background: "var(--surface)", color: "var(--text-primary)",
          fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer"
        }}>
          <option value="all">All Cupboards</option>
          {cupboards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {/* View Toggle */}
        <div style={{ display: "flex", background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
          {["grid","list"].map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              padding: "8px 12px", border: "none", cursor: "pointer",
              background: viewMode === mode ? "#0f0f1a" : "transparent",
              color: viewMode === mode ? "#fff" : "var(--text-muted)",
              transition: "all 0.15s", display: "flex", alignItems: "center"
            }}>
              {mode === "grid"
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
            </button>
          ))}
        </div>

        <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" }}>
          {searching && <div style={{ width: "12px", height: "12px", border: "2px solid var(--border)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>No items found</div>
          <div style={{ fontSize: "13px" }}>Try adjusting your search or filters</div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {filtered.map((item, i) => (
            <div key={item.id} onClick={() => setSelected(item)} style={{
              background: "var(--surface)", border: "1.5px solid var(--border)",
              borderRadius: "14px", padding: "18px", cursor: "pointer",
              transition: "all 0.2s ease",
              animation: `fadeUp 0.3s ease ${i * 0.04}s forwards`, opacity: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#6366f1"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--surface2)", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>{item.emoji}</div>
                <StatusBadge status={item.status} />
              </div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", marginBottom: "3px" }}>{item.name}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px" }}>{item.code}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "20px", color: "var(--text-primary)" }}>{item.quantity}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "4px" }}>available</span>
                </div>
                {canBorrow(item) && (
                  <button onClick={e => { e.stopPropagation(); setBorrowItem(item); }} style={{
                    padding: "5px 12px", borderRadius: "7px", background: "#0f0f1a", color: "#fff",
                    border: "none", fontSize: "11px", fontWeight: 600, cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#6366f1"}
                    onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
                  >Borrow</button>
                )}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
                📍 {item.place}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && filtered.length > 0 && (
        <div className="panel">
          <table className="data-table">
            <thead>
              <tr><th>Item</th><th>Code</th><th>Qty</th><th>Location</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} style={{ cursor: "pointer" }} onClick={() => setSelected(item)}>
                  <td><div className="item-cell"><div className="item-thumb">{item.emoji}</div><div style={{ fontWeight: 500 }}>{item.name}</div></div></td>
                  <td style={{ fontFamily: "'Syne',sans-serif", fontSize: "12px", color: "var(--text-muted)" }}>{item.code}</td>
                  <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>{item.quantity}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.place}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td onClick={e => e.stopPropagation()}>
                    {canBorrow(item)
                      ? <button className="action-btn btn-borrow" onClick={() => setBorrowItem(item)}>Borrow</button>
                      : <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ITEM DETAIL MODAL ── */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px", animation: "fadeIn 0.2s ease"
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "var(--surface)", borderRadius: "18px",
            width: "100%", maxWidth: "480px", overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18)", animation: "slideUp 0.25s ease"
          }}>
            <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "var(--surface2)", fontSize: "26px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{selected.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "4px" }}>{selected.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{selected.code}</span>
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "22px", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px" }}>{selected.description || "No description available."}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                {[
                  { label: "Quantity",   value: selected.quantity },
                  { label: "Serial No.", value: selected.serial_number || "N/A" },
                  { label: "Location",   value: selected.place },
                  { label: "Cupboard",   value: selected.cupboard },
                ].map((row, i) => (
                  <div key={i} style={{ background: "var(--surface2)", borderRadius: "10px", padding: "12px 14px" }}>
                    <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: "4px" }}>{row.label}</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{row.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setSelected(null)} style={{
                padding: "10px 20px", borderRadius: "9px", border: "1.5px solid var(--border)",
                background: "var(--surface2)", color: "var(--text-secondary)",
                fontSize: "13px", fontFamily: "'DM Sans',sans-serif", cursor: "pointer"
              }}>Close</button>
              {canBorrow(selected) && (
                <button onClick={() => { setBorrowItem(selected); setSelected(null); }} style={{
                  padding: "10px 24px", borderRadius: "9px", border: "none",
                  background: "#0f0f1a", color: "#fff", fontSize: "13px", fontWeight: 600,
                  fontFamily: "'DM Sans',sans-serif", cursor: "pointer", transition: "background 0.15s"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#6366f1"}
                  onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
                >📤 Borrow This Item</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BORROW FORM MODAL ── */}
      {borrowItem && (
        <BorrowForm
          item={borrowItem}
          onClose={() => setBorrowItem(null)}
          onSuccess={handleBorrowSuccess}
        />
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}