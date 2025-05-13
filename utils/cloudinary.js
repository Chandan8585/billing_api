const cloudinary = require('cloudinary').v2;
const express = require('express');
const fs = require('fs');
require('dotenv').config();

    // Configuration
    cloudinary.config({ 
        cloud_name: 'drmn35dgj', 
        api_key: '716459894998266', 
        api_secret: process.env.API_SECRET
    });
const uploadCloudinary = async function(localFilePath) {

    try {
        if(!localFilePath) return null;
        // Upload an image
     const uploadResult = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto"
     })
     console.log("file is uploaded on cloudinary", uploadResult.url);
     return uploadResult;
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null;
        // console.log(error);
    }
};

module.exports = { uploadCloudinary };