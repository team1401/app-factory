# ViralCheck Backend

Production-ready Express backend for AI Persona Focus Group testing.

## Features

- ✅ OpenAI + Anthropic SDK integration
- ✅ Per-request API key handling via headers
- ✅ Fallback to .env API keys for callers with `SERVER_ACCESS_TOKEN`
- ✅ CORS, Helmet security, rate limiting
- ✅ Comprehensive error handling
- ✅ 30 diverse personas per audience type
- ✅ Batch processing for efficiency
- ✅ Detailed voting simulation with reactions

## API Endpoints

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

### `POST /api/generate-personas`
Generate 30 AI personas for the selected audience.

**Headers (optional):**
- `X-AI-Provider`: `openai` or `anthropic`
- `X-AI-API-Key`: Your API key
- `X-Access-Token`: Required to use the server's .env keys when `X-AI-API-Key` is not provided

Requests with neither a client key nor a valid access token get `401`.

**Request:**
```json
{
  "audience": "hacker-news"
}
```

**Supported audiences:**
- `hacker-news`
- `product-hunt`
- `reddit-technology`
- `twitter-tech`
- `linkedin-business`
- `general-public`

**Response:**
```json
{
  "personas": [
    {
      "name": "Alex",
      "background": "Senior Software Engineer at FAANG",
      "interests": ["distributed systems", "Rust", "performance optimization"],
      "traits": ["skeptical of marketing hype", "values technical depth"],
      "votingPattern": "critical"
    }
    // ... 29 more
  ]
}
```

### `POST /api/test-content`
Test content against personas and get virality score.

**Headers (optional):**
- `X-AI-Provider`: `openai` or `anthropic`
- `X-AI-API-Key`: Your API key
- `X-Access-Token`: Required to use the server's .env keys when `X-AI-API-Key` is not provided

`content` is limited to 2000 characters and `personas` to 1-30 entries; larger requests get `400`.

**Request:**
```json
{
  "content": "I Built an AI That Predicts Viral Posts with 60% Accuracy",
  "personas": [...] // Array of 30 personas from generate-personas
}
```

**Response:**
```json
{
  "viralityScore": 67,
  "avgInterest": 7.3,
  "distribution": {
    "wouldEngage": 20,
    "wouldNotEngage": 10
  },
  "topReactions": [
    {
      "persona": "Alex",
      "reaction": "Interesting approach but needs more technical detail."
    }
    // ... 7 more
  ],
  "suggestions": [
    "Add specific metrics or methodology details",
    "Reduce clickbait tone, focus on novel approach",
    "Include open-source code or reproducible results"
  ],
  "votes": [...] // All 30 individual votes
}
```

## Environment Variables

Create a `.env` file:

```env
PORT=3100
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SERVER_ACCESS_TOKEN=change-me  # required for callers to use the keys above
NODE_ENV=production
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Docker

```bash
docker build -t viralcheck-backend .
docker run -p 3100:3100 --env-file .env viralcheck-backend
```

## Rate Limiting

- 100 requests per 15 minutes per IP
- Applied to all `/api/*` endpoints

## Security

- Helmet.js for HTTP headers
- CORS enabled
- Input validation
- Error sanitization in production
- API keys never logged

## Architecture

- **Persona Templates**: 6 predefined audience types with curated traits and backgrounds
- **Batch Processing**: Processes 10 personas at a time for efficiency
- **Dual AI Support**: Seamless switching between OpenAI and Anthropic
- **Server Key Access**: Uses .env keys only for callers sending a valid `X-Access-Token`; otherwise BYOK is required
