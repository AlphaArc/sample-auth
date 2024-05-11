const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require("../model/User");

// Register
router.post('/register',async (req, res) => {
    const { email, password, name, isAdmin ,visibility} = req.body;

    try {
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Create a new user
        const newUser = new User({ email, password, name, isAdmin,visibility });
        await newUser.save();

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Login
router.post('/login', passport.authenticate('local'),async (req, res) => {
    return res.status(200).json({ message: 'Login successful' });
});

// Logout
router.get('/logout', async(req, res) => {
    req.logout();
    return res.status(200).json({ message: 'Logout successful' });
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    return res.redirect('/profile');
});

module.exports = router;
