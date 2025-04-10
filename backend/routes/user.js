const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const axios = require('axios');  // Import axios

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

    const alreadyExists = user.favorites.some(fav => fav.artistId === artistId);
    if (alreadyExists) {
      return res.status(409).json({ message: 'Artist already in favorites' });
    }

    // Fetch full artist bio from your own API
    const response = await axios.get(`http://localhost:8080/api/artist?id=${artistId}`);
    const artist = response.data;

    if (!artist || !artist.name) {
      return res.status(404).json({ message: 'Artist details not found' });
    }

    // Format birth-death string
    const birthDeath = artist.birthday || artist.deathday
      ? `${artist.birthday || ''}${artist.deathday ? ' - ' + artist.deathday : ''}`
      : '';

    user.favorites.push({
      artistId,
      name: artist.name,
      image: artist.image,
      nationality: artist.nationality,
      birthDeath,
      addedAt: new Date()
    });

    await user.save();
    res.status(200).json({ message: 'Artist added to favorites' });
  } catch (err) {
    console.error(err);
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
    const index = user.favorites.findIndex(fav => fav.artistId.toString() === artistId);
    if (index === -1) {
      return res.status(404).json({ message: 'Artist not found in favorites' });
    }

    user.favorites.splice(index, 1);
    await user.save();
    res.status(200).json({ message: 'Artist removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error removing from favorites' });
  }
});

// GET /api/user/favorites
router.get('/favorites', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Create an array of favorites with artist data and addedAt time
    const favoritesWithDetails = user.favorites.map(fav => ({
      artistId: fav.artistId,
      name: fav.name,
      image: fav.image,
      nationality: fav.nationality,
      birthDeath: fav.birthDeath,
      addedAt: fav.addedAt
    }));    

    res.status(200).json(favoritesWithDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});

module.exports = router;