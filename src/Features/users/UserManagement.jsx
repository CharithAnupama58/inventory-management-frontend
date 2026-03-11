import { useState, useEffect, useCallback } from "react";
import { UserService } from "../../services/otherServices";
import UserForm from "./UserForm";

const AVATAR_COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  : "Never";

const getInitials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

function Avatar({ initials, index, size = 36 }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Syne',sans-serif", fontWeight: 700,
      fontSize: size * 0.35, flexShrink: 0, letterSpacing: "0.5px"
    }}>{initials}</div>
  );
}

function RoleBadge({ role }) {
  return (
    <span style={{
      fontSize: "11px", padding: "3px 10px", borderRadius: "100px", fontWeight: 600,
      background: role === "admin" ? "#ede9fe" : "#d1fae5",
      color:      role === "admin" ? "#6366f1" : "#10b981",
    }}>{role === "admin" ? "Admin" : "Staff"}</span>
  );
}

function StatusDot({ status }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{
        width: "7px", height: "7px", borderRadius: "50%",
        background: status === "active" ? "#10b981" : "#d1d5db",
        display: "inline-block"
      }} />
      <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "capitalize" }}>{status}</span>
    </span>
  );
}

/* ── Delete Confirm Modal ── */
function DeleteConfirm({ user, onClose, onConfirm }) {
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");

  const handle = async () => {
    setLoading(true);
    setApiError("");
    try {
      await UserService.delete(user.id);
      onConfirm(user.id);
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to delete user.");
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(4px)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: "18px",
        width: "100%", maxWidth: "420px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
        padding: "28px", animation: "slideUp 0.25s ease", textAlign: "center"
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "#fee2e2", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 16px", fontSize: "24px"
        }}>🗑️</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "8px" }}>
          Delete User?
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px", lineHeight: 1.7 }}>
          Are you sure you want to delete <strong style={{ color: "var(--text-primary)" }}>{user.name}</strong>?
          This action cannot be undone and will remove all their access.
        </div>
        <div style={{
          background: "#fee2e2", border: "1px solid #fca5a5",
          borderRadius: "10px", padding: "10px 14px", marginBottom: "16px",
          fontSize: "12px", color: "#991b1b", lineHeight: 1.6
        }}>
          ⚠️ This will be permanently logged in the audit trail.
        </div>
        {apiError && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.3)",
            borderRadius: "10px", padding: "10px 14px", marginBottom: "14px",
            fontSize: "12px", color: "#ef4444"
          }}>⚠️ {apiError}</div>
        )}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px", background: "var(--surface2)",
            border: "1.5px solid var(--border)", borderRadius: "10px",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            fontSize: "13px", color: "var(--text-secondary)"
          }}>Cancel</button>
          <button onClick={handle} disabled={loading} style={{
            flex: 2, padding: "12px", background: "#ef4444",
            color: "#fff", border: "none", borderRadius: "10px",
            fontFamily: "'Syne',sans-serif", fontWeight: 700,
            fontSize: "13px", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            opacity: loading ? 0.8 : 1
          }}>
            {loading ? (
              <><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> Deleting...</>
            ) : "🗑️ Delete User"}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ── Toggle Status Confirm ── */
function ToggleConfirm({ user, onClose, onConfirm }) {
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const isDeactivating = user.status === "active";

  const handle = async () => {
    setLoading(true);
    setApiError("");
    try {
      await UserService.toggleStatus(user.id);
      onConfirm(user.id);
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to update status.");
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(4px)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: "18px",
        width: "100%", maxWidth: "400px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
        padding: "28px", animation: "slideUp 0.25s ease", textAlign: "center"
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: isDeactivating ? "#fee2e2" : "#d1fae5",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: "24px"
        }}>{isDeactivating ? "🔒" : "🔓"}</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", marginBottom: "8px" }}>
          {isDeactivating ? "Deactivate User?" : "Activate User?"}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: 1.7 }}>
          {isDeactivating
            ? <><strong style={{ color: "var(--text-primary)" }}>{user.name}</strong>'s login access will be revoked immediately.</>
            : <>Activating <strong style={{ color: "var(--text-primary)" }}>{user.name}</strong> will restore their login access.</>}
        </div>
        {apiError && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.3)",
            borderRadius: "10px", padding: "10px 14px", marginBottom: "14px",
            fontSize: "12px", color: "#ef4444"
          }}>⚠️ {apiError}</div>
        )}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px", background: "var(--surface2)",
            border: "1.5px solid var(--border)", borderRadius: "10px",
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            fontSize: "13px", color: "var(--text-secondary)"
          }}>Cancel</button>
          <button onClick={handle} disabled={loading} style={{
            flex: 2, padding: "12px",
            background: isDeactivating ? "#ef4444" : "#10b981",
            color: "#fff", border: "none", borderRadius: "10px",
            fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "13px",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            opacity: loading ? 0.8 : 1
          }}>
            {loading
              ? <><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> Processing...</>
              : (isDeactivating ? "🔒 Deactivate" : "🔓 Activate")}
          </button>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN USER MANAGEMENT PAGE
══════════════════════════════════════════ */
export default function UserManagement() {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm,     setShowForm]     = useState(false);
  const [editUser,     setEditUser]     = useState(null);
  const [deleteUser,   setDeleteUser]   = useState(null);
  const [toggleUser,   setToggleUser]   = useState(null);

  // ── Fetch users from API ──
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await UserService.getAll({ per_page: 100 });
      setUsers(
        (res.data || []).map(u => ({
          id:        u.id,
          name:      u.name,
          email:     u.email,
          role:      u.role,
          status:    u.status || "active",
          createdAt: formatDate(u.created_at),
          lastLogin: formatDate(u.last_login_at),
          avatar:    getInitials(u.name),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Derived ──
  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter   === "all" || u.role   === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const adminCnt  = users.filter(u => u.role   === "admin").length;
  const staffCnt  = users.filter(u => u.role   === "staff").length;
  const activeCnt = users.filter(u => u.status === "active").length;

  // ── Handlers — optimistic UI + API already called inside modals ──
  const handleCreateSuccess = () => {
    setShowForm(false);
    fetchUsers(); // refresh from API
  };

  const handleEditSuccess = () => {
    setEditUser(null);
    fetchUsers();
  };

  const handleDeleteConfirm = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteUser(null);
  };

  const handleToggleConfirm = (id) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
    ));
    setToggleUser(null);
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease forwards" }}>

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div className="page-eyebrow">Admin Panel</div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>User <span>Management</span></h1>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "11px 22px", background: "#0f0f1a", color: "#fff",
          border: "none", borderRadius: "11px", cursor: "pointer",
          fontFamily: "'Syne',sans-serif", fontWeight: 700,
          fontSize: "13px", letterSpacing: "0.5px", transition: "background 0.15s"
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#6366f1"}
          onMouseLeave={e => e.currentTarget.style.background = "#0f0f1a"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New User
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Users", value: users.length, icon: "👥", bg: "#ede9fe", color: "#6366f1" },
          { label: "Admins",      value: adminCnt,     icon: "🛡️", bg: "#fee2e2", color: "#ef4444" },
          { label: "Staff",       value: staffCnt,     icon: "👤", bg: "#d1fae5", color: "#10b981" },
          { label: "Active",      value: activeCnt,    icon: "✅", bg: "#fef3c7", color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "var(--surface)", border: "1.5px solid var(--border)",
            borderRadius: "14px", padding: "16px 18px",
            display: "flex", alignItems: "center", gap: "12px",
            animation: `fadeUp 0.35s ease ${i * 0.06}s forwards`, opacity: 0
          }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: s.bg, fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "24px", color: "var(--text-primary)", lineHeight: 1 }}>
                {loading ? "…" : s.value}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "3px" }}>{s.label}</div>
            </div>
          </div>
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            style={{ border: "none", background: "none", outline: "none", fontSize: "13.5px", color: "var(--text-primary)", fontFamily: "'DM Sans',sans-serif", width: "100%" }} />
          {search && <button onClick={() => setSearch("")} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "18px", lineHeight: 1 }}>×</button>}
        </div>

        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{
          padding: "9px 14px", borderRadius: "10px", border: "1.5px solid var(--border)",
          background: "var(--surface)", color: "var(--text-primary)",
          fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer"
        }}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
          padding: "9px 14px", borderRadius: "10px", border: "1.5px solid var(--border)",
          background: "var(--surface)", color: "var(--text-primary)",
          fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer"
        }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          {loading ? "Loading..." : `${filtered.length} user${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Users Table */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-muted)", fontSize: "13px" }}>
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>👤</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>No users found</div>
            <div style={{ fontSize: "13px" }}>Try adjusting your search or filters</div>
          </div>
        ) : (
          <table className="data-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last Login</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ animation: `fadeUp 0.3s ease ${i * 0.05}s forwards`, opacity: 0 }}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Avatar initials={u.avatar} index={i} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{u.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "1px" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><RoleBadge role={u.role} /></td>
                  <td><StatusDot status={u.status} /></td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{u.createdAt}</td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{u.lastLogin}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button onClick={() => setEditUser(u)} title="Edit user" style={{
                        padding: "6px 12px", borderRadius: "7px",
                        border: "1.5px solid var(--border)", background: "var(--surface)",
                        cursor: "pointer", fontSize: "12px", fontWeight: 500,
                        color: "var(--text-secondary)", fontFamily: "'DM Sans',sans-serif",
                        transition: "all 0.15s", display: "flex", alignItems: "center", gap: "4px"
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#ede9fe"; e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                      >✏️ Edit</button>

                      <button onClick={() => setToggleUser(u)} title={u.status === "active" ? "Deactivate" : "Activate"} style={{
                        padding: "6px 12px", borderRadius: "7px",
                        border: "1.5px solid var(--border)", background: "var(--surface)",
                        cursor: "pointer", fontSize: "12px", fontWeight: 500,
                        color: "var(--text-secondary)", fontFamily: "'DM Sans',sans-serif",
                        transition: "all 0.15s", display: "flex", alignItems: "center", gap: "4px"
                      }}
                        onMouseEnter={e => {
                          const isActive = u.status === "active";
                          e.currentTarget.style.background   = isActive ? "#fee2e2" : "#d1fae5";
                          e.currentTarget.style.borderColor  = isActive ? "#ef4444" : "#10b981";
                          e.currentTarget.style.color        = isActive ? "#ef4444" : "#10b981";
                        }}
                        onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                      >{u.status === "active" ? "🔒 Deactivate" : "🔓 Activate"}</button>

                      <button onClick={() => setDeleteUser(u)} title="Delete user" style={{
                        padding: "6px 10px", borderRadius: "7px",
                        border: "1.5px solid var(--border)", background: "var(--surface)",
                        cursor: "pointer", fontSize: "13px", transition: "all 0.15s"
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#ef4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                      >🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modals ── */}
      {showForm   && <UserForm onClose={() => setShowForm(false)} onSuccess={handleCreateSuccess} />}
      {editUser   && <UserForm user={editUser} onClose={() => setEditUser(null)} onSuccess={handleEditSuccess} />}
      {deleteUser && <DeleteConfirm user={deleteUser} onClose={() => setDeleteUser(null)} onConfirm={handleDeleteConfirm} />}
      {toggleUser && <ToggleConfirm user={toggleUser} onClose={() => setToggleUser(null)} onConfirm={handleToggleConfirm} />}

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}