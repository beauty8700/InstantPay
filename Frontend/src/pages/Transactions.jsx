import { useEffect, useState } from "react";
import { getStats, getTransactions } from "../api.js";

const filters = ["All", "Sent", "Received"];

function Transactions() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [allTransactions, setAllTransactions] = useState([]);
  const [stats, setStats] = useState({ totalSent: 0, totalReceived: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [error, setError] = useState("");

  const loadTransactions = async (nextPage = page) => {
    try {
      setLoading(true);
      setError("");
      const [txData, statsData] = await Promise.all([
        getTransactions({ page: nextPage, limit: 20 }),
        getStats(),
      ]);
      setAllTransactions(txData.transactions || []);
      setPagination(txData.pagination || { totalPages: 1, total: 0 });
      setPage(nextPage);
      setStats(statsData);
    } catch (err) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(1);
  }, []);

  const filtered = allTransactions.filter((tx) => {
    const matchFilter =
      filter === "All" ||
      (filter === "Sent" && tx.type === "sent") ||
      (filter === "Received" && tx.type === "received");
    const matchSearch = (tx.counterparty?.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalSent = stats.totalSent || 0;
  const totalReceived = stats.totalReceived || 0;

  return (
    <div className="tx-page">
      <div className="page-toolbar">
        <h1 className="page-title">Transaction History</h1>
        <button className="subtle-btn" onClick={() => loadTransactions(page)}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

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

      {error && <div className="form-error">{error}</div>}

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
        {loading ? (
          <div className="empty-state">Loading transactions...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No transactions found.</div>
        ) : (
          filtered.map((tx) => (
            <div key={tx._id} className="tx-item">
              <div className="tx-avatar" style={{ background: tx.type === "sent" ? "#e879a0" : "#10b981" }}>
                {(tx.counterparty?.name || "U")
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="tx-info">
                <div className="tx-name">{tx.counterparty?.name || "Unknown"}</div>
                <div className="tx-time">
                  <span className="tx-cat-badge">Transfer</span>
                  {new Date(tx.createdAt).toLocaleString()}
                </div>
              </div>
              <div className={`tx-amount ${tx.type}`}>
                {tx.type === "sent" ? "−" : "+"}₹{Number(tx.amount || 0).toLocaleString("en-IN")}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pagination-bar">
        <button
          className="subtle-btn"
          onClick={() => loadTransactions(page - 1)}
          disabled={page <= 1 || loading}
        >
          Previous
        </button>
        <div className="pagination-text">
          Page {page} of {pagination.totalPages || 1} · {pagination.total || 0} records
        </div>
        <button
          className="subtle-btn"
          onClick={() => loadTransactions(page + 1)}
          disabled={page >= (pagination.totalPages || 1) || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Transactions;
