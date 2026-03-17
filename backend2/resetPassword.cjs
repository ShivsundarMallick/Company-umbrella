const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User');
const { umbrellaDb } = require('./config/db');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

async function resetAdminPassword() {
  try {
    console.log('resetting password...');
    const user = await User.findOne({ email: 'admin@company.com' });
    if (!user) {
      console.log('admin user not found!');
      process.exit(1);
    }
    
    user.password = 'password123';
    await user.save();
    console.log('Password for admin@company.com successfully reset to: password123');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password: ', err);
    process.exit(1);
  }
}

resetAdminPassword();
