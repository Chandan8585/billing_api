const express = require('express');
const Category = require('../models/categories');
const { userAuth } = require('../middlewares/userAuth');
const categoryRouter = express.Router();
const sanitizeHtml = require('sanitize-html');

// Helper function to sanitize product input
const sanitizeCategoryInput = (body, user) => {
    const allowedFields = [
        'name', 'description', 'price', 'originalPrice', 'quantity', 'category',
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
    sanitized.createdBy = user._id;
    
    return sanitized;
};
categoryRouter.get("", async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

categoryRouter.get('/generate-category-code', async (req, res) => {
    try {
      const prefix = req.query.prefix || 'CAT'; 
      const digits = req.query.digits || 4;    
      
      const lastCategory = await Category.findOne({
        categoryCode: new RegExp(`^${prefix}-\\d+$`)
      }).sort('-categoryCode');
  
      let nextNumber = 1;
      if (lastCategory) {
        const lastNumber = parseInt(lastCategory.categoryCode.replace(`${prefix}-`, ''));
        nextNumber = lastNumber + 1;
      }
  
      const newCode = `${prefix}-${nextNumber.toString().padStart(digits, '0')}`;
      res.json({ code: newCode });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

categoryRouter.patch("/category", userAuth, async (req, res)=>{
    console.log("Request Body:", req.body);
console.log("Request Headers:", req.headers);

    try {   
        const user = req.user;
        const allowedUpdates = ["photoUrl", "postal", "state", "city", "streetAddress", "shopName", "userName", "gst"];

        
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(field=> allowedUpdates.includes(field));
        if(!isValidOperation){
            return res.status(400).send({error: "Invalid updates!"});
        }
        updates.forEach(field=>{
            user[field] = req.body[field];
        })
        await user.save();
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ error: "Something went wrong" });
    }
});

categoryRouter.patch("/", userAuth, async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const allowedUpdates = ["name", "subCategory", "icon"];

    if (!id) {
      return res.status(400).send({ error: "Category ID is required" });
    }

    const updates = Object.keys(updateData);
    const isValidOperation = updates.every(field => allowedUpdates.includes(field));
    
    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    }

    updates.forEach(field => {
      category[field] = updateData[field];
    });

  
    const updatedCategory = await category.save();
    res.status(200).send(updatedCategory);

  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).send({ 
      error: "Something went wrong",
      details: error.message 
    });
  }
});


categoryRouter.post("/add-category", userAuth, async (req, res)=>{
    try {  
        const categoryData = sanitizeCategoryInput(req.body, req.user);

        const newCategory = new Category(categoryData);
        const savedCategory = await newCategory.save();
        res.status(201).json({
            message: "Category created successfully",
            data: savedCategory
        });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send({ error: "Something went wrong" });
    }
  });
module.exports = {categoryRouter};