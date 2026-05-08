const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const User = require('./models/User');
const ChefProfile = require('./models/ChefProfile');
const Booking = require('./models/Booking');
const Message = require('./models/Message');
const Review = require('./models/Review');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5373", "http://localhost:5175"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chef_alert')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.log('❌ MongoDB connection error:', err.message);
  });

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5373", "http://localhost:5175"],
    methods: ["GET", "POST"]
  }
});

const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        message: 'No token provided',
        path: req.path 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('❌ Invalid token - user not found');
      return res.status(401).json({ 
        message: 'Invalid token',
        decodedUserId: decoded.userId 
      });
    }

    req.user = user;
    console.log('✅ Authenticated user:', user._id);
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ 
      message: 'Invalid token',
      error: error.message 
    });
  }
};

const multer = require('multer');

const uploadsDir = path.join(__dirname, 'uploads/profile-pictures');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/test', (req, res) => {
  console.log('✅ Test route called');
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    routes: [
      '/test',
      '/health',
      '/api/auth/signup',
      '/api/auth/login',
      '/api/auth/me',
      '/api/auth/profile',
      '/api/upload/profile-picture',
      '/api/chefs/profile',
      '/api/chefs',
      '/api/bookings',
      '/api/reviews',
      '/api/chat/booking/:id/details',
      '/api/admin/stats'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/debug/uploads', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    
    const fileDetails = files.map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      const url = `http://${req.get('host')}/uploads/profile-pictures/${file}`;
      
      return {
        filename: file,
        size: stats.size,
        created: stats.birthtime,
        url: url,
        accessible: true
      };
    });
    
    res.json({
      success: true,
      uploadsDir: uploadsDir,
      exists: fs.existsSync(uploadsDir),
      totalFiles: files.length,
      files: fileDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', auth, require('./routes/admin'));
app.use('/api/subscriptions', auth, require('./routes/subscriptions'));
app.use('/api/support', auth, require('./routes/support'));

app.use('/api/chefs', require('./routes/chefs'));

app.put('/api/auth/profile', auth, async (req, res) => {
  try {
    const { full_name, phone_number, address, city, state, zip_code } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { full_name, phone_number, address, city, state, zip_code },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    let is_pro = false;
    try {
      const UserSubscription = require('./models/UserSubscription');

      await UserSubscription.updateMany(
        {
          user_id: user._id,
          status: 'active',
          end_at: { $ne: null, $lt: new Date() }
        },
        { $set: { status: 'expired' } }
      );

      const activeSub = await UserSubscription.findOne({ user_id: user._id, status: 'active' }).populate('plan_id');
      const planCode = activeSub?.plan_id?.code;
      is_pro = planCode === 'pro_monthly' || planCode === 'pro_yearly';
    } catch (e) {
      is_pro = false;
    }

    console.log('👤 GET /api/auth/me - User fetched:', {
      id: user._id,
      email: user.email,
      profile_picture_url: user.profile_picture_url
    });

    res.json({ user: { ...user.toObject(), is_pro } });
  } catch (error) {
    console.error('❌ GET /api/auth/me error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/upload/profile-picture', auth, upload.single('profile_picture'), async (req, res) => {
  try {
    console.log('📸 Profile picture upload request');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileName = req.file.filename;
    const fullUrl = `${protocol}://${host}/uploads/profile-pictures/${fileName}`;

    console.log('📁 File uploaded:', fileName);
    console.log('🔗 Generated URL:', fullUrl);
    console.log('🌐 Base URL:', `${protocol}://${host}`);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profile_picture_url: fullUrl },
      { new: true }
    ).select('-password');

    console.log(`✅ Profile picture updated for user: ${user._id}`);
    console.log(`📸 User profile_picture_url saved: ${user.profile_picture_url}`);

    const filePath = path.join(uploadsDir, fileName);
    const fileExists = fs.existsSync(filePath);

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profile_picture_url: fullUrl,
      debug: {
        filename: fileName,
        file_exists: fileExists,
        file_size: req.file.size,
        url_accessible: true
      },
      user: user
    });
  } catch (error) {
    console.error('❌ Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
});

app.delete('/api/delete/profile-picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.profile_picture_url) {
      return res.status(400).json({ 
        success: false, 
        message: 'No profile picture to delete' 
      });
    }

    const urlParts = user.profile_picture_url.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    if (filename) {
      const filePath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ File deleted: ${filename}`);
      }
    }

    user.profile_picture_url = null;
    await user.save();

    console.log(`✅ Profile picture deleted for user: ${user._id}`);
    
    res.json({
      success: true,
      message: 'Profile picture deleted successfully',
      user: user
    });
  } catch (error) {
    console.error('❌ Delete profile picture error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete profile picture',
      error: error.message 
    });
  }
});

app.get('/api/profile/picture-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('profile_picture_url');
    
    console.log('📸 Picture status for user:', {
      id: user._id,
      hasProfilePicture: !!user.profile_picture_url,
      url: user.profile_picture_url
    });
    
    res.json({
      success: true,
      hasProfilePicture: !!user.profile_picture_url,
      profile_picture_url: user.profile_picture_url
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get picture status',
      error: error.message 
    });
  }
});

app.get('/api/test-image/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ 
      success: false, 
      message: 'File not found' 
    });
  }
  
  res.sendFile(filePath);
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_booking', (bookingId) => {
    socket.join(`booking_${bookingId}`);
    console.log(`User ${socket.id} joined booking ${bookingId}`);
  });

  socket.on('send_message', (data) => {
    const { bookingId, senderId, receiverId, message } = data;
    const messageData = {
      booking_id: bookingId,
      sender_id: senderId,
      receiver_id: receiverId,
      message,
      timestamp: new Date()
    };
    
    io.to(`booking_${bookingId}`).emit('new_message', messageData);
    console.log(`Message sent in booking ${bookingId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Frontend URLs: http://localhost:5173 & http://localhost:5373`);
  console.log(`✅ Test your server: http://localhost:${PORT}/test`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Available Routes:`);
  console.log(`   Auth:    POST http://localhost:${PORT}/api/auth/signup`);
  console.log(`   Auth:    POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   Auth:    GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`   Profile: PUT  http://localhost:${PORT}/api/auth/profile`);
  console.log(`   Upload:  POST http://localhost:${PORT}/api/upload/profile-picture`);
  console.log(`   Delete:  DELETE http://localhost:${PORT}/api/delete/profile-picture`);
  console.log(`   Debug:   GET  http://localhost:${PORT}/api/debug/uploads`);
  console.log(`   Chef:    GET  http://localhost:${PORT}/api/chefs/profile`);
  console.log(`   Chef:    PUT  http://localhost:${PORT}/api/chefs/profile`);
  console.log(`   Chefs:   GET  http://localhost:${PORT}/api/chefs (PUBLIC)`);
  console.log(`\n📸 Profile Picture Upload: Enabled`);
  console.log(`   Max Size: 5MB, Formats: JPG, PNG, GIF, WEBP`);
  console.log(`   Uploads Dir: ${uploadsDir}`);
  console.log(`   Static files served from: ${path.join(__dirname, 'uploads')}`);
});