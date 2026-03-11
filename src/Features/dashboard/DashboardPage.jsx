import { useNavigate }    from "react-router-dom";
import { useAuth }        from "../../context/AuthContext";
import MainLayout         from "../../Components/layout/MainLayout";
import AdminView          from "./AdminView";
import StaffView          from "./StaffView";
import BrowseInventory    from "../inventory/BrowseInventory";
import MyBorrows          from "../inventory/MyBorrows";
import StorageMap         from "../storage/StorageMap";
import StorageManagement  from "../storage/StorageManagement";
import UserManagement     from "../users/UserManagement";
import BorrowManagement   from "../borrows/BorrowManagement";
import AuditLog           from "../audit/AuditLog";

export default function DashboardPage() {
  const { user, logout, isAdmin } = useAuth();   // ← real auth
  const navigate = useNavigate();
  console.log("is Admin",isAdmin);
  console.log(user);

  const handleLogout = async () => {             // ← real logout
    await logout();
    navigate("/login");
  };

  return (
    <MainLayout defaultPage="dashboard" onLogout={handleLogout} user={user}>
      {(activePage, setActivePage) => (
        <>
          {activePage === "dashboard" && (
            isAdmin ? <AdminView  /> : <StaffView onNavigate={setActivePage} />
          )}

          {/* Shared */}
          {activePage === "inventory" && <BrowseInventory />}

          {/* Storage — role-based view */}
          {activePage === "storage" && !isAdmin && <StorageMap />}
          {activePage === "storage" &&  isAdmin  && <StorageManagement />}

          {/* Staff only */}
          {activePage === "borrow" && !isAdmin && <MyBorrows />}

          {/* Admin only */}
          {activePage === "borrow" &&  isAdmin && <BorrowManagement />}
          {activePage === "users"  &&  isAdmin && <UserManagement />}
          {activePage === "audit"  &&  isAdmin && <AuditLog />}
        </>
      )}
    </MainLayout>
  );
}