const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    comparePrice: {          // original price — used to show discount
      type: Number,
      default: null,
    },
    category: {
      type: String,
      required: true,
      enum: ['groceries', 'electronics', 'clothing', 'footwear', 'food_drinks', 'home_living', 'pharmacy', 'other'],
    },
    images: [{ type: String }],     // Cloudinary URLs
    thumbnail: { type: String, default: '' },
    weight: { type: String, default: '' },  // e.g. "1 kg", "500 ml"
    stock: { type: Number, default: 0, min: 0 },
    isAvailable: { type: Boolean, default: true },
    tags: [{ type: String, lowercase: true }],
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ vendorId: 1, category: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
