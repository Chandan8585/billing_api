const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
require("dotenv").config();

const UserSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true
    },
    warehouse: {
        type: String
    },
    store: {
        type: String
    },
    firstName: {
        type: String,   
        minlength: 3
    },
    lastName: {
        type: String,
        minlength: 3,
    },
    userName: {
        type: String      
    },
    role: {
        type: String,
        enum: ['admin', 'user' , 'manager', 'owner'],
        default: 'user'
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
    Address: {
        type: String,
        default: "This is default for streetAddress area"
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

UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);  
    }
    next();
});

UserSchema.methods.getJWT = async function() {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_KEY, { expiresIn: "1d" });
    return token;
};

UserSchema.methods.ValidatePassword = async function(passwordInputByUser) {
    const isPasswordValid = await bcrypt.compare(passwordInputByUser, this.password);
    return isPasswordValid;
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
