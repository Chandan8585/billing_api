const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
      brandName: {
        type: String,
        required: true,
        trim: true
    },
    image: String,
    status: {
        type: String,
        default: 'active'
    },
}, { timestamps: true });

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;

  