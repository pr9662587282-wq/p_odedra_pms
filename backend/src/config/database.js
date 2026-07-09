const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/testdb";
    const conn = await mongoose.connect(uri, {
      family: 4,                    // Force IPv4 — avoids localhost → ::1 (IPv6) timeout
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
