import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getMe, updateProfile, saveSession } from "../api.js";

function Profile() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "User",
    lastName: "",
    username: "",
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMe();
        const nextForm = {
          firstName: data.user?.firstName || "",
          lastName: data.user?.lastName || "",
          username: data.user?.username || "",
        };
        setForm(nextForm);
        const userData = localStorage.getItem("user");
        if (userData) {
          const local = JSON.parse(userData);
          saveSession(localStorage.getItem("token"), {
            ...local,
            ...nextForm,
          });
        }
      } catch (err) {
        setError(err.message || "Failed to load profile");
      }
    };

    load();
  }, []);

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="profile-page">
      <h1 className="page-title">My Profile</h1>

      {/* Avatar */}
      <div className="profile-hero">
        <div className="profile-avatar">AK</div>
        <div className="profile-name">{form.firstName} {form.lastName}</div>
        <div className="profile-upi">{form.username}</div>
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

        <div className="profile-field">
          <div className="field-label">Username</div>
          <div className="field-value">{form.username}</div>
        </div>

        {editing && (
          <div className="profile-field">
            <div className="field-label">New Password (optional)</div>
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </div>
        )}

        {error && <div className="form-error">{error}</div>}
        {success && <div className="kyc-badge" style={{ marginTop: "1rem" }}>{success}</div>}

        {editing && (
          <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={async () => {
            try {
              setError("");
              setSuccess("");
              const payload = {
                firstName: form.firstName,
                lastName: form.lastName,
              };
              if (password.trim()) payload.password = password.trim();

              const updated = await updateProfile(payload);
              const userData = localStorage.getItem("user");
              if (userData) {
                const local = JSON.parse(userData);
                saveSession(localStorage.getItem("token"), {
                  ...local,
                  ...updated.user,
                });
              }
              setPassword("");
              setEditing(false);
              setSuccess("Profile updated successfully");
            } catch (err) {
              setError(err.message || "Failed to update profile");
            }
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
