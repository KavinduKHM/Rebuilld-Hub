import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./src/app.js";

// Load env
dotenv.config();

console.log("🚀 Server starting...");
console.log("📂 Current directory:", process.cwd());

const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    // Use MongoDB_URL (from your working version)
    const conn = await mongoose.connect(process.env.MongoDB_URL);
    console.log(`✅ MongoDB Connected Successfully on ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Connect database
connectDB();

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
