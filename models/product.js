const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');
const productSchema = new mongoose.Schema({
    sku: {type: String},
    productId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Validate format like "PID-0001"
        return /^[A-Z]+-\d+$/.test(v);
      },
      message: props => `${props.value} is not a valid productId format (e.g., PID-0001)`
     }
    },
    store: {type: String},
    warehouse: {type: String},
    gstType: {type: Boolean},
    gstRate: {type: Number},
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    description: {type: String,
        set: (value) => sanitizeHtml(value, {
            allowedTags: [], 
            allowedAttributes: {}
        }),
        maxlength: 2000
    },
    quantity: {type: Number},
    quantityAlert: {type: Number},
    discountType: { type: String, enum: ['percentage', 'fixed', null] },
    discountValue: {type: Number},
    warratyType: {type: String},
    warrantyPeriod: {type: Number},
    manufacturedDate: { type: Date },
    expiry: { type: Date, validate: {
        validator: function(value) {
            return !this.manufacturedDate || value > this.manufacturedDate;
        },
        message: 'Expiry date must be after manufacture date'
    }},
    barcodeSymbology: {type: String},
    itemCode: {type: String},
    productName: { type: String, required: true },
    saleRate: { type: Number, required: true },
    available: { type: Number },
    discount: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' ,required: true },
    thumbnail: {type: String},
    // Image: {type: String},
    image: { type: Array, 
    default: ['https://plus.unsplash.com/premium_photo-1681702307633-a27a52914043?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'] 
    },
    rating: {
        type: {
          rate: { type: Number, min: 1, max: 5 },
          count: { type: Number, min: 0 }
        },
        default: { rate: 0, count: 0 } // Optional
      },
    fastMoving: { type: Boolean },
    hsn: { type: String },
    slug: {type: String},
    counter: { type: String },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit'  },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
