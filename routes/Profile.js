const express = require('express');
const User = require('../models/User');
const { userAuth } = require('../middlewares/userAuth');
const profileRouter = express.Router();
const { singleImage } = require('../middlewares/multer.middleware');
const { uploadCloudinary } = require('../utils/cloudinary.js');
const fs = require('fs');

// Get profile
profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user; // Changed from User to user (convention)
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

profileRouter.patch("/profile", userAuth, singleImage, async (req, res) => {
  try {
    const user = req.user;
    const allowedUpdates = ["firstName", "lastName", "Address", "mobile", "userName", "photoUrl"];

    // Handle image upload if present
    if (req.file) {
      try {
        const uploadResult = await uploadCloudinary(req.file.path);
        if (!uploadResult) {
          throw new Error("Failed to upload image");
        }
        req.body.photoUrl = uploadResult.secure_url;
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).send({ error: "Image upload failed" });
      }
    }

    // Get only the fields that were actually sent in the request
    const updates = Object.keys(req.body);
    
    // Validate fields are allowed
    const isValidOperation = updates.every(field => allowedUpdates.includes(field));
    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" });
    }

    // Only update the fields that were sent and have values
    updates.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        user[field] = req.body[field];
      }
    });

    // Only save if there are actual changes
    if (updates.length > 0 || req.file) {
      await user.save();
      return res.status(200).send({
        message: "Profile updated successfully",
        user: user
      });
    } else {
      return res.status(200).send({
        message: "No changes detected",
        user: user
      });
    }
  } catch (error) {
    console.error("Profile update error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).send({
      error: "Something went wrong",
      message: error.message
    });
  }
});

module.exports = { profileRouter };