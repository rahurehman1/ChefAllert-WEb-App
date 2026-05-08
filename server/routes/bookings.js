const express = require('express');
const Booking = require('../models/Booking.js');
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');
const SubscriptionPlan = require('../models/SubscriptionPlan.js');
const UserSubscription = require('../models/UserSubscription.js');
const ChefProfile = require('../models/ChefProfile.js');

const router = express.Router();

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

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

router.use(auth);

const ensureDefaultPlans = async () => {
  const existing = await SubscriptionPlan.find({ code: { $in: ['free', 'pro_monthly', 'pro_yearly'] } });
  const codes = new Set(existing.map(p => p.code));

  const toCreate = [];
  if (!codes.has('free')) {
    toCreate.push({
      code: 'free',
      name: 'Free',
      price_pkr: 0,
      duration_days: 3650,
      booking_limit_per_month: 2,
      is_active: true
    });
  }
  if (!codes.has('pro_monthly')) {
    toCreate.push({
      code: 'pro_monthly',
      name: 'Pro (Monthly)',
      price_pkr: 1500,
      duration_days: 30,
      booking_limit_per_month: null,
      is_active: true
    });
  }
  if (!codes.has('pro_yearly')) {
    toCreate.push({
      code: 'pro_yearly',
      name: 'Pro (Yearly)',
      price_pkr: 10000,
      duration_days: 365,
      booking_limit_per_month: null,
      is_active: true
    });
  }

  if (toCreate.length) {
    await SubscriptionPlan.insertMany(toCreate);
  }
};

const getOrCreateActiveSubscription = async (userId) => {
  await ensureDefaultPlans();

  await UserSubscription.updateMany(
    {
      user_id: userId,
      status: 'active',
      end_at: { $ne: null, $lt: new Date() }
    },
    { $set: { status: 'expired' } }
  );

  let subscription = await UserSubscription.findOne({ user_id: userId, status: 'active' }).populate('plan_id');
  if (!subscription) {
    const freePlan = await SubscriptionPlan.findOne({ code: 'free' });

    subscription = await UserSubscription.create({
      user_id: userId,
      plan_id: freePlan._id,
      status: 'active',
      start_at: new Date(),
      end_at: null
    });
    subscription = await UserSubscription.findById(subscription._id).populate('plan_id');
  }
  return subscription;
};

router.post('/', async (req, res) => {
  try {
    const { client_id, chef_id, booking_date, start_time, end_time, location, cuisine_type, primary_dish, dishes, number_of_dishes, special_requests } = req.body;

    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can create bookings' });
    }

    if (client_id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'client_id must match authenticated user' });
    }

    const subscription = await getOrCreateActiveSubscription(req.user._id);
    const limit = subscription?.plan_id?.booking_limit_per_month;
    const isPro = subscription?.plan_id?.code === 'pro_monthly' || subscription?.plan_id?.code === 'pro_yearly';
    if (typeof limit === 'number') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const bookingsThisMonth = await Booking.countDocuments({
        client_id: req.user._id,
        createdAt: { $gte: startOfMonth, $lt: endOfMonth }
      });

      if (bookingsThisMonth >= limit) {
        return res.status(402).json({
          message: `Free plan limit reached (${limit} bookings/month). Upgrade to Pro for unlimited bookings.`
        });
      }
    }

    const getHoursDiff = () => {
      try {
        if (!start_time || !end_time) return 0;
        const start = new Date(`2024-01-01T${start_time}`);
        const end = new Date(`2024-01-01T${end_time}`);
        const diff = (end.getTime() - start.getTime()) / 3600000;
        return diff > 0 ? diff : 0;
      } catch {
        return 0;
      }
    };

    const hoursDiff = getHoursDiff();
    const chefProfile = await ChefProfile.findOne({ user_id: chef_id }).select('price_per_hour');
    const pricePerHour = chefProfile?.price_per_hour || 0;
    const baseTotal = pricePerHour * hoursDiff;
    const discountedTotal = isPro ? baseTotal * 0.8 : baseTotal;
    const computedTotalAmount = Math.round(discountedTotal);

    const booking = new Booking({
      client_id,
      chef_id,
      booking_date,
      start_time,
      end_time,
      location,
      cuisine_type,
      primary_dish: typeof primary_dish === 'string' ? primary_dish : '',
      dishes: Array.isArray(dishes) ? dishes.filter(Boolean) : [],
      number_of_dishes,
      special_requests,
      total_amount: computedTotalAmount,
      status: 'pending'
    });

    await booking.save();
    await booking.populate('client_id', 'full_name email profile_picture_url phone_number');
    await booking.populate('chef_id', 'full_name email profile_picture_url');

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/client/:clientId', async (req, res) => {
  try {
    const bookings = await Booking.find({ client_id: req.params.clientId })
      .populate('chef_id', 'full_name email profile_picture_url')
      .populate('client_id', 'full_name email')
      .sort({ booking_date: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/chef/:chefId', async (req, res) => {
  try {
    const bookings = await Booking.find({ chef_id: req.params.chefId })
      .populate('client_id', 'full_name email profile_picture_url phone_number')
      .sort({ booking_date: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate('client_id', 'full_name email profile_picture_url phone_number')
    .populate('chef_id', 'full_name email profile_picture_url');

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;