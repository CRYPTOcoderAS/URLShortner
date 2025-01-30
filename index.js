require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const Url = require('./models/Url');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener';
const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:9000}`;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// POST endpoint to create short URL
app.post('/shorten', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Generate short ID
        const shortId = nanoid(6);
        const shortUrl = `${BASE_URL}/rupeek/${shortId}`;

        // Save to MongoDB
        const urlDoc = new Url({
            shortId,
            originalUrl: url,
            shortUrl,
        });

        await urlDoc.save();

        res.json({
            originalUrl: url,
            shortUrl,
            shortId,
            createdAt: urlDoc.createdAt
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint to redirect short URLs
app.get('/short/:shortId', async (req, res) => {
    try {
        const { shortId } = req.params;
        const url = await Url.findOne({ shortId });

        if (!url) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        // Increment clicks
        url.clicks += 1;
        await url.save();

        res.redirect(url.originalUrl);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint to get URL stats
app.get('/stats/:shortId', async (req, res) => {
    try {
        const { shortId } = req.params;
        const url = await Url.findOne({ shortId });

        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }

        res.json({
            shortId: url.shortId,
            originalUrl: url.originalUrl,
            shortUrl: url.shortUrl,
            clicks: url.clicks,
            createdAt: url.createdAt
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
