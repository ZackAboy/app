const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getToken } = require('../controllers/tokenManager');

router.get('/', async (req, res) => {
    const artistId = req.query.artist_id;
    if (!artistId) {
        return res.status(400).json({ error: 'Missing artist ID' });
    }
    try {
        const token = await getToken();
        const response = await axios.get(`https://api.artsy.net/api/artworks`, {
            headers: { 'X-XAPP-Token': token },
            params: { artist_id: artistId, size: 10 }
        });
    
        // 👇 DEBUG LOG THIS
        console.log('Raw Artworks API Response:', JSON.stringify(response.data, null, 2));
    
        const artworks = (response.data._embedded?.artworks || []).map(artwork => ({
            id: artwork.id,
            title: artwork.title,
            date: artwork.date,
            image: artwork._links.thumbnail?.href || 'static/artsy_logo.svg'
        }));        
        res.json(artworks);
    } catch (err) {
        console.error('Artworks error:', err.message);
        res.status(500).json({ error: 'Failed to fetch artworks' });
    }    
});

module.exports = router;