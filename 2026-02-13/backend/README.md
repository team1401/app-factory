# Agent Rep Check - Backend API

Backend service for Agent Rep Check - Monitor what AI agents are saying about you online.

## Features

- ✅ **BYOK Support** - Bring Your Own Keys via headers (`X-AI-Provider`, `X-AI-API-Key`)
- ✅ **Multi-Provider AI** - OpenAI, Anthropic, and Ollama support
- ✅ **GitHub Integration** - Search issues, PRs, and commits
- ✅ **Web Search** - Brave Search API integration (optional)
- ✅ **Sentiment Analysis** - AI-powered sentiment and hostility detection
- ✅ **Rate Limiting** - Prevent abuse with configurable limits
- ✅ **Caching** - Cache search results for better performance

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Search for Mentions
```
POST /api/search
Headers:
  X-AI-Provider: openai|anthropic|ollama (optional)
  X-AI-API-Key: your_api_key (optional)
  X-GitHub-Token: your_github_token (optional)
  X-Brave-API-Key: your_brave_key (optional)

Body:
{
  "name": "John Doe",
  "username": "johndoe",
  "sources": ["github", "web"]
}

Response:
{
  "mentions": [...],
  "riskScore": 0-100,
  "timeline": [...],
  "totalMentions": 5,
  "searchQuery": "johndoe",
  "timestamp": "2026-02-13T..."
}
```

### Analyze Specific Content
```
POST /api/analyze
Headers:
  X-AI-Provider: openai|anthropic|ollama (optional)
  X-AI-API-Key: your_api_key (optional)

Body:
{
  "url": "https://example.com/article",
  "content": "text to analyze" // optional, url takes priority
}

Response:
{
  "sentiment": "positive|neutral|negative|hostile",
  "isHostile": false,
  "claims": ["claim 1", "claim 2"],
  "summary": "Brief summary of content",
  "analyzedAt": "2026-02-13T...",
  "sourceUrl": "https://..."
}
```

## Environment Variables

See `.env.example` for all available configuration options.

**Key variables:**
- `PORT` - Server port (default: 3001)
- `SERVER_KEYS_ACCESS_TOKEN` - Shared secret; server-side keys below are only used for requests sending a matching `X-App-Token` header
- `MAX_ANALYZED_MENTIONS` - Max mentions sent for AI analysis per search (default: 20)
- `OPENAI_API_KEY` - OpenAI API key (fallback if BYOK not provided)
- `ANTHROPIC_API_KEY` - Anthropic API key (fallback)
- `OLLAMA_BASE_URL` - Ollama endpoint (default: http://localhost:11434)
- `GITHUB_TOKEN` - GitHub personal access token
- `BRAVE_SEARCH_API_KEY` - Brave Search API key (optional)

## BYOK (Bring Your Own Keys)

Users can provide their own API keys via headers, which take priority over environment variables. Environment keys (and Ollama) are only used when the request also sends `X-App-Token` matching `SERVER_KEYS_ACCESS_TOKEN`; otherwise requests without the needed keys get `401`.

- `X-AI-Provider`: `openai`, `anthropic`, or `ollama` (other values return `400`)
- `X-App-Token`: Operator access token that allows use of server-side keys
- `X-AI-API-Key`: Your API key for the selected provider
- `X-GitHub-Token`: GitHub personal access token
- `X-Brave-API-Key`: Brave Search API key

This allows users to use their own API quotas without sharing keys with the server.

## Running Locally

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your keys (optional)

# Start server
npm start
```

## Docker Build

```bash
docker build -t agent-rep-check-backend .
docker run -p 3001:3001 --env-file .env agent-rep-check-backend
```

## Rate Limiting

Default: 100 requests per 15 minutes per IP address.

Configure via environment variables:
- `RATE_LIMIT_WINDOW_MS` - Time window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window

## Caching

Search results are cached for 1 hour by default to reduce API calls and improve performance.

Configure via `CACHE_TTL_SECONDS` environment variable.

## AI Provider Fallback

If the selected AI provider fails, the service automatically falls back to Ollama (if available), and finally returns a default neutral sentiment if all providers fail.

Priority order:
1. BYOK provider (from headers)
2. Environment variable provider (requires `X-App-Token`)
3. Ollama fallback (requires `X-App-Token`)
4. Default neutral response

## Error Handling

All endpoints include comprehensive error handling:
- Invalid requests return 400 status
- Authentication errors return 401 status
- Rate limiting returns 429 status
- Server errors return 500 status with error details (in development mode)

## Security Notes

- Never commit `.env` files to git
- Use BYOK headers for sensitive API keys
- Rate limiting prevents abuse
- CORS enabled for frontend integration
- Input validation on all endpoints
