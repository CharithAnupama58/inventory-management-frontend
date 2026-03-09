import MainLayout        from "../../Components/layout/MainLayout";
import AdminView         from "./AdminView";
import StaffView         from "./StaffView";
import BrowseInventory   from "../inventory/BrowseInventory";
import MyBorrows         from "../inventory/MyBorrows";
import StorageMap        from "../storage/StorageMap";
import StorageManagement from "../storage/StorageManagement";
import UserManagement    from "../users/UserManagement";
import BorrowManagement  from "../borrows/BorrowManagement";
import AuditLog          from "../audit/AuditLog";

export default function DashboardPage() {
  const role    = localStorage.getItem("role") || "staff";
  const isAdmin = role === "admin";

  return (
    <MainLayout defaultPage="dashboard">
      {(activePage, setActivePage) => (
        <>
          {activePage === "dashboard" && (
            isAdmin ? <AdminView /> : <StaffView onNavigate={setActivePage} />
          )}

          {/* Shared */}
          {activePage === "inventory" && <BrowseInventory />}

          {/* Storage — role-based view */}
          {activePage === "storage" && !isAdmin && <StorageMap />}
          {activePage === "storage" && isAdmin  && <StorageManagement />}

          {/* Staff only */}
          {activePage === "borrow" && !isAdmin && <MyBorrows />}

          {/* Admin only */}
          {activePage === "borrow" && isAdmin && <BorrowManagement />}
          {activePage === "users"  && isAdmin && <UserManagement />}
          {activePage === "audit"  && isAdmin && <AuditLog />}
        </>
      )}
    </MainLayout>
  );
}