const express = require('express');
const mongoose = require('mongoose');
const ChefProfile = require('../models/ChefProfile.js');
const User = require('../models/User.js');
const Review = require('../models/Review.js');

const router = express.Router();

// IMPORT AUTH MIDDLEWARE FROM server.js
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ================== PUBLIC ROUTES ==================

// Get all chefs with profiles (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    const dish = (req.query.dish || '').toString().trim();

    const hasQ = !!q;
    const hasDish = !!dish;

    const matchStages = [];
    if (dish) {
      matchStages.push({
        $or: [
          { specialties: { $elemMatch: { $regex: dish, $options: 'i' } } },
          { specializations: { $regex: dish, $options: 'i' } }
        ]
      });
    }

    const chefs = await ChefProfile.aggregate([
      ...(matchStages.length ? [{ $match: { $and: matchStages } }] : []),
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $addFields: {
          smart_score: {
            $add: [
              // Dish match gets the highest boost
              ...(hasDish
                ? [
                    {
                      $cond: [
                        { $or: [
                          { $in: [dish, { $ifNull: ['$specialties', []] }] },
                          { $regexMatch: { input: { $ifNull: ['$specializations', ''] }, regex: dish, options: 'i' } }
                        ]},
                        100,
                        0
                      ]
                    }
                  ]
                : [0]),

              // Query match bonus (name / specializations / specialties)
              ...(hasQ
                ? [
                    {
                      $cond: [
                        {
                          $or: [
                            { $regexMatch: { input: { $ifNull: ['$user.full_name', ''] }, regex: q, options: 'i' } },
                            { $regexMatch: { input: { $ifNull: ['$specializations', ''] }, regex: q, options: 'i' } },
                            {
                              $anyElementTrue: {
                                $map: {
                                  input: { $ifNull: ['$specialties', []] },
                                  as: 's',
                                  in: { $regexMatch: { input: '$$s', regex: q, options: 'i' } }
                                }
                              }
                            }
                          ]
                        },
                        20,
                        0
                      ]
                    }
                  ]
                : [0]),

              // Quality signals
              { $multiply: [{ $ifNull: ['$rating', 0] }, 10] },
              { $multiply: [{ $ifNull: ['$experience_years', 0] }, 2] }
            ]
          }
        }
      },
      ...(q
        ? [
            {
              $match: {
                $or: [
                  { 'user.full_name': { $regex: q, $options: 'i' } },
                  { specializations: { $regex: q, $options: 'i' } },
                  { specialties: { $elemMatch: { $regex: q, $options: 'i' } } }
                ]
              }
            }
          ]
        : []),
      { $sort: { smart_score: -1, rating: -1, experience_years: -1 } },
      { $project: { 'user.password': 0 } }
    ]);

    res.json(chefs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================== PROTECTED ROUTES ==================

// GET chef profile (PROTECTED - for logged in chefs)
router.get('/profile/me', auth, async (req, res) => {
  try {
    // Check if user is a chef
    if (req.user.role !== 'chef') {
      return res.status(403).json({ 
        message: 'Access denied. Only chefs can access this profile.' 
      });
    }

    const chefProfile = await ChefProfile.findOne({ user_id: req.user._id })
      .populate('user_id', 'full_name email phone_number address city state zip_code profile_picture_url');

    if (!chefProfile) {
      // Create new profile if doesn't exist
      const newChefProfile = new ChefProfile({
        user_id: req.user._id,
        bio: '',
        experience_years: 0,
        price_per_hour: 0,
        availability_start_time: '09:00',
        availability_end_time: '17:00',
        specializations: '',
        specialties: [],
        certifications: '',
        rating: 0,
        total_reviews: 0
      });
      
      await newChefProfile.save();
      return res.json(newChefProfile);
    }

    res.json(chefProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE chef profile (PROTECTED)
router.put('/profile', auth, async (req, res) => {
  try {
    // Check if user is a chef
    if (req.user.role !== 'chef') {
      return res.status(403).json({ 
        message: 'Access denied. Only chefs can update profile.' 
      });
    }

    const { 
      bio, 
      experience_years, 
      price_per_hour, 
      availability_start_time, 
      availability_end_time, 
      specializations, 
      specialties,
      certifications 
    } = req.body;

    // Handle specializations - convert array to string if needed
    let processedSpecializations = '';
    if (Array.isArray(specializations)) {
      processedSpecializations = specializations.join(', ');
    } else if (typeof specializations === 'string') {
      processedSpecializations = specializations;
    }

    // Handle certifications - convert array to string if needed
    let processedCertifications = '';
    if (Array.isArray(certifications)) {
      processedCertifications = certifications.join(', ');
    } else if (typeof certifications === 'string') {
      processedCertifications = certifications;
    }

    let processedSpecialties = [];
    if (Array.isArray(specialties)) {
      processedSpecialties = specialties.map(s => (s || '').toString().trim()).filter(Boolean);
    } else if (typeof specialties === 'string' && specialties.trim()) {
      processedSpecialties = specialties.split(',').map(s => s.trim()).filter(Boolean);
    }

    const updateData = {
      bio: bio || '',
      experience_years: parseInt(experience_years) || 0,
      price_per_hour: parseInt(price_per_hour) || 0,
      availability_start_time: availability_start_time || '09:00',
      availability_end_time: availability_end_time || '17:00',
      specializations: processedSpecializations,
      specialties: processedSpecialties,
      certifications: processedCertifications,
      updated_at: new Date()
    };

    const chefProfile = await ChefProfile.findOneAndUpdate(
      { user_id: req.user._id },
      updateData,
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    ).populate('user_id', 'full_name email phone_number address city state zip_code profile_picture_url');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: chefProfile
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile',
      error: error.message 
    });
  }
});

// ✅ SIMPLE GET profile endpoint (REDIRECT to profile/me)
router.get('/profile', auth, async (req, res) => {
  try {
    // Simply redirect to profile/me
    // Check if user is a chef
    if (req.user.role !== 'chef') {
      return res.status(403).json({ 
        message: 'Access denied. Only chefs can access this profile.' 
      });
    }

    const chefProfile = await ChefProfile.findOne({ user_id: req.user._id })
      .populate('user_id', 'full_name email phone_number address city state zip_code profile_picture_url');

    if (!chefProfile) {
      // Create new profile if doesn't exist
      const newChefProfile = new ChefProfile({
        user_id: req.user._id,
        bio: '',
        experience_years: 0,
        price_per_hour: 0,
        availability_start_time: '09:00',
        availability_end_time: '17:00',
        specializations: '',
        specialties: [],
        certifications: '',
        rating: 0,
        total_reviews: 0
      });
      
      await newChefProfile.save();
      return res.json(newChefProfile);
    }

    res.json(chefProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chef by ID (PUBLIC)
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid chef ID' });
    }

    const chef = await ChefProfile.findOne({ user_id: req.params.id })
      .populate('user_id', '-password');

    if (!chef) {
      return res.status(404).json({ message: 'Chef not found' });
    }

    const reviews = await Review.find({ chef_id: req.params.id })
      .populate('client_id', 'full_name');

    res.json({ ...chef.toObject(), reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;