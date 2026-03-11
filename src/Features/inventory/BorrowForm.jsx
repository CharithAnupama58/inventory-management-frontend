import { useState } from "react";
import BorrowService from "../../services/borrowService";
import { useAuth } from "../../context/AuthContext";

const today = new Date().toISOString().split("T")[0];

const minReturn = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

/* ─── Field wrapper ─── */
function Field({ label, required, children, error }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: 500,
        letterSpacing: "0.8px", textTransform: "uppercase",
        color: error ? "#ef4444" : "var(--text-secondary)",
        marginBottom: "7px"
      }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "5px" }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}

const inputStyle = (hasError) => ({
  width: "100%", padding: "11px 14px",
  background: "#fff",
  border: `1.5px solid ${hasError ? "#ef4444" : "var(--border)"}`,
  borderRadius: "9px",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "13.5px", color: "var(--text-primary)",
  outline: "none", transition: "border-color 0.2s",
  boxSizing: "border-box",
});

/* ─── Success Screen ─── */
function SuccessScreen({ item, formData, onClose }) {
  return (
    <div style={{ padding: "32px 28px", textAlign: "center" }}>
      <div style={{
        width: "64px", height: "64px", borderRadius: "50%",
        background: "linear-gradient(135deg,#6366f1,#10b981)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px", fontSize: "28px"
      }}>✓</div>

      <div style={{
        fontFamily: "'Syne',sans-serif", fontWeight: 800,
        fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px"
      }}>Borrow Request Submitted!</div>

      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
        Your request has been recorded successfully.
      </div>

      <div style={{
        background: "var(--surface2)", borderRadius: "12px",
        padding: "18px", textAlign: "left", marginBottom: "24px"
      }}>
        {[
          { label: "Item",            value: `${item.emoji} ${item.name} (${item.code})` },
          { label: "Quantity",        value: `${formData.quantity} unit(s)` },
          { label: "Borrower",        value: formData.borrowerName },
          { label: "Contact",         value: formData.contact },
          { label: "Borrow Date",     value: formData.borrowDate },
          { label: "Expected Return", value: formData.returnDate },
        ].map((row, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "7px 0",
            borderBottom: i < 5 ? "1px solid var(--border)" : "none"
          }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px" }}>
              {row.label}
            </span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        style={{
          width: "100%", padding: "12px",
          background: "#0f0f1a", color: "#fff",
          border: "none", borderRadius: "10px",
          fontFamily: "'Syne',sans-serif", fontWeight: 700,
          fontSize: "13px", letterSpacing: "1px",
          cursor: "pointer", transition: "background 0.15s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#6366f1"}
        onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
      >Done</button>
    </div>
  );
}

/* ─── Main Borrow Form Modal ─── */
export default function BorrowForm({ item, onClose, onSuccess }) {
  const { user } = useAuth();
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState({
    borrowerName: user?.name || "",   // pre-fill from logged-in user
    contact:      user?.email || "",  // pre-fill from logged-in user
    quantity:     1,
    borrowDate:   today,
    returnDate:   "",
    notes:        "",
  });

  const set = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
  };

  /* Validation — use item.quantity (real API field) */
  const validate = () => {
    const e = {};
    if (!formData.borrowerName.trim()) e.borrowerName = "Borrower name is required";
    if (!formData.contact.trim())      e.contact      = "Contact details are required";
    if (formData.quantity < 1)         e.quantity     = "Quantity must be at least 1";
    if (formData.quantity > item.quantity) e.quantity = `Only ${item.quantity} available`;
    if (!formData.returnDate)          e.returnDate   = "Expected return date is required";
    if (formData.returnDate <= today)  e.returnDate   = "Return date must be after today";
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setApiError("");
    setStep(2);
  };

  /* ── Real API call ── */
  const handleSubmit = async () => {
    setLoading(true);
    setApiError("");
    try {
      await BorrowService.create({
        item_id:             item.id,
        quantity:            formData.quantity,
        borrower_name:       formData.borrowerName,
        contact:             formData.contact,
        borrow_date:         formData.borrowDate,
        expected_return_date: formData.returnDate,
        notes:               formData.notes || null,
      });
      setStep(3);
      onSuccess && onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit borrow request. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(5px)",
        zIndex: 200, display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: "20px", animation: "fadeIn 0.2s ease"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "18px", width: "100%", maxWidth: "500px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
          animation: "slideUp 0.25s ease",
          maxHeight: "90vh", overflowY: "auto"
        }}
      >
        {/* ── Step 3: Success ── */}
        {step === 3 && (
          <SuccessScreen item={item} formData={formData} onClose={onClose} />
        )}

        {/* ── Step 1 & 2: Form / Confirm ── */}
        {step !== 3 && (
          <>
            {/* Modal Header */}
            <div style={{
              padding: "22px 24px 18px",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: "14px"
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "11px",
                background: "var(--surface2)", fontSize: "20px",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}>{item.emoji}</div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Syne',sans-serif", fontWeight: 800,
                  fontSize: "16px", color: "var(--text-primary)"
                }}>
                  {step === 1 ? "Borrow Item" : "Confirm Borrow"}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {item.name} · {item.code} · {item.quantity} available
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                {[1, 2].map(s => (
                  <div key={s} style={{
                    width: "24px", height: "4px", borderRadius: "100px",
                    background: step >= s ? "#6366f1" : "var(--border)",
                    transition: "background 0.3s"
                  }} />
                ))}
              </div>

              <button
                onClick={onClose}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: "22px", lineHeight: 1
                }}
              >×</button>
            </div>

            {/* ── STEP 1: Form ── */}
            {step === 1 && (
              <div style={{ padding: "22px 24px" }}>

                <Field label="Borrower Name" required error={errors.borrowerName}>
                  <input
                    style={inputStyle(errors.borrowerName)}
                    placeholder="Full name of the borrower"
                    value={formData.borrowerName}
                    onChange={e => set("borrowerName", e.target.value)}
                    onFocus={e => e.target.style.borderColor = "#6366f1"}
                    onBlur={e => e.target.style.borderColor = errors.borrowerName ? "#ef4444" : "var(--border)"}
                  />
                </Field>

                <Field label="Contact Details" required error={errors.contact}>
                  <input
                    style={inputStyle(errors.contact)}
                    placeholder="Phone number or email"
                    value={formData.contact}
                    onChange={e => set("contact", e.target.value)}
                    onFocus={e => e.target.style.borderColor = "#6366f1"}
                    onBlur={e => e.target.style.borderColor = errors.contact ? "#ef4444" : "var(--border)"}
                  />
                </Field>

                <Field label="Quantity" required error={errors.quantity}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      onClick={() => set("quantity", Math.max(1, formData.quantity - 1))}
                      style={{
                        width: "38px", height: "38px", borderRadius: "9px",
                        border: "1.5px solid var(--border)", background: "var(--surface2)",
                        fontSize: "18px", cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        color: "var(--text-primary)", fontWeight: 700
                      }}
                    >−</button>
                    <div style={{
                      flex: 1, textAlign: "center",
                      fontFamily: "'Syne',sans-serif", fontWeight: 800,
                      fontSize: "22px", color: "var(--text-primary)"
                    }}>{formData.quantity}</div>
                    <button
                      onClick={() => set("quantity", Math.min(item.quantity, formData.quantity + 1))}
                      style={{
                        width: "38px", height: "38px", borderRadius: "9px",
                        border: "1.5px solid var(--border)", background: "var(--surface2)",
                        fontSize: "18px", cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        color: "var(--text-primary)", fontWeight: 700
                      }}
                    >+</button>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", textAlign: "center" }}>
                    Max: {item.quantity} available
                  </div>
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <Field label="Borrow Date" required>
                    <input
                      type="date"
                      style={inputStyle(false)}
                      value={formData.borrowDate}
                      min={today}
                      onChange={e => set("borrowDate", e.target.value)}
                      onFocus={e => e.target.style.borderColor = "#6366f1"}
                      onBlur={e => e.target.style.borderColor = "var(--border)"}
                    />
                  </Field>

                  <Field label="Expected Return" required error={errors.returnDate}>
                    <input
                      type="date"
                      style={inputStyle(errors.returnDate)}
                      value={formData.returnDate}
                      min={minReturn()}
                      onChange={e => set("returnDate", e.target.value)}
                      onFocus={e => e.target.style.borderColor = "#6366f1"}
                      onBlur={e => e.target.style.borderColor = errors.returnDate ? "#ef4444" : "var(--border)"}
                    />
                  </Field>
                </div>

                <Field label="Notes (optional)">
                  <textarea
                    style={{ ...inputStyle(false), resize: "none", height: "80px", lineHeight: 1.6 }}
                    placeholder="Any additional notes..."
                    value={formData.notes}
                    onChange={e => set("notes", e.target.value)}
                    onFocus={e => e.target.style.borderColor = "#6366f1"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </Field>

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button onClick={onClose} style={{
                    flex: 1, padding: "12px", background: "var(--surface2)",
                    border: "1.5px solid var(--border)", borderRadius: "10px", cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "var(--text-secondary)"
                  }}>Cancel</button>
                  <button onClick={handleNext} style={{
                    flex: 2, padding: "12px", background: "#0f0f1a", color: "#fff",
                    border: "none", borderRadius: "10px", fontFamily: "'Syne',sans-serif",
                    fontWeight: 700, fontSize: "13px", letterSpacing: "0.8px",
                    cursor: "pointer", transition: "background 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#6366f1"}
                    onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
                  >Review →</button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Confirm ── */}
            {step === 2 && (
              <div style={{ padding: "22px 24px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                  Please review the details before confirming.
                </p>

                <div style={{ background: "var(--surface2)", borderRadius: "12px", padding: "18px", marginBottom: "20px" }}>
                  {[
                    { label: "Item",            value: `${item.emoji} ${item.name}` },
                    { label: "Code",            value: item.code },
                    { label: "Quantity",        value: `${formData.quantity} unit(s)` },
                    { label: "Borrower",        value: formData.borrowerName },
                    { label: "Contact",         value: formData.contact },
                    { label: "Borrow Date",     value: formData.borrowDate },
                    { label: "Expected Return", value: formData.returnDate },
                    ...(formData.notes ? [{ label: "Notes", value: formData.notes }] : []),
                  ].map((row, i, arr) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", padding: "8px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                      gap: "12px"
                    }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px", flexShrink: 0 }}>{row.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", textAlign: "right" }}>{row.value}</span>
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
                  background: "#fef3c7", border: "1px solid #fde68a",
                  borderRadius: "10px", padding: "12px 14px", marginBottom: "20px"
                }}>
                  <span style={{ fontSize: "16px" }}>⚠️</span>
                  <span style={{ fontSize: "12px", color: "#92400e", lineHeight: 1.6 }}>
                    By confirming, the item stock will be reduced and the borrow will be recorded in the audit log.
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setStep(1)} style={{
                    flex: 1, padding: "12px", background: "var(--surface2)",
                    border: "1.5px solid var(--border)", borderRadius: "10px", cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "var(--text-secondary)"
                  }}>← Back</button>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      flex: 2, padding: "12px",
                      background: loading ? "#6366f1" : "#0f0f1a",
                      color: "#fff", border: "none", borderRadius: "10px",
                      fontFamily: "'Syne',sans-serif", fontWeight: 700,
                      fontSize: "13px", letterSpacing: "0.8px",
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "background 0.15s",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#10b981"; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#0f0f1a"; }}
                  >
                    {loading ? (
                      <>
                        <div style={{
                          width: "14px", height: "14px",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#fff", borderRadius: "50%",
                          animation: "spin 0.6s linear infinite"
                        }} />
                        Submitting...
                      </>
                    ) : "✓ Confirm Borrow"}
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