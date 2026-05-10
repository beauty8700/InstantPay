import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession } from "../api.js";

function Profile() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "User",
    lastName: "",
    email: "",
    phone: "",
    upi: "user@instapay",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setForm(JSON.parse(userData));
    }
  }, []);

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="profile-page">
      <h1 className="page-title">My Profile</h1>

      {/* Avatar */}
      <div className="profile-hero">
        <div className="profile-avatar">AK</div>
        <div className="profile-name">{form.firstName} {form.lastName}</div>
        <div className="profile-upi">{form.upi}</div>
        <div className="kyc-badge">✅ KYC Verified</div>
      </div>

      {/* Info Card */}
      <div className="profile-card">
        <div className="profile-card-header">
          <span>Personal Info</span>
          <button className="edit-btn" onClick={() => setEditing(!editing)}>
            {editing ? "✕ Cancel" : "✏️ Edit"}
          </button>
        </div>

        {[
          { label: "First Name", key: "firstName" },
          { label: "Last Name", key: "lastName" },
          { label: "Email", key: "email" },
          { label: "Phone", key: "phone" },
          { label: "UPI ID", key: "upi" },
        ].map(({ label, key }) => (
          <div key={key} className="profile-field">
            <div className="field-label">{label}</div>
            {editing ? (
              <input
                className="field-input"
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            ) : (
              <div className="field-value">{form[key]}</div>
            )}
          </div>
        ))}

        {editing && (
          <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => {
            localStorage.setItem("user", JSON.stringify(form));
            setEditing(false);
          }}>
            Save Changes
          </button>
        )}
      </div>

      {/* Settings List */}
      <div className="settings-list">
        {[
          { icon: "🔒", label: "Change UPI PIN" },
          { icon: "🏦", label: "Linked Bank Accounts" },
          { icon: "🔔", label: "Notification Settings" },
          { icon: "🛡️", label: "Privacy & Security" },
          { icon: "❓", label: "Help & Support" },
          { icon: "📄", label: "Terms & Conditions" },
        ].map((item) => (
          <button key={item.label} className="settings-item">
            <span className="settings-icon">{item.icon}</span>
            <span className="settings-label">{item.label}</span>
            <span className="settings-arrow">→</span>
          </button>
        ))}
      </div>

      <button
        className="logout-btn"
        onClick={() => {
          clearSession();
          navigate("/signin");
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}

export default Profile;
