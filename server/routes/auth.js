const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const ChefProfile = require('../models/ChefProfile.js');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

router.post('/signup', async (req, res) => {
  try {
    console.log('📝 Signup request received:', req.body);

    const { email, password, full_name, role } = req.body;

    if (!email || !password || !full_name || !role) {
      console.error('❌ Missing required fields:', { email, password, full_name, role });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      email,
      password,
      full_name,
      role,
    });

    await user.save();
    console.log('✅ User created successfully:', user._id);

    if (role === 'chef') {
      const chefProfile = new ChefProfile({
        user_id: user._id,
      });
      await chefProfile.save();
      console.log('✅ Chef profile created for:', user._id);
    }

    const token = generateToken(user._id);

    console.log('🎉 Signup successful for:', email);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone_number: user.phone_number,
        profile_picture_url: user.profile_picture_url,
        address: user.address,
        city: user.city,
        state: user.state,
        zip_code: user.zip_code,
      },
    });
  } catch (error) {
    console.error('❌ Signup error details:', error);
    res.status(500).json({ 
      message: 'Error creating account', 
      error: error.message 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    console.log('✅ Login successful for:', email);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone_number: user.phone_number,
        profile_picture_url: user.profile_picture_url,
        address: user.address,
        city: user.city,
        state: user.state,
        zip_code: user.zip_code,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone_number: user.phone_number,
        profile_picture_url: user.profile_picture_url,
        address: user.address,
        city: user.city,
        state: user.state,
        zip_code: user.zip_code,
      },
    });
  } catch (error) {
    console.error('❌ Get me error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;