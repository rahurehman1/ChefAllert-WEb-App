const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  gateway: { type: String, enum: ['jazzcash'], required: true, default: 'jazzcash' },
  amount_pkr: { type: Number, required: true },
  currency: { type: String, default: 'PKR' },
  status: { type: String, enum: ['initiated', 'paid', 'failed'], default: 'initiated' },
  reference: { type: String, required: true, unique: true },
  raw: { type: Object, default: {} }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
