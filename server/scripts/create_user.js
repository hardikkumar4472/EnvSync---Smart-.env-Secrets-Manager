require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/envsync_user.model');

const createUser = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const userData = {
      email: 'hardikm332004@gmail.com',
      password: '123456',
      role: 'admin'
    };

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log(`User with email ${userData.email} already exists.`);
    } else {
      const user = new User(userData);
      await user.save();
      console.log('User created successfully:', user.email);
    }

  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  }
};

createUser();
