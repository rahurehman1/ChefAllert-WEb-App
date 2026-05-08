const express = require('express');
const User = require('../models/User.js');
const Booking = require('../models/Booking.js');
const ChefProfile = require('../models/ChefProfile.js');
const Review = require('../models/Review.js');

const router = express.Router();

const isAdmin = (req, res, next) => {
  console.log('🔐 Admin check:', {
    user: req.user?.email,
    role: req.user?.role,
    path: req.path
  });

  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.log('❌ Admin access denied');
    res.status(403).json({ 
      success: false,
      message: 'Admin access required' 
    });
  }
};

router.use(isAdmin);

router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Admin stats requested');

    const [
      totalUsers,
      totalChefs,
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      revenueResult,
      recentBookings,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'chef' }),
      
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'cancelled' }),
      
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      
      Booking.find()
        .populate('client_id', 'full_name email')
        .populate('chef_id', 'full_name email')
        .sort({ createdAt: -1 })
        .limit(10),
      
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const revenue = revenueResult[0]?.total || 0;

    console.log('📊 Stats calculated:', {
      totalUsers,
      totalChefs,
      totalBookings,
      completedBookings,
      revenue
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalChefs,
        totalBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings,
        revenue,
        recentBookings,
        recentUsers
      }
    });

  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${users.length} users`);

    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        _id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone_number: user.phone_number,
        address: user.address,
        city: user.city,
        state: user.state,
        zip_code: user.zip_code,
        profile_picture_url: user.profile_picture_url,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        is_verified: user.role === 'chef' ? true : false
      }))
    });
  } catch (error) {
    console.error('❌ Users error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('client_id', 'full_name email phone_number')
      .populate('chef_id', 'full_name email phone_number')
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${bookings.length} bookings`);

    res.json({
      success: true,
      count: bookings.length,
      bookings: bookings.map(booking => ({
        _id: booking._id,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        location: booking.location,
        cuisine_type: booking.cuisine_type,
        number_of_dishes: booking.number_of_dishes,
        special_requests: booking.special_requests,
        status: booking.status,
        total_amount: booking.total_amount,
        created_at: booking.createdAt,
        client_id: booking.client_id,
        chef_id: booking.chef_id,
        client: booking.client_id,
        chef: booking.chef_id
      }))
    });
  } catch (error) {
    console.error('❌ Bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await ChefProfile.findOneAndDelete({ user_id: req.params.id });
    console.log(`🗑️ User ${req.params.id} deleted`);
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

router.delete('/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    console.log(`🗑️ Booking ${req.params.id} deleted`);
    res.json({ 
      success: true, 
      message: 'Booking deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

router.put('/chefs/:id/verify', async (req, res) => {
  try {
    const chef = await ChefProfile.findOneAndUpdate(
      { user_id: req.params.id },
      { is_verified: true },
      { new: true }
    ).populate('user_id', 'full_name email');
    console.log(`✅ Chef ${req.params.id} verified`);
    
    res.json({
      success: true,
      message: 'Chef verified successfully',
      chef
    });
  } catch (error) {
    console.error('❌ Verify chef error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;