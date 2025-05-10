import { v2 as cloudinary } from 'cloudinary';
import express from 'express';
import fs from 'fs';
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
    
    
     
    
    // console.log(uploadResult);
    
    // // Optimize delivery by resizing and applying auto-format and auto-quality
    // const optimizeUrl = cloudinary.url('shoes', {
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });
    
    // console.log(optimizeUrl);
    
    // // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url('shoes', {
    //     crop: 'auto',
    //     gravity: 'auto',
    //     width: 500,
    //     height: 500,
    // });
    
    // console.log(autoCropUrl);    
};

uploadCloudinary(localFilePath);