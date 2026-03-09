import { useState } from "react";
import StatusBadge from "../../Components/common/StatusBadge";

/* ─── Mock Data (replace with API later) ─── */
const STORAGE_DATA = [
  {
    id: 1, name: "Cupboard A", code: "CUP-A", color: "#6366f1", bg: "#ede9fe",
    description: "Main electronics storage",
    places: [
      {
        id: 1, name: "Shelf 1", items: [
          { id: 1,  name: "Soldering Iron",  code: "EQ-001", qty: 5,  status: "instore",  emoji: "🔧" },
          { id: 9,  name: "Logic Analyzer",  code: "EQ-009", qty: 2,  status: "instore",  emoji: "🔍" },
        ]
      },
      {
        id: 2, name: "Shelf 2", items: [
          { id: 6,  name: "Breadboard",      code: "CM-006", qty: 10, status: "instore",  emoji: "🔲" },
          { id: 11, name: "ESP32 Module",    code: "CM-011", qty: 8,  status: "instore",  emoji: "📶" },
        ]
      },
      {
        id: 3, name: "Shelf 3", items: [
          { id: 3,  name: "Arduino Mega",    code: "CM-003", qty: 12, status: "instore",  emoji: "🔌" },
        ]
      },
    ]
  },
  {
    id: 2, name: "Cupboard B", code: "CUP-B", color: "#10b981", bg: "#d1fae5",
    description: "Test & measurement equipment",
    places: [
      {
        id: 4, name: "Shelf 1", items: [
          { id: 5,  name: "Raspberry Pi 4",  code: "CM-005", qty: 0,  status: "missing",  emoji: "💻" },
        ]
      },
      {
        id: 5, name: "Shelf 2", items: [
          { id: 2,  name: "Oscilloscope",    code: "EQ-002", qty: 2,  status: "borrowed", emoji: "📡" },
        ]
      },
      {
        id: 6, name: "Shelf 3", items: [
          { id: 8,  name: "Heat Gun",        code: "EQ-008", qty: 1,  status: "borrowed", emoji: "🌡️" },
        ]
      },
    ]
  },
  {
    id: 3, name: "Cupboard C", code: "CUP-C", color: "#f59e0b", bg: "#fef3c7",
    description: "Hand tools & accessories",
    places: [
      {
        id: 7, name: "Shelf 1", items: [
          { id: 4,  name: "Multimeter",      code: "EQ-004", qty: 1,  status: "damaged",  emoji: "⚡" },
          { id: 12, name: "Crimping Tool",   code: "TL-012", qty: 2,  status: "instore",  emoji: "🔩" },
        ]
      },
      {
        id: 8, name: "Shelf 2", items: [
          { id: 7,  name: "Wire Stripper",   code: "TL-007", qty: 3,  status: "instore",  emoji: "✂️" },
        ]
      },
      {
        id: 9, name: "Shelf 3", items: [
          { id: 10, name: "Power Supply",    code: "EQ-010", qty: 2,  status: "instore",  emoji: "🔋" },
        ]
      },
    ]
  },
];

const STATUS_COLORS = {
  instore:  { dot: "#10b981", bg: "#d1fae5" },
  borrowed: { dot: "#f59e0b", bg: "#fef3c7" },
  damaged:  { dot: "#ef4444", bg: "#fee2e2" },
  missing:  { dot: "#a855f7", bg: "#f3e8ff" },
};

function getTotalItems(cupboard) {
  return cupboard.places.reduce((acc, p) => acc + p.items.length, 0);
}

function getAvailableItems(cupboard) {
  return cupboard.places.reduce((acc, p) =>
    acc + p.items.filter(i => i.status === "instore").length, 0);
}

/* ─── Item Detail Popover ─── */
function ItemPopover({ item, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", animation: "fadeIn 0.15s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: "16px",
        width: "100%", maxWidth: "360px",
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        animation: "slideUp 0.2s ease", overflow: "hidden"
      }}>
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "14px"
        }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "var(--surface2)", fontSize: "22px",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>{item.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>{item.name}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{item.code}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "20px" }}>×</button>
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            {[
              { label: "Quantity", value: item.qty },
              { label: "Status",   value: <StatusBadge status={item.status} /> },
            ].map((row, i) => (
              <div key={i} style={{ background: "var(--surface2)", borderRadius: "9px", padding: "10px 12px" }}>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>{row.label}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "15px", color: "var(--text-primary)" }}>{row.value}</div>
              </div>
            ))}
          </div>
          <button onClick={onClose} style={{
            width: "100%", padding: "10px", borderRadius: "9px",
            background: "#0f0f1a", color: "#fff", border: "none",
            fontFamily: "'DM Sans',sans-serif", fontSize: "13px",
            fontWeight: 600, cursor: "pointer", transition: "background 0.15s"
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#6366f1"}
            onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
          >Close</button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}

/* ─── Main StorageMap Component ─── */
export default function StorageMap() {
  const [selectedCupboard, setSelectedCupboard] = useState(STORAGE_DATA[0]);
  const [expandedPlace,    setExpandedPlace]    = useState(null);
  const [selectedItem,     setSelectedItem]     = useState(null);
  const [search,           setSearch]           = useState("");

  /* Search across all cupboards */
  const searchResults = search.trim().length > 1
    ? STORAGE_DATA.flatMap(cup =>
        cup.places.flatMap(place =>
          place.items
            .filter(item =>
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.code.toLowerCase().includes(search.toLowerCase())
            )
            .map(item => ({ ...item, cupboard: cup.name, place: place.name, cupboardColor: cup.color, cupboardBg: cup.bg }))
        )
      )
    : [];

  const totalItems     = STORAGE_DATA.reduce((a, c) => a + getTotalItems(c), 0);
  const totalAvailable = STORAGE_DATA.reduce((a, c) => a + getAvailableItems(c), 0);
  const totalCupboards = STORAGE_DATA.length;
  const totalPlaces    = STORAGE_DATA.reduce((a, c) => a + c.places.length, 0);

  return (
    <div style={{ animation: "fadeUp 0.4s ease forwards" }}>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-eyebrow">Staff Portal</div>
        <h1 className="page-title">Storage <span>Map</span></h1>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Cupboards",  value: totalCupboards, icon: "🗄️",  bg: "#ede9fe" },
          { label: "Places",     value: totalPlaces,    icon: "📍",  bg: "#d1fae5" },
          { label: "Total Items",value: totalItems,     icon: "📦",  bg: "#fef3c7" },
          { label: "Available",  value: totalAvailable, icon: "✅",  bg: "#d1fae5" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "var(--surface)", border: "1.5px solid var(--border)",
            borderRadius: "14px", padding: "16px 18px",
            display: "flex", alignItems: "center", gap: "12px",
            animation: `fadeUp 0.35s ease ${i * 0.06}s forwards`, opacity: 0
          }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: s.bg, fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "22px", color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "3px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        background: "var(--surface)", border: "1.5px solid var(--border)",
        borderRadius: "12px", padding: "11px 16px", marginBottom: "24px"
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a8a8" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items by name or code across all storage..."
          style={{
            border: "none", background: "none", outline: "none",
            fontSize: "13.5px", color: "var(--text-primary)",
            fontFamily: "'DM Sans',sans-serif", flex: 1
          }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "18px", lineHeight: 1 }}>×</button>
        )}
      </div>

      {/* Search Results */}
      {search.trim().length > 1 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
          </div>
          {searchResults.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>No items found</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {searchResults.map((item, i) => (
                <div key={i} onClick={() => setSelectedItem(item)} style={{
                  background: "var(--surface)", border: "1.5px solid var(--border)",
                  borderRadius: "12px", padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: "14px",
                  cursor: "pointer", transition: "all 0.15s"
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = item.cupboardColor; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = ""; }}
                >
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: item.cupboardBg, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{item.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{item.code}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      fontSize: "11px", padding: "3px 10px", borderRadius: "100px",
                      background: item.cupboardBg, color: item.cupboardColor, fontWeight: 600
                    }}>📍 {item.cupboard} › {item.place}</span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Layout — Cupboard List + Detail */}
      {!search.trim() && (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px" }}>

          {/* Left — Cupboard List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>
              Select Cupboard
            </div>
            {STORAGE_DATA.map((cup, i) => {
              const available = getAvailableItems(cup);
              const total     = getTotalItems(cup);
              const pct       = total > 0 ? Math.round((available / total) * 100) : 0;
              const isActive  = selectedCupboard?.id === cup.id;

              return (
                <div key={cup.id} onClick={() => { setSelectedCupboard(cup); setExpandedPlace(null); }} style={{
                  background: isActive ? cup.bg : "var(--surface)",
                  border: `1.5px solid ${isActive ? cup.color : "var(--border)"}`,
                  borderRadius: "14px", padding: "16px",
                  cursor: "pointer", transition: "all 0.2s ease",
                  animation: `fadeUp 0.35s ease ${i * 0.08}s forwards`, opacity: 0
                }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = cup.color; e.currentTarget.style.background = cup.bg + "80"; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "8px",
                      background: isActive ? cup.color : cup.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px", flexShrink: 0
                    }}>🗄️</div>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>{cup.name}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{cup.code} · {cup.places.length} places</div>
                    </div>
                  </div>

                  {/* Availability bar */}
                  <div style={{ marginBottom: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Available</span>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: cup.color }}>{available}/{total}</span>
                    </div>
                    <div style={{ height: "4px", background: "var(--border)", borderRadius: "100px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: cup.color, borderRadius: "100px", transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right — Cupboard Detail */}
          {selectedCupboard && (
            <div style={{ animation: "fadeUp 0.3s ease forwards" }}>

              {/* Cupboard Header */}
              <div style={{
                background: selectedCupboard.bg,
                border: `1.5px solid ${selectedCupboard.color}30`,
                borderRadius: "16px", padding: "20px 24px",
                marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px"
              }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: selectedCupboard.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "24px", flexShrink: 0
                }}>🗄️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "20px", color: "var(--text-primary)" }}>{selectedCupboard.name}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>{selectedCupboard.description}</div>
                </div>
                <div style={{ display: "flex", gap: "16px" }}>
                  {[
                    { label: "Places",    value: selectedCupboard.places.length },
                    { label: "Items",     value: getTotalItems(selectedCupboard) },
                    { label: "Available", value: getAvailableItems(selectedCupboard) },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "22px", color: selectedCupboard.color }}>{s.value}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Places */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedCupboard.places.map((place, pi) => {
                  const isExpanded = expandedPlace === place.id;
                  return (
                    <div key={place.id} style={{
                      background: "var(--surface)", border: "1.5px solid var(--border)",
                      borderRadius: "14px", overflow: "hidden",
                      transition: "border-color 0.2s",
                      animation: `fadeUp 0.3s ease ${pi * 0.07}s forwards`, opacity: 0
                    }}>
                      {/* Place Header — clickable to expand */}
                      <div
                        onClick={() => setExpandedPlace(isExpanded ? null : place.id)}
                        style={{
                          padding: "14px 18px", display: "flex",
                          alignItems: "center", gap: "12px", cursor: "pointer",
                          background: isExpanded ? selectedCupboard.bg : "transparent",
                          transition: "background 0.2s"
                        }}
                      >
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "8px",
                          background: isExpanded ? selectedCupboard.color : "var(--surface2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "14px", transition: "all 0.2s", flexShrink: 0
                        }}>📍</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{place.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{place.items.length} item{place.items.length !== 1 ? "s" : ""} stored</div>
                        </div>

                        {/* Item status dots */}
                        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                          {place.items.map(item => (
                            <div key={item.id} title={`${item.name} — ${item.status}`} style={{
                              width: "8px", height: "8px", borderRadius: "50%",
                              background: STATUS_COLORS[item.status]?.dot || "#ccc"
                            }} />
                          ))}
                        </div>

                        {/* Expand chevron */}
                        <div style={{
                          color: "var(--text-muted)", fontSize: "16px",
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.25s ease"
                        }}>▾</div>
                      </div>

                      {/* Expanded Items */}
                      {isExpanded && (
                        <div style={{ borderTop: "1px solid var(--border)" }}>
                          {place.items.length === 0 ? (
                            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                              No items in this place
                            </div>
                          ) : (
                            place.items.map((item, ii) => (
                              <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                style={{
                                  display: "flex", alignItems: "center", gap: "14px",
                                  padding: "13px 18px",
                                  borderBottom: ii < place.items.length - 1 ? "1px solid var(--border)" : "none",
                                  cursor: "pointer", transition: "background 0.15s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              >
                                <div style={{
                                  width: "36px", height: "36px", borderRadius: "9px",
                                  background: STATUS_COLORS[item.status]?.bg || "var(--surface2)",
                                  fontSize: "16px", display: "flex", alignItems: "center",
                                  justifyContent: "center", flexShrink: 0
                                }}>{item.emoji}</div>

                                <div style={{ flex: 1 }}>
                                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: "13.5px", color: "var(--text-primary)" }}>{item.name}</div>
                                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.code}</div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <div style={{ textAlign: "right" }}>
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "18px", color: "var(--text-primary)" }}>{item.qty}</div>
                                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>in stock</div>
                                  </div>
                                  <StatusBadge status={item.status} />
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6"/>
                                  </svg>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemPopover item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}