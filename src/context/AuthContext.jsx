import { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../services/authService.js";

/* ── Create Context ──────────────────────────────────────────── */
const AuthContext = createContext(null);

/* ── Provider ────────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true on first load

  // On app boot — restore user from localStorage if token exists
  useEffect(() => {
    const savedUser = AuthService.getCurrentUser();
    const token     = localStorage.getItem("token");

    if (savedUser && token) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  /**
   * Login — calls API, stores token, updates state
   */
  const login = async (email, password) => {
    const loggedInUser = await AuthService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  /**
   * Logout — clears state and storage
   */
  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  /**
   * Update user in context (e.g. after profile update)
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isStaff: user?.role === "staff",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────────── */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export default AuthContext;