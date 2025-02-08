const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const Url = require('../models/Url');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Url.deleteMany({});
});

describe('URL Shortener API', () => {
    describe('POST /shorten', () => {
        it('should create a short URL', async () => {
            const response = await request(app)
                .post('/shorten1')
                .send({ url: 'https://example.com' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('shortUrl');
            expect(response.body).toHaveProperty('shortId');
            expect(response.body.originalUrl).toBe('https://example.com');
        });

        it('should return 400 if URL is not provided', async () => {
            const response = await request(app)
                .post('/shorten')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('URL is required');
        });
    });

    describe('GET /short/:shortId', () => {
        it('should redirect to original URL', async () => {
            // First create a short URL
            const createResponse = await request(app)
                .post('/shorten')
                .send({ url: 'https://example.com' });

            const shortId = createResponse.body.shortId;

            // Then try to access it
            const response = await request(app)
                .get(`/short/${shortId}`)
                .send();

            expect(response.status).toBe(302); // Redirect status code
            expect(response.header.location).toBe('https://example.com');
        });

        it('should return 404 for non-existent shortId', async () => {
            const response = await request(app)
                .get('/short/nonexistent')
                .send();

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Short URL not found');
        });
    });

    describe('GET /stats/:shortId', () => {
        it('should return URL statistics', async () => {
            // First create a short URL
            const createResponse = await request(app)
                .post('/shorten')
                .send({ url: 'https://example.com' });

            const shortId = createResponse.body.shortId;

            // Access the URL to increment clicks
            await request(app).get(`/short/${shortId}`);

            // Get stats
            const response = await request(app)
                .get(`/stats/${shortId}`)
                .send();

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('clicks', 1);
            expect(response.body.originalUrl).toBe('https://example.com');
            expect(response.body.shortId).toBe(shortId);
        });

        it('should return 404 for non-existent shortId stats', async () => {
            const response = await request(app)
                .get('/stats/nonexistent')
                .send();

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('URL not found');
        });
    });

    describe('GET /health', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .send();

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ status: 'ok' });
        });
    });
});
