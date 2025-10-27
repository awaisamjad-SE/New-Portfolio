import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI || "mongodb+srv://awaisamjad:JuGujylg9ToHSI8x@cluster0.zmzyi.mongodb.net/";

export const connectDB = async () => {
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
