const mongoose = require('mongoose');
const Product = require('../models/product');
const productsData = require('../data/product'); // your raw product data
require('dotenv').config();

const MONGODB_URI_MAIN = process.env.MONGODB_URI;

async function seedProducts() {
  try {
    await mongoose.connect(MONGODB_URI_MAIN);
    await Product.deleteMany({});
    await Product.insertMany(productsData);
    console.log('Product data seeded successfully!');
}
catch (error) {
    console.error('Error seeding user data:', error);
} finally {
    mongoose.disconnect();
}
}

seedProducts();
