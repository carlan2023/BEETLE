require("dotenv").config();
const express = require("express");
const path = require("path");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.log("INCOMING REQUEST:", req.method, req.originalUrl);
  }
  next();
});

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  }),
);

app.use(
  "/api/auth/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
      success: false,
      message: "Too many auth attempts, please wait 15 minutes.",
    },
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath, { maxAge: "30d", index: false }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/vendor", require("./routes/vendor"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/store", require("./routes/store"));
app.use("/api/public", require("./routes/public"));
app.use("/api/admin", require("./routes/admin"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Beetle API is running 🪲",
    env: process.env.NODE_ENV,
    mongodb:
      mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected",
    dbHost: mongoose.connection.host || "Not connected",
  });
});

app.get("*", (req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.originalUrl.startsWith("/api/")) return next();
  const indexFile = path.join(publicPath, "index.html");
  res.sendFile(indexFile, (err) => {
    if (err) return next(err);
  });
});

app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong."
        : err.message,
  });
});

module.exports = app;
