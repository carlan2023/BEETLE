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

// Provide a safe default JWT secret in test environment to avoid
// module import order causing `jsonwebtoken` to fail when tests
// set env vars after some modules are loaded. Tests still should
// set `process.env.JWT_SECRET` but this fallback makes CI robust.
if (process.env.NODE_ENV === "test" && !process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "testsecret";
}

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
// CORS configuration - allow frontend origin from environment or defaults
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  process.env.CLIENT_URL_SECONDARY, // For multiple frontend URLs if needed
  "http://localhost:3000", // Local development
  "http://localhost:3001",
  "http://localhost:5173", // Vite default
].filter(Boolean);

// In production, also allow any vercel deployment domain
if (process.env.NODE_ENV === "production") {
  allowedOrigins.push(/\.vercel\.app$/);
}

console.log("✅ CORS Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl requests)
      if (!origin) return callback(null, true);

      // Check if origin matches allowed list
      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === "string") {
          return origin === allowed;
        }
        return allowed.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
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
app.use("/api/customer", require("./routes/customer"));
app.use("/api/cart", require("./routes/cart"));
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
    corsOrigin: req.get("origin") || "No origin header",
    allowedOrigins: allowedOrigins.map((o) =>
      o instanceof RegExp ? o.toString() : o,
    ),
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
