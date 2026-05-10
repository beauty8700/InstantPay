import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const recentTx = [
  { id: 1, name: "Rahul Sharma", type: "sent", amount: 500, time: "Today, 2:30 PM", avatar: "RS", color: "#e879a0" },
  { id: 2, name: "Priya Singh", type: "received", amount: 1200, time: "Today, 11:00 AM", avatar: "PS", color: "#a855f7" },
  { id: 3, name: "Amit Verma", type: "sent", amount: 250, time: "Yesterday, 6:15 PM", avatar: "AV", color: "#3b82f6" },
  { id: 4, name: "Sneha Rao", type: "received", amount: 800, time: "Yesterday, 9:00 AM", avatar: "SR", color: "#10b981" },
];

const quickActions = [
  { label: "Send Money", icon: "💸", path: "/send", color: "#e879a0" },
  { label: "Add Money", icon: "➕", path: "/addmoney", color: "#a855f7" },
  { label: "Request", icon: "🔔", path: "/transactions", color: "#3b82f6" },
  { label: "History", icon: "📋", path: "/transactions", color: "#10b981" },
];

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ firstName: "User", lastName: "" });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="home-page">
      {/* Greeting */}
      <div className="greeting">
        <div>
          <p className="greeting-sub">Good afternoon,</p>
          <h1 className="greeting-name">{user.firstName} {user.lastName} 👋</h1>
        </div>
        <div className="notif-btn">🔔</div>
      </div>

      {/* Balance Card */}
      <div className="balance-card">
        <div className="balance-card-inner">
          <div className="balance-label">Total Balance</div>
          <div className="balance-amount">₹ 24,580.00</div>
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

      <div className="tx-list">
        {recentTx.map((tx) => (
          <div key={tx.id} className="tx-item">
            <div className="tx-avatar" style={{ background: tx.color }}>
              {tx.avatar}
            </div>
            <div className="tx-info">
              <div className="tx-name">{tx.name}</div>
              <div className="tx-time">{tx.time}</div>
            </div>
            <div className={`tx-amount ${tx.type}`}>
              {tx.type === "sent" ? "−" : "+"}₹{tx.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
