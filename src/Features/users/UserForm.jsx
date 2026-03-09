import { useState } from "react";

const ROLES = [
  { value: "admin", label: "Administrator", desc: "Full access to all features including user management and audit log", color: "#6366f1", bg: "#ede9fe" },
  { value: "staff", label: "Staff",         desc: "Can browse inventory, borrow and return items",                    color: "#10b981", bg: "#d1fae5" },
];

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

const inputStyle = (hasError) => ({
  width: "100%", padding: "11px 14px",
  background: "#fff",
  border: `1.5px solid ${hasError ? "#ef4444" : "var(--border)"}`,
  borderRadius: "9px", fontFamily: "'DM Sans', sans-serif",
  fontSize: "13.5px", color: "var(--text-primary)",
  outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
});

function SuccessScreen({ user, isEdit, onClose }) {
  return (
    <div style={{ padding: "32px 28px", textAlign: "center" }}>
      <div style={{
        width: "64px", height: "64px", borderRadius: "50%",
        background: "linear-gradient(135deg,#6366f1,#10b981)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px", fontSize: "28px"
      }}>👤</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "20px", color: "var(--text-primary)", marginBottom: "8px" }}>
        User {isEdit ? "Updated" : "Created"} Successfully!
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
        {isEdit ? "The user details have been updated." : "The new user can now log in with their credentials."}
      </div>
      <div style={{ background: "var(--surface2)", borderRadius: "12px", padding: "18px", textAlign: "left", marginBottom: "24px" }}>
        {[
          { label: "Name",  value: user.name  },
          { label: "Email", value: user.email },
          { label: "Role",  value: user.role === "admin" ? "Administrator" : "Staff" },
        ].map((row, i, arr) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "7px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", gap: "12px"
          }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px" }}>{row.label}</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{row.value}</span>
          </div>
        ))}
      </div>
      <button onClick={onClose} style={{
        width: "100%", padding: "12px", background: "#0f0f1a", color: "#fff",
        border: "none", borderRadius: "10px", fontFamily: "'Syne',sans-serif",
        fontWeight: 700, fontSize: "13px", letterSpacing: "1px", cursor: "pointer"
      }}
        onMouseEnter={e => e.currentTarget.style.background = "#6366f1"}
        onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
      >Done</button>
    </div>
  );
}

export default function UserForm({ user = null, onClose, onSuccess }) {
  const isEdit = !!user;
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const [form, setForm] = useState({
    name:     user?.name     || "",
    email:    user?.email    || "",
    role:     user?.role     || "staff",
    password: "",
    confirmPassword: "",
  });

  const set = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Full name is required";
    if (!form.email.trim()) e.email = "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!isEdit) {
      if (!form.password)             e.password = "Password is required";
      if (form.password.length < 8)   e.password = "Password must be at least 8 characters";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    }
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setStep(2);
  };

  const handleSubmit = () => {
    setLoading(true);
    // Simulate API — replace with POST /api/users or PUT /api/users/:id later
    setTimeout(() => {
      setLoading(false);
      setStep(3);
      onSuccess && onSuccess(form);
    }, 1200);
  };

  const selectedRole = ROLES.find(r => r.value === form.role);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(5px)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: "18px",
        width: "100%", maxWidth: "500px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
        animation: "slideUp 0.25s ease",
        maxHeight: "90vh", overflowY: "auto"
      }}>

        {/* Success */}
        {step === 3 && <SuccessScreen user={form} isEdit={isEdit} onClose={onClose} />}

        {step !== 3 && (
          <>
            {/* Header */}
            <div style={{
              padding: "22px 24px 18px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: "14px"
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "11px",
                background: "#ede9fe", fontSize: "20px",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>👤</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>
                  {step === 1 ? (isEdit ? "Edit User" : "Create New User") : "Confirm User Details"}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {isEdit ? `Editing: ${user.name}` : "Admin access only — no self-signup allowed"}
                </div>
              </div>
              {/* Step indicators */}
              <div style={{ display: "flex", gap: "6px" }}>
                {[1, 2].map(s => (
                  <div key={s} style={{
                    width: "24px", height: "4px", borderRadius: "100px",
                    background: step >= s ? "#6366f1" : "var(--border)",
                    transition: "background 0.3s"
                  }} />
                ))}
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "22px", lineHeight: 1 }}>×</button>
            </div>

            {/* STEP 1 — Form */}
            {step === 1 && (
              <div style={{ padding: "22px 24px" }}>

                <Field label="Full Name" required error={errors.name}>
                  <input style={inputStyle(errors.name)} placeholder="e.g. Kasun Perera"
                    value={form.name} onChange={e => set("name", e.target.value)}
                    onFocus={e => e.target.style.borderColor = "#6366f1"}
                    onBlur={e => e.target.style.borderColor = errors.name ? "#ef4444" : "var(--border)"}
                  />
                </Field>

                <Field label="Email Address" required error={errors.email}>
                  <input style={inputStyle(errors.email)} placeholder="e.g. kasun@ceyntics.com" type="email"
                    value={form.email} onChange={e => set("email", e.target.value)}
                    onFocus={e => e.target.style.borderColor = "#6366f1"}
                    onBlur={e => e.target.style.borderColor = errors.email ? "#ef4444" : "var(--border)"}
                  />
                </Field>

                {/* Role Selector */}
                <Field label="Role" required>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {ROLES.map(r => (
                      <div key={r.value} onClick={() => set("role", r.value)} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 14px", borderRadius: "10px", cursor: "pointer",
                        border: `1.5px solid ${form.role === r.value ? r.color : "var(--border)"}`,
                        background: form.role === r.value ? r.bg : "var(--surface)",
                        transition: "all 0.15s"
                      }}>
                        <div style={{
                          width: "18px", height: "18px", borderRadius: "50%",
                          border: `2px solid ${form.role === r.value ? r.color : "var(--border)"}`,
                          background: form.role === r.value ? r.color : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, transition: "all 0.15s"
                        }}>
                          {form.role === r.value && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{r.label}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{r.desc}</div>
                        </div>
                        <span style={{
                          fontSize: "10px", padding: "2px 8px", borderRadius: "100px",
                          background: r.bg, color: r.color, fontWeight: 600, letterSpacing: "0.5px"
                        }}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                </Field>

                {/* Password fields — only for create */}
                {!isEdit && (
                  <>
                    <Field label="Password" required error={errors.password}>
                      <input style={inputStyle(errors.password)} type="password" placeholder="Min. 8 characters"
                        value={form.password} onChange={e => set("password", e.target.value)}
                        onFocus={e => e.target.style.borderColor = "#6366f1"}
                        onBlur={e => e.target.style.borderColor = errors.password ? "#ef4444" : "var(--border)"}
                      />
                    </Field>

                    <Field label="Confirm Password" required error={errors.confirmPassword}>
                      <input style={inputStyle(errors.confirmPassword)} type="password" placeholder="Re-enter password"
                        value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
                        onFocus={e => e.target.style.borderColor = "#6366f1"}
                        onBlur={e => e.target.style.borderColor = errors.confirmPassword ? "#ef4444" : "var(--border)"}
                      />
                    </Field>
                  </>
                )}

                {/* Password hint for edit */}
                {isEdit && (
                  <div style={{
                    display: "flex", gap: "10px", alignItems: "flex-start",
                    background: "#fef3c7", border: "1px solid #fde68a",
                    borderRadius: "10px", padding: "12px 14px", marginBottom: "16px"
                  }}>
                    <span>🔒</span>
                    <span style={{ fontSize: "12px", color: "#92400e", lineHeight: 1.6 }}>
                      Password is not shown for security. Leave blank to keep the existing password unchanged.
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button onClick={onClose} style={{
                    flex: 1, padding: "12px", background: "var(--surface2)",
                    border: "1.5px solid var(--border)", borderRadius: "10px",
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    fontSize: "13px", color: "var(--text-secondary)"
                  }}>Cancel</button>
                  <button onClick={handleNext} style={{
                    flex: 2, padding: "12px", background: "#0f0f1a", color: "#fff",
                    border: "none", borderRadius: "10px",
                    fontFamily: "'Syne',sans-serif", fontWeight: 700,
                    fontSize: "13px", letterSpacing: "0.8px", cursor: "pointer", transition: "background 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#6366f1"}
                    onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
                  >Review →</button>
                </div>
              </div>
            )}

            {/* STEP 2 — Confirm */}
            {step === 2 && (
              <div style={{ padding: "22px 24px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                  Please review the user details before {isEdit ? "saving changes" : "creating the account"}.
                </p>

                <div style={{ background: "var(--surface2)", borderRadius: "12px", padding: "18px", marginBottom: "20px" }}>
                  {[
                    { label: "Full Name", value: form.name  },
                    { label: "Email",     value: form.email },
                    { label: "Role",      value: selectedRole?.label },
                    ...(!isEdit ? [{ label: "Password", value: "••••••••" }] : []),
                  ].map((row, i, arr) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none", gap: "12px"
                    }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.7px", flexShrink: 0 }}>{row.label}</span>
                      <span style={{
                        fontSize: "13px", fontWeight: 600, textAlign: "right",
                        color: row.label === "Role" ? selectedRole?.color : "var(--text-primary)"
                      }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Role permission summary */}
                <div style={{
                  display: "flex", gap: "10px", alignItems: "flex-start",
                  background: selectedRole?.bg, border: `1px solid ${selectedRole?.color}40`,
                  borderRadius: "10px", padding: "12px 14px", marginBottom: "20px"
                }}>
                  <span>🔐</span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    <strong>{selectedRole?.label}</strong> — {selectedRole?.desc}
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
                    background: loading ? "#6366f1" : "#0f0f1a",
                    color: "#fff", border: "none", borderRadius: "10px",
                    fontFamily: "'Syne',sans-serif", fontWeight: 700,
                    fontSize: "13px", letterSpacing: "0.8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "background 0.15s"
                  }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#6366f1"; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#0f0f1a"; }}
                  >
                    {loading ? (
                      <>
                        <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                        {isEdit ? "Saving..." : "Creating..."}
                      </>
                    ) : (isEdit ? "✓ Save Changes" : "✓ Create User")}
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