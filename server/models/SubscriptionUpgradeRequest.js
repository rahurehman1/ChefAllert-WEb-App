const mongoose = require('mongoose');

const subscriptionUpgradeRequestSchema = new mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  plan_code: { type: String, enum: ['pro_monthly', 'pro_yearly'], required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'paid', 'activated'], default: 'pending' },
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  admin_payment_method: { type: String, enum: ['easypaisa', 'jazzcash', 'bank', 'other', ''], default: '' },
  admin_account_details: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

subscriptionUpgradeRequestSchema.index({ client_id: 1, status: 1 });

module.exports = mongoose.model('SubscriptionUpgradeRequest', subscriptionUpgradeRequestSchema);
