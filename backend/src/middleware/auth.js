const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");
const Customer = require("../models/Customer");

const protect = async (req, res, next) => {
  try {
    // 1. Extract token
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated. Please log in." });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check vendor still exists and is active
    const vendor = await Vendor.findById(decoded.id).select("-password");
    if (!vendor) {
      return res
        .status(401)
        .json({ success: false, message: "Account no longer exists." });
    }
    if (vendor.status === "suspended") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Your account has been suspended. Contact support.",
        });
    }

    req.vendor = vendor;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token." });
    }
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          success: false,
          message: "Token expired. Please log in again.",
        });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error during authentication." });
  }
};

// Only allow approved vendors to access sensitive routes
const requireApproved = (req, res, next) => {
  if (req.vendor.status !== "approved") {
    return res.status(403).json({
      success: false,
      message:
        "Your vendor account is pending approval. We will notify you by email.",
    });
  }
  next();
};

// ── Protect Customer - verify JWT token for customer routes ──────────────────
const protectCustomer = async (req, res, next) => {
  try {
    // 1. Extract token
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated. Please log in." });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check customer still exists
    const customer = await Customer.findById(decoded.id).select("-password");
    if (!customer) {
      return res
        .status(401)
        .json({ success: false, message: "Account no longer exists." });
    }

    req.customer = customer;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token." });
    }
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          success: false,
          message: "Token expired. Please log in again.",
        });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error during authentication." });
  }
};

module.exports = { protect, requireApproved, protectCustomer };
