import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getStats, getTransactions } from "../api.js";

const getInitials = (name = "User") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const quickActions = [
  { label: "Send Money", icon: "💸", path: "/send", color: "#e879a0" },
  { label: "Add Money", icon: "➕", path: "/addmoney", color: "#a855f7" },
  { label: "Request", icon: "🔔", path: "/transactions", color: "#3b82f6" },
  { label: "History", icon: "📋", path: "/transactions", color: "#10b981" },
];

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ firstName: "User", lastName: "" });
  const [stats, setStats] = useState({ balance: 0 });
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hour = new Date().getHours();
  const greetingLabel = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }

      const [statsRes, txRes] = await Promise.all([
        getStats(),
        getTransactions({ page: 1, limit: 5 }),
      ]);

      setStats(statsRes);
      setRecentTx(txRes.transactions || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="home-page">
      {/* Greeting */}
      <div className="greeting">
        <div>
          <p className="greeting-sub">{greetingLabel},</p>
          <h1 className="greeting-name">{user.firstName} {user.lastName} 👋</h1>
        </div>
        <button className="notif-btn" onClick={loadDashboard} title="Refresh dashboard">
          {loading ? "⏳" : "↻"}
        </button>
      </div>

      {/* Balance Card */}
      <div className="balance-card">
        <div className="balance-card-inner">
          <div className="balance-label">Total Balance</div>
          <div className="balance-amount">₹ {Number(stats.balance || 0).toLocaleString("en-IN")}</div>
          <div className="balance-meta">
            <span className="balance-acct">A/C •••• 4291</span>
            <span className="balance-badge">Active ✓</span>
          </div>
        </div>
        <div className="card-pattern" aria-hidden="true">
          <div className="card-circle c1" />
          <div className="card-circle c2" />
        </div>
        <div className="card-chip" aria-hidden="true">◈</div>
      </div>

      {/* Quick Actions */}
      <div className="section-title">Quick Actions</div>
      <div className="quick-actions-grid">
        {quickActions.map((a) => (
          <button
            key={a.label}
            className="quick-action-btn"
            onClick={() => navigate(a.path)}
            style={{ "--accent": a.color }}
          >
            <div className="qa-icon">{a.icon}</div>
            <div className="qa-label">{a.label}</div>
          </button>
        ))}
      </div>

      {/* Offers Banner */}
      <div className="offers-banner">
        <div className="offer-text">
          <div className="offer-title">🎉 Cashback Offer!</div>
          <div className="offer-desc">Get 2% cashback on all UPI transactions above ₹500 this weekend.</div>
        </div>
        <button className="offer-cta">Avail Now</button>
      </div>

      {/* Recent Transactions */}
      <div className="section-header">
        <div className="section-title" style={{ marginTop: 0 }}>Recent Activity</div>
        <button className="view-all" onClick={() => navigate("/transactions")}>View All →</button>
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading && <div className="empty-state">Loading your latest account data...</div>}

      <div className="tx-list">
        {!loading && recentTx.map((tx) => {
          const name = tx.counterparty?.name || "Unknown";
          const isSent = tx.type === "sent";
          return (
          <div key={tx._id} className="tx-item">
            <div className="tx-avatar" style={{ background: isSent ? "#e879a0" : "#10b981" }}>
              {getInitials(name)}
            </div>
            <div className="tx-info">
              <div className="tx-name">{name}</div>
              <div className="tx-time">{new Date(tx.createdAt).toLocaleString()}</div>
            </div>
            <div className={`tx-amount ${tx.type}`}>
              {isSent ? "−" : "+"}₹{Number(tx.amount || 0).toLocaleString("en-IN")}
            </div>
          </div>
          );
        })}
        {recentTx.length === 0 && !error && <div className="empty-state">No recent transactions.</div>}
      </div>
    </div>
  );
}

export default Home;
