import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import { router as userRouter } from "./routes/user.js";
import { router as accountRouter } from "./routes/account.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients and same-origin requests.
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    service: "InstaPay Backend",
    status: "ok",
    health: "/api/health",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/user", userRouter);
app.use("/api/account", accountRouter);
// Backward-compatible mounts for clients that call without /api prefix.
app.use("/user", userRouter);
app.use("/account", accountRouter);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  if (err.message === "CORS origin not allowed") {
    return res.status(403).json({ message: "CORS origin not allowed" });
  }
  res.status(500).json({ message: "Internal server error" });
});

let server;

const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`✅  InstaPay server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌  Server startup failed:", err.message);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
