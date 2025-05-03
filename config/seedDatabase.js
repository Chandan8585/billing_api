
const mongoose = require('mongoose');
const Product = require('../models/product');
const menuItems = require('../data/product');
// const menuItems = require('../data/categories');
// const Product = require('../models/categories');
require('dotenv').config()
MONGODB_URI_MAIN = process.env.MONGODB_URI;
async function seedDatabase() {
    try {
        await mongoose.connect(MONGODB_URI_MAIN);

        await Product.deleteMany({});

        await Product.insertMany(menuItems);

        console.log('Database seeded with mock dish data!');
    } catch (error) {
        console.log('Error seeding the database:', error);
    } finally {
        mongoose.disconnect();
    }
}

seedDatabase();
