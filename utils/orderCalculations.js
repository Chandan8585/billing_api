
const Cart = require("../models/cart");
const Product = require("../models/product");

const calculateOrderTotals = async (userId) => {
    const cartItems = await Cart.find({ user: userId }).populate('product');
    
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;
  
    for (const cartItem of cartItems) {
      const product = cartItem.product;
      const quantity = cartItem.quantity;
      const saleRate = product.saleRate || 0;
  
      // Discount calculation
      let discountAmount = 0;
      if (product.discountType === 'percentage') {
        discountAmount = (saleRate * product.discountValue) / 100;
      } else if (product.discountType === 'fixed') {
        discountAmount = product.discountValue;
      }
  
      const discountedPrice = saleRate - discountAmount;
  
      // GST calculation
      let gstAmount = 0;
      if (product.gstType === false) {
        gstAmount = (discountedPrice * product.gstRate) / 100; // GST exclusive
      } else {
        gstAmount = discountedPrice - (discountedPrice * 100) / (100 + product.gstRate); // GST inclusive
      }
  
      const finalRatePerUnit = product.gstType === false 
        ? discountedPrice + gstAmount 
        : discountedPrice;
  
      const lineTotal = finalRatePerUnit * quantity;
  
      subtotal += lineTotal;
      totalTax += gstAmount * quantity;
      totalDiscount += discountAmount * quantity;
    }
  
    return {
      subtotal: Math.round((subtotal - totalTax) * 100) / 100,
      tax: Math.round(totalTax * 100) / 100,
      discount: Math.round(totalDiscount * 100) / 100,
      total: Math.round(subtotal * 100) / 100,
      cartItems // Return cart items for order creation
    };
  };
  
  module.exports = { calculateOrderTotals };