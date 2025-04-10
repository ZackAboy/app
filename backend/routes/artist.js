const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getToken } = require('../controllers/tokenManager');

router.get('/', async (req, res) => {
    const artistId = req.query.id;
    if (!artistId) return res.status(400).json({ error: 'Missing artist ID' });

    try {
        const token = await getToken();

        // Fetch main artist info
        const artistResponse = await axios.get(`https://api.artsy.net/api/artists/${artistId}`, {
            headers: { 'X-XAPP-Token': token }
        });

        const artist = artistResponse.data;

        // Fetch similar artists
        let similarArtists = [];
        if (artist._links?.similar_artists?.href) {
            try {
                const simResponse = await axios.get(artist._links.similar_artists.href, {
                    headers: { 'X-XAPP-Token': token }
                });
                similarArtists = simResponse.data._embedded.artists.map(sim => ({
                    id: sim.id,
                    name: sim.name,
                    image: sim._links?.thumbnail?.href || 'static/artsy_logo.svg'
                }));
            } catch (simErr) {
                console.warn('Similar artists fetch failed:', simErr.message);
            }
        }

        res.json({
            name: artist.name,
            birthday: artist.birthday,
            deathday: artist.deathday,
            nationality: artist.nationality,
            biography: artist.biography,
            image: artist._links?.thumbnail?.href || 'static/artsy_logo.svg',
            similarArtists
        });

    } catch (err) {
        console.error('Artist fetch error:', err.message);
        res.status(500).json({ error: 'Failed to fetch artist details' });
    }
});

module.exports = router;