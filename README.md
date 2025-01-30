# URL Shortener Service

A simple URL shortener service that creates short URLs with the format `rupeek.co/short/[shortId]`.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
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
  "shortUrl": "rupeek.co/short/abc123"
}
```

### Access shortened URL
Simply visit the short URL in your browser, and you'll be redirected to the original URL.
