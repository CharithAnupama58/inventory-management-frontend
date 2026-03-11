import api from "./api";

const AuthService = {
  /**
   * Login — stores token and user in localStorage on success
   */
  async login(email, password) {
    const response = await api.post("/login", { email, password });
    const { token } = response.data.data;
    const user = response.data.data.user?.data || response.data.data.user;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  },

  /**
   * Logout — clears localStorage and calls backend to revoke token
   */
  async logout() {
    try {
      await api.post("/logout");
    } catch {
      // Even if backend call fails, clear local state
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  /**
   * Get current user from localStorage (no API call)
   */
  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get current user from API (fresh data)
   */
  async me() {
    const response = await api.get("/me");
    const user = response.data.data;
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  /**
   * Check if current user is admin
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === "admin";
  },
};

export default AuthService;