# DebateArena Backend

Production-ready Node.js + Express + Socket.io backend for AI model debate platform.

## Features

- ✅ Real-time debate streaming via WebSocket (Socket.io)
- ✅ Multi-provider AI support (OpenAI, Anthropic, Ollama)
- ✅ Queue system for debate turns (3 rounds, alternating)
- ✅ Live voting system with real-time updates
- ✅ Health check endpoint
- ✅ Comprehensive error handling and logging
- ✅ Docker support with docker-compose
- ✅ CORS enabled for frontend
- ✅ Environment-based configuration
- ✅ Production-ready security (non-root user, health checks)

## Architecture

```
backend/
├── server.js                 # Main Express + Socket.io server
├── routes/
│   ├── health.js            # Health check endpoint
│   └── debate.js            # Debate CRUD endpoints
├── services/
│   ├── debateManager.js     # Core debate orchestration
│   ├── aiProviderFactory.js # AI provider abstraction
│   └── providers/
│       ├── openai.js        # OpenAI integration
│       ├── anthropic.js     # Anthropic/Claude integration
│       └── ollama.js        # Ollama (local) integration
├── utils/
│   └── logger.js            # Winston logging
├── Dockerfile               # Production container
├── docker-compose.yml       # Container orchestration
└── package.json             # Dependencies
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
OLLAMA_BASE_URL=http://localhost:11434  # Optional
```

### 3. Run Locally

```bash
npm start
```

Server runs on http://localhost:3000

### 4. Run with Docker

```bash
docker-compose up -d
```

## API Endpoints

### Health Check
```http
GET /health
```

Returns server health status and metrics.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-12T07:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "used": 45,
    "total": 128,
    "unit": "MB"
  }
}
```

### Create Debate
```http
POST /api/debates
Content-Type: application/json

{
  "topic": "Should AI have rights?",
  "models": [
    {
      "name": "claude-3-5-sonnet-20241022",
      "provider": "anthropic"
    },
    {
      "name": "gpt-4-turbo-preview",
      "provider": "openai"
    }
  ]
}
```

**Response:**
```json
{
  "debateId": "uuid-here",
  "topic": "Should AI have rights?",
  "models": [...],
  "status": "created"
}
```

### Get Debate
```http
GET /api/debates/:id
```

Returns debate data including arguments and votes.

### List All Debates
```http
GET /api/debates
```

Returns array of all debates.

## WebSocket Events

### Client → Server

**Join Debate Room:**
```javascript
socket.emit('join-debate', debateId);
```

**Vote on Argument:**
```javascript
socket.emit('vote', {
  debateId: 'uuid',
  argumentId: 'uuid-r1-pro',
  vote: 'up' // or 'down'
});
```

### Server → Client

**Debate Started:**
```javascript
socket.on('debate-started', (data) => {
  console.log('Debate started:', data.debateId);
});
```

**Model Thinking:**
```javascript
socket.on('model-thinking', (data) => {
  // data: { model, side, round }
  console.log(`${data.model} is thinking...`);
});
```

**Argument Chunk (Streaming):**
```javascript
socket.on('argument-chunk', (data) => {
  // data: { model, side, round, chunk }
  console.log('Chunk:', data.chunk);
});
```

**Argument Complete:**
```javascript
socket.on('argument-complete', (argument) => {
  // argument: { id, round, side, model, content, timestamp }
  console.log('Argument complete:', argument);
});
```

**Debate Complete:**
```javascript
socket.on('debate-complete', (data) => {
  // data: { debateId, arguments, votes }
  console.log('Debate finished!');
});
```

**Vote Update:**
```javascript
socket.on('vote-update', (data) => {
  // data: { argumentId, voteCount }
  console.log('Votes updated:', data);
});
```

**Error:**
```javascript
socket.on('error', (error) => {
  console.error('Error:', error.message);
});
```

## Debate Flow

1. Client creates debate via `POST /api/debates`
2. Server creates debate and returns ID
3. Client connects to WebSocket and joins debate room
4. Server starts debate asynchronously:
   - **Round 1:** Model A (pro) → Model B (con)
   - **Round 2:** Model A (pro) → Model B (con)
   - **Round 3:** Model A (pro) → Model B (con)
5. Each argument streams in real-time via `argument-chunk` events
6. Clients vote during/after debate
7. Server emits `debate-complete` when finished

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment (development/production) |
| `LOG_LEVEL` | No | `info` | Logging level (error/warn/info/debug) |
| `CORS_ORIGIN` | No | `*` | CORS origin (use specific domain in production) |
| `OPENAI_API_KEY` | Yes* | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | Yes* | - | Anthropic API key |
| `OLLAMA_BASE_URL` | No | `http://host.docker.internal:11434` | Ollama server URL |

*At least one AI provider key is required

## AI Providers

### OpenAI
- Models: `gpt-4-turbo-preview`, `gpt-4`, `gpt-3.5-turbo`
- Requires: `OPENAI_API_KEY`

### Anthropic
- Models: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, `claude-3-sonnet-20240229`
- Requires: `ANTHROPIC_API_KEY`

### Ollama (Local)
- Models: Any model you have installed locally (`llama2`, `mistral`, etc.)
- Requires: Ollama running locally or via Docker
- URL: `http://localhost:11434` or `http://host.docker.internal:11434` in Docker

## Docker Deployment

### Build Image
```bash
docker build -t debatearena-backend .
```

### Run Container
```bash
docker run -d \
  -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  --name debatearena-backend \
  debatearena-backend
```

### Docker Compose
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Logging

Uses Winston for structured logging with multiple transports:

- **Console:** Colorized output for development
- **File (Production):** `error.log` and `combined.log`

Log levels: `error`, `warn`, `info`, `debug`

Configure via `LOG_LEVEL` environment variable.

## Security Features

- ✅ Non-root container user
- ✅ No secrets in code (environment variables only)
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error handling without exposing internals
- ✅ Health checks for monitoring
- ✅ Request logging

## Development

### Run in Development Mode
```bash
npm run dev
```

Uses `nodemon` for auto-restart on file changes.

### Test Health Endpoint
```bash
curl http://localhost:3000/health
```

### Test WebSocket Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('join-debate', 'test-debate-id');
});
```

## Production Considerations

1. **CORS:** Set `CORS_ORIGIN` to your frontend domain
2. **Secrets:** Use secrets management (AWS Secrets Manager, HashiCorp Vault)
3. **Monitoring:** Add APM (New Relic, Datadog) and error tracking (Sentry)
4. **Rate Limiting:** Add rate limiting middleware (express-rate-limit)
5. **Reverse Proxy:** Use Nginx/Caddy for SSL termination
6. **Logging:** Ship logs to centralized logging (ELK, Splunk)
7. **Scaling:** Use Redis for Socket.io adapter to scale horizontally

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=3001
```

### AI Provider Errors
- Check API keys are valid
- Verify internet connectivity
- Check provider service status

### WebSocket Connection Issues
- Verify CORS settings
- Check firewall rules
- Ensure Socket.io client version matches server

### Ollama Not Found
- Start Ollama: `ollama serve`
- Pull model: `ollama pull llama2`
- Verify URL: `curl http://localhost:11434/api/tags`

## License

MIT

## Support

For issues or questions, please open an issue on the repository.

---

**Built with ❤️ for OpenClaw Daily Apps Challenge**
