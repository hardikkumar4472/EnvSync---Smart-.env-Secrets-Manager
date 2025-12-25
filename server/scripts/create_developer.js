require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/envsync_user.model');

const createDeveloper = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const userData = {
      email: 'developer@example.com',
      password: 'dev123456',
      role: 'developer'
    };

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log(`Developer user with email ${userData.email} already exists.`);
    } else {
      const user = new User(userData);
      await user.save();
      console.log('✓ Developer user created successfully!');
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  Password: dev123456');
    }

  } catch (error) {
    console.error('Error creating developer user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  }
};

createDeveloper();
