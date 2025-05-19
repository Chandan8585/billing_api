const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
    unitName: {
        type: String,
        required: true, 
        unique: true 
    },
    shortName: {
        type: String,
        
    },
    productCount: { 
        type: Number,
         default: 0 
    },
    Status: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;

  