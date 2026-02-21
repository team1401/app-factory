# DebateArena Backend Architecture

## System Overview

DebateArena is a real-time AI debate platform backend built with Node.js, Express, and Socket.io. It orchestrates debates between multiple AI models, streams arguments in real-time, and manages live voting.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Client                       │
│                  (React + Socket.io-client)                  │
└────────────────┬────────────────────────┬───────────────────┘
                 │ HTTP (REST)            │ WebSocket (Socket.io)
                 │                        │
┌────────────────▼────────────────────────▼───────────────────┐
│                      Express Server                          │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │   Routes   │  │  Socket.io   │  │  Debate Manager  │    │
│  │            │  │   Handler    │  │                  │    │
│  │ - Health   │  │              │  │ - Queue system   │    │
│  │ - Debate   │  │ - Join/leave │  │ - Turn control   │    │
│  │   CRUD     │  │ - Vote       │  │ - Vote tracking  │    │
│  └────────────┘  └──────────────┘  └──────────────────┘    │
│         │               │                    │               │
│         └───────────────┴────────────────────┘               │
│                         │                                    │
│           ┌─────────────▼─────────────┐                      │
│           │   AI Provider Factory     │                      │
│           └─────────────┬─────────────┘                      │
│                         │                                    │
│      ┌──────────────────┼──────────────────┐                 │
│      │                  │                  │                 │
│  ┌───▼────┐      ┌──────▼──────┐   ┌──────▼──────┐          │
│  │OpenAI  │      │ Anthropic   │   │   Ollama    │          │
│  │Provider│      │  Provider   │   │  Provider   │          │
│  └───┬────┘      └──────┬──────┘   └──────┬──────┘          │
└──────┼──────────────────┼─────────────────┼─────────────────┘
       │                  │                 │
   ┌───▼────┐        ┌────▼─────┐      ┌───▼────┐
   │ OpenAI │        │Anthropic │      │ Ollama │
   │  API   │        │   API    │      │ Local  │
   └────────┘        └──────────┘      └────────┘
```

## Component Breakdown

### 1. Server Layer (`server.js`)

**Responsibilities:**
- Express app initialization
- Socket.io setup with CORS
- Route registration
- WebSocket event handling
- Graceful shutdown

**Key Features:**
- Non-blocking async operations
- Error handling middleware
- Health monitoring
- Connection lifecycle management

### 2. Routes

#### Health Route (`routes/health.js`)
- Simple endpoint returning 200
- Memory and uptime metrics
- No external dependencies

#### Debate Route (`routes/debate.js`)
- POST `/api/debates` - Create new debate
- GET `/api/debates/:id` - Get debate details
- GET `/api/debates` - List all debates
- Input validation
- Error handling

### 3. Debate Manager (`services/debateManager.js`)

**Core orchestration layer**

**Data Structures:**
```javascript
debates: Map<debateId, DebateState>
votes: Map<voteKey, VoteCount>
```

**State Machine:**
```
pending → active → completed/error
           │
           ├─ Round 1: pro → con
           ├─ Round 2: pro → con
           └─ Round 3: pro → con
```

**Key Methods:**
- `createDebate()` - Initialize debate state
- `startDebate()` - Begin debate execution
- `streamArgument()` - Real-time argument streaming
- `buildContext()` - Construct AI context from history
- `recordVote()` - Track user votes
- `getVoteCounts()` - Aggregate vote data

**Debate Flow:**
1. Create debate → status: "pending"
2. Start debate → status: "active"
3. For each round (3 total):
   - Model A (pro) generates argument
   - Stream chunks via WebSocket
   - Model B (con) generates argument
   - Stream chunks via WebSocket
4. Complete → status: "completed"

### 4. AI Provider System

#### Factory Pattern (`services/aiProviderFactory.js`)

**Purpose:** Abstract provider differences, enable easy addition of new providers

**Methods:**
- `getProvider(type, model)` - Return appropriate provider instance
- `validateConfig(type)` - Check if provider is configured

#### Provider Interface

All providers implement:
```javascript
async generateArgument(topic, context, onChunk)
```

**Parameters:**
- `topic` - Debate topic string
- `context` - Historical arguments and side assignment
- `onChunk` - Callback for streaming chunks

**Returns:** Complete argument text

#### OpenAI Provider (`services/providers/openai.js`)

**Features:**
- GPT-4/3.5 support
- Streaming via SSE (Server-Sent Events)
- Temperature: 0.8 (creative but coherent)
- Max tokens: 500 (concise arguments)

**API:**
```
POST https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer {OPENAI_API_KEY}
  Content-Type: application/json
Body:
  {
    "model": "gpt-4-turbo-preview",
    "messages": [...],
    "stream": true
  }
```

#### Anthropic Provider (`services/providers/anthropic.js`)

**Features:**
- Claude 3.5 Sonnet/Opus support
- Streaming via SSE
- System prompts for better control
- Temperature: 0.8

**API:**
```
POST https://api.anthropic.com/v1/messages
Headers:
  x-api-key: {ANTHROPIC_API_KEY}
  anthropic-version: 2023-06-01
Body:
  {
    "model": "claude-3-5-sonnet-20241022",
    "system": "...",
    "messages": [...],
    "stream": true
  }
```

#### Ollama Provider (`services/providers/ollama.js`)

**Features:**
- Local model support
- No API key required
- Streaming via JSON-line protocol
- Fallback to localhost:11434

**API:**
```
POST http://localhost:11434/api/generate
Body:
  {
    "model": "llama2",
    "prompt": "...",
    "stream": true
  }
```

### 5. Utilities

#### Logger (`utils/logger.js`)

**Winston-based logging:**
- Structured JSON logs
- Colorized console output (dev)
- File logging (production)
- Levels: error, warn, info, debug

**Log Format:**
```
2026-02-12 07:00:00 [info]: Debate created: 550e8400...
```

## Data Models

### Debate State
```javascript
{
  id: 'uuid',
  topic: 'string',
  models: [
    { name: 'model-id', provider: 'type' },
    { name: 'model-id', provider: 'type' }
  ],
  status: 'pending|active|completed|error',
  arguments: [
    {
      id: 'debateId-r{round}-{side}',
      round: 1,
      side: 'pro|con',
      model: 'model-id',
      content: 'argument text',
      timestamp: 'ISO 8601'
    }
  ],
  currentRound: 0,
  maxRounds: 3,
  createdAt: 'ISO 8601',
  completedAt: 'ISO 8601'
}
```

### Vote State
```javascript
{
  'debateId-argumentId': {
    up: 0,
    down: 0
  }
}
```

## WebSocket Event Flow

### Client Connects
```
Client → Server: socket.connect()
Server → Client: 'connect' event
Client → Server: emit('join-debate', debateId)
```

### Debate Execution
```
Server → All Clients in Room: 'debate-started'

For each turn:
  Server → All: 'model-thinking' { model, side, round }
  
  While generating:
    Server → All: 'argument-chunk' { chunk }
    Server → All: 'argument-chunk' { chunk }
    ...
  
  Server → All: 'argument-complete' { full argument }

Server → All: 'debate-complete' { results }
```

### Voting
```
Client → Server: emit('vote', { debateId, argumentId, vote })
Server: Update vote count
Server → All Clients in Room: 'vote-update' { argumentId, voteCount }
```

## Concurrency & Scalability

### Current Design
- **In-memory state:** Map-based storage
- **Single instance:** No distributed state
- **WebSocket rooms:** Isolated by debateId

### Scaling Considerations

**Horizontal Scaling (Future):**
1. Add Redis for shared state
2. Use Redis adapter for Socket.io
3. Stateless server instances
4. Load balancer (Nginx/HAProxy)

**Vertical Scaling:**
- Node.js cluster mode
- PM2 process manager
- Multiple CPU cores

**Database (Future):**
- Persist debates to PostgreSQL/MongoDB
- Store vote history
- User analytics

## Security Measures

1. **Environment Variables:** No hardcoded secrets
2. **Non-root Container:** User `nodejs` (uid 1001)
3. **Input Validation:** Topic and model validation
4. **CORS Configuration:** Configurable origin
5. **Error Handling:** No internal details leaked
6. **Rate Limiting:** (TODO - recommend express-rate-limit)

## Error Handling Strategy

### Levels

1. **Provider Level:** Catch API errors, return friendly message
2. **Manager Level:** Catch generation errors, emit error event
3. **Route Level:** Return appropriate HTTP status codes
4. **Server Level:** Global error middleware

### Error Types

- **API Errors:** Invalid keys, rate limits, timeouts
- **Validation Errors:** Missing fields, invalid models
- **System Errors:** Out of memory, network issues

### Recovery

- Debates marked as "error" status
- Clients notified via `error` event
- Logging for debugging

## Performance Optimizations

1. **Streaming:** Real-time chunks instead of waiting for full response
2. **Async/Await:** Non-blocking I/O operations
3. **Room Isolation:** Events only sent to relevant clients
4. **Brief Pauses:** 1s between turns to avoid rate limits

## Configuration Management

### Environment Variables

**Server:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging verbosity (error/warn/info/debug)

**CORS:**
- `CORS_ORIGIN` - Allowed origins (default: *)

**AI Providers:**
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `OLLAMA_BASE_URL` - Ollama server URL

## Testing Strategy

### Unit Tests (TODO)
- Provider streaming logic
- Vote counting
- Context building

### Integration Tests (TODO)
- End-to-end debate flow
- WebSocket events
- API endpoints

### Manual Testing
- `test-client.js` - Full debate simulation
- `curl` commands - REST endpoints
- Browser DevTools - WebSocket inspection

## Deployment

### Docker
```bash
docker build -t debatearena-backend .
docker run -p 3000:3000 --env-file .env debatearena-backend
```

### Docker Compose
```bash
docker-compose up -d
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure specific `CORS_ORIGIN`
- [ ] Use secrets manager for API keys
- [ ] Enable file logging
- [ ] Set up monitoring (health checks)
- [ ] Configure reverse proxy (Nginx)
- [ ] SSL/TLS termination
- [ ] Rate limiting
- [ ] CDN for static assets

## Monitoring & Observability

### Health Checks
- `/health` endpoint
- Docker HEALTHCHECK directive
- Returns memory usage and uptime

### Logging
- Structured JSON logs
- Winston transports (console + file)
- Log levels for filtering

### Metrics (TODO)
- Prometheus exporter
- Debate count
- Active connections
- API latency
- Error rates

## Future Enhancements

1. **Persistence:** Database integration
2. **User Auth:** JWT authentication
3. **Rate Limiting:** Per-IP/per-user limits
4. **Caching:** Redis for debate history
5. **Analytics:** Vote trends, popular topics
6. **Admin Panel:** Manage debates, ban users
7. **Model Marketplace:** Add/remove models dynamically
8. **Custom Prompts:** User-defined debate formats
9. **Multi-round Voting:** Vote per round, not per argument
10. **Leaderboards:** Top models by votes

## Dependencies

**Production:**
- `express` - Web framework
- `socket.io` - WebSocket server
- `axios` - HTTP client for AI APIs
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `winston` - Logging
- `uuid` - Unique IDs

**Development:**
- `nodemon` - Auto-restart on changes

## License

MIT

---

**Version:** 1.0.0  
**Last Updated:** February 12, 2026  
**Author:** OpenClaw Backend Builder
