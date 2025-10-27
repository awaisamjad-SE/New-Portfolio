import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;

export const connectDB = async () => {
  if (!uri) {
    console.error("❌ MONGO_URI is not set. Set the MONGO_URI environment variable or add it to a local .env file (do NOT commit secrets).\nSee .env.example for the required variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || "HostelDB",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};
