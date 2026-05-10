import { useState } from "react";
import { useNavigate } from "react-router-dom";

const allUsers = [
  { id: 1, name: "Rahul Sharma", upi: "rahul@instapay", avatar: "RS", color: "#e879a0" },
  { id: 2, name: "Priya Singh", upi: "priya@instapay", avatar: "PS", color: "#a855f7" },
  { id: 3, name: "Amit Verma", upi: "amit@instapay", avatar: "AV", color: "#3b82f6" },
  { id: 4, name: "Sneha Rao", upi: "sneha@instapay", avatar: "SR", color: "#10b981" },
  { id: 5, name: "Karan Mehta", upi: "karan@instapay", avatar: "KM", color: "#f59e0b" },
  { id: 6, name: "Neha Gupta", upi: "neha@instapay", avatar: "NG", color: "#ef4444" },
];

function Send() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = query.trim()
    ? allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.upi.toLowerCase().includes(query.toLowerCase())
      )
    : allUsers;

  const handleSend = (user) => {
    navigate("/sendmoney", { state: { user } });
  };

  return (
    <div className="send-page">
      <h1 className="page-title">Pay & Transfer</h1>

      {/* UPI / Mobile input */}
      <div className="upi-card">
        <div className="upi-label">Enter UPI ID or Mobile Number</div>
        <div className="upi-input-row">
          <input
            type="text"
            className="upi-input"
            placeholder="name@instapay or 9876543210"
          />
          <button className="upi-pay-btn">Pay →</button>
        </div>
      </div>

      {/* QR Section */}
      <div className="qr-row">
        <button className="qr-btn">📷 Scan QR Code</button>
        <button className="qr-btn">🔗 Share Your QR</button>
      </div>

      {/* Search Users */}
      <div className="section-title">Send to Contacts</div>
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or UPI ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery("")}>✕</button>
        )}
      </div>

      <div className="user-list">
        {filtered.length === 0 ? (
          <div className="empty-state">No users found for "{query}"</div>
        ) : (
          filtered.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-avatar" style={{ background: user.color }}>
                {user.avatar}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-upi">{user.upi}</div>
              </div>
              <button
                className="send-btn"
                onClick={() => handleSend(user)}
              >
                💸 Send
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Send;
