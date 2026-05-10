import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/instapay";

    console.log("🔄 Connecting to MongoDB...");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Increased timeout for cloud connections
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
      family: 4 // Use IPv4, skip trying IPv6
    });

    console.log(`✅  MongoDB connected successfully to: ${mongoose.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌  MongoDB connection error:", err.message);
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected successfully");
    });

  } catch (err) {
    console.error("❌  MongoDB connection failed:", err.message);
    console.error("💡  Make sure your MONGO_URI is correct and MongoDB is accessible");

    // Don't exit in production - let the app handle it gracefully
    if (process.env.NODE_ENV === "production") {
      console.error("🚨  Production deployment: MongoDB connection failed. App may not work properly.");
      return false;
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;
