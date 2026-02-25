import dotenv from "dotenv";
import app from "./src/app.js";
import mongoose from "mongoose";

// Load env
dotenv.config();

console.log(" Server starting...");
console.log(" Current directory:", process.cwd());

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MongoDB_URL);
    console.log(` MongoDB Connected..!!`);
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Connect database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
