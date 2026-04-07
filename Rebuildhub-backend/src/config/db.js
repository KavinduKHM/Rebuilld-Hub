const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URL;

    if (!mongoUri) {
      throw new Error("Missing MongoDB URI. Set MONGO_URI or MONGODB_URL in .env");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection failed", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;