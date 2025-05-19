const asyncHandler = require("express-async-handler");
const Unit = require('../models/unit.js');
const sanitizeHtml = require('sanitize-html');
const mongoose = require('mongoose');
const fs = require('fs');
// Helper function to sanitize product input



exports.getUnitList = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [unit, total] = await Promise.all([
        Unit.find({})
          .skip(skip)
          .limit(limit)
          .lean(),
        Unit.countDocuments()
      ]);
    res.status(200).json({
        success: true,
        count: unit.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: unit
    });
});
exports.getUnitById = asyncHandler(async(req, res)=>{
       const _id = req.params.id;
    const unit = await Unit.findById(_id)
        .populate('category')
        .populate('createdBy');
    
    if (!unit) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }
    
    res.status(200).json({
        success: true,
        data: unit
    });
});

exports.addNewUnit = asyncHandler(async (req, res) => {    
    const { unitName, status, shortName } = req.body;
    
    // Validate required fields
    if (!unitName || typeof unitName !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Valid unit name is required'
        });
    }

    // Check for existing unit
    const existingUnit = await Unit.findOne({ unitName: unitName.trim() });
    if (existingUnit) {
        return res.status(400).json({
            success: false,
            message: 'Unit with this name already exists'
        });
    }

    // Prepare unit data with proper null checks
    const unitData = {
        unitName: sanitizeHtml((unitName || '').trim(), {
            allowedTags: [],
            allowedAttributes: {}
        }),
        status: status || 'active'
    };

    // Only add shortName if provided
    if (shortName) {
        unitData.shortName = sanitizeHtml(shortName.trim(), {
            allowedTags: [],
            allowedAttributes: {}
        });
    }

    // Create and save unit
    const unit = new Unit(unitData);
    const savedUnit = await unit.save();
    
    res.status(201).json({
        success: true,
        data: savedUnit
    });
});

