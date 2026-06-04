const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Customer = require("../models/Customer");
const { protect, protectCustomer } = require("../middleware/auth");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendToken = (customer, statusCode, res) => {
  const token = signToken(customer._id);
  res.status(statusCode).json({
    success: true,
    token,
    customer: customer.toPublicJSON(),
  });
};

// ── POST /api/customer/register ───────────────────────────────────────────
router.post(
  "/register",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("phone").trim().notEmpty().withMessage("Phone number is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    // Validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { firstName, lastName, email, phone, password } = req.body;

      console.log("📝 Customer registration attempt:", {
        email,
        firstName,
        lastName,
        phone,
        origin: req.get("origin"),
        userAgent: req.get("user-agent")?.substring(0, 50),
      });

      // Check duplicate email
      const existing = await Customer.findOne({ email });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      // Create customer
      const customer = await Customer.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        cart: [],
      });

      console.log("✅ Customer registered successfully:", {
        email,
        id: customer._id,
      });
      sendToken(customer, 201, res);
    } catch (err) {
      console.error("❌ Register error:", {
        message: err.message,
        stack: err.stack,
        code: err.code,
        validationErrors: err.errors,
        origin: req.get("origin"),
      });

      // Handle specific MongoDB/Mongoose errors
      if (err.code === 11000) {
        return res
          .status(409)
          .json({ success: false, message: "Email already exists." });
      }
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res
          .status(400)
          .json({ success: false, message: messages.join(", ") });
      }

      res.status(500).json({
        success: false,
        message: "Registration failed. Please try again.",
      });
    }
  },
);

// ── POST /api/customer/login ──────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Find customer + include password field (normally hidden)
      const customer = await Customer.findOne({ email }).select("+password");
      if (!customer) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password." });
      }

      // Check password
      const isMatch = await customer.comparePassword(password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password." });
      }

      sendToken(customer, 200, res);
    } catch (err) {
      console.error("Login error:", err);
      res
        .status(500)
        .json({ success: false, message: "Login failed. Please try again." });
    }
  },
);

// ── GET /api/customer/me ──────────────────────────────────────────────────
router.get("/me", protectCustomer, async (req, res) => {
  res.json({ success: true, customer: req.customer.toPublicJSON() });
});

// ── POST /api/customer/logout ─────────────────────────────────────────────
router.post("/logout", protectCustomer, (req, res) => {
  res.json({ success: true, message: "Logged out successfully." });
});

// ── POST /api/customer/change-password ────────────────────────────────────
router.post(
  "/change-password",
  protectCustomer,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const customer = await Customer.findById(req.customer._id).select(
        "+password",
      );
      const isMatch = await customer.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Current password is incorrect." });
      }

      customer.password = req.body.newPassword;
      await customer.save();

      res.json({ success: true, message: "Password updated successfully." });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Failed to update password." });
    }
  },
);

module.exports = router;
