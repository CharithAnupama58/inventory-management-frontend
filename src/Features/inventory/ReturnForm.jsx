import { useState } from "react";
import BorrowService from "../../services/borrowService";

const CONDITIONS = [
  { value: "good",    label: "Good",    desc: "Item is in original condition",        color: "#10b981", bg: "#d1fae5" },
  { value: "fair",    label: "Fair",    desc: "Minor wear but fully functional",      color: "#f59e0b", bg: "#fef3c7" },
  { value: "damaged", label: "Damaged", desc: "Item has damage that needs attention", color: "#ef4444", bg: "#fee2e2" },
];

function SuccessScreen({ borrow, condition, notes, onClose }) {
  const cond = CONDITIONS.find(c => c.value === condition);
  return (
    <div style={{ padding: "32px 28px", textAlign: "center" }}>
      <div style={{
        width: "64px", height: "64px", borderRadius: "50%",
        background: "linear-gradient(135deg,#10b981,#6366f1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px", fontSize: "28px"
      }}>↩</div>

      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>
        Return Confirmed!
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
        The item has been marked as returned and stock has been updated.
      </div>

      <div style={{ background: "var(--surface2)", borderRadius: "12px", padding: "18px", textAlign: "left", marginBottom: "24px" }}>
        {[
          { label: "Item",        value: `${borrow.emoji} ${borrow.itemName}` },
          { label: "Quantity",    value: `${borrow.qty} unit(s)` },
          { label: "Returned By", value: borrow.borrowerName },
          { label: "Return Date", value: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) },
          { label: "Condition",   value: cond?.label || condition },
          ...(notes ? [{ label: "Notes", value: notes }] : []),
        ].map((row, i, arr) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", gap: "12px"
          }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px" }}>{row.label}</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", textAlign: "right" }}>{row.value}</span>
          </div>
        ))}
      </div>

      <button onClick={onClose} style={{
        width: "100%", padding: "12px",
        background: "#0f0f1a", color: "#fff", border: "none",
        borderRadius: "10px", fontFamily: "'Syne',sans-serif",
        fontWeight: 700, fontSize: "13px", letterSpacing: "1px", cursor: "pointer"
      }}
        onMouseEnter={e => e.currentTarget.style.background = "#10b981"}
        onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
      >Done</button>
    </div>
  );
}

export default function ReturnForm({ borrow, onClose, onSuccess }) {
  const [step,      setStep]      = useState(1);
  const [condition, setCondition] = useState("good");
  const [notes,     setNotes]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [apiError,  setApiError]  = useState("");

  // ── Real API call ──
  const handleSubmit = async () => {
    setLoading(true);
    setApiError("");
    try {
      await BorrowService.processReturn(borrow.id, {
        return_condition: condition,
        notes:            notes || null,
      });
      setStep(3);
      onSuccess && onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to process return. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!borrow) return null;

  const selectedCond = CONDITIONS.find(c => c.value === condition);
  const isOverdue    = borrow.dueDate && new Date(borrow.dueDate) < new Date();

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
        animation: "slideUp 0.25s ease", overflow: "hidden",
        maxHeight: "90vh", overflowY: "auto"
      }}>

        {/* Success */}
        {step === 3 && <SuccessScreen borrow={borrow} condition={condition} notes={notes} onClose={onClose} />}

        {step !== 3 && (
          <>
            {/* Header */}
            <div style={{
              padding: "22px 24px 18px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: "14px"
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "11px",
                background: "#d1fae5", fontSize: "20px",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>↩️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>
                  {step === 1 ? "Return Item" : "Confirm Return"}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {borrow.emoji} {borrow.itemName} · {borrow.qty} unit(s)
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                {[1, 2].map(s => (
                  <div key={s} style={{
                    width: "24px", height: "4px", borderRadius: "100px",
                    background: step >= s ? "#10b981" : "var(--border)",
                    transition: "background 0.3s"
                  }} />
                ))}
              </div>

              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "22px", lineHeight: 1 }}>×</button>
            </div>

            {/* STEP 1 — Form */}
            {step === 1 && (
              <div style={{ padding: "22px 24px" }}>

                <div style={{
                  background: "var(--surface2)", borderRadius: "12px",
                  padding: "14px 16px", marginBottom: "22px",
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px"
                }}>
                  {[
                    { label: "Borrowed By", value: borrow.borrowerName },
                    { label: "Quantity",    value: `${borrow.qty} unit(s)` },
                    { label: "Borrow Date", value: borrow.borrowDate },
                    { label: "Due Date",    value: borrow.dueDateLabel || borrow.dueDate },
                  ].map((row, i) => (
                    <div key={i}>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" }}>{row.label}</div>
                      <div style={{
                        fontSize: "13px", fontWeight: 600,
                        color: row.label === "Due Date" && isOverdue ? "#ef4444" : "var(--text-primary)"
                      }}>
                        {row.value} {row.label === "Due Date" && isOverdue && <span style={{ fontSize: "11px", color: "#ef4444" }}>(Overdue)</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {isOverdue && (
                  <div style={{
                    display: "flex", gap: "10px", alignItems: "flex-start",
                    background: "#fee2e2", border: "1px solid #fca5a5",
                    borderRadius: "10px", padding: "12px 14px", marginBottom: "20px"
                  }}>
                    <span style={{ fontSize: "16px" }}>⚠️</span>
                    <span style={{ fontSize: "12px", color: "#991b1b", lineHeight: 1.6 }}>
                      This item is overdue. The return will be logged with the actual return date.
                    </span>
                  </div>
                )}

                {/* Condition selector */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{
                    display: "block", fontSize: "11px", fontWeight: 500,
                    letterSpacing: "0.8px", textTransform: "uppercase",
                    color: "var(--text-secondary)", marginBottom: "10px"
                  }}>Item Condition <span style={{ color: "#ef4444" }}>*</span></label>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {CONDITIONS.map(c => (
                      <div key={c.value} onClick={() => setCondition(c.value)} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 14px", borderRadius: "10px", cursor: "pointer",
                        border: `1.5px solid ${condition === c.value ? c.color : "var(--border)"}`,
                        background: condition === c.value ? c.bg : "var(--surface)",
                        transition: "all 0.15s"
                      }}>
                        <div style={{
                          width: "18px", height: "18px", borderRadius: "50%",
                          border: `2px solid ${condition === c.value ? c.color : "var(--border)"}`,
                          background: condition === c.value ? c.color : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, transition: "all 0.15s"
                        }}>
                          {condition === c.value && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{c.label}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{c.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: "22px" }}>
                  <label style={{
                    display: "block", fontSize: "11px", fontWeight: 500,
                    letterSpacing: "0.8px", textTransform: "uppercase",
                    color: "var(--text-secondary)", marginBottom: "7px"
                  }}>Return Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any notes about the condition or return..."
                    style={{
                      width: "100%", padding: "11px 14px",
                      background: "#fff", border: "1.5px solid var(--border)",
                      borderRadius: "9px", fontFamily: "'DM Sans',sans-serif",
                      fontSize: "13.5px", color: "var(--text-primary)",
                      outline: "none", resize: "none", height: "80px",
                      lineHeight: 1.6, boxSizing: "border-box", transition: "border-color 0.2s"
                    }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={onClose} style={{
                    flex: 1, padding: "12px", background: "var(--surface2)",
                    border: "1.5px solid var(--border)", borderRadius: "10px",
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    fontSize: "13px", color: "var(--text-secondary)"
                  }}>Cancel</button>
                  <button onClick={() => setStep(2)} style={{
                    flex: 2, padding: "12px", background: "#0f0f1a", color: "#fff",
                    border: "none", borderRadius: "10px",
                    fontFamily: "'Syne',sans-serif", fontWeight: 700,
                    fontSize: "13px", letterSpacing: "0.8px", cursor: "pointer", transition: "background 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#10b981"}
                    onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
                  >Review →</button>
                </div>
              </div>
            )}

            {/* STEP 2 — Confirm */}
            {step === 2 && (
              <div style={{ padding: "22px 24px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                  Please confirm the return details below.
                </p>

                <div style={{ background: "var(--surface2)", borderRadius: "12px", padding: "18px", marginBottom: "20px" }}>
                  {[
                    { label: "Item",        value: `${borrow.emoji} ${borrow.itemName}` },
                    { label: "Quantity",    value: `${borrow.qty} unit(s)` },
                    { label: "Returned By", value: borrow.borrowerName },
                    { label: "Return Date", value: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) },
                    { label: "Condition",   value: selectedCond?.label },
                    ...(notes ? [{ label: "Notes", value: notes }] : []),
                  ].map((row, i, arr) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", gap: "12px"
                    }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px", flexShrink: 0 }}>{row.label}</span>
                      <span style={{
                        fontSize: "13px", fontWeight: 600, textAlign: "right",
                        color: row.label === "Condition" ? (selectedCond?.color || "var(--text-primary)") : "var(--text-primary)"
                      }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* API error */}
                {apiError && (
                  <div style={{
                    background: "rgba(239,68,68,0.1)", border: "1.5px solid rgba(239,68,68,0.3)",
                    borderRadius: "10px", padding: "12px 14px", marginBottom: "16px",
                    fontSize: "13px", color: "#ef4444", display: "flex", alignItems: "center", gap: "8px"
                  }}>
                    ⚠️ {apiError}
                  </div>
                )}

                <div style={{
                  display: "flex", gap: "10px", alignItems: "flex-start",
                  background: "#d1fae5", border: "1px solid #6ee7b7",
                  borderRadius: "10px", padding: "12px 14px", marginBottom: "20px"
                }}>
                  <span style={{ fontSize: "16px" }}>✅</span>
                  <span style={{ fontSize: "12px", color: "#065f46", lineHeight: 1.6 }}>
                    Confirming will restore the item stock and log this return in the audit trail.
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setStep(1)} style={{
                    flex: 1, padding: "12px", background: "var(--surface2)",
                    border: "1.5px solid var(--border)", borderRadius: "10px",
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    fontSize: "13px", color: "var(--text-secondary)"
                  }}>← Back</button>
                  <button onClick={handleSubmit} disabled={loading} style={{
                    flex: 2, padding: "12px",
                    background: loading ? "#10b981" : "#0f0f1a",
                    color: "#fff", border: "none", borderRadius: "10px",
                    fontFamily: "'Syne',sans-serif", fontWeight: 700,
                    fontSize: "13px", letterSpacing: "0.8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "background 0.15s"
                  }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#10b981"; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#0f0f1a"; }}
                  >
                    {loading ? (
                      <>
                        <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                        Processing...
                      </>
                    ) : "↩ Confirm Return"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes spin    { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}