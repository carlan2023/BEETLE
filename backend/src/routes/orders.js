const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

router.use(protect);

const VALID_TRANSITIONS = {
  PENDING:          ['ACCEPTED', 'REJECTED'],
  ACCEPTED:         ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['ASSIGNED'],
  ASSIGNED:         ['PICKED_UP'],
  PICKED_UP:        ['IN_TRANSIT'],
  IN_TRANSIT:       ['DELIVERED'],
};

// ── GET /api/orders ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { vendorId: req.vendor._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// ── GET /api/orders/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, pending, revenue] = await Promise.all([
      Order.countDocuments({ vendorId }),
      Order.countDocuments({ vendorId, createdAt: { $gte: today } }),
      Order.countDocuments({ vendorId, status: 'PENDING' }),
      Order.aggregate([
        { $match: { vendorId, status: 'DELIVERED' } },
        { $group: { _id: null, total: { $sum: '$subtotal' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        pendingOrders: pending,
        totalRevenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
});

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, vendorId: req.vendor._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
});

// ── PATCH /api/orders/:id/status ──────────────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findOne({ _id: req.params.id, vendorId: req.vendor._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move order from ${order.status} to ${status}.`,
      });
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || '' });
    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

module.exports = router;
