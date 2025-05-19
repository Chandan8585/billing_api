const asyncHandler = require("express-async-handler");
const Product = require("../models/product");
const Brand = require('../models/brand.js');
const sanitizeHtml = require('sanitize-html');
const Category = require("../models/categories");
const mongoose = require('mongoose');
const { uploadCloudinary } = require('../utils/cloudinary.js');
const fs = require('fs');
// Helper function to sanitize product input



exports.getBrandList = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [brand, total] = await Promise.all([
        Brand.find({})
          .skip(skip)
          .limit(limit)
          .lean(),
        Brand.countDocuments()
      ]);
    res.status(200).json({
        success: true,
        count: brand.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: brand
    });
});
exports.getBrandById = asyncHandler(async(req, res)=>{
       const _id = req.params.id;
    const brand = await Brand.findById(_id)
        .populate('category')
        .populate('createdBy');
    
    if (!brand) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }
    
    res.status(200).json({
        success: true,
        data: brand
    });
});

exports.addNewBrand = asyncHandler(async (req, res) => {    
    // For formData, the fields come in req.body, but files come in req.file(s)
    const { brandName, status } = req.body;
    
    // Validate required fields
    if (!brandName) {
        return res.status(400).json({
            success: false,
            message: 'Brand name is required'
        });
    }

    // Prepare brand data
    const brandData = {
        brandName: sanitizeHtml(brandName.trim(), {
            allowedTags: [],
            allowedAttributes: {}
        }),
        status: status || 'active' // default status if not provided
    };

    // Handle image upload if present
    if (req.file) {
        try {
            const uploadResult = await uploadCloudinary(req.file.path);
            if (!uploadResult) throw new Error("Failed to upload image");
            brandData.image = uploadResult.secure_url;
            fs.unlinkSync(req.file.path);
        } catch (uploadError) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({ 
                success: false,
                error: "Image upload failed",
                message: uploadError.message 
            });
        }
    }

    // Create and save brand
    const brand = new Brand(brandData);
    const savedBrand = await brand.save();
    
    res.status(201).json({
        success: true,
        data: savedBrand
    });
});


