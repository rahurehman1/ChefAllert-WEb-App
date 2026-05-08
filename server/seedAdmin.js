const mongoose = require('mongoose');
const User = require('./models/User'); // ✅ Direct User model import
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // MongoDB connection
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chef_alert');
    
    console.log('📡 MongoDB connected...');

    // Delete existing admin (if any)
    await User.deleteOne({ email: 'admin@chefalert.com' });
    console.log('🗑️ Old admin deleted (if existed)');

    // ✅ IMPORTANT: Direct User model ka instance banayein
    // Ye automatically User.js ke pre-save hook se hash hojayega
    const adminUser = new User({
      email: 'admin@chefalert.com',
      password: 'admin123', // ✅ Plain password - User.js hash karega
      full_name: 'Super Admin',
      role: 'admin',
      phone_number: '+911234567890',
      address: '123 Admin Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip_code: '400001',
      profile_picture_url: ''
    });

    // Save admin user
    await adminUser.save();
    
    console.log('\n🎉 ADMIN USER CREATED SUCCESSFULLY!');
    console.log('====================================');
    console.log('📧 Email: admin@chefalert.com');
    console.log('🔑 Password: admin123');
    console.log('🎭 Role: admin');
    console.log('👤 Name: Super Admin');
    console.log('====================================\n');

    // ✅ Verify hash
    const savedAdmin = await User.findOne({ email: 'admin@chefalert.com' });
    console.log('✅ Password hash saved:', savedAdmin.password.substring(0, 20) + '...');
    
    // ✅ Test password compare
    const isMatch = await savedAdmin.comparePassword('admin123');
    console.log('✅ Password match test:', isMatch ? 'PASSED ✅' : 'FAILED ❌');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

// Run the function
seedAdmin();