const mongoose = require("mongoose");
const dns = require("dns");

// Use reliable public DNS servers for Atlas SRV lookup on Windows environments
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    console.log(" Connecting to MongoDB...");
    console.log(" URI:", process.env.MONGODB_URI ? "✓ Set" : "NOT SET");

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error("Error details:", error.toString());
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Attempting reconnect...");
});

module.exports = connectDB;
