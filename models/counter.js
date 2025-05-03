const mongoose = require('mongoose');
const counterSchema = new mongoose.Schema({
    name: {type: String}
}, {
    timestamps: true
});
const Counter = mongoose.model("Counter", counterSchema);
module.exports = Counter;