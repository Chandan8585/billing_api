const express = require('express');
const { userAuth } = require('../middlewares/userAuth'); // Middleware for user authentication
const Cart = require('../models/cart'); // Cart model
const Product = require('../models/product'); // Product model
const { calculateOrderTotals } = require('../utils/orderCalculations');
const { mongoose } = require('mongoose');
const Order = require('../models/order');
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
    const { subtotal, tax, discount, total } = await calculateOrderTotals(req.user._id);
    
    res.status(200).json({ subtotal, tax, discount, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to calculate totals" });
  }
});
const createOrder = async (userId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get populated cart items
        const cartItems = await Cart.find({ user: userId })
            .populate('product')
            .session(session);

        if (!cartItems.length) {
            throw new Error("Cart is empty");
        }

        // Prepare order items with all required fields
        const orderItems = cartItems.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            saleRate: item.saleRate,
            productName: item.product.productName,
            productCategory: item.product.category.name   

        }));

        // Calculate totals
        const subtotal = cartItems.reduce((sum, item) => 
            sum + (item.saleRate * item.quantity), 0);
        const gst = subtotal * 0.18;
        const discount = 0;
        const total = subtotal + gst - discount;

        // Create order
        const order = new Order({
            user: userId,
            items: orderItems,
            amount: {
                subtotal: Math.round(subtotal * 100) / 100,
                gst: Math.round(gst * 100) / 100,
                serviceTax: 0,
                discount: Math.round(discount * 100) / 100,
                total: Math.round(total * 100) / 100
            }
        });

        await order.save({ session });
        await Cart.deleteMany({ user: userId }, { session });
        await session.commitTransaction();
        
        return order;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
// Usage in route:
cartRouter.post('/create-order', userAuth, async (req, res) => {
    try {
      const order = await createOrder(req.user._id); // Pass items to createOrder
      
      res.status(201).json({
        success: true,
        order: {
          billNumber: order.billNumber,
          items: order.items, // Include items in response
          amount: order.amount,
          date: order.createdAt
        }
      });
    } catch (error) {
      console.error('[Order Error]', error);
      const statusCode = error.message.includes("empty") ? 400 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
});
cartRouter.get('/get-all-orders', async(req, res) => {
    try {
        const allOrders = await Order.find({})
            .populate("user")
            .populate({
                path: "items.product",
                model: "Product",
                select: "name price images category" // Include needed fields
            });

        res.status(200).json({
            success: true,
            data: allOrders
        });
    } catch (error) {
        console.error('[Order Error]', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// cartRouter.get("/orderList", )
module.exports = cartRouter;
