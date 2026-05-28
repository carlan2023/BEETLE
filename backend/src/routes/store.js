const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { body, validationResult } = require('express-validator');

const normalizeCategory = (value) => {
  if (!value) return null;

  const normalized = value.toString().trim().toLowerCase().replace(/\s*&\s*/g, "_").replace(/\s+/g, "_");
  const aliases = {
    restaurants: "food_drinks",
    food_drinks: "food_drinks",
    groceries: "groceries",
    clothing: "clothing",
    footwear: "footwear",
    electronics: "electronics",
    home_living: "home_living",
    pharmacy: "pharmacy",
    books: "other",
    other: "other",
  };

  return aliases[normalized] || normalized;
};

// ── GET /api/store/vendors ────────────────────────────────────────────────────
router.get('/vendors', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'approved', isActive: true };
    const normalizedCategory = normalizeCategory(category);
    if (normalizedCategory) filter.category = normalizedCategory;
    if (search) filter.$text = { $search: search };

    const vendors = await Vendor.find(filter)
      .select('businessName description logoUrl coverUrl category address city rating reviewCount isOpen deliveryTimeMin deliveryTimeMax')
      .sort({ rating: -1 });

    res.json({ success: true, data: vendors });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch vendors.' });
  }
});

// ── GET /api/store/vendors/:id ────────────────────────────────────────────────
router.get('/vendors/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ _id: req.params.id, status: 'approved' })
      .select('-password -passwordResetToken -emailVerificationToken');
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found.' });

    const products = await Product.find({ vendorId: vendor._id, isAvailable: true });
    res.json({ success: true, data: { vendor, products } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch vendor.' });
  }
});

// ── POST /api/store/orders ────────────────────────────────────────────────────
// Customers place orders (no auth required in MVP)
router.post(
  '/orders',
  [
    body('vendorId').notEmpty().withMessage('Vendor is required'),
    body('customer.name').trim().notEmpty().withMessage('Your name is required'),
    body('customer.phone').trim().notEmpty().withMessage('Phone number is required'),
    body('customer.address').trim().notEmpty().withMessage('Delivery address is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('paymentMethod').optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { vendorId, customer, items, paymentMethod } = req.body;

      // Verify vendor exists
      const vendor = await Vendor.findOne({ _id: vendorId, status: 'approved' });
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found.' });

      // Calculate totals
      let subtotal = 0;
      const enrichedItems = [];
      for (const item of items) {
        const product = await Product.findOne({ _id: item.productId, vendorId, isAvailable: true });
        if (!product) {
          return res.status(400).json({ success: false, message: `Product "${item.productId}" is unavailable.` });
        }
        subtotal += product.price * item.quantity;
        enrichedItems.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          thumbnail: product.thumbnail,
        });
      }

      const deliveryFee = 3000;
      const serviceFee = 500;
      const total = subtotal + deliveryFee + serviceFee;

      const order = await Order.create({
        vendorId,
        customer,
        items: enrichedItems,
        subtotal,
        deliveryFee,
        serviceFee,
        total,
        paymentMethod: paymentMethod || 'cash',
        statusHistory: [{ status: 'PENDING', note: 'Order placed by customer' }],
      });

      res.status(201).json({ success: true, data: order });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to place order.' });
    }
  }
);

// ── GET /api/store/orders/:orderNumber ────────────────────────────────────────
// Customer tracks their order by order number
router.get('/orders/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('vendorId', 'businessName address phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
});

module.exports = router;
