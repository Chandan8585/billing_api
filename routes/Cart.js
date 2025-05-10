const express = require('express');
const { userAuth } = require('../middlewares/userAuth'); // Middleware for user authentication
const Cart = require('../models/cart'); // Cart model
const Product = require('../models/product'); // Product model

const cartRouter = express.Router();

// Get cart items
cartRouter.get('', userAuth, async (req, res) => {
    try {
        const userId = req.user._id; // Extract user ID from the authenticated request
        const cart = await Cart.find({ user: userId }).populate('product'); // Populate product details
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch cart items" });
    }
});

// Add product to cart
cartRouter.post('/add', userAuth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check if the product already exists in the cart
        const existingCartItem = await Cart.findOne({ user: userId, product: productId });

        if (existingCartItem) {
            existingCartItem.quantity += quantity;
            await existingCartItem.save();
        } else {
            const newCartItem = new Cart({
                user: userId,
                product: productId,
                saleRate: product.saleRate,
                quantity
            });
            
            await newCartItem.save();
        }
        const updatedCart = await Cart.find({ user: userId }).populate('product');
        res.status(200).json({ 
            message: "Product added to cart successfully", 
            cart: updatedCart 
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to add product to cart" });
    }
});

// Remove product from cart
cartRouter.delete('/product/:productId', userAuth, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        await Cart.deleteOne({ user: userId, product: productId });
        res.status(200).json({ message: "Product removed from cart successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove product from cart" });
    }
});
cartRouter.delete('/empty', userAuth, async (req, res) => {
    try {
        // const { productId } = req.params;
        const userId = req.user._id;

       const result = await Cart.deleteMany({ user: userId});
       if(result.deletedCount == 0){
        return res.status(404).json({ message: "No cart items found for this user" });
       }
        res.status(200).json({ message: "All Products removed from cart successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove product from cart" });
    }
});
// Increase product quantity

cartRouter.patch('/:productId', userAuth, async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req.user._id;
  
      const cartItem = await Cart.findOne({ user: userId, product: productId }).populate("product");
      if (!cartItem) {
        return res.status(404).json({ message: "Product not in cart", data: 0 });
      }
  
      if (quantity <= 0) {
        await Cart.deleteOne({ user: userId, product: productId });
        return res.status(200).json({ message: "Product removed from cart", data: 0 });
      }
  
      cartItem.quantity = quantity;
      await cartItem.save();
      return res.status(200).json({ message: "Quantity updated", data: cartItem.quantity });
    } catch (error) {
      console.error("Cart update error:", error);
      return res.status(500).json({ error: "Failed to update cart" });
    }
  });
  


// Decrease product quantity
cartRouter.post('/cart/:productId', userAuth, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const cartItem = await Cart.findOne({ user: userId, product: productId }).populate("product");
        if (cartItem) {
            if (cartItem.quantity === 1) {
                await Cart.deleteOne({ user: userId, product: productId });
                res.status(200).json({ message: "Product removed from cart successfully", data: 0 });
            } else {
                cartItem.quantity -= 1;
                await cartItem.save();
                res.status(200).json({ message: "Product quantity decreased successfully", data: cartItem.quantity });
            }
        } else {
            
            return res.status(200).json({ message: "Product already removed from cart", data: 0 });
        }
    } catch (error) {
        
        res.status(500).json({ error: "Failed to decrease product quantity" });
    }
});

// Calculate cart totals
cartRouter.get('/totals', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const cartItems = await Cart.find({ user: userId }).populate('product');

        let subtotal = 0;
        let totalTax = 0;
        let totalDiscount = 0;

        for (const cartItem of cartItems) {
            const product = cartItem.product;
            const quantity = cartItem.quantity;
            let saleRate = product.saleRate || 0;

            let discountAmount = 0;
            if (product.discountType === 'percentage') {
                discountAmount = (saleRate * product.discountValue) / 100;
            } else if (product.discountType === 'fixed') {
                discountAmount = product.discountValue;
            }

            const discountedPrice = saleRate - discountAmount;

            // Calculate GST
            let gstAmount = 0;
            if (product.gstType === false) {
                // GST exclusive — add GST
                gstAmount = (discountedPrice * product.gstRate) / 100;
            } else {
                // GST inclusive — extract GST
                gstAmount = discountedPrice - (discountedPrice * 100) / (100 + product.gstRate);
            }

            const finalRatePerUnit = product.gstType === false
                ? discountedPrice + gstAmount
                : discountedPrice;

            const lineTotal = finalRatePerUnit * quantity;

            subtotal += lineTotal;
            totalTax += gstAmount * quantity;
            totalDiscount += discountAmount * quantity;
        }

        const total = subtotal;

        res.status(200).json({
            subtotal: Math.round((subtotal - totalTax) * 100) / 100,
            tax: Math.round(totalTax * 100) / 100,
            discount: Math.round(totalDiscount * 100) / 100,
            total: Math.round(total * 100) / 100,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to calculate totals" });
    }
});


module.exports = cartRouter;
