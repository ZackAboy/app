const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getToken } = require('../controllers/tokenManager');

router.get('/', async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: 'Missing search query' });
    }

    try {
        const token = await getToken();

        const response = await axios.get('https://api.artsy.net/api/search', {
            headers: { 'X-XAPP-Token': token },
            params: { q: query, size: 10, type: 'artist' }
        });

        const results = response.data._embedded.results
            .filter(item => item.type === 'artist')
            .map(item => {
                const id = item._links.self.href.split('/').pop();
                const thumbnail = item._links.thumbnail?.href?.includes('missing_image.png')
                    ? 'static/artsy_logo.svg'
                    : item._links.thumbnail?.href;

                return {
                    id,
                    name: item.title,
                    image: thumbnail
                };
            });

        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
});

module.exports = router;