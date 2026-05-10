import { useState } from "react";

function AddMoney() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi");
  const [success, setSuccess] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const methods = [
    { id: "upi", label: "UPI", icon: "📱" },
    { id: "netbanking", label: "Net Banking", icon: "🏦" },
    { id: "card", label: "Debit Card", icon: "💳" },
  ];

  const banks = ["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB"];

  const handleAdd = () => {
    if (!amount || Number(amount) <= 0) return;
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="addmoney-page">
        <div className="success-card">
          <div className="success-icon">🎉</div>
          <h2 className="success-title">Money Added!</h2>
          <p className="success-desc">
            ₹{Number(amount).toLocaleString()} has been added to your InstaPay wallet.
          </p>
          <div className="success-ref">New Balance: ₹{(24580 + Number(amount)).toLocaleString()}</div>
          <button
            className="btn-primary"
            style={{ marginTop: "1.5rem" }}
            onClick={() => { setSuccess(false); setAmount(""); }}
          >
            Add More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="addmoney-page">
      <h1 className="page-title">Add Money</h1>

      {/* Balance */}
      <div className="wallet-balance-card">
        <div className="wb-label">Current Wallet Balance</div>
        <div className="wb-amount">₹ 24,580.00</div>
      </div>

      {/* Amount */}
      <div className="section-title">Enter Amount</div>
      <div className="amount-input-section" style={{ marginBottom: "1rem" }}>
        <div className="amount-prefix">₹</div>
        <input
          type="number"
          className="amount-input"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="quick-amounts" style={{ marginBottom: "1.5rem" }}>
        {quickAmounts.map((a) => (
          <button
            key={a}
            className={`quick-amt-btn ${amount == a ? "selected" : ""}`}
            onClick={() => setAmount(String(a))}
          >
            +₹{a.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Payment Method */}
      <div className="section-title">Payment Method</div>
      <div className="method-tabs">
        {methods.map((m) => (
          <button
            key={m.id}
            className={`method-tab ${method === m.id ? "active" : ""}`}
            onClick={() => setMethod(m.id)}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {method === "upi" && (
        <div className="method-body">
          <input
            type="text"
            className="upi-input"
            placeholder="Enter UPI ID (e.g. name@instapay)"
            style={{ marginBottom: 0 }}
          />
        </div>
      )}

      {method === "netbanking" && (
        <div className="method-body">
          <div className="bank-grid">
            {banks.map((b) => (
              <button key={b} className="bank-btn">🏦 {b}</button>
            ))}
          </div>
        </div>
      )}

      {method === "card" && (
        <div className="method-body">
          <input className="card-input" placeholder="Card Number" maxLength={19} />
          <div className="card-row">
            <input className="card-input" placeholder="MM/YY" maxLength={5} style={{ flex: 1 }} />
            <input className="card-input" placeholder="CVV" maxLength={3} type="password" style={{ flex: 1 }} />
          </div>
          <input className="card-input" placeholder="Name on Card" />
        </div>
      )}

      <button
        className="pay-now-btn"
        style={{ marginTop: "1.5rem" }}
        onClick={handleAdd}
        disabled={!amount || Number(amount) <= 0}
      >
        ➕ Add ₹{amount ? Number(amount).toLocaleString() : "0"}
      </button>

      <p className="secure-note">🔒 256-bit SSL encrypted. Your data is safe.</p>
    </div>
  );
}

export default AddMoney;
