const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    company : {
        type: String,
        required: true, 
    },
    warehouse: {
        type: String
    },
    store: {
        type: String
    },
    createBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User' ,required: true 
    }
}, { timestamps: true });

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
