import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Secret loaded from environment; never hardcode this in source code.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("❌  JWT_SECRET is not set in environment variables. Exiting.");
  process.exit(1);
}

/**
 * Express middleware that validates a Bearer JWT token.
 * On success it sets req.userId (Mongoose ObjectId string) and calls next().
 */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id; // attach userId to request for downstream use
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please log in again" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export { auth, JWT_SECRET };
