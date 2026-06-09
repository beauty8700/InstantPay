import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup, saveSession } from "../api.js";

function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "", lastName: "", mobile: "", email: "", password: "", confirm: ""
  });
  const [error, setError] = useState("");

  const handleNext = async () => {
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.mobile) {
        setError("Please fill all fields."); return;
      }
      if (!/^\d{10}$/.test(form.mobile)) {
        setError("Mobile number must be exactly 10 digits.");
        return;
      }
      if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
        setError("Please enter a valid email address.");
        return;
      }
      setError(""); setStep(2);
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!form.password || form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const username = form.email?.trim() || `${form.mobile}@instapay`;
      const result = await signup({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username,
        mobile: form.mobile,
        email: form.email.trim() || undefined,
        password: form.password,
      });
      saveSession(result.token, result.user);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    }
  };

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-logo">₹</div>
        <div className="auth-brand-name">InstaPay</div>
        <div className="auth-tagline">Join millions of users</div>
      </div>

      <div className="auth-card">
        {/* Steps */}
        <div className="steps-indicator">
          <div className={`step-dot ${step >= 1 ? "active" : ""}`}>1</div>
          <div className="step-line" />
          <div className={`step-dot ${step >= 2 ? "active" : ""}`}>2</div>
        </div>

        <h2 className="auth-title">{step === 1 ? "Create Account" : "Set Password"}</h2>
        <p className="auth-subtitle">{step === 1 ? "Step 1 of 2 — Basic Info" : "Step 2 of 2 — Secure Your Account"}</p>

        <div className="auth-form">
          {step === 1 ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" placeholder="Arjun" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" placeholder="Kumar" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input className="form-input" placeholder="9876543210" maxLength={10} value={form.mobile} onChange={(e) => update("mobile", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email (optional)</label>
                <input className="form-input" placeholder="arjun@gmail.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Create Password</label>
                <input type="password" className="form-input" placeholder="Min. 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-input" placeholder="Re-enter password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} />
              </div>
              <p className="terms-note">
                By signing up, you agree to our <a href="#" className="auth-link">Terms</a> and <a href="#" className="auth-link">Privacy Policy</a>.
              </p>
            </>
          )}

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            {step === 2 && (
              <button type="button" className="auth-btn-secondary" onClick={() => { setError(""); setStep(1); }}>
                ← Back
              </button>
            )}
            <button type="button" className="auth-btn" onClick={handleNext}>
              {step === 1 ? "Next →" : "Create Account"}
            </button>
          </div>
        </div>

        <p className="auth-switch">
          Already have an account?{" "}
          <a href="/signin" className="auth-link" onClick={(e) => { e.preventDefault(); navigate("/signin"); }}>
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
