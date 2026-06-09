import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getBalance, transferMoney } from "../api.js";

function SendMoney() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || {
    name: "Rahul Sharma",
    username: "rahul@instapay",
    id: "",
    avatar: "RS",
    color: "#e879a0",
  };

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState("enter"); // enter | confirm | success
  const [pin, setPin] = useState("");
  const [balance, setBalance] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  const handlePay = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    if (Number(amount) > balance) {
      setError("Insufficient balance for this payment.");
      return;
    }
    setError("");
    setStep("confirm");
  };

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const data = await getBalance();
        setBalance(data.balance || 0);
      } catch {
        // Keep screen usable even if balance endpoint fails.
      }
    };

    loadBalance();
  }, []);

  const handleConfirm = async () => {
    if (pin.length < 4) return;
    if (!user.id) {
      setError("Please select a recipient from contacts.");
      return;
    }

    try {
      setProcessing(true);
      setError("");
      const result = await transferMoney({
        toUserId: user.id,
        amount: Number(amount),
        note,
      });
      setBalance(result.newBalance ?? balance);
      setStep("success");
    } catch (err) {
      setError(err.message || "Transfer failed");
    } finally {
      setProcessing(false);
    }
  };

  if (step === "success") {
    return (
      <div className="sendmoney-page">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2 className="success-title">Payment Successful!</h2>
          <p className="success-desc">
            ₹{Number(amount).toLocaleString()} sent to{" "}
            <strong>{user.name}</strong>
          </p>
          <div className="success-ref">Ref: IPAY{Math.floor(Math.random() * 9000000 + 1000000)}</div>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate("/home")}>
              Go to Home
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                setStep("enter");
                setAmount("");
                setPin("");
                setNote("");
              }}
            >
              Send Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="sendmoney-page">
        <div className="confirm-card">
          <h2 className="confirm-title">Confirm Payment</h2>

          <div className="confirm-receiver">
            <div className="sm-avatar" style={{ background: user.color }}>
              {user.avatar}
            </div>
            <div>
              <div className="sm-name">{user.name}</div>
              <div className="sm-upi">{user.username}</div>
            </div>
          </div>

          <div className="confirm-amount-box">
            <div className="confirm-amount-label">Amount</div>
            <div className="confirm-amount">₹{Number(amount).toLocaleString()}</div>
            {note && <div className="confirm-note">"{note}"</div>}
          </div>

          <div className="pin-section">
            <div className="pin-label">Enter UPI PIN</div>
            <input
              type="password"
              className="pin-input"
              maxLength={6}
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/, ""))}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="confirm-actions">
            <button className="btn-secondary" onClick={() => setStep("enter")}>
              ← Back
            </button>
            <button
              className="btn-primary"
              onClick={handleConfirm}
              disabled={pin.length < 4 || processing}
            >
              {processing ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sendmoney-page">
      <button className="back-btn" onClick={() => navigate("/send")}>
        ← Back
      </button>

      <div className="sm-card">
        {/* Receiver */}
        <div className="sm-receiver">
          <div className="sm-avatar" style={{ background: user.color }}>
            {user.avatar}
          </div>
          <div>
            <div className="sm-name">{user.name}</div>
            <div className="sm-upi">{user.username}</div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="amount-input-section">
          <div className="amount-prefix">₹</div>
          <input
            type="number"
            className="amount-input"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Quick amounts */}
        <div className="quick-amounts">
          {quickAmounts.map((a) => (
            <button
              key={a}
              className={`quick-amt-btn ${amount == a ? "selected" : ""}`}
              onClick={() => setAmount(String(a))}
            >
              ₹{a.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Note */}
        <input
          type="text"
          className="note-input"
          placeholder="Add a note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={60}
        />

        {/* Balance */}
        <div className="available-bal">Available balance: ₹{Number(balance || 0).toLocaleString("en-IN")}</div>

        {error && <div className="form-error">{error}</div>}

        <button
          className="pay-now-btn"
          onClick={handlePay}
          disabled={!amount || Number(amount) <= 0}
        >
          💸 Pay ₹{amount ? Number(amount).toLocaleString() : "0"}
        </button>
      </div>
    </div>
  );
}

export default SendMoney;
