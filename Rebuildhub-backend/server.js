const app = require("./src/app");
const mongoose = require("mongoose");


require("dotenv").config();

const PORT = process.env.PORT || 5000;



const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database Connection Failed:", error);
    process.exit(1);
  }
};

// Connect Database
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
