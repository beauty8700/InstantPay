import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import { router as userRouter } from "./routes/user.js";
import { router as accountRouter } from "./routes/account.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const rawAllowedOrigins = [
  process.env.CLIENT_URL || "",
  process.env.CORS_ORIGINS || "",
  process.env.FRONTEND_URL || "",
]
  .filter(Boolean)
  .join(",");

const allowedOrigins = rawAllowedOrigins
  .split(",")
  .map((origin) => origin.trim().replace(/^['"]|['"]$/g, ""))
  .filter(Boolean);

const allowAllTraffic = allowedOrigins.includes("*");

const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS !== "false";

const normalizeOrigin = (value = "") =>
  value.trim().replace(/\/+$/, "").toLowerCase();

const parseOrigin = (value) => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const wildcardToRegex = (pattern) => {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\*/g, ".*")}$`, "i");
};

const isAllowedOrigin = (origin) => {
  if (allowAllTraffic) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  const parsedOrigin = parseOrigin(normalizedOrigin);

  // If CLIENT_URL is empty, keep behavior permissive.
  if (allowedOrigins.length === 0) return true;

  // Allow localhost origins while developing.
  if (
    process.env.NODE_ENV !== "production" &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin)
  ) {
    return true;
  }

  // Helpful default for Vercel preview deployments.
  if (
    parsedOrigin &&
    allowVercelPreviews &&
    parsedOrigin.hostname.toLowerCase().endsWith(".vercel.app")
  ) {
    return true;
  }

  return allowedOrigins.some((allowed) => {
    const normalizedAllowed = normalizeOrigin(allowed);

    // Support patterns like https://*.vercel.app
    if (/^https?:\/\/\*\./i.test(normalizedAllowed) && parsedOrigin) {
      const allowedUrl = parseOrigin(normalizedAllowed.replace("*.", "placeholder."));
      if (!allowedUrl) return false;

      const suffix = allowedUrl.hostname.replace(/^placeholder\./, "");
      return (
        parsedOrigin.protocol === allowedUrl.protocol &&
        (parsedOrigin.hostname === suffix || parsedOrigin.hostname.endsWith(`.${suffix}`))
      );
    }

    if (normalizedAllowed.includes("*")) {
      return wildcardToRegex(normalizedAllowed).test(normalizedOrigin);
    }

    return normalizedAllowed === normalizedOrigin;
  });
};

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients and same-origin requests.
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      console.warn("CORS blocked origin:", origin);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

console.log(
  "CORS allowed origins:",
  allowAllTraffic ? "* (all origins)" : allowedOrigins.length ? allowedOrigins : "<all>"
);

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
