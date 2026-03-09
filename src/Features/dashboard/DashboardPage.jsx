import MainLayout      from "../../Components/layout/MainLayout";
import AdminView       from "./AdminView";
import StaffView       from "./StaffView";
import BrowseInventory from "../inventory/BrowseInventory";
import MyBorrows       from "../inventory/MyBorrows";
import StorageMap      from "../storage/StorageMap";
import UserManagement  from "../users/UserManagement";

export default function DashboardPage() {
  const role    = localStorage.getItem("role") || "staff";
  const isAdmin = role === "admin";

  return (
    <MainLayout defaultPage="dashboard">
      {(activePage, setActivePage) => (
        <>
          {/* Dashboard home */}
          {activePage === "dashboard" && (
            isAdmin ? <AdminView /> : <StaffView onNavigate={setActivePage} />
          )}

          {/* Shared features */}
          {activePage === "inventory" && <BrowseInventory />}
          {activePage === "storage"   && <StorageMap />}

          {/* Staff only */}
          {activePage === "borrow" && !isAdmin && <MyBorrows />}

          {/* Admin only */}
          {activePage === "users"  && isAdmin && <UserManagement />}
          {activePage === "borrow" && isAdmin && <PlaceholderPage title="Borrow / Return Management" icon="📤" />}
          {activePage === "audit"  && isAdmin && <PlaceholderPage title="Audit Log"                  icon="📋" />}
        </>
      )}
    </MainLayout>
  );
}

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
      <div style={{ fontSize: "14px" }}>Coming up next!</div>
    </div>
  );
}