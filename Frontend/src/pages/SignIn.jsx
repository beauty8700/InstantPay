import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, saveSession } from "../api.js";

function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const result = await login({ username: form.username.trim(), password: form.password });
      saveSession(result.token, result.user);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Sign in failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-logo">₹</div>
        <div className="auth-brand-name">InstaPay</div>
        <div className="auth-tagline">Fast. Secure. Instant.</div>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Mobile / Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter mobile or username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="forgot-row">
            <a href="#" className="forgot-link">Forgot Password?</a>
          </div>

          <button type="submit" className="auth-btn">
            Sign In →
          </button>
        </form>

        <div className="auth-divider"><span>or continue with</span></div>

        <div className="social-btns">
          <button className="social-btn">📱 OTP Login</button>
          <button className="social-btn">🔑 Biometric</button>
        </div>

        <p className="auth-switch">
          Don't have an account?{" "}
          <a href="/signup" className="auth-link" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
