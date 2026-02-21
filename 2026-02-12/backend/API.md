# DebateArena API Documentation

Complete API reference for the DebateArena backend.

## Base URL

```
http://localhost:3000
```

## REST Endpoints

### Health Check

Check if the server is running and get system metrics.

**Endpoint:** `GET /health`

**Response:** 200 OK
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

---

### Create Debate

Start a new AI debate.

**Endpoint:** `POST /api/debates`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
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

**Field Descriptions:**
- `topic` (string, required): The debate topic/question
- `models` (array, required): Exactly 2 models to debate
  - `name` (string): Model identifier (e.g., "gpt-4-turbo-preview")
  - `provider` (string): Provider type ("openai", "anthropic", or "ollama")

**Response:** 201 Created
```json
{
  "debateId": "550e8400-e29b-41d4-a716-446655440000",
  "topic": "Should AI have rights?",
  "models": [...],
  "status": "created"
}
```

**Error Responses:**

400 Bad Request - Invalid input
```json
{
  "error": "Invalid request",
  "message": "Topic and exactly 2 models are required"
}
```

500 Internal Server Error - Server error
```json
{
  "error": "Failed to create debate",
  "message": "Error details..."
}
```

---

### Get Debate

Retrieve details of a specific debate.

**Endpoint:** `GET /api/debates/:id`

**Parameters:**
- `id` (path): Debate UUID

**Response:** 200 OK
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "topic": "Should AI have rights?",
  "models": [...],
  "status": "completed",
  "arguments": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000-r1-pro",
      "round": 1,
      "side": "pro",
      "model": "claude-3-5-sonnet-20241022",
      "content": "Artificial intelligence systems...",
      "timestamp": "2026-02-12T07:05:00.000Z"
    }
  ],
  "votes": {
    "550e8400-e29b-41d4-a716-446655440000-r1-pro": {
      "up": 15,
      "down": 3
    }
  },
  "createdAt": "2026-02-12T07:00:00.000Z",
  "completedAt": "2026-02-12T07:15:00.000Z",
  "currentRound": 3,
  "maxRounds": 3
}
```

**Error Responses:**

404 Not Found - Debate doesn't exist
```json
{
  "error": "Debate not found"
}
```

---

### List All Debates

Get all debates (past and active).

**Endpoint:** `GET /api/debates`

**Response:** 200 OK
```json
{
  "debates": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "topic": "Should AI have rights?",
      "models": [...],
      "status": "completed",
      "createdAt": "2026-02-12T07:00:00.000Z",
      "completedAt": "2026-02-12T07:15:00.000Z",
      "argumentCount": 6
    }
  ],
  "count": 1
}
```

---

## WebSocket Events

Connect to Socket.io server at base URL.

### Client → Server Events

#### Join Debate Room

Subscribe to real-time updates for a specific debate.

**Event:** `join-debate`

**Payload:**
```javascript
socket.emit('join-debate', debateId);
```

**Parameters:**
- `debateId` (string): UUID of the debate

---

#### Leave Debate Room

Unsubscribe from debate updates.

**Event:** `leave-debate`

**Payload:**
```javascript
socket.emit('leave-debate', debateId);
```

**Parameters:**
- `debateId` (string): UUID of the debate

---

#### Vote on Argument

Vote up or down on an argument.

**Event:** `vote`

**Payload:**
```javascript
socket.emit('vote', {
  debateId: '550e8400-e29b-41d4-a716-446655440000',
  argumentId: '550e8400-e29b-41d4-a716-446655440000-r1-pro',
  vote: 'up' // or 'down'
});
```

**Fields:**
- `debateId` (string): UUID of the debate
- `argumentId` (string): ID of the argument (format: `{debateId}-r{round}-{side}`)
- `vote` (string): Either "up" or "down"

---

### Server → Client Events

#### Debate Started

Emitted when a debate begins.

**Event:** `debate-started`

**Payload:**
```javascript
{
  "debateId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

#### Model Thinking

Emitted when a model starts generating an argument.

**Event:** `model-thinking`

**Payload:**
```javascript
{
  "model": "claude-3-5-sonnet-20241022",
  "side": "pro",
  "round": 1
}
```

**Fields:**
- `model` (string): Name of the AI model
- `side` (string): Either "pro" or "con"
- `round` (number): Current round (1-3)

---

#### Argument Chunk

Emitted during streaming as the argument is generated (real-time).

**Event:** `argument-chunk`

**Payload:**
```javascript
{
  "model": "claude-3-5-sonnet-20241022",
  "side": "pro",
  "round": 1,
  "chunk": "Artificial intelligence "
}
```

**Fields:**
- `model` (string): Name of the AI model
- `side` (string): Either "pro" or "con"
- `round` (number): Current round (1-3)
- `chunk` (string): Text fragment to append

**Usage:**
```javascript
let currentArgument = '';

socket.on('argument-chunk', (data) => {
  currentArgument += data.chunk;
  // Update UI with currentArgument
});
```

---

#### Argument Complete

Emitted when an argument is fully generated.

**Event:** `argument-complete`

**Payload:**
```javascript
{
  "id": "550e8400-e29b-41d4-a716-446655440000-r1-pro",
  "round": 1,
  "side": "pro",
  "model": "claude-3-5-sonnet-20241022",
  "content": "Artificial intelligence systems demonstrate...",
  "timestamp": "2026-02-12T07:05:00.000Z"
}
```

---

#### Debate Complete

Emitted when all rounds are finished.

**Event:** `debate-complete`

**Payload:**
```javascript
{
  "debateId": "550e8400-e29b-41d4-a716-446655440000",
  "arguments": [
    {
      "id": "...",
      "round": 1,
      "side": "pro",
      "model": "claude-3-5-sonnet-20241022",
      "content": "...",
      "timestamp": "..."
    }
    // ... more arguments
  ],
  "votes": {
    "550e8400-e29b-41d4-a716-446655440000-r1-pro": {
      "up": 15,
      "down": 3
    }
    // ... more votes
  }
}
```

---

#### Vote Update

Emitted when vote counts change.

**Event:** `vote-update`

**Payload:**
```javascript
{
  "argumentId": "550e8400-e29b-41d4-a716-446655440000-r1-pro",
  "voteCount": {
    "up": 16,
    "down": 3
  }
}
```

---

#### Error

Emitted when an error occurs.

**Event:** `error`

**Payload:**
```javascript
{
  "message": "Failed to generate argument for gpt-4-turbo-preview",
  "error": "API key invalid"
}
```

---

## Debate Flow

Complete sequence of events:

```
1. Client: POST /api/debates
2. Server: Returns debateId
3. Client: socket.emit('join-debate', debateId)
4. Server: 'debate-started'

For each of 3 rounds:
  For Model A (pro):
    5. Server: 'model-thinking' (pro)
    6. Server: 'argument-chunk' × N (streaming)
    7. Server: 'argument-complete'
  
  For Model B (con):
    8. Server: 'model-thinking' (con)
    9. Server: 'argument-chunk' × N (streaming)
    10. Server: 'argument-complete'

11. Server: 'debate-complete'

During/after debate:
  - Client: socket.emit('vote', {...})
  - Server: 'vote-update' (broadcast to all)
```

---

## Supported AI Models

### OpenAI
- `gpt-4-turbo-preview`
- `gpt-4`
- `gpt-3.5-turbo`

### Anthropic
- `claude-3-5-sonnet-20241022` (recommended)
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`

### Ollama (Local)
- Any model installed locally
- Examples: `llama2`, `mistral`, `phi3`, etc.
- Requires Ollama running

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request (invalid input) |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Rate Limiting

Currently not implemented. Consider adding in production:
- 100 requests/minute per IP
- 10 concurrent debates per IP

---

## Example: Full Client Implementation

```javascript
const axios = require('axios');
const { io } = require('socket.io-client');

const BASE_URL = 'http://localhost:3000';

// Create debate
const response = await axios.post(`${BASE_URL}/api/debates`, {
  topic: 'Should we ban single-use plastics?',
  models: [
    { name: 'claude-3-5-sonnet-20241022', provider: 'anthropic' },
    { name: 'gpt-4-turbo-preview', provider: 'openai' }
  ]
});

const { debateId } = response.data;

// Connect to WebSocket
const socket = io(BASE_URL);

socket.on('connect', () => {
  socket.emit('join-debate', debateId);
});

// Handle events
socket.on('debate-started', () => {
  console.log('Debate started!');
});

socket.on('model-thinking', (data) => {
  console.log(`${data.model} is thinking...`);
});

let currentArg = '';
socket.on('argument-chunk', (data) => {
  currentArg += data.chunk;
  updateUI(currentArg); // Your UI update function
});

socket.on('argument-complete', (arg) => {
  console.log(`Argument complete: ${arg.content}`);
  currentArg = ''; // Reset for next argument
});

socket.on('debate-complete', (data) => {
  console.log('Debate finished!', data.arguments.length, 'arguments');
});

// Vote on argument
socket.emit('vote', {
  debateId,
  argumentId: '550e8400-e29b-41d4-a716-446655440000-r1-pro',
  vote: 'up'
});

socket.on('vote-update', (data) => {
  console.log('New vote count:', data.voteCount);
});
```

---

## Testing

```bash
# Health check
curl http://localhost:3000/health

# Create debate
curl -X POST http://localhost:3000/api/debates \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Test debate",
    "models": [
      {"name": "claude-3-5-sonnet-20241022", "provider": "anthropic"},
      {"name": "gpt-4-turbo-preview", "provider": "openai"}
    ]
  }'

# Get debate
curl http://localhost:3000/api/debates/{debateId}

# List debates
curl http://localhost:3000/api/debates
```

---

**Last Updated:** February 12, 2026
