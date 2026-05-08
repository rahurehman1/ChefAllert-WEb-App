// server/models/Review.js - CORRECTED
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true, 
    unique: true 
  },
  chef_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  client_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  review_text: { 
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// ✅ CORRECT EXPORT - NO EXTRA CODE
module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);