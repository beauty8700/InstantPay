import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/instapay";

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, 
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
    process.exit(1); 
  }
};

export default connectDB;
