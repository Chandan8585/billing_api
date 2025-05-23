const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    quantity: { type: Number, required: true },
    saleRate: { type: Number, required: true },
    productName: { type: String },
    productCategory: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  billNumber: { type: Number, unique: true }, 
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  amount: {
    subtotal: { type: Number, required: true },
    gst: { type: Number, required: true },
    serviceTax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
}, { timestamps: true });

// Pre-save hook for billNumber (atomic increment)
orderSchema.pre('save', async function () {
  if (!this.isNew || this.billNumber) return; // Skip if not new or billNumber exists
  
  const lastOrder = await Order.findOne().sort({ billNumber: -1 }).lean();
  this.billNumber = lastOrder ? lastOrder.billNumber + 1 : 1;
});

// Pre-save hook for total calculation (sync)
orderSchema.pre('save', function () {
  const { subtotal, gst, serviceTax, discount } = this.amount;
  this.amount.total = subtotal + gst + serviceTax - discount;
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;