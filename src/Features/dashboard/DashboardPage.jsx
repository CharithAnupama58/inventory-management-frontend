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
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <MainLayout defaultPage="dashboard" onLogout={handleLogout} user={user}>
      {(activePage, setActivePage) => (
        <>
          {activePage === "dashboard" && (
            isAdmin
              ? <AdminView onNavigate={setActivePage} />
              : <StaffView onNavigate={setActivePage} />
          )}

          {activePage === "inventory" && <BrowseInventory />}

          {activePage === "storage"      && !isAdmin && <StorageMap />}
          {activePage === "storage"      &&  isAdmin && <StorageManagement />}
          {activePage === "storage-mgmt" &&  isAdmin && <StorageManagement />}

          {activePage === "borrow"  && !isAdmin && <MyBorrows />}

          {activePage === "borrow"  &&  isAdmin && <BorrowManagement />}
          {activePage === "borrows" &&  isAdmin && <BorrowManagement />}
          {activePage === "users"   &&  isAdmin && <UserManagement />}
          {activePage === "audit"   &&  isAdmin && <AuditLog />}
        </>
      )}
    </MainLayout>
  );
}