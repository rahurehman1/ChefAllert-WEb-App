const express = require('express');
const Message = require('../models/Message.js');
const Booking = require('../models/Booking.js');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // ADD THIS
const User = require('../models/User.js'); // ADD THIS

const router = express.Router();

// ✅ ADD AUTHENTICATION MIDDLEWARE
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ Invalid token - user not found');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = user;
    console.log('✅ Authenticated user:', user._id);
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token',
      error: error.message 
    });
  }
};

// ✅ Apply auth middleware to ALL chat routes
router.use(auth);
router.get('/booking/:bookingId/details', async (req, res) => {
  try {
    console.log(`🔍 GET /chat/booking/${req.params.bookingId}/details called`);
    
    // Get user ID from auth token (assuming you have auth middleware)
    const userId = req.user._id.toString();
    const authHeader = req.headers.authorization;
    
    console.log('👤 User from request:', {

      userId: userId,
      hasAuthHeader: !!authHeader,
      authHeader: authHeader ? `${authHeader.substring(0, 20)}...` : 'none'
    });

    if (!userId) {
      console.log('❌ No user ID found in request');
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    const booking = await Booking.findById(req.params.bookingId)
      .populate('chef_id', 'full_name email profile_picture_url phone_number')
      .populate('client_id', 'full_name email profile_picture_url phone_number');

    if (!booking) {
      console.log('❌ Booking not found:', req.params.bookingId);
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    console.log('📋 Booking details:', {
      bookingId: booking._id,
      chef_id: booking.chef_id?._id || booking.chef_id,
      client_id: booking.client_id?._id || booking.client_id,
      requestingUser: userId.toString()
    });

    // ✅ CRITICAL FIX: Compare ObjectIds properly
    const isClient = booking.client_id?._id?.toString() === userId.toString();
    const isChef = booking.chef_id?._id?.toString() === userId.toString();
    
    console.log('🔐 Authorization check:', {
      isClient: isClient,
      isChef: isChef,
      clientId: booking.client_id?._id?.toString(),
      chefId: booking.chef_id?._id?.toString(),
      userId: userId.toString()
    });

    if (!isClient && !isChef) {
      console.log('❌ User not authorized for this chat');
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to view this chat',
        userRole: req.user?.role,
        userId: userId,
        bookingClient: booking.client_id?._id,
        bookingChef: booking.chef_id?._id
      });
    }

    console.log('✅ User authorized, returning booking details');
    res.json({
      success: true,
      booking: booking,
      userRole: isChef ? 'chef' : 'client'
    });

  } catch (error) {
    console.error('❌ GET /chat/booking/:bookingId/details error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to load chat details',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
  }
});

// ✅ Get messages for a booking
router.get('/booking/:bookingId', async (req, res) => {
  try {
    console.log(`📨 GET /chat/booking/${req.params.bookingId} called`);
    
    // Get user ID from auth
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // First check if user has access to this booking
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const isClient = booking.client_id.toString() === userId.toString();
    const isChef = booking.chef_id.toString() === userId.toString();
    
    if (!isClient && !isChef) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ booking_id: req.params.bookingId })
      .populate('sender_id', 'full_name profile_picture_url')
      .populate('receiver_id', 'full_name')
      .sort({ created_at: 1 });

    res.json({
      success: true,
      messages: messages,
      userRole: isChef ? 'chef' : 'client'
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Send message
router.post('/messages', async (req, res) => {
  try {
    console.log('📤 POST /chat/messages called');
    console.log('📦 Request body:', req.body);
    
    const { booking_id, sender_id, receiver_id, message } = req.body;

    if (!booking_id || !sender_id || !receiver_id || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    // Verify sender is either chef or client for this booking
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isSenderAuthorized = 
      booking.client_id.toString() === sender_id.toString() ||
      booking.chef_id.toString() === sender_id.toString();

    if (!isSenderAuthorized) {
      return res.status(403).json({ message: 'Sender not authorized for this booking' });
    }

    const newMessage = new Message({
      booking_id,
      sender_id,
      receiver_id,
      message
    });

    await newMessage.save();
    await newMessage.populate('sender_id', 'full_name profile_picture_url');
    await newMessage.populate('receiver_id', 'full_name');

    console.log('✅ Message sent:', newMessage._id);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get unread messages count
router.get('/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const unreadCount = await Message.countDocuments({
      receiver_id: userId,
      is_read: false
    });

    res.json({ unread_count: unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Mark messages as read
router.put('/mark-read/:bookingId/:userId', async (req, res) => {
  try {
    const { bookingId, userId } = req.params;
    
    await Message.updateMany(
      { 
        booking_id: bookingId,
        receiver_id: userId,
        is_read: false
      },
      { $set: { is_read: true } }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;