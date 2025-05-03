    const mongoose = require('mongoose');
    const User = require('../models/User');
    const usersData = require('../data/userData');
    const bcrypt = require('bcrypt');
    require('dotenv').config();
    const MONGODB_URI = process.env.MONGODB_URI;   
    async function seedUserData() {
        try {
            await mongoose.connect(MONGODB_URI);
            await User.deleteMany({});
            await User.insertMany(usersData);
            console.log('User data seeded successfully!');
        }
        catch (error) {
            console.error('Error seeding user data:', error);
        } finally {
            mongoose.disconnect();
        }
    }
    seedUserData();