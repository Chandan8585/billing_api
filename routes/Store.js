const express = require('express');
const Store = require('../models/store');
const { userAuth } = require('../middlewares/userAuth');
const storeRouter = express.Router();

storeRouter.get("/store-list", async(req, res)=> {
    try {
        const store = await Store.find({});
        res.status(200).json(store)
    } catch (error) {
        res.status(500).json({error: "Something went wrong"});
    }
})

module.exports = {storeRouter};