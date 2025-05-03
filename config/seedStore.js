const mongoose = require('mongoose');
const Store = require('../models/store');
const seedStoreData = require('../data/storeData');

require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;
async function seedStoreDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        await Store.deleteMany({});
        await Store.insertMany(seedStoreData);
        console.log('Store data seeded successfully!');
    } catch (error) {
        console.error('Error seeding store data:', error);
    } finally {
        mongoose.disconnect();
    }
}   
seedStoreDatabase();