import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/instapay";

  console.log("🔄 Connecting to MongoDB...");

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      family: 4,
    });
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err.message);
    console.error("💡  Make sure your MONGO_URI is correct and MongoDB is accessible");
    throw err;
  }

  console.log(`✅  MongoDB connected successfully to: ${mongoose.connection.host}`);

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected. Requests may fail until reconnection.");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌  MongoDB connection error:", err.message);
  });

  mongoose.connection.on("reconnected", () => {
    console.log("🔄 MongoDB reconnected successfully");
  });
};

export default connectDB;
