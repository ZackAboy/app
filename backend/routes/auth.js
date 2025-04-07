const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// ✅ Middleware to check if user is logged in
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

// ✅ Block access to login/signup if already logged in
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

// ✅ POST /api/auth/signup
router.post('/signup', blockIfAuthenticated, async (req, res) => {
    const { fullname, email, password } = req.body;

    // Basic field validation
    if (!fullname || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate SHA256 hash for Gravatar
        const hash = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
        const profileImageUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`;

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
            profileImageUrl
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id, email }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000 // 1 hour
        }).status(201).json({ message: 'Signup successful' });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Server error during signup' });
    }
});

// ✅ POST /api/auth/login
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
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000 // 1 hour
        }).status(200).json({ message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// ✅ POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// ✅ GET /api/auth/verify
router.get('/verify', authenticate, (req, res) => {
    res.status(200).json({ message: 'User is logged in', email: req.user.email });
});

// ✅ POST /api/auth/delete
router.post('/delete', authenticate, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Error deleting account:', err);
        res.status(500).json({ message: 'Server error during account deletion' });
    }
});

module.exports = router;