const mongoose = require('mongoose');
const Category = require('../models/categories'); 
const categoriesData = require('../data/categoryData');
require('dotenv').config();
const MONGO_DB_URI = process.env.MONGODB_URI;
const seedCategories = async () => {
    try {
        await mongoose.connect(MONGO_DB_URI);
        await Category.deleteMany({});
        await Category.insertMany(categoriesData);
        console.log('Categories seeded successfully!');
    } catch (error) {
        console.error('Error seeding categories:', error);
    }
    finally {
 
        mongoose.disconnect();
    }                        
};

seedCategories();


