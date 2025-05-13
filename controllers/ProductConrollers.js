const asyncHandler = require("express-async-handler");
const Product = require("../models/product");
const sanitizeHtml = require('sanitize-html');
const Category = require("../models/categories");
const mongoose = require('mongoose');
const { uploadCloudinary } = require('../utils/cloudinary.js');
const fs = require('fs');
// Helper function to sanitize product input
const sanitizeProductInput = (body, user) => {
    const allowedFields = [
        'productName', 'description', 'saleRate', 'quantity', 'category',
        'sku', 'store', 'warehouse', 'gstType', 'gstRate', 'brand', 
        'quantityAlert', 'discountType', 'discountValue', 'warrantyType',
        'warrantyPeriod', 'manufacturedDate', 'expiry', 'barcodeSymbology',
        'itemCode', 'discount', 'image', 'fastMoving', 'hsn', 'counter', 'unit'
    ];
    
    const sanitized = {};
    
    allowedFields.forEach(field => {
        if (body[field] !== undefined) {
            if (typeof body[field] === 'string') {
                sanitized[field] = sanitizeHtml(body[field], {
                    allowedTags: [],
                    allowedAttributes: {}
                }).trim();
            } else {
                sanitized[field] = body[field];
            }
        }
    });
    
    // Set server-controlled fields
    // sanitized.createdBy = user._id;
    
    return sanitized;
};

exports.generateSkuCode = asyncHandler(async(req, res)=> {
   try {
    const prefix = req.query.prefix || 'PT';
    const digits = req.query.digits || 3;
    const lastSku = await Product.findOne({
        sku: new RegExp(`^${prefix}-\\d+$`)
    }).sort('-sku');
    let nextNumber = 1;
    if(lastSku){
        const lastNumber = parseInt(lastSku.sku.replace(`${prefix}-`, ''));
        nextNumber = lastNumber + 1;
    }
    const newCode = `${prefix}-${nextNumber.toString().padStart(digits, '0')}`;
    res.json({code: newCode});
   } catch (err) {
     res.status(500).json({error: err.message});
   }
})

exports.getProductList = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
        Product.find({})
          .populate('category') 
          .populate('createdBy') 
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments()
      ]);
      
    
    res.status(200).json({
        success: true,
        count: products.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: products
    });
});
exports.getProductById = asyncHandler(async(req, res)=>{
       const _id = req.params.id;
    const product = await Product.findById(_id)
        .populate('category')
        .populate('createdBy');
    
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }
    
    res.status(200).json({
        success: true,
        data: product
    });
});
exports.getCategoryList = asyncHandler(async (req, res) => {
    const categories = await Category.find({}, 'name description');
    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    });
});

exports.addNewProduct = asyncHandler(async (req, res) => {
    // Sanitize and prepare product data
    const productData = sanitizeProductInput(req.body, req.user);
    
    if (req.file) {
      try {
        const uploadResult = await uploadCloudinary(req.file.path);

        if (!uploadResult) {
          throw new Error("Failed to upload image");
        }

        req.body.thumbnail = uploadResult.secure_url;

        // Delete the temporary file
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).send({ error: "Image upload failed" });
      }
    }
    // Create and save product
    const product = new Product(productData);
    const savedProduct = await product.save();
    
    res.status(201).json({
        success: true,
        data: savedProduct
    });
});



exports.filterProduct = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = {};

  // Handle category filtering
  if (category && category !== 'all') {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    } else {
      const cat = await Category.findOne({ name: { $regex: `^${category}$`, $options: 'i' } });      if (cat) {
        filter.category = cat._id;
      } else {
        return res.status(404).json({ success: false, message: "Category not found" });
      }
    }
  }

  // Handle search filtering
  if (search) {
    filter.$or = [
      { productName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const products = await Product.find(filter).populate('category', 'name');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});