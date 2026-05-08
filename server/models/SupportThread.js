const mongoose = require('mongoose');

const supportThreadSchema = new mongoose.Schema({
  request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionUpgradeRequest', required: true, unique: true, index: true },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('SupportThread', supportThreadSchema);
