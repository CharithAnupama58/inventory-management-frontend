import MainLayout from "../../Components/layout/MainLayout";
import AdminView  from "./AdminView";
import StaffView  from "./StaffView";

export default function DashboardPage() {
  const role    = localStorage.getItem("role") || "staff";
  const isAdmin = role === "admin";

  return (
    <MainLayout defaultPage="dashboard">
      {(activePage) => (
        <>
          {/* Dashboard home */}
          {activePage === "dashboard" && (isAdmin ? <AdminView /> : <StaffView />)}

          {/* Placeholder pages – replace with real feature pages later */}
          {activePage === "inventory" && <PlaceholderPage title="Inventory" icon="📦" />}
          {activePage === "borrow"    && <PlaceholderPage title={isAdmin ? "Borrow / Return" : "My Borrows"} icon="📤" />}
          {activePage === "users"     && isAdmin && <PlaceholderPage title="User Management" icon="👥" />}
          {activePage === "storage"   && <PlaceholderPage title="Storage" icon="🗄️" />}
          {activePage === "audit"     && isAdmin && <PlaceholderPage title="Audit Log" icon="📋" />}
        </>
      )}
    </MainLayout>
  );
}

/* Placeholder for pages not yet built */
function PlaceholderPage({ title, icon }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "60vh", gap: "16px",
      color: "var(--text-muted)", textAlign: "center"
    }}>
      <div style={{ fontSize: "48px" }}>{icon}</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
        {title}
      </div>
      <div style={{ fontSize: "14px" }}>This page is under construction. Coming soon.</div>
    </div>
  );
}