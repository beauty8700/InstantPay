import express from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { Account, Transaction, User } from "../models/user.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All account routes require authentication
router.use(auth);

// ── Zod Schemas ────────────────────────────────────────────────────────────

const DepositSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be positive")
    .max(100000, "Maximum single deposit is ₹1,00,000"),
});

const TransferSchema = z.object({
  toUserId: z.string().min(1, "Recipient ID is required"),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be positive")
    .max(100000, "Maximum single transfer is ₹1,00,000"),
  note: z.string().max(100).optional().default(""),
});

// ── GET /api/account/balance ───────────────────────────────────────────────
router.get("/balance", async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({ balance: account.balance });
  } catch (err) {
    console.error("Balance error:", err);
    res.status(500).json({ message: "Server error fetching balance" });
  }
});

// ── POST /api/account/deposit ──────────────────────────────────────────────
router.post("/deposit", async (req, res) => {
  try {
    const parsed = DepositSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { amount } = parsed.data;

    const account = await Account.findOneAndUpdate(
      { userId: req.userId },
      { $inc: { balance: amount } },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json({
      message: `₹${amount} added successfully`,
      balance: account.balance,
    });
  } catch (err) {
    console.error("Deposit error:", err);
    res.status(500).json({ message: "Server error during deposit" });
  }
});

// ── POST /api/account/transfer ─────────────────────────────────────────────
// Uses a MongoDB session + atomic transaction so money is never lost/doubled.
router.post("/transfer", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const parsed = TransferSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { toUserId, amount, note } = parsed.data;

    // Prevent sending money to yourself
    if (toUserId === String(req.userId)) {
      return res.status(400).json({ message: "Cannot transfer to yourself" });
    }

    session.startTransaction();

    // 1. Verify recipient user exists
    const recipient = await User.findById(toUserId).session(session);
    if (!recipient) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Recipient not found" });
    }

    // 2. Debit sender — only succeeds if balance >= amount
    const senderAccount = await Account.findOneAndUpdate(
      { userId: req.userId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true, session }
    );

    if (!senderAccount) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // 3. Credit recipient
    const recipientAccount = await Account.findOneAndUpdate(
      { userId: toUserId },
      { $inc: { balance: amount } },
      { new: true, session }
    );

    if (!recipientAccount) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Recipient account not found" });
    }

    // 4. Record transaction for audit trail / history
    await Transaction.create(
      [
        {
          fromUserId: req.userId,
          toUserId,
          amount,
          note,
          status: "success",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.json({
      message: `₹${amount} sent to ${recipient.firstName} ${recipient.lastName} successfully`,
      newBalance: senderAccount.balance,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Transfer error:", err);
    res.status(500).json({ message: "Transfer failed. Please try again." });
  } finally {
    session.endSession();
  }
});

// ── GET /api/account/transactions ─────────────────────────────────────────
// Returns full transaction history for the logged-in user (sent + received)
router.get("/transactions", async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({
        $or: [{ fromUserId: req.userId }, { toUserId: req.userId }],
      })
        .populate("fromUserId", "firstName lastName username")
        .populate("toUserId",   "firstName lastName username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Transaction.countDocuments({
        $or: [{ fromUserId: req.userId }, { toUserId: req.userId }],
      }),
    ]);

    const formatted = transactions.map((tx) => {
      const isSender = String(tx.fromUserId._id) === String(req.userId);
      return {
        _id:          tx._id,
        type:         isSender ? "sent" : "received",
        amount:       tx.amount,
        note:         tx.note,
        status:       tx.status,
        createdAt:    tx.createdAt,
        counterparty: isSender
          ? {
              id:       tx.toUserId._id,
              name:     `${tx.toUserId.firstName} ${tx.toUserId.lastName}`,
              username: tx.toUserId.username,
            }
          : {
              id:       tx.fromUserId._id,
              name:     `${tx.fromUserId.firstName} ${tx.fromUserId.lastName}`,
              username: tx.fromUserId.username,
            },
      };
    });

    res.json({
      transactions: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Transaction history error:", err);
    res.status(500).json({ message: "Server error fetching transactions" });
  }
});

// ── GET /api/account/stats ─────────────────────────────────────────────────
// Summary stats for the dashboard (total sent, received, tx count)
router.get("/stats", async (req, res) => {
  try {
    const [sent, received, account] = await Promise.all([
      Transaction.aggregate([
        { $match: { fromUserId: new mongoose.Types.ObjectId(req.userId), status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { toUserId: new mongoose.Types.ObjectId(req.userId), status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Account.findOne({ userId: req.userId }),
    ]);

    res.json({
      balance:       account?.balance ?? 0,
      totalSent:     sent[0]?.total ?? 0,
      totalReceived: received[0]?.total ?? 0,
      txCount:       (sent[0]?.count ?? 0) + (received[0]?.count ?? 0),
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Server error fetching stats" });
  }
});

export { router };
