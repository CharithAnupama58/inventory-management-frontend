import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute
 * Wraps any page that requires authentication.
 * Optionally restricts to a specific role.
 *
 * Usage:
 *   <ProtectedRoute>          → any logged in user
 *   <ProtectedRoute role="admin">  → admin only
 */
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();

  // While checking auth state — show nothing (avoids flash)
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "var(--bg)",
        fontFamily: "'DM Sans', sans-serif", color: "var(--text-muted)"
      }}>
        Loading...
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role check — if role required and user doesn't have it
  if (role && user?.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}