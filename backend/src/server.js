require("dotenv").config();
const express = require("express");
const path = require("path");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();

// Trust proxy when running behind a load balancer (Render, Heroku, etc.)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use((req, res, next) => {
  console.log("INCOMING REQUEST:", req.method, req.originalUrl);
  next();
});

// ── Connect Database ──────────────────────────────────────────────────────────
connectDB();

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
// Gzip compression for responses (useful for static assets)
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Rate limiting — 100 requests per 15 minutes
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

// Auth routes stricter rate limit
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

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ── Routes ────────────────────────────────────────────────────────────────────
// Serve static frontend files from backend/public with cache headers
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath, { maxAge: "30d", index: false }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/vendor", require("./routes/vendor"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/store", require("./routes/store"));
app.use("/api/public", require("./routes/public"));
app.use("/api/admin", require("./routes/admin"));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Beetle API is running 🪲",
    env: process.env.NODE_ENV,
  });
});

// Serve the client-side app for non-API GET requests (SPA fallback)
app.get("*", (req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.originalUrl.startsWith("/api/")) return next();
  const indexFile = path.join(publicPath, "index.html");
  res.sendFile(indexFile, (err) => {
    if (err) return next(err);
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────────
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

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `\n🪲 Beetle API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
  );
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
