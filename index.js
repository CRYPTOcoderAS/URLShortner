const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json());

const PORT = 3000;
const URLS_FILE = path.join(__dirname, 'urls.json');
const BASE_URL = 'rupeek.co/short';

// Initialize URLs file if it doesn't exist
async function initializeUrlsFile() {
    try {
        await fs.access(URLS_FILE);
    } catch {
        await fs.writeFile(URLS_FILE, JSON.stringify({}));
    }
}

// Read URLs from file
async function readUrls() {
    const data = await fs.readFile(URLS_FILE, 'utf8');
    return JSON.parse(data);
}

// Write URLs to file
async function writeUrls(urls) {
    await fs.writeFile(URLS_FILE, JSON.stringify(urls, null, 2));
}

// POST endpoint to create short URL
app.post('/shorten', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Generate short ID
        const shortId = nanoid(6);
        const shortUrl = `${BASE_URL}/${shortId}`;

        // Read existing URLs
        const urls = await readUrls();

        // Save the mapping
        urls[shortId] = {
            originalUrl: url,
            shortUrl,
            createdAt: new Date().toISOString()
        };

        // Write back to file
        await writeUrls(urls);

        res.json({
            originalUrl: url,
            shortUrl
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
        const urls = await readUrls();

        if (!urls[shortId]) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        res.redirect(urls[shortId].originalUrl);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Initialize and start the server
async function startServer() {
    await initializeUrlsFile();
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer();
