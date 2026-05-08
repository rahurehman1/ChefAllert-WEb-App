const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);