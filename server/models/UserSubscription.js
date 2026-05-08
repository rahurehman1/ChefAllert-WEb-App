const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  start_at: { type: Date, default: null },
  end_at: { type: Date, default: null },
  auto_renew: { type: Boolean, default: false }
}, {
  timestamps: true
});

userSubscriptionSchema.index({ user_id: 1, status: 1 });

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);
