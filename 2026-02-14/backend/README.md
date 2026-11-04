# PaperPlain Backend

AI Research Paper Explainer API

## Setup

1. Copy `.env.example` to `.env` and add your API keys
2. Run `npm install`
3. Run `npm start`

## API Endpoints

### POST /api/explain

Explain a research paper using AI.

**Request body:**
```json
{
  "arxivUrl": "https://arxiv.org/abs/2402.12345" // OR
  "text": "raw paper text" // OR upload PDF as multipart/form-data
}
```

**Headers:**
- `X-AI-Provider`: `openai` or `anthropic`
- `X-AI-API-Key`: Your API key (required unless you send the access token below)
- `Authorization: Bearer <PAPERPLAIN_ACCESS_TOKEN>`: use the server's own API keys instead

Requests are rate limited per IP (`RATE_LIMIT_MAX` per `RATE_LIMIT_WINDOW_MS`), PDF uploads are capped at `MAX_UPLOAD_BYTES` (default 10 MB) and `text` at `MAX_TEXT_LENGTH` characters (default 50,000).

**Response:**
```json
{
  "title": "Paper Title",
  "authors": "Author Names",
  "tldr": "One sentence summary",
  "keyFindings": ["Finding 1", "Finding 2"],
  "methodology": "How they did it",
  "implications": "Why it matters",
  "eli5": "Simple explanation",
  "relatedWork": ["Paper 1", "Paper 2"]
}
```

### GET /health

Health check endpoint.

## Docker

```bash
docker build -t paperplain-backend .
docker run -p 3108:3108 --env-file .env paperplain-backend
```
