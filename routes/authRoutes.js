const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require("../model/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');


// Register
router.post('/register', async (req, res) => {
    const { email, password, name, isAdmin, visibility } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

        const newUser = new User({ email, password: hashedPassword, name, isAdmin, visibility });
        await newUser.save();

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log({ email, password });
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log("isPasswordValid " + isPasswordValid);

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Logout
router.get('/logout', async(req, res) => {
    req.logout();
    return res.status(200).json({ message: 'Logout successful' });
});

router.get('/users', authMiddleware, async (req, res) => {
    try {
        console.log(req.user.isAdmin);
        if (req.user.isAdmin) {
            const users = await User.find();
            return res.status(200).json(users);
        } else {
            const users = await User.find({ visibility: 'public' });
            return res.status(200).json(users);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    return res.redirect('/profile');
});

module.exports = router;
