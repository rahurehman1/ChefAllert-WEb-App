const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  thread_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportThread', required: true, index: true },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
