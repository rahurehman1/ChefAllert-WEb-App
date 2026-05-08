const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chef_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking_date: { type: Date, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  location: { type: String, required: true },
  cuisine_type: { type: String },
  primary_dish: { type: String, default: '' },
  dishes: { type: [String], default: [] },
  number_of_dishes: { type: Number, default: 1 },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  total_amount: { type: Number },
  special_requests: { type: String },
  // ✅ ADD THIS FIELD
  hasReview: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);