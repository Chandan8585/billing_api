const express = require('express');
const User = require('../models/User');
const { userAuth } = require('../middlewares/userAuth');
const Customer = require('../models/Customer');
const customerRouter = express.Router();

customerRouter.get("/", userAuth, async (req, res) => {
    try {
        const customers = await Customer.find({})
        res.status(200).json({
            message: "Customer data fetched Successfully",
            data: customers            
        })
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});
customerRouter.get("/", userAuth, async (req, res) => {
    try {
        const customers = await Customer.find({})
        res.status(200).json({
            message: "Customer data fetched Successfully",
            data: customers            
        })
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

customerRouter.patch("/", userAuth, async (req, res)=>{
    try {  
        const customerId = req.body;
        const customerDetails = await Customer.findById(customerId);
        const allowedUpdates = ["customerName", "address", "mobile", "phone", "creditLimit"];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(field=> allowedUpdates.includes(field));
        if(!isValidOperation){
            return res.status(400).send({error: "Invalid updates!"});
        }
        updates.forEach(field=>{
            customerDetails[field] = req.body[field];
        })
        await user.save();
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});
customerRouter.post("/", userAuth, async()=> {
    try {  
        const customerId = req.body;
        const customerDetails = await Customer.findById(customerId);
        const allowedUpdates = ["customerName", "address", "mobile", "phone", "creditLimit"];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(field=> allowedUpdates.includes(field));
        if(!isValidOperation){
            return res.status(400).send({error: "Invalid updates!"});
        }
        updates.forEach(field=>{
            customerDetails[field] = req.body[field];
        })
        await user.save();
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
})
module.exports = {customerRouter};