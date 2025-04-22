require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const Url = require('./models/Url');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI ;
const BASE_URL = 'https://urlpeek.vercel.app';

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.post('/api/shorten', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (err) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        const shortId = nanoid(6);
        const shortUrl = `${BASE_URL}/rupeek/${shortId}`;

        const urlDoc = new Url({
            shortId,
            originalUrl: url,
            shortUrl,
        });

        await urlDoc.save();
        console.log(`Created short URL: ${shortUrl} for ${url}`);

        res.json({
            originalUrl: url,
            shortUrl,
            shortId,
            createdAt: urlDoc.createdAt
        });
    } catch (error) {
        console.error('Error in /api/shorten:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/rupeek/:shortId', async (req, res) => {
    try {
        const { shortId } = req.params;
        console.log(`Attempting to redirect shortId: ${shortId}`);
        
        const url = await Url.findOne({ shortId });
        console.log('Found URL:', url);

        if (!url) {
            console.log(`No URL found for shortId: ${shortId}`);
            return res.status(404).json({ error: 'URL not found' });
        }

        url.clicks += 1;
        await url.save();

        console.log(`Redirecting to: ${url.originalUrl}`);
        return res.redirect(301, url.originalUrl);
    } catch (error) {
        console.error('Error in redirect:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/stats/:shortId', async (req, res) => {
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
        console.error('Error in stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Catch-all route for debugging
app.use('*', (req, res) => {
    console.log(`404: ${req.method} ${req.url}`);
    res.status(404).json({ error: 'Route not found' });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
