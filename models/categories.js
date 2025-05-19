const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryCode: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    subCategory: [{ type: String }],
    thumbnail: {
        type: String,
    }
}, { timestamps: true });

// Pre-save hook to generate categoryCode
categorySchema.pre('validate', async function(next) {
    if (this.isNew && !this.categoryCode) {
        try {
            const lastCategory = await Category.findOne({}, {}, { sort: { 'createdAt': -1 } });
            
            let lastCode = 0;
            if (lastCategory && lastCategory.categoryCode) {
                // Extract the numeric part from the last code (assuming format like "CAT001")
                const codeMatch = lastCategory.categoryCode.match(/(\d+)$/);
                if (codeMatch) {
                    lastCode = parseInt(codeMatch[1], 10);
                }
            }
            
            // Generate new code with leading zeros (e.g., CAT001, CAT002, etc.)
            this.categoryCode = `CAT${String(lastCode + 1).padStart(3, '0')}`;
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;