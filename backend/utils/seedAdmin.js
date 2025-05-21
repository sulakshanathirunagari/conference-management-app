// utils/seedAdmin.js
const User = require('../models/User');

/**
 * Creates the default admin user if no admin exists
 */
const seedAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user using environment variables
    const admin = await User.create({
      fullName: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
    });
    
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

module.exports = seedAdminUser;