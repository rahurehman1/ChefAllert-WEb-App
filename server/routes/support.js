const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const SubscriptionUpgradeRequest = require('../models/SubscriptionUpgradeRequest.js');
const SupportThread = require('../models/SupportThread.js');
const SupportMessage = require('../models/SupportMessage.js');

const router = express.Router();

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

router.use(auth);

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

router.post('/requests', async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ success: false, message: 'Only clients can request upgrades' });
    }

    const { plan_code } = req.body;
    if (plan_code !== 'pro_monthly' && plan_code !== 'pro_yearly') {
      return res.status(400).json({ success: false, message: 'Invalid plan_code' });
    }

    const existing = await SubscriptionUpgradeRequest.findOne({
      client_id: req.user._id,
      status: { $in: ['pending', 'accepted', 'paid'] }
    });

    if (existing) {
      return res.json({ success: true, request: existing, message: 'Request already exists' });
    }

    const request = await SubscriptionUpgradeRequest.create({
      client_id: req.user._id,
      plan_code,
      status: 'pending'
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/requests/:id/paid', async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ success: false, message: 'Only clients can mark as paid' });
    }

    const request = await SubscriptionUpgradeRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (request.client_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (request.status !== 'accepted' && request.status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Request is not accepted yet' });
    }

    request.status = 'paid';
    await request.save();

    const thread = await SupportThread.findOne({ request_id: request._id });
    if (thread) {
      const planLabel = request.plan_code === 'pro_monthly' ? 'Monthly (Rs 1,500)' : request.plan_code === 'pro_yearly' ? 'Yearly (Rs 10,000)' : request.plan_code;
      await SupportMessage.create({
        thread_id: thread._id,
        sender_id: req.user._id,
        receiver_id: thread.admin_id,
        message: `Client marked payment as sent for ${planLabel}. Please verify and activate.`
      });
    }

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/requests/me', async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ success: false, message: 'Only clients can view their requests' });
    }

    const request = await SubscriptionUpgradeRequest.findOne({ client_id: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, request: request || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/admin/requests', isAdmin, async (req, res) => {
  try {
    const requests = await SubscriptionUpgradeRequest.find()
      .populate('client_id', 'full_name email profile_picture_url')
      .populate('admin_id', 'full_name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/admin/requests/:id/accept', isAdmin, async (req, res) => {
  try {
    const { admin_account_details, admin_payment_method } = req.body;

    const request = await SubscriptionUpgradeRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = 'accepted';
    request.admin_id = req.user._id;
    request.admin_payment_method = typeof admin_payment_method === 'string' ? admin_payment_method : '';
    request.admin_account_details = typeof admin_account_details === 'string' ? admin_account_details : '';
    await request.save();

    let thread = await SupportThread.findOne({ request_id: request._id });
    if (!thread) {
      thread = await SupportThread.create({
        request_id: request._id,
        client_id: request.client_id,
        admin_id: req.user._id
      });
    }

    res.json({ success: true, request, thread });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/admin/requests/:id/paid', isAdmin, async (req, res) => {
  try {
    const request = await SubscriptionUpgradeRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    request.status = 'paid';
    if (!request.admin_id) request.admin_id = req.user._id;
    await request.save();

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/admin/requests/:id/activate', isAdmin, async (req, res) => {
  try {
    const SubscriptionPlan = require('../models/SubscriptionPlan.js');
    const UserSubscription = require('../models/UserSubscription.js');

    const request = await SubscriptionUpgradeRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const plan = await SubscriptionPlan.findOne({ code: request.plan_code });
    if (!plan) return res.status(500).json({ success: false, message: 'Subscription plan not found' });

    await UserSubscription.updateMany(
      { user_id: request.client_id, status: 'active' },
      { $set: { status: 'expired', end_at: new Date() } }
    );

    const start = new Date();
    const end = new Date(start.getTime() + (plan.duration_days || 30) * 86400000);

    const subscription = await UserSubscription.create({
      user_id: request.client_id,
      plan_id: plan._id,
      status: 'active',
      start_at: start,
      end_at: end
    });

    request.status = 'activated';
    request.admin_id = request.admin_id || req.user._id;
    await request.save();

    res.json({ success: true, request, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/threads/by-request/:requestId', async (req, res) => {
  try {
    const thread = await SupportThread.findOne({ request_id: req.params.requestId })
      .populate('request_id', 'plan_code status admin_account_details admin_payment_method');
    if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });

    const userId = req.user._id.toString();
    const isClient = thread.client_id.toString() === userId;
    const isAdminUser = thread.admin_id.toString() === userId;

    if (!isClient && !isAdminUser) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, thread });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/threads/:threadId/messages', async (req, res) => {
  try {
    const thread = await SupportThread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });

    const userId = req.user._id.toString();
    const isClient = thread.client_id.toString() === userId;
    const isAdminUser = thread.admin_id.toString() === userId;

    if (!isClient && !isAdminUser) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = await SupportMessage.find({ thread_id: req.params.threadId })
      .populate('sender_id', 'full_name profile_picture_url role')
      .populate('receiver_id', 'full_name profile_picture_url role')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/threads/:threadId/messages', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'message is required' });

    const thread = await SupportThread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });

    const userId = req.user._id.toString();
    const isClient = thread.client_id.toString() === userId;
    const isAdminUser = thread.admin_id.toString() === userId;

    if (!isClient && !isAdminUser) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const receiver_id = isClient ? thread.admin_id : thread.client_id;

    const msg = await SupportMessage.create({
      thread_id: thread._id,
      sender_id: req.user._id,
      receiver_id,
      message
    });

    const populated = await SupportMessage.findById(msg._id)
      .populate('sender_id', 'full_name profile_picture_url role')
      .populate('receiver_id', 'full_name profile_picture_url role');

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
