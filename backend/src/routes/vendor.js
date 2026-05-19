const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const { protect } = require('../middleware/auth');

router.use(protect);

// ── GET /api/vendor/profile ───────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  res.json({ success: true, data: req.vendor.toPublicJSON() });
});

// ── PUT /api/vendor/profile ───────────────────────────────────────────────────
router.put('/profile', async (req, res) => {
  try {
    const allowed = ['businessName', 'ownerName', 'phone', 'description', 'address', 'city', 'isOpen', 'category'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const vendor = await Vendor.findByIdAndUpdate(req.vendor._id, updates, {
      new: true, runValidators: true,
    });
    res.json({ success: true, data: vendor.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// ── PATCH /api/vendor/toggle-open ────────────────────────────────────────────
router.patch('/toggle-open', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id);
    vendor.isOpen = !vendor.isOpen;
    await vendor.save();
    res.json({ success: true, data: { isOpen: vendor.isOpen } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle store.' });
  }
});

module.exports = router;
