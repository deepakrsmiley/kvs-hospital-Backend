import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { HeartPulse, ShieldCheck, Zap, Building2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      {/* LEFT BRAND PANEL — change copy/colors here */}
      <div className="login-left">
        <div className="login-left-top">
          <div className="brand-row">
            <HeartPulse size={26} />
            DevSoft
          </div>
          <div className="sub">TECHNOLOGY FOR TOMORROW</div>

          <h2>Hospital Billing &amp;<br />Discharge Summary<br />Management System</h2>
          <p>A complete solution for managing hospital billing and patient discharge summaries efficiently.</p>

          <ul className="login-feature-list">
            <li><ShieldCheck size={18} /> Secure &amp; Reliable</li>
            <li><Zap size={18} /> Easy to Use</li>
            <li><Building2 size={18} /> Built for Healthcare</li>
          </ul>
        </div>
        <div className="login-left-footer">
          Powered by DevSoft · www.devsoft.in
        </div>
      </div>

      {/* RIGHT LOGIN FORM */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-logo">
            <div className="brand-name">Welcome Back!</div>
            <div className="brand-sub">Sign in to your account</div>
          </div>
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hospital.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 14 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, color: "var(--text-muted)" }}>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" style={{ color: "var(--primary)", fontWeight: 600 }}>Forgot Password?</a>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 4, padding: "11px 16px" }} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="devsoft-footer">© 2025 DevSoft. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
}