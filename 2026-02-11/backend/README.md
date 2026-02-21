# VulnScout Backend

Production-ready Node.js + Express backend for VulnScout - AI-Powered Dependency Vulnerability Scanner.

## Features

- 🔍 **Multi-format Support**: Parse npm, pip, Go, and Ruby dependency files
- 🛡️ **OSV.dev Integration**: Real-time vulnerability scanning using open-source vulnerability database
- 🤖 **AI Analysis**: Plain-English explanations using OpenAI or Anthropic Claude
- ⚡ **Fast & Async**: Non-blocking scan processing with progress tracking
- 🔥 **Production Ready**: CORS, error handling, logging, health checks, graceful shutdown
- 🐳 **Docker Support**: Full containerization with Docker Compose

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express 4
- **APIs**: OSV.dev, OpenAI/Anthropic
- **Storage**: In-memory (Map-based)

## Quick Start

### Prerequisites

- Node.js 20+ 
- npm
- OpenAI API key OR Anthropic API key

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start the server**:
   ```bash
   npm start
   # or for auto-reload during development:
   npm run dev
   ```

4. **Verify health**:
   ```bash
   curl http://localhost:3100/health
   # Should return: {"status":"ok"}
   ```

### Docker Deployment

1. **Create .env file**:
   ```bash
   cp .env.example .env
   # Edit with your API keys
   ```

2. **Build and run**:
   ```bash
   docker-compose up -d
   ```

3. **Check logs**:
   ```bash
   docker-compose logs -f
   ```

4. **Check health**:
   ```bash
   docker-compose exec backend wget -qO- http://localhost:3100/health
   ```

## API Endpoints

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

### Create Scan
```bash
POST /api/scan
Content-Type: application/json

{
  "fileName": "package.json",
  "fileContent": "{ \"dependencies\": { \"express\": \"^4.18.0\" } }"
}
```

**Response (202 Accepted):**
```json
{
  "scanId": "1707654321000-abc123xyz",
  "message": "Scan initiated",
  "statusUrl": "/api/scan/1707654321000-abc123xyz"
}
```

### Get Scan Results
```bash
GET /api/scan/:id
```

**Response (Processing):**
```json
{
  "scanId": "1707654321000-abc123xyz",
  "status": "processing",
  "progress": 45,
  "totalDependencies": 20,
  "message": "Checked 9/20 dependencies"
}
```

**Response (Completed):**
```json
{
  "scanId": "1707654321000-abc123xyz",
  "status": "completed",
  "progress": 100,
  "fileName": "package.json",
  "totalDependencies": 20,
  "vulnerabilities": [
    {
      "id": "CVE-2023-12345",
      "package": "lodash",
      "version": "4.17.20",
      "ecosystem": "npm",
      "severity": "HIGH",
      "cvssScore": 7.5,
      "summary": "Prototype pollution vulnerability",
      "details": "...",
      "references": [...]
    }
  ],
  "summary": {
    "total": 5,
    "critical": 1,
    "high": 2,
    "medium": 1,
    "low": 1
  },
  "aiAnalysis": {
    "summary": "Your project has 5 vulnerabilities, including 1 critical issue...",
    "topRisks": [
      "Critical prototype pollution in lodash affecting data integrity",
      "High severity XSS vulnerability in express middleware",
      "Outdated crypto library with known weaknesses"
    ],
    "recommendations": [
      "Upgrade lodash to version 4.17.21 or higher immediately",
      "Update express to latest stable version",
      "Review and update all dependencies older than 6 months"
    ]
  },
  "createdAt": "2024-02-11T10:32:01.000Z",
  "completedAt": "2024-02-11T10:32:15.000Z"
}
```

## Supported File Formats

| Format | File Name | Ecosystem |
|--------|-----------|-----------|
| npm | `package.json` | npm |
| pip | `requirements.txt` | PyPI |
| Go | `go.mod` | Go |
| Ruby | `Gemfile` | RubyGems |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3100` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `OPENAI_API_KEY` | Yes* | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | Yes* | - | Anthropic API key |
| `AI_MODEL` | No | `gpt-4o` or `claude-3-5-sonnet-20241022` | AI model to use |

\* Either `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is required for AI analysis. If both are provided, OpenAI takes precedence.

## Architecture

```
backend/
├── src/
│   ├── index.js                    # Express app & server
│   ├── routes/
│   │   └── index.js                # API route handlers
│   ├── services/
│   │   ├── scanService.js          # Scan orchestration & storage
│   │   └── aiService.js            # AI provider abstraction
│   ├── clients/
│   │   └── osvClient.js            # OSV.dev API client
│   └── parsers/
│       └── dependencyParser.js     # Multi-format dependency parsers
├── package.json
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `202` - Accepted (scan initiated)
- `400` - Bad request (missing parameters)
- `404` - Not found (invalid scan ID)
- `500` - Internal server error

Error response format:
```json
{
  "error": "Error message here"
}
```

## Security Considerations

- **API Keys**: Never commit `.env` file - use `.env.example` as template
- **CORS**: Enabled for all origins (configure restrictive origins in production)
- **Rate Limiting**: Consider adding rate limiting for production use
- **Input Validation**: Basic validation implemented, consider additional sanitization
- **Memory Storage**: In-memory storage is cleared on restart - use persistent DB for production

## Performance

- **Concurrent Scans**: Multiple scans can run simultaneously
- **Async Processing**: Scans are processed asynchronously, API returns immediately
- **Batch Processing**: OSV.dev queries are batched (5 at a time) to avoid rate limits
- **Timeouts**: OSV.dev requests have 10s timeout per package

## Troubleshooting

### Health check fails
```bash
# Check if server is running
docker-compose ps

# Check logs
docker-compose logs backend

# Verify port
netstat -an | grep 3100
```

### AI analysis not working
- Verify API key is set correctly in `.env`
- Check API key has sufficient credits/quota
- Review logs for specific error messages

### OSV.dev queries failing
- Check internet connectivity
- Verify OSV.dev API is accessible: `curl https://api.osv.dev/v1/query`
- Individual package failures won't stop the entire scan

## Development

### Run tests (future)
```bash
npm test
```

### Code style
- Use async/await for asynchronous operations
- Proper error handling with try/catch
- Descriptive variable and function names
- Comments for complex logic

## License

MIT

## Support

For issues or questions, please open an issue on the repository.

---

**Built for the VulnScout daily app challenge** 🚀
