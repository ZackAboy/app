const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getToken } = require('../controllers/tokenManager');

router.get('/', async (req, res) => {
    const artworkId = req.query.artwork_id;
    if (!artworkId) {
        return res.status(400).json({ error: 'Missing artwork ID' });
    }
    try {
        const token = await getToken();
        const response = await axios.get('https://api.artsy.net/api/genes', {
            headers: { 'X-XAPP-Token': token },
            params: { artwork_id: artworkId, size: 10 }
        });
        const categories = response.data._embedded.genes.map(gene => ({
            name: gene.name,
            image: gene._links.thumbnail.href
        }));
        res.json(categories);
    } catch (err) {
        console.error('Categories error:', err.message);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

module.exports = router;