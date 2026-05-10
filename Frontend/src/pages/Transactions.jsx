import { useState } from "react";

const allTransactions = [
  { id: 1, name: "Rahul Sharma", type: "sent", amount: 500, time: "Today, 2:30 PM", avatar: "RS", color: "#e879a0", category: "Transfer" },
  { id: 2, name: "Priya Singh", type: "received", amount: 1200, time: "Today, 11:00 AM", avatar: "PS", color: "#a855f7", category: "Transfer" },
  { id: 3, name: "Amazon Pay", type: "sent", amount: 1499, time: "Today, 9:15 AM", avatar: "AM", color: "#f59e0b", category: "Shopping" },
  { id: 4, name: "Amit Verma", type: "sent", amount: 250, time: "Yesterday, 6:15 PM", avatar: "AV", color: "#3b82f6", category: "Transfer" },
  { id: 5, name: "Sneha Rao", type: "received", amount: 800, time: "Yesterday, 9:00 AM", avatar: "SR", color: "#10b981", category: "Transfer" },
  { id: 6, name: "Swiggy", type: "sent", amount: 342, time: "12 May, 8:30 PM", avatar: "SW", color: "#ef4444", category: "Food" },
  { id: 7, name: "Netflix", type: "sent", amount: 649, time: "10 May, 12:00 PM", avatar: "NF", color: "#dc2626", category: "Entertainment" },
  { id: 8, name: "Karan Mehta", type: "received", amount: 2000, time: "9 May, 3:00 PM", avatar: "KM", color: "#f59e0b", category: "Transfer" },
  { id: 9, name: "BSNL Recharge", type: "sent", amount: 299, time: "7 May, 10:00 AM", avatar: "BS", color: "#6366f1", category: "Recharge" },
  { id: 10, name: "Salary Credit", type: "received", amount: 45000, time: "1 May, 9:00 AM", avatar: "SC", color: "#10b981", category: "Salary" },
];

const filters = ["All", "Sent", "Received"];

function Transactions() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = allTransactions.filter((tx) => {
    const matchFilter =
      filter === "All" ||
      (filter === "Sent" && tx.type === "sent") ||
      (filter === "Received" && tx.type === "received");
    const matchSearch = tx.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalSent = allTransactions.filter((t) => t.type === "sent").reduce((s, t) => s + t.amount, 0);
  const totalReceived = allTransactions.filter((t) => t.type === "received").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="tx-page">
      <h1 className="page-title">Transaction History</h1>

      {/* Summary Cards */}
      <div className="tx-summary">
        <div className="tx-summary-card sent-card">
          <div className="ts-label">Total Sent</div>
          <div className="ts-amount">₹{totalSent.toLocaleString()}</div>
          <div className="ts-icon">📤</div>
        </div>
        <div className="tx-summary-card received-card">
          <div className="ts-label">Total Received</div>
          <div className="ts-amount">₹{totalReceived.toLocaleString()}</div>
          <div className="ts-icon">📥</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrapper" style={{ marginBottom: "1rem" }}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        {filters.map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="tx-list">
        {filtered.length === 0 ? (
          <div className="empty-state">No transactions found.</div>
        ) : (
          filtered.map((tx) => (
            <div key={tx.id} className="tx-item">
              <div className="tx-avatar" style={{ background: tx.color }}>
                {tx.avatar}
              </div>
              <div className="tx-info">
                <div className="tx-name">{tx.name}</div>
                <div className="tx-time">
                  <span className="tx-cat-badge">{tx.category}</span>
                  {tx.time}
                </div>
              </div>
              <div className={`tx-amount ${tx.type}`}>
                {tx.type === "sent" ? "−" : "+"}₹{tx.amount.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Transactions;
