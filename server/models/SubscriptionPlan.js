const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: { type: String, required: true, trim: true },
  price_pkr: { type: Number, required: true, default: 0 },
  duration_days: { type: Number, required: true, default: 30 },
  booking_limit_per_month: { type: Number, default: null },
  is_active: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
