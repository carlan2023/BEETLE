const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Vendor = require('../models/Vendor');
const { protect } = require('../middleware/auth');

// ── Helper: sign JWT ──────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendToken = (vendor, statusCode, res) => {
  const token = signToken(vendor._id);
  res.status(statusCode).json({
    success: true,
    token,
    vendor: vendor.toPublicJSON(),
  });
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('businessName').trim().notEmpty().withMessage('Business name is required'),
    body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('category').notEmpty().withMessage('Business category is required'),
    body('address').trim().notEmpty().withMessage('Business address is required'),
  ],
  async (req, res) => {
    // Validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { businessName, ownerName, email, phone, password, category, address, description } = req.body;

      // Check duplicate email
      const existing = await Vendor.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }

      // Create vendor (status: pending — admin must approve)
      const vendor = await Vendor.create({
        businessName,
        ownerName,
        email,
        phone,
        password,
        category,
        address,
        description: description || '',
        status: 'pending',
      });

      sendToken(vendor, 201, res);
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
  }
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Find vendor + include password field (normally hidden)
      const vendor = await Vendor.findOne({ email }).select('+password');
      if (!vendor) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Check password
      const isMatch = await vendor.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      sendToken(vendor, 200, res);
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
    }
  }
);

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, vendor: req.vendor.toPublicJSON() });
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ── POST /api/auth/change-password ───────────────────────────────────────────
router.post(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const vendor = await Vendor.findById(req.vendor._id).select('+password');
      const isMatch = await vendor.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }

      vendor.password = req.body.newPassword;
      await vendor.save();

      res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to update password.' });
    }
  }
);

module.exports = router;
