    const express = require('express');
    const connectDB = require('./config/database');
    // const user = require('./models/user');
    // const Order = require('./models/order');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const { userAuth } = require('./middlewares/userAuth');
const authRouter = require('./routes/Auth');
const { profileRouter } = require('./routes/Profile');
const cartRouter = require('./routes/Cart');
const { categoryRouter } = require('./routes/Category');
const productRoutes = require('./routes/ProductRoutes');
const { customerRouter } = require('./routes/Customer');
const Counter = require('./models/counter');
const { storeRouter } = require('./routes/Store');
require('dotenv').config()
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    const corsOptions = {
        origin: '*', // Allow all origins
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Common methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Basic headers
      };
      
      app.use(cors(corsOptions));
    app.use(express.urlencoded({ extended: true }));
app.use("/", authRouter);
app.use("/user", profileRouter); 
app.use("/store", storeRouter);
app.use("/cart", cartRouter);
app.use("/category", categoryRouter);
app.use("/product", productRoutes);
app.use("/customer", customerRouter);
app.post('/orders', userAuth, async (req, res) => {
    const { dishId, quantity } = req.body;   
    try {
        const dish = await Product.findById(dishId);  
        if (!dish) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const totalPrice = dish.price * quantity;
        const newOrder = new Order({
            user: req.user._id,  
            dish: dishId,
            quantity,
            totalPrice,
            status: 'pending'  
        });
        await newOrder.save();  
        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
});
app.get('/counter', async(req, res)=>{
    try {
        const counter = await Counter.find({});
        res.status(200).json({
        counter
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

app.get('/', (req, res) => res.send('API Running!'));

connectDB().then(()=>app.listen(5001, ()=>{

    console.log("running on port 5001");
    })
    )