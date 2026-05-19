const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  thumbnail: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    // Customer info (no auth in MVP — stored inline)
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      notes: { type: String, default: '' },
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 3000 },
    serviceFee: { type: Number, default: 500 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'READY_FOR_PICKUP', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      enum: ['mtn_momo', 'airtel_money', 'card', 'cash'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    statusHistory: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String,
    }],
    estimatedMinutes: { type: Number, default: 25 },
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null },
  },
  { timestamps: true }
);

// Auto-generate order number before save
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `KLA-${String(count + 1001).padStart(5, '0')}`;
  }
  next();
});

orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
