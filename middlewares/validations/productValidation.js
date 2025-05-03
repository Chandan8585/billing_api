const { body, validationResult } = require('express-validator');
const Product = require('../../models/product');
const mongoose = require('mongoose');
exports.validateProduct = [
    body('productName').trim().notEmpty().withMessage('product Name is required')
        .isLength({ max: 100 }).withMessage('product Description must be less than 100 characters'),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('saleRate').isFloat({ gt: 0 }).withMessage('saleRate must be greater than 0'),
    body('quantity').isInt({ gt: -1 }).withMessage('Quantity must be 0 or greater'),
    body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number (decimals allowed)'),
    body('category').isMongoId().withMessage('Invalid category ID'),
    body('image.*').isURL().withMessage('Image must be a valid URL'),
    body('gstRate').optional().isFloat({ min: 0, max: 100 })
        .withMessage('GST rate must be between 0 and 100'),
    body('expiry').optional().isISO8601().toDate(),
    body('manufacturedDate').optional().isISO8601().toDate(),
    
    // Custom validation
    body().custom(async (value, { req }) => {
        // Check if category exists
        const categoryExists = await mongoose.model('Category').exists({ _id: req.body.category });
        if (!categoryExists) {
            throw new Error('Category does not exist');
        }
        
        
        return true;
    }),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];