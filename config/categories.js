const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName : {
        type: String,
        required: true, 
    },
    subCategory: {
        type: String
    },
    description: {
        type: String
    },
    icon: { 
        type: String, 
        required: true, 
    }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
