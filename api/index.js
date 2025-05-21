// api/index.js
require('dotenv').config()
const serverless = require('serverless-http');
const app = require('../index'); // Import your existing Express app
const connectDB = require('../config/database');

let dbConnected = false;

module.exports = async (req, res) => {
  if (!dbConnected) {
    await connectDB(); // Ensure MongoDB is connected once per cold start
    dbConnected = true;
  }

  return serverless(app)(req, res);
};
