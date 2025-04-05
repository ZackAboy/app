const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Middleware to authenticate JWT
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

// GET /api/user/login - Gravatar & mock profile
router.get('/login', (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: 'Missing email address' });
  }

  const hash = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`;

  const user = {
    name: email.split('@')[0],
    email: email,
    avatar: gravatarUrl
  };

  return res.json(user);
});

// POST /api/user/favorites/add
router.post('/favorites/add', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { artistId } = req.body;

  if (!artistId) {
    return res.status(400).json({ message: 'Artist ID is required' });
  }

  try {
    const user = await User.findById(userId);
    if (user.favorites.includes(artistId)) {
      return res.status(409).json({ message: 'Artist already in favorites' });
    }

    user.favorites.push(artistId);
    await user.save();
    res.status(200).json({ message: 'Artist added to favorites' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to favorites' });
  }
});

// POST /api/user/favorites/remove
router.post('/favorites/remove', authenticate, async (req, res) => {
  const userId = req.user.id;
  const { artistId } = req.body;

  if (!artistId) {
    return res.status(400).json({ message: 'Artist ID is required' });
  }

  try {
    const user = await User.findById(userId);
    const index = user.favorites.indexOf(artistId);
    if (index === -1) {
      return res.status(404).json({ message: 'Artist not found in favorites' });
    }

    user.favorites.splice(index, 1);
    await user.save();
    res.status(200).json({ message: 'Artist removed from favorites' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from favorites' });
  }
});

module.exports = router;