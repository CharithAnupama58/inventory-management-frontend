import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  const navigate     = useNavigate();
  const { login }    = useAuth();

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState("");
  const [focused, setFocused]         = useState("");
  const { isAuthenticated } = useAuth();

  

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await login(email, password);
      // Navigate based on role returned from real API
      if (user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html, body, #root {
          width: 100%;
          height: 100%;
          min-height: 100vh;
        }

        .login-root {
          display: flex;
          width: 100vw;
          height: 100vh;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* LEFT PANEL */
        .left-panel {
          flex: 1;
          position: relative;
          background: #0a0a0f;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          overflow: hidden;
        }

        .left-panel::before {
          content: '';
          position: absolute;
          top: -120px;
          left: -120px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%);
          pointer-events: none;
        }

        .left-panel::after {
          content: '';
          position: absolute;
          bottom: -80px;
          right: -80px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%);
          pointer-events: none;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #10b981);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #fff;
          letter-spacing: 0.5px;
        }

        .left-main {
          position: relative;
          z-index: 2;
        }

        .left-tag {
          display: inline-block;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.3);
          color: #a5b4fc;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 28px;
        }

        .left-heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 4vw, 54px);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 20px;
        }

        .left-heading span {
          background: linear-gradient(90deg, #6366f1, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .left-desc {
          color: #6b7280;
          font-size: 15px;
          line-height: 1.7;
          max-width: 380px;
          margin-bottom: 48px;
        }

        .stats-row {
          display: flex;
          gap: 32px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-number {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
        }

        .stat-label {
          font-size: 12px;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .left-footer {
          position: relative;
          z-index: 2;
          color: #374151;
          font-size: 12px;
        }

        /* Floating Cards */
        .floating-cards {
          position: absolute;
          right: -20px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 3;
        }

        .float-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 18px;
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          gap: 12px;
          animation: floatUp 3s ease-in-out infinite;
        }

        .float-card:nth-child(2) { animation-delay: 1s; }
        .float-card:nth-child(3) { animation-delay: 2s; }

        @keyframes floatUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .float-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .float-text {
          font-size: 12px;
          color: #9ca3af;
          white-space: nowrap;
        }

        /* RIGHT PANEL */
        .right-panel {
          width: 480px;
          min-width: 480px;
          background: #f8f7f4;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          position: relative;
        }

        .right-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .form-container {
          width: 100%;
          max-width: 360px;
          position: relative;
          z-index: 2;
        }

        .form-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #6366f1;
          margin-bottom: 12px;
        }

        .form-title {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #0a0a0f;
          margin-bottom: 8px;
          line-height: 1.15;
        }

        .form-subtitle {
          color: #9ca3af;
          font-size: 14px;
          margin-bottom: 40px;
        }

        .field-group {
          margin-bottom: 20px;
        }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #374151;
          margin-bottom: 8px;
        }

        .field-wrap {
          position: relative;
        }

        .field-input {
          width: 100%;
          padding: 14px 16px;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #0a0a0f;
          outline: none;
          transition: all 0.2s ease;
          appearance: none;
        }

        .field-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
        }

        .field-input::placeholder { color: #d1d5db; }

        .field-input.has-icon { padding-right: 48px; }

        .field-icon-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: color 0.2s;
        }

        .field-icon-btn:hover { color: #374151; }

        .login-btn {
          width: 100%;
          padding: 15px;
          margin-top: 8px;
          background: #0a0a0f;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .login-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #6366f1, #10b981);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .login-btn:hover::before { opacity: 1; }

        .login-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(99,102,241,0.3);
        }

        .login-btn:active { transform: translateY(0); }

        .btn-text {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .divider-text {
          font-size: 11px;
          color: #9ca3af;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .security-note {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 10px 14px;
        }

        .security-note span {
          font-size: 12px;
          color: #166534;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .left-panel { display: none; }
          .right-panel {
            width: 100vw;
            min-width: unset;
          }
        }

        /* Fade in animation */
        .form-container {
          animation: fadeInUp 0.5s ease forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="login-root">

        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="grid-overlay" />

          <div className="brand-logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" />
              </svg>
            </div>
            <span className="logo-text">Ceyntics Systems</span>
          </div>

          <div className="left-main">
            <div className="left-tag">Internal Platform</div>
            <h1 className="left-heading">
              Inventory<br />
              <span>Controlled.</span><br />
              Always.
            </h1>
            <p className="left-desc">
              A secure internal system to manage tools, products, and electronic components across the organization. Access is restricted to authorized personnel only.
            </p>
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Secure</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">2</span>
                <span className="stat-label">Role Levels</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">Live</span>
                <span className="stat-label">Tracking</span>
              </div>
            </div>
          </div>

          {/* Floating status cards */}
          <div className="floating-cards">
            <div className="float-card">
              <div className="float-dot" style={{ background: "#10b981" }} />
              <span className="float-text">12 items in store</span>
            </div>
            <div className="float-card">
              <div className="float-dot" style={{ background: "#f59e0b" }} />
              <span className="float-text">3 items borrowed</span>
            </div>
            <div className="float-card">
              <div className="float-dot" style={{ background: "#6366f1" }} />
              <span className="float-text">Audit log active</span>
            </div>
          </div>

          <div className="left-footer">
            © 2026 Ceyntics Systems (Pvt) Ltd — All rights reserved
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="form-container">

            <p className="form-eyebrow">Secure Access</p>
            <h2 className="form-title">Welcome back.</h2>
            <p className="form-subtitle">Sign in with your credentials to continue.</p>

            <form onSubmit={handleLogin}>

              <div className="field-group">
                <label className="field-label">Email Address</label>
                <div className="field-wrap">
                  <input
                    className="field-input"
                    type="email"
                    placeholder="you@ceyntics.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <div className="field-wrap">
                  <input
                    className={`field-input has-icon`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="field-icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* API Error Message */}
              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1.5px solid rgba(239,68,68,0.3)",
                  borderRadius: "10px", padding: "12px 16px",
                  marginBottom: "16px", fontSize: "13px",
                  color: "#ef4444", fontFamily: "'DM Sans', sans-serif",
                  display: "flex", alignItems: "center", gap: "8px",
                }}>
                  ⚠️ {error}
                </div>
              )}

                            <button className="login-btn" type="submit" disabled={isLoading}>
                <span className="btn-text">
                  {isLoading ? (
                    <><div className="spinner" /> Signing in...</>
                  ) : (
                    <>Sign In →</>
                  )}
                </span>
              </button>

            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">Access Policy</span>
              <div className="divider-line" />
            </div>

            <div className="security-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>No public registration. Accounts are created by Admin only.</span>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}