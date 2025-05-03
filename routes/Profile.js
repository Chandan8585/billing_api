const express = require('express');
const User = require('../models/User');
const {userAuth} = require('../middlewares/userAuth');
const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
    try {
        const User = req.User; 
        res.status(200).json(User);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});


profileRouter.patch("/profile", userAuth, async (req, res)=>{
    console.log("Request Body:", req.body);
console.log("Request Headers:", req.headers);

    try {   
        const User = req.User;
        const allowedUpdates = ["photoUrl", "postal", "state", "city", "streetAddress", "shopName", "UserName", "gst"];

        
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(field=> allowedUpdates.includes(field));
        if(!isValidOperation){
            return res.status(400).send({error: "Invalid updates!"});
        }
        updates.forEach(field=>{
            User[field] = req.body[field];
        })
        await User.save();
        res.status(200).send(User);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

module.exports = {profileRouter};