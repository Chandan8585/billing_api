const express = require('express');
const User = require('../models/User');
const validateSignup = require('../utils/validateSignup');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const { userAuth } = require('../middlewares/userAuth');
require("dotenv").config();
const jwt = require("jsonwebtoken");

authRouter.post('/signup', async(req, res)=>{ 
    try { 
        const isUserDataSafe = await validateSignup(req);
        if(isUserDataSafe){
            const {email, password, mobile, company} = req.body;
            const userObject = {
                email,
                password,
                mobile,
                company
            };
            const newUser = new User(userObject);
          await newUser.save();
          res.status(200).json({message: "Your Account has been created successfully, Now you are being redirected to Login page"});
        }else{
            res.status(200).json({message: "Enter Valid Details"});
        }
    }
      catch (error) {
        res.status(401).json({message: error.message});
    }
})

authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for email:", email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found!");
            return res.status(400).json({ message: "User not found. Please sign up first." });
        }

        console.log("User found:", user);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("Password validation result:", isPasswordValid);

        if (!isPasswordValid) {
            console.log("Incorrect password!");
            return res.status(400).json({ message: "Incorrect password." });
        }

        const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_KEY, { expiresIn: "100d" });
        console.log("JWT Token generated:", token);

        res.cookie("token", token, {
            httpOnly: true,  
            secure: true,   // Must be true if using SameSite=None
            sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000 
        });
    
        res.status(200).json({
            message: "Login successful!",   
            user: {
            // id: user._id,
            photoUrl: user.photoUrl,
            email: user.email,
            company: user.company,
            store: user.store,
            warehouse: user.warehouse,
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            role: user.role,
            mobile: user.mobile,
            Address: user.Address
          } });
    
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});



authRouter.post('/logout', async(req , res)=>{
    try {
        res.cookie("token", null, {expires: new Date(Date.now())});
        res.send("Logout Successfull!!!");
    } catch (error) {
        res.status(401).send(error.message);
    }
});

authRouter.post('/forgotPassword', async(req , res)=>{
    try {
        res.cookie("token", null, {expires: new Date(Date.now())});
        res.send("Logout Successfull!!!");
    } catch (error) {
        res.status(401).send(error.message);
    }
});

authRouter.get('/verify', userAuth ,async (req, res)=> {
      try {
        req.user.isVerifed = true;
      } catch (error) {
        res.status(500).send("Failed to verify the user.");
      }
}) 



module.exports = authRouter;