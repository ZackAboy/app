const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getToken } = require('../controllers/tokenManager');

router.get('/', async (req, res) => {
    const artistId = req.query.id;
    if (!artistId) {
        return res.status(400).json({ error: 'Missing artist ID' });
    }
    try {
        const token = await getToken();
        const response = await axios.get(`https://api.artsy.net/api/artists/${artistId}`, {
            headers: { 'X-XAPP-Token': token }
        });
        const data = response.data;
        res.json({
            name: data.name,
            birthday: data.birthday,
            deathday: data.deathday,
            nationality: data.nationality,
            biography: data.biography
        });
    } catch (err) {
        console.error('Artist error:', err.message);
        res.status(500).json({ error: 'Failed to fetch artist details' });
    }
});

module.exports = router;