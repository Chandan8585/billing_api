const mongoose = require('mongoose');
require("dotenv").config();

const CustomerSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
        
    },
    address: {
        type: String
    },
    mobile:{
        type: Number,
        required: true
    },
    phone:{
        type: Number
    },
    creditLimit:{
        type: Number
    }
}, { timestamps: true });



const Customer = mongoose.model("customer", CustomerSchema);
module.exports = Customer;
