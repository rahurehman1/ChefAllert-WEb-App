const express = require('express');
const crypto = require('crypto');
const SubscriptionPlan = require('../models/SubscriptionPlan.js');
const UserSubscription = require('../models/UserSubscription.js');
const PaymentTransaction = require('../models/PaymentTransaction.js');

const router = express.Router();

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};

const ensureDefaultPlans = async () => {
  await SubscriptionPlan.updateMany(
    { code: 'pro' },
    { $set: { is_active: false } }
  );

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

router.get('/plans', async (req, res) => {
  try {
    await ensureDefaultPlans();
    const plans = await SubscriptionPlan.find({
      is_active: true,
      code: { $in: ['free', 'pro_monthly', 'pro_yearly'] }
    }).sort({ price_pkr: 1 });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    await ensureDefaultPlans();

    await UserSubscription.updateMany(
      {
        user_id: req.user._id,
        status: 'active',
        end_at: { $ne: null, $lt: new Date() }
      },
      { $set: { status: 'expired' } }
    );

    let subscription = await UserSubscription.findOne({ user_id: req.user._id, status: 'active' })
      .populate('plan_id');

    if (!subscription) {
      const freePlan = await SubscriptionPlan.findOne({ code: 'free' });
      subscription = await UserSubscription.create({
        user_id: req.user._id,
        plan_id: freePlan._id,
        status: 'active',
        start_at: new Date(),
        end_at: null
      });
      subscription = await UserSubscription.findById(subscription._id).populate('plan_id');
    }

    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// AUTH: initiate JazzCash (scaffold)
router.post('/jazzcash/initiate', requireAuth, async (req, res) => {
  try {
    const { plan_code } = req.body;
    if (!plan_code) {
      return res.status(400).json({ success: false, message: 'plan_code is required' });
    }

    await ensureDefaultPlans();
    const plan = await SubscriptionPlan.findOne({ code: plan_code, is_active: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    if (plan.price_pkr <= 0) {
      return res.status(400).json({ success: false, message: 'This plan is free' });
    }

    const reference = crypto.randomBytes(16).toString('hex');
    const tx = await PaymentTransaction.create({
      user_id: req.user._id,
      plan_id: plan._id,
      gateway: 'jazzcash',
      amount_pkr: plan.price_pkr,
      currency: 'PKR',
      status: 'initiated',
      reference,
      raw: { note: 'JazzCash scaffold. Configure env + real API integration.' }
    });

    res.json({
      success: true,
      transaction: {
        reference: tx.reference,
        amount_pkr: tx.amount_pkr,
        gateway: tx.gateway
      },
      redirect_url: null,
      message: 'Payment initiated (scaffold). Use /api/subscriptions/mock/success for testing.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/mock/success', requireAuth, async (req, res) => {
  try {
    const { plan_code } = req.body;
    if (!plan_code) {
      return res.status(400).json({ success: false, message: 'plan_code is required' });
    }

    await ensureDefaultPlans();
    const plan = await SubscriptionPlan.findOne({ code: plan_code, is_active: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    await UserSubscription.updateMany(
      { user_id: req.user._id, status: 'active' },
      { $set: { status: 'expired', end_at: new Date() } }
    );

    const start = new Date();
    const end = plan.duration_days ? new Date(start.getTime() + plan.duration_days * 86400000) : null;

    const subscription = await UserSubscription.create({
      user_id: req.user._id,
      plan_id: plan._id,
      status: 'active',
      start_at: start,
      end_at: plan.code === 'free' ? null : end
    });

    const populated = await UserSubscription.findById(subscription._id).populate('plan_id');

    res.json({ success: true, subscription: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/admin/users/:userId/cancel', requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    await UserSubscription.updateMany(
      { user_id: req.params.userId, status: 'active' },
      { $set: { status: 'cancelled', end_at: new Date() } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
