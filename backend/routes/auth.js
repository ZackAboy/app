const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Middleware to check if user is logged in
const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware to block access if already logged in
const blockIfAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return next();

    try {
        jwt.verify(token, JWT_SECRET);
        return res.status(403).json({ message: 'Already logged in' });
    } catch {
        return next(); // Allow if token is invalid/expired
    }
};

// POST /api/auth/signup
router.post('/signup', blockIfAuthenticated, async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id, email }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            maxAge: 3600000 // 1 hour
        }).status(201).json({ message: 'Signup successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// POST /api/auth/login
router.post('/login', blockIfAuthenticated, async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, email }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            maxAge: 3600000 // 1 hour
        }).status(200).json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict'
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// GET /api/auth/verify
router.get('/verify', authenticate, (req, res) => {
    res.status(200).json({ message: 'User is logged in', email: req.user.email });
});

// POST /api/auth/delete
router.post('/delete', authenticate, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict'
        });
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Error deleting account:', err);
        res.status(500).json({ message: 'Server error during account deletion' });
    }
});

module.exports = router;