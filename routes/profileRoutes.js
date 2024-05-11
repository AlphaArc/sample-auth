const express = require('express');
const router = express.Router();
const User = require("../model/User");
const multer = require('multer');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Rename the file to avoid conflicts
  }
});

// Initialize multer upload middleware
const upload = multer({ storage: storage });

// Middleware for authorization
const { isAdmin, isNormalUser } = require('../middleware/authMiddleware');

// Profile details
router.get('/:userId', async(req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user profile details
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Edit profile
router.put('/:userId', async(req, res) => {
    const userId = req.params.userId;
    const { name, bio, phone, email, password } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name;
        user.bio = bio;
        user.phone = phone;
        user.email = email;
        user.password = password; // Password should be hashed before saving

        await user.save();

        return res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Upload photo
router.post('/:userId/photo', upload.single('photo'), async (req, res) => {
    const userId = req.params.userId;
    const photo = req.file;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save photo URL or file path to user profile
    user.photo = photo.path; // Assuming 'photo' is the field name in the form
    await user.save();

    return res.status(200).json({ message: 'Photo uploaded successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle profile visibility (public/private)
router.put('/:userId/visibility', async(req, res) => {
    const userId = req.params.userId;
    const { visibility } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update profile visibility
        user.visibility = visibility;

        await user.save();

        return res.status(200).json({ message: 'Profile visibility updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
