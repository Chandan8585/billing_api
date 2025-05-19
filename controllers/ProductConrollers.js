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
          'productId', 'thumbnail', 'Image',
          'productName', 'description', 'saleRate', 'quantity', 'category',
          'sku', 'store', 'warehouse', 'gstType', 'gstRate', 'brand', 
          'quantityAlert', 'discountType', 'discountValue', 'warrantyType',
          'warrantyPeriod', 'manufacturedDate', 'expiry', 'barcodeSymbology',
          'itemCode', 'discount', 'image', 'fastMoving', 'counter', 'unit',
            'hsnCode', 'subCategory', 'warranty','manufacturer'
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

exports.addNewProduct = asyncHandler(async (req, res) => {
    // Directly use the request body without sanitization
    const productData = req.body;
    
    // Handle file upload if present
    if (req.file) {
        try {
            const uploadResult = await uploadCloudinary(req.file.path);
            
            // Add image URLs to product data
            productData.thumbnail = uploadResult.secure_url;
            productData.image = [uploadResult.secure_url];
            
            // Clean up temp file
            fs.unlinkSync(req.file.path);
        } catch (uploadError) {
            // Clean up temp file if upload fails
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(500).send({ 
                success: false,
                error: "Image upload failed" 
            });
        }
    }
    
    try {
        // Create and save product
        const product = new Product(productData);
        const savedProduct = await product.save();
        
        res.status(201).json({
            success: true,
            data: savedProduct
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});
exports.generateProductId = asyncHandler(async (req, res) => {
  try {
    const prefix = req.query.prefix || 'PID'; // Default prefix for productId
    const digits = req.query.digits || 4; // Default digits (e.g., PID-0001)
    
    // Find the last product with a matching productId pattern
    const lastProduct = await Product.findOne({
      productId: new RegExp(`^${prefix}-\\d+$`)
    }).sort({ productId: -1 }); // Sort descending to get the latest

    let nextNumber = 1;
    if (lastProduct) {
      const lastNumber = parseInt(lastProduct.productId.replace(`${prefix}-`, ''));
      nextNumber = lastNumber + 1;
    }

    const newProductId = `${prefix}-${nextNumber.toString().padStart(digits, '0')}`;
    res.json({ productId: newProductId });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.getProductList = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
        Product.find({})
          .populate('brand')
          .populate('unit')
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
        .populate('brand')
        .populate('unit')
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
exports.deleteProductById = asyncHandler(async (req, res) => {
    const _id = req.params.id;

    const product = await Product.findById(_id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
        });
    }

    await product.deleteOne(); // or Product.findByIdAndDelete(_id)

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
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