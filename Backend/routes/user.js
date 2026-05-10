import mongoose from "mongoose";

// ── User Schema ────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    username:  { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile:    { type: String, required: true, unique: true, trim: true },
    email:     { type: String, lowercase: true, trim: true, default: "" },
    password:  { type: String, required: true },
  },
  { timestamps: true }
);

// ── Account Schema ─────────────────────────────────────────────────────────
const AccountSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

// ── Transaction Schema (new — audit trail) ─────────────────────────────────
const TransactionSchema = new mongoose.Schema(
  {
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUserId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount:     { type: Number, required: true, min: 1 },
    note:       { type: String, default: "", maxLength: 100 },
    status:     { type: String, enum: ["success", "failed"], default: "success" },
  },
  { timestamps: true }
);

TransactionSchema.index({ fromUserId: 1, createdAt: -1 });
TransactionSchema.index({ toUserId: 1, createdAt: -1 });

const User        = mongoose.model("User", UserSchema);
const Account     = mongoose.model("Account", AccountSchema);
const Transaction = mongoose.model("Transaction", TransactionSchema);

export { User, Account, Transaction };
