import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchUsers } from "../api.js";

const getAvatar = (name = "User") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function Send() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const data = await searchUsers(query);
        const mapped = (data.users || []).map((u) => {
          const name = `${u.firstName} ${u.lastName}`.trim();
          return {
            id: u._id,
            name,
            username: u.username,
            avatar: getAvatar(name),
            color: "#3b82f6",
          };
        });
        setUsers(mapped);
      } catch (err) {
        setError(err.message || "Unable to search users");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="upi-pay-btn" onClick={() => setQuery((q) => q.trim())}>Search</button>
        </div>
        <p className="hint-text">Tip: search by first name, last name, or username</p>
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
        {error && <div className="form-error">{error}</div>}
        {loading ? (
          <div className="empty-state">Searching users...</div>
        ) : users.length === 0 && query.trim() ? (
          <div className="empty-state">No users found for "{query}"</div>
        ) : users.length === 0 ? (
          <div className="empty-state">Start typing to search and pay your contacts quickly.</div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-avatar" style={{ background: user.color }}>
                {user.avatar}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-upi">{user.username}</div>
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
