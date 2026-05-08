const mongoose = require('mongoose');

const chefProfileSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  bio: { type: String },
  experience_years: { type: Number, default: 0 },
  price_per_hour: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  total_reviews: { type: Number, default: 0 },
  availability_start_time: { type: String },
  availability_end_time: { type: String },
  available_days: { 
    type: [String], 
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] 
  },
  certifications: { type: String },
  specializations: { type: String },
  specialties: { type: [String], default: [] }
}, {
  timestamps: true
});

// Add index for faster queries
chefProfileSchema.index({ user_id: 1 }, { unique: true });
chefProfileSchema.index({ rating: -1 });

module.exports = mongoose.model('ChefProfile', chefProfileSchema);