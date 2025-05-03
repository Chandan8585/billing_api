const jwt = require("jsonwebtoken");
const User = require("../models/User");
require('dotenv').config();

const userAuth = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
console.log("Received Token:", token);

    // const { token } = req.cookies;
    console.log("Token from cookies:", token);

    if (!token) {
        return res.status(401).json({ message: "Token is not found" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        console.log("Decoded token:", decoded);

        const { _id } = decoded;
        const userData = await User.findById(_id);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = userData;  
        console.log("User found:", userData);
        next();

    } catch (error) {
        console.log("Token verification error:", error);
        return res.status(400).json({ message: "User token is invalid or expired" });
    }
};

module.exports = { userAuth };
