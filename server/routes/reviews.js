// server/routes/reviews.js - COMPLETE UPDATED
const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review.js');
const ChefProfile = require('../models/ChefProfile.js');
const Booking = require('../models/Booking.js');

const router = express.Router();

// Create review
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /api/reviews called');
    console.log('📦 Request body:', req.body);
    
    const { booking_id, chef_id, client_id, rating, review_text } = req.body;

    // ✅ VALIDATION: Check required fields
    if (!booking_id || !chef_id || !client_id || !rating) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields',
        required: ['booking_id', 'chef_id', 'client_id', 'rating']
      });
    }

    // ✅ VALIDATION: Check if rating is valid (1-5)
    const ratingNum = parseFloat(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ 
        success: false,
        message: 'Rating must be a number between 1 and 5',
        received: rating
      });
    }

    // ✅ Check if booking exists and belongs to this client
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found',
        booking_id
      });
    }

    // ✅ Verify booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'You can only review completed bookings',
        booking_status: booking.status
      });
    }

    // ✅ Verify client is the one who made the booking
    if (booking.client_id.toString() !== client_id) {
      return res.status(403).json({ 
        success: false,
        message: 'You can only review your own bookings'
      });
    }

    // ✅ Check if review already exists for this booking
    const existingReview = await Review.findOne({ booking_id });
    if (existingReview) {
      return res.status(400).json({ 
        success: false,
        message: 'Review already exists for this booking',
        reviewId: existingReview._id
      });
    }

    // ✅ Check if booking already has a review
    if (booking.hasReview) {
      return res.status(400).json({ 
        success: false,
        message: 'This booking already has a review'
      });
    }

    console.log('✅ All validations passed, creating review...');

    // ✅ Create review
    const review = new Review({
      booking_id,
      chef_id,
      client_id,
      rating: ratingNum,
      review_text: review_text || ''
    });

    await review.save();
    console.log('✅ Review created:', review._id);

    // ✅ UPDATE BOOKING to mark review exists
try {
  await Booking.findByIdAndUpdate(
    booking_id, 
    { 
      hasReview: true,
      updated_at: new Date()
    },
    { new: true } // ✅ ADD THIS OPTION
  );
  console.log('✅ Booking marked as reviewed:', booking_id);
} catch (bookingUpdateError) {
  console.error('⚠️ Booking update error:', bookingUpdateError.message);
  // Continue even if booking update fails
}

    // ✅ Update chef's rating and review count
    try {
      const chefReviews = await Review.find({ chef_id });
      console.log(`🔍 Found ${chefReviews.length} reviews for chef ${chef_id}`);
      
      const totalRating = chefReviews.reduce((sum, rev) => sum + rev.rating, 0);
      const averageRating = chefReviews.length > 0 ? totalRating / chefReviews.length : 0;

      console.log(`📊 Updating chef ${chef_id}: avg rating ${averageRating.toFixed(2)}, ${chefReviews.length} reviews`);

      await ChefProfile.findOneAndUpdate(
        { user_id: chef_id },
        {
          rating: parseFloat(averageRating.toFixed(1)),
          total_reviews: chefReviews.length,
          updated_at: new Date()
        },
        { 
          new: true,
          upsert: true
        }
      );
      console.log('✅ Chef profile updated successfully');
    } catch (chefUpdateError) {
      console.error('⚠️ Chef profile update failed:', chefUpdateError.message);
      // Don't fail the review if chef update fails
    }

    // ✅ Populate review data before sending response
    await review.populate('client_id', 'full_name profile_picture_url');
    await review.populate('chef_id', 'full_name');

    console.log('🎉 Review submitted successfully');
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: review,
      bookingUpdated: true
    });

  } catch (error) {
    console.error('❌ POST /api/reviews error:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ 
        success: false,
        message: 'Duplicate review for this booking'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to create review',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get reviews for a chef
router.get('/chef/:chefId', async (req, res) => {
  try {
    console.log(`🔍 GET /api/reviews/chef/${req.params.chefId} called`);
    
    // Validate chef ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.chefId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid chef ID format' 
      });
    }

    const reviews = await Review.find({ chef_id: req.params.chefId })
      .populate('client_id', 'full_name profile_picture_url')
      .populate('booking_id', 'booking_date location')
      .sort({ created_at: -1 });

    console.log(`✅ Found ${reviews.length} reviews for chef ${req.params.chefId}`);
    
    res.json({
      success: true,
      count: reviews.length,
      reviews: reviews
    });
  } catch (error) {
    console.error('❌ GET /api/reviews/chef/:chefId error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch reviews',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
});

// Get review by booking ID
router.get('/booking/:bookingId', async (req, res) => {
  try {
    console.log(`🔍 GET /api/reviews/booking/${req.params.bookingId} called`);
    
    const review = await Review.findOne({ booking_id: req.params.bookingId })
      .populate('client_id', 'full_name profile_picture_url')
      .populate('chef_id', 'full_name');

    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: 'Review not found for this booking' 
      });
    }

    res.json({
      success: true,
      review: review
    });
  } catch (error) {
    console.error('❌ GET /api/reviews/booking/:bookingId error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch review',
      error: error.message 
    });
  }
});

// Get reviews by client ID
router.get('/client/:clientId', async (req, res) => {
  try {
    console.log(`🔍 GET /api/reviews/client/${req.params.clientId} called`);
    
    const reviews = await Review.find({ client_id: req.params.clientId })
      .populate('chef_id', 'full_name profile_picture_url')
      .populate('booking_id', 'booking_date location')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews: reviews
    });
  } catch (error) {
    console.error('❌ GET /api/reviews/client/:clientId error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message 
    });
  }
});

// Check if booking has review
router.get('/check/:bookingId', async (req, res) => {
  try {
    console.log(`🔍 GET /api/reviews/check/${req.params.bookingId} called`);
    
    const review = await Review.findOne({ booking_id: req.params.bookingId });
    const booking = await Booking.findById(req.params.bookingId);

    res.json({
      success: true,
      hasReview: !!review,
      bookingHasReview: booking?.hasReview || false,
      reviewId: review?._id || null
    });
  } catch (error) {
    console.error('❌ GET /api/reviews/check/:bookingId error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to check review status',
      error: error.message 
    });
  }
});

module.exports = router;