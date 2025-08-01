const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Wait for the admin user to be created and log the result
    // await User.create({
    //   name: 'Admin',
    //   email: 'admin@example.com',
    //   password: 'password',
    //   role: 'admin',
    //   employeeId: 'ADMIN-001',
    //   token: 'admin-token'
    // });
    // console.log('Admin user created');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
