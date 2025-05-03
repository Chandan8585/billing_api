const mongoose = require("mongoose");
require('dotenv').config()
MONGODB_URI_MAIN = process.env.MONGODB_URI;
const connectDB = async ()=>{
    await mongoose.connect(MONGODB_URI_MAIN);
}

connectDB().then(()=>{
    console.log("Database connected successfully");

}).catch((err)=>{
      console.log(err);
});
module.exports = connectDB;
