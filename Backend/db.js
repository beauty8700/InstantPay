import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
       console.log(process.env.MONGO_URI);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast if DB unreachable
    });

    console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Reconnecting...");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌  MongoDB error:", err.message);
    });
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1); // Exit so the app doesn't start with no DB
  }
};

export default connectDB;
