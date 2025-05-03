const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
require("dotenv").config();

const SellerSchema = new mongoose.Schema({
    sellerName: {
        type: String,
        minlength: 3
    },
    shopName: {
        type: String,
        minlength: 3,
    },
    gst: {
        type: String      
    },
    email: { 
        type: String,
        unique: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Enter valid Email ID");
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    mobile:{
        type: Number,
        required: true
    },
    streetAddress: {
        type: String,
        default: "This is default for streetAddress area"
    },
    city: {
        type: String,
        default: "city"
    },
    state: {
        type: String,
        default: "state"
    },
    postal: {
        type: String,
        default: "pincode"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    photoUrl: {
        type: String,
        default: "https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?t=st=1735743812~exp=1735747412~hmac=6f7e2462ee2538c712035754bbcd0dea9d9bd789db583c78030cf2e0462e3add&w=740",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Enter valid photo Url");
            }
        }
    },
}, { timestamps: true });

SellerSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);  
    }
    next();
});

SellerSchema.methods.getJWT = async function() {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_KEY, { expiresIn: "1d" });
    return token;
};

SellerSchema.methods.ValidatePassword = async function(passwordInputBySeller) {
    const isPasswordValid = await bcrypt.compare(passwordInputBySeller, this.password);
    return isPasswordValid;
};

const Seller = mongoose.model("seller", SellerSchema);
module.exports = Seller;
