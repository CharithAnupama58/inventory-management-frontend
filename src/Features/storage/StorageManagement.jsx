import { useState, useEffect, useCallback } from "react";
import { CupboardService } from "../../services/otherServices";

const COLORS = [
  { value: "#6366f1", bg: "#ede9fe", label: "Indigo"  },
  { value: "#10b981", bg: "#d1fae5", label: "Green"   },
  { value: "#f59e0b", bg: "#fef3c7", label: "Amber"   },
  { value: "#ef4444", bg: "#fee2e2", label: "Red"     },
  { value: "#8b5cf6", bg: "#f3e8ff", label: "Purple"  },
  { value: "#06b6d4", bg: "#cffafe", label: "Cyan"    },
  { value: "#ec4899", bg: "#fce7f3", label: "Pink"    },
  { value: "#0ea5e9", bg: "#e0f2fe", label: "Blue"    },
];

const inputStyle = (err) => ({
  width: "100%", padding: "11px 14px", background: "#fff",
  border: `1.5px solid ${err ? "#ef4444" : "var(--border)"}`,
  borderRadius: "9px", fontFamily: "'DM Sans',sans-serif",
  fontSize: "13.5px", color: "var(--text-primary)",
  outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
});

function Field({ label, required, error, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: 500,
        letterSpacing: "0.8px", textTransform: "uppercase",
        color: error ? "#ef4444" : "var(--text-secondary)", marginBottom: "7px"
      }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: "3px" }}>*</span>}
      </label>
      {children}
      {error && <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "5px" }}>⚠ {error}</div>}
    </div>
  );
}

/* ══════════════════════
   CUPBOARD FORM MODAL
══════════════════════ */
function CupboardForm({ cupboard, onClose, onSuccess }) {
  const isEdit = !!cupboard;
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState({
    name:        cupboard?.name        || "",
    code:        cupboard?.code        || "",
    description: cupboard?.description || "",
    location:    cupboard?.location    || "",
    color:       cupboard?.color       || "#6366f1",
    bg_color:    cupboard?.bg_color    || "#ede9fe",
  });

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Cupboard name is required";
    if (!form.code.trim()) e.code = "Cupboard code is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setApiError("");
    try {
      if (isEdit) {
        await CupboardService.update(cupboard.id, form);
      } else {
        await CupboardService.create(form);
      }
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {})[0]?.[0]
        || "Something went wrong.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

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
        animation: "slideUp 0.25s ease",
        maxHeight: "90vh", overflowY: "auto"
      }}>
        <div style={{
          padding: "22px 24px 18px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "14px"
        }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "11px", background: form.bg_color, fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🗄️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>
              {isEdit ? "Edit Cupboard" : "Add New Cupboard"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              {isEdit ? `Editing: ${cupboard.name}` : "Create a new storage cupboard"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "22px", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "22px 24px" }}>
          <Field label="Cupboard Name" required error={errors.name}>
            <input style={inputStyle(errors.name)} placeholder="e.g. Cupboard A"
              value={form.name} onChange={e => set("name", e.target.value)}
              onFocus={e => e.target.style.borderColor = form.color}
              onBlur={e => e.target.style.borderColor = errors.name ? "#ef4444" : "var(--border)"}
            />
          </Field>

          <Field label="Cupboard Code" required error={errors.code}>
            <input style={inputStyle(errors.code)} placeholder="e.g. CUP-A"
              value={form.code} onChange={e => set("code", e.target.value.toUpperCase())}
              onFocus={e => e.target.style.borderColor = form.color}
              onBlur={e => e.target.style.borderColor = errors.code ? "#ef4444" : "var(--border)"}
            />
          </Field>

          <Field label="Location">
            <input style={inputStyle(false)} placeholder="e.g. Lab Room 101"
              value={form.location} onChange={e => set("location", e.target.value)}
              onFocus={e => e.target.style.borderColor = form.color}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </Field>

          <Field label="Description">
            <textarea style={{ ...inputStyle(false), resize: "none", height: "72px", lineHeight: 1.6 }}
              placeholder="Short description of what's stored here..."
              value={form.description} onChange={e => set("description", e.target.value)}
              onFocus={e => e.target.style.borderColor = form.color}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </Field>

          <Field label="Color Theme">
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {COLORS.map(c => (
                <div key={c.value} onClick={() => { set("color", c.value); set("bg_color", c.bg); }}
                  title={c.label} style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    background: c.value, cursor: "pointer",
                    border: `3px solid ${form.color === c.value ? "#0f0f1a" : "transparent"}`,
                    transition: "all 0.15s", transform: form.color === c.value ? "scale(1.15)" : "scale(1)"
                  }}
                />
              ))}
            </div>
          </Field>

          {apiError && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#ef4444" }}>
              ⚠️ {apiError}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "var(--surface2)", border: "1.5px solid var(--border)", borderRadius: "10px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "var(--text-secondary)" }}>Cancel</button>
            <button onClick={handleSubmit} disabled={loading} style={{
              flex: 2, padding: "12px", background: loading ? form.color : "#0f0f1a",
              color: "#fff", border: "none", borderRadius: "10px",
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.15s"
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = form.color; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#0f0f1a"; }}
            >
              {loading ? <><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />{isEdit ? "Saving..." : "Creating..."}</> : (isEdit ? "✓ Save Changes" : "✓ Create Cupboard")}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ══════════════════════
   PLACE FORM MODAL
══════════════════════ */
function PlaceForm({ place, cupboard, onClose, onSuccess }) {
  const isEdit = !!place;
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState({
    name:     place?.name     || "",
    capacity: place?.capacity || 10,
  });

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name     = "Place name is required";
    if (form.capacity < 1) e.capacity = "Capacity must be at least 1";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setApiError("");
    try {
      if (isEdit) {
        await CupboardService.updatePlace(place.id, form);
      } else {
        await CupboardService.createPlace(cupboard.id, form);
      }
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {})[0]?.[0]
        || "Something went wrong.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(5px)", zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: "18px",
        width: "100%", maxWidth: "420px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
        animation: "slideUp 0.25s ease"
      }}>
        <div style={{
          padding: "22px 24px 18px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "14px"
        }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "11px", background: cupboard.bg_color, fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>📍</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>
              {isEdit ? "Edit Place" : "Add New Place"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>In {cupboard.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "22px", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "22px 24px" }}>
          <Field label="Place Name" required error={errors.name}>
            <input style={inputStyle(errors.name)} placeholder="e.g. Shelf 1, Drawer A, Top Rack"
              value={form.name} onChange={e => set("name", e.target.value)}
              onFocus={e => e.target.style.borderColor = cupboard.color}
              onBlur={e => e.target.style.borderColor = errors.name ? "#ef4444" : "var(--border)"}
            />
          </Field>

          <Field label="Capacity (max items)" error={errors.capacity}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => set("capacity", Math.max(1, form.capacity - 1))} style={{ width: "38px", height: "38px", borderRadius: "9px", border: "1.5px solid var(--border)", background: "var(--surface2)", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)", fontWeight: 700 }}>−</button>
              <div style={{ flex: 1, textAlign: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--text-primary)" }}>{form.capacity}</div>
              <button onClick={() => set("capacity", form.capacity + 1)} style={{ width: "38px", height: "38px", borderRadius: "9px", border: "1.5px solid var(--border)", background: "var(--surface2)", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)", fontWeight: 700 }}>+</button>
            </div>
          </Field>

          {apiError && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#ef4444" }}>
              ⚠️ {apiError}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "var(--surface2)", border: "1.5px solid var(--border)", borderRadius: "10px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "var(--text-secondary)" }}>Cancel</button>
            <button onClick={handleSubmit} disabled={loading} style={{
              flex: 2, padding: "12px", background: loading ? cupboard.color : "#0f0f1a",
              color: "#fff", border: "none", borderRadius: "10px",
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.15s"
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = cupboard.color; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#0f0f1a"; }}
            >
              {loading ? <><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />{isEdit ? "Saving..." : "Adding..."}</> : (isEdit ? "✓ Save Changes" : "✓ Add Place")}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── Delete Confirm ── */
function DeleteConfirm({ label, warning, onClose, onConfirm }) {
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");

  const handle = async () => {
    setLoading(true);
    setApiError("");
    try {
      await onConfirm();
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to delete. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(4px)", zIndex: 400,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: "18px",
        width: "100%", maxWidth: "400px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
        padding: "28px", animation: "slideUp 0.25s ease", textAlign: "center"
      }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "24px" }}>🗑️</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "8px" }}>Delete {label}?</div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.7 }}>This action cannot be undone.</div>
        {warning && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "#991b1b", lineHeight: 1.6 }}>
            ⚠️ {warning}
          </div>
        )}
        {apiError && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", fontSize: "12px", color: "#ef4444" }}>
            ⚠️ {apiError}
          </div>
        )}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "var(--surface2)", border: "1.5px solid var(--border)", borderRadius: "10px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "var(--text-secondary)" }}>Cancel</button>
          <button onClick={handle} disabled={loading} style={{
            flex: 2, padding: "12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "10px",
            fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "13px",
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}>
            {loading ? <><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />Deleting...</> : "🗑️ Delete"}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN STORAGE MANAGEMENT PAGE
══════════════════════════════════════════ */
export default function StorageManagement() {
  const [cupboards,      setCupboards]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedCup,    setSelectedCup]    = useState(null);
  const [showCupForm,    setShowCupForm]    = useState(false);
  const [editCupboard,   setEditCupboard]   = useState(null);
  const [deleteCupboard, setDeleteCupboard] = useState(null);
  const [showPlaceForm,  setShowPlaceForm]  = useState(false);
  const [editPlace,      setEditPlace]      = useState(null);
  const [deletePlace,    setDeletePlace]    = useState(null);

  // ── Map API cupboard → UI cupboard ──
  const mapCupboard = (c) => ({
    id:          c.id,
    name:        c.name,
    code:        c.code,
    description: c.description || "",
    location:    c.location    || "",
    color:       c.color       || "#6366f1",
    bg_color:    c.bg_color    || "#ede9fe",
    places: (c.places || []).map(p => ({
      id:        p.id,
      name:      p.name,
      capacity:  p.capacity,
      itemCount: p.item_count || 0,
    })),
  });

  // ── Fetch cupboards ──
  const fetchCupboards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await CupboardService.getAll();
      const mapped = (data || []).map(mapCupboard);
      setCupboards(mapped);
      // Keep selectedCup in sync after refresh
      setSelectedCup(prev =>
        prev ? mapped.find(c => c.id === prev.id) || null : null
      );
    } catch (err) {
      console.error("Failed to fetch cupboards:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCupboards(); }, [fetchCupboards]);

  // ── Derived stats ──
  const totalPlaces = cupboards.reduce((a, c) => a + c.places.length, 0);
  const totalItems  = cupboards.reduce((a, c) => a + c.places.reduce((b, p) => b + p.itemCount, 0), 0);
  const liveCup     = selectedCup ? cupboards.find(c => c.id === selectedCup.id) || null : null;

  return (
    <div style={{ animation: "fadeUp 0.4s ease forwards" }}>

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div className="page-eyebrow">Admin Panel</div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Storage <span>Management</span></h1>
        </div>
        <button onClick={() => setShowCupForm(true)} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "11px 22px", background: "#0f0f1a", color: "#fff",
          border: "none", borderRadius: "11px", cursor: "pointer",
          fontFamily: "'Syne',sans-serif", fontWeight: 700,
          fontSize: "13px", letterSpacing: "0.5px", transition: "background 0.15s"
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#6366f1"}
          onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Cupboard
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Cupboards",    value: cupboards.length, icon: "🗄️", bg: "#ede9fe" },
          { label: "Places",       value: totalPlaces,      icon: "📍", bg: "#d1fae5" },
          { label: "Items Stored", value: totalItems,       icon: "📦", bg: "#fef3c7" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "var(--surface)", border: "1.5px solid var(--border)",
            borderRadius: "14px", padding: "16px 18px",
            display: "flex", alignItems: "center", gap: "12px",
            animation: `fadeUp 0.35s ease ${i * 0.07}s forwards`, opacity: 0
          }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: s.bg, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "26px", color: "var(--text-primary)", lineHeight: 1 }}>
                {loading ? "…" : s.value}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "3px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px" }}>

        {/* Left — Cupboard list */}
        <div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>
            Cupboards ({cupboards.length})
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)", fontSize: "13px" }}>Loading...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {cupboards.map((cup, i) => (
                <div key={cup.id} style={{
                  background: liveCup?.id === cup.id ? cup.bg_color : "var(--surface)",
                  border: `1.5px solid ${liveCup?.id === cup.id ? cup.color : "var(--border)"}`,
                  borderRadius: "14px", padding: "14px 16px",
                  cursor: "pointer", transition: "all 0.2s",
                  animation: `fadeUp 0.35s ease ${i * 0.08}s forwards`, opacity: 0
                }}
                  onClick={() => setSelectedCup(cup)}
                  onMouseEnter={e => { if (liveCup?.id !== cup.id) { e.currentTarget.style.borderColor = cup.color; e.currentTarget.style.background = cup.bg_color + "60"; }}}
                  onMouseLeave={e => { if (liveCup?.id !== cup.id) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: liveCup?.id === cup.id ? cup.color : cup.bg_color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>🗄️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>{cup.name}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{cup.code} · {cup.location}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {cup.places.length} place{cup.places.length !== 1 ? "s" : ""}
                    </span>
                    <div style={{ display: "flex", gap: "4px" }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => setEditCupboard(cup)} style={{ padding: "3px 8px", borderRadius: "6px", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: "11px", color: "var(--text-muted)", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.color = "#6366f1"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >✏️</button>
                      <button onClick={() => setDeleteCupboard(cup)} style={{ padding: "3px 8px", borderRadius: "6px", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", fontSize: "11px", color: "var(--text-muted)", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >🗑️</button>
                    </div>
                  </div>
                </div>
              ))}

              {cupboards.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)", background: "var(--surface)", borderRadius: "14px", border: "1.5px dashed var(--border)" }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>🗄️</div>
                  <div style={{ fontSize: "13px" }}>No cupboards yet.<br />Add one to get started.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — Places detail */}
        <div>
          {!liveCup ? (
            <div style={{
              height: "100%", minHeight: "300px", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "12px",
              background: "var(--surface)", borderRadius: "16px",
              border: "1.5px dashed var(--border)", color: "var(--text-muted)"
            }}>
              <div style={{ fontSize: "36px" }}>👈</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "16px", color: "var(--text-primary)" }}>Select a Cupboard</div>
              <div style={{ fontSize: "13px" }}>Click a cupboard to manage its places</div>
            </div>
          ) : (
            <div style={{ animation: "fadeUp 0.3s ease forwards" }}>
              {/* Cupboard header */}
              <div style={{
                background: liveCup.bg_color, border: `1.5px solid ${liveCup.color}30`,
                borderRadius: "16px", padding: "18px 22px", marginBottom: "16px",
                display: "flex", alignItems: "center", gap: "16px"
              }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: liveCup.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>🗄️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "18px", color: "var(--text-primary)" }}>{liveCup.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{liveCup.description} · {liveCup.location}</div>
                </div>
                <button onClick={() => setShowPlaceForm(true)} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "9px 16px", background: liveCup.color, color: "#fff",
                  border: "none", borderRadius: "9px", cursor: "pointer",
                  fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "12px", transition: "opacity 0.15s"
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Place
                </button>
              </div>

              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "10px" }}>
                Places ({liveCup.places.length})
              </div>

              {liveCup.places.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", background: "var(--surface)", borderRadius: "14px", border: "1.5px dashed var(--border)", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "30px", marginBottom: "10px" }}>📍</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "15px", color: "var(--text-primary)", marginBottom: "6px" }}>No places yet</div>
                  <div style={{ fontSize: "13px", marginBottom: "16px" }}>Add shelves, drawers or sections inside {liveCup.name}</div>
                  <button onClick={() => setShowPlaceForm(true)} style={{
                    padding: "9px 20px", background: liveCup.color, color: "#fff",
                    border: "none", borderRadius: "9px", cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: "13px"
                  }}>+ Add First Place</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {liveCup.places.map((place, pi) => {
                    const usedPct = place.capacity > 0 ? Math.round((place.itemCount / place.capacity) * 100) : 0;
                    const isFull  = usedPct >= 100;
                    return (
                      <div key={place.id} style={{
                        background: "var(--surface)", border: "1.5px solid var(--border)",
                        borderRadius: "12px", padding: "16px 18px",
                        display: "flex", alignItems: "center", gap: "16px",
                        animation: `fadeUp 0.3s ease ${pi * 0.06}s forwards`, opacity: 0,
                        transition: "border-color 0.15s"
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = liveCup.color}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                      >
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: liveCup.bg_color, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>📍</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>{place.name}</span>
                            {isFull && <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "100px", background: "#fee2e2", color: "#ef4444", fontWeight: 600 }}>FULL</span>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ flex: 1, height: "5px", background: "var(--border)", borderRadius: "100px", overflow: "hidden" }}>
                              <div style={{
                                height: "100%", borderRadius: "100px", transition: "width 0.8s ease",
                                width: `${Math.min(usedPct, 100)}%`,
                                background: isFull ? "#ef4444" : usedPct > 70 ? "#f59e0b" : liveCup.color
                              }} />
                            </div>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                              {place.itemCount} / {place.capacity} items
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <button onClick={() => setEditPlace(place)} style={{ padding: "6px 12px", borderRadius: "7px", border: "1.5px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                          >✏️ Edit</button>
                          <button onClick={() => setDeletePlace(place)} style={{ padding: "6px 10px", borderRadius: "7px", border: "1.5px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: "13px", transition: "all 0.15s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#ef4444"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                          >🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showCupForm && (
        <CupboardForm onClose={() => setShowCupForm(false)} onSuccess={() => { setShowCupForm(false); fetchCupboards(); }} />
      )}
      {editCupboard && (
        <CupboardForm cupboard={editCupboard} onClose={() => setEditCupboard(null)} onSuccess={() => { setEditCupboard(null); fetchCupboards(); }} />
      )}
      {deleteCupboard && (
        <DeleteConfirm
          label={`"${deleteCupboard.name}"`}
          warning={deleteCupboard.places.length > 0 ? `This will also delete all ${deleteCupboard.places.length} place(s) inside it. Items must be relocated first.` : null}
          onClose={() => setDeleteCupboard(null)}
          onConfirm={async () => {
            await CupboardService.delete(deleteCupboard.id);
            setDeleteCupboard(null);
            fetchCupboards();
          }}
        />
      )}
      {showPlaceForm && liveCup && (
        <PlaceForm cupboard={liveCup} onClose={() => setShowPlaceForm(false)} onSuccess={() => { setShowPlaceForm(false); fetchCupboards(); }} />
      )}
      {editPlace && liveCup && (
        <PlaceForm place={editPlace} cupboard={liveCup} onClose={() => setEditPlace(null)} onSuccess={() => { setEditPlace(null); fetchCupboards(); }} />
      )}
      {deletePlace && (
        <DeleteConfirm
          label={`"${deletePlace.name}"`}
          warning={deletePlace.itemCount > 0 ? `This place has ${deletePlace.itemCount} item(s) currently assigned to it.` : null}
          onClose={() => setDeletePlace(null)}
          onConfirm={async () => {
            await CupboardService.deletePlace(deletePlace.id);
            setDeletePlace(null);
            fetchCupboards();
          }}
        />
      )}

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}