# URL Shortener Service

A simple URL shortener service that creates short URLs.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## API Usage

### Shorten a URL
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/very/long/url"}'
```

The response will be in the format:
```json
{
  "originalUrl": "https://example.com/very/long/url",
  "shortUrl": "https://your-app.vercel.app/short/abc123"
}
```

### Access shortened URL
Simply visit the short URL in your browser, and you'll be redirected to the original URL.

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy to Vercel:
```bash
vercel
```

The application will be deployed to Vercel and you'll get a unique URL for your service.
