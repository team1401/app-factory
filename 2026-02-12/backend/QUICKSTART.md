# DebateArena Backend - Quick Start

## 🚀 Get Running in 60 Seconds

```bash
# 1. Navigate to backend
cd /Users/helix/.openclaw/workspace/projects/daily-apps/2026-02-12/backend

# 2. Setup (creates .env from template)
./setup.sh

# 3. Add your API keys to .env
# Edit .env and add:
#   OPENAI_API_KEY=sk-...
#   ANTHROPIC_API_KEY=sk-ant-...

# 4. Run with Docker
docker-compose up -d

# 5. Test
curl http://localhost:3000/health
```

**Done! Backend is live on port 3000** ✅

---

## 🧪 Quick Test

```bash
# Run included test client
npm install
node test-client.js
```

This will:
1. Check health endpoint
2. Create a test debate (Claude vs GPT-4)
3. Stream arguments in real-time
4. Verify WebSocket events work

---

## 📡 API Quick Reference

### Create Debate
```bash
curl -X POST http://localhost:3000/api/debates \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Should AI have rights?",
    "models": [
      {"name": "claude-3-5-sonnet-20241022", "provider": "anthropic"},
      {"name": "gpt-4-turbo-preview", "provider": "openai"}
    ]
  }'
```

### Get Debate
```bash
curl http://localhost:3000/api/debates/{debateId}
```

### Health Check
```bash
curl http://localhost:3000/health
```

---

## 🔌 WebSocket Example

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  socket.emit('join-debate', debateId);
});

socket.on('argument-chunk', (data) => {
  console.log(data.chunk); // Real-time streaming!
});

socket.on('debate-complete', (data) => {
  console.log('Done!', data.arguments);
});
```

---

## 🐳 Docker Commands

```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

---

## 🔧 Environment Variables

**Minimal .env:**
```env
PORT=3000
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Full .env (optional):**
```env
# Server
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# CORS
CORS_ORIGIN=http://localhost:5173

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OLLAMA_BASE_URL=http://localhost:11434
```

---

## 🎯 Supported Models

### OpenAI
- `gpt-4-turbo-preview` ⭐ (recommended)
- `gpt-4`
- `gpt-3.5-turbo`

### Anthropic
- `claude-3-5-sonnet-20241022` ⭐ (recommended)
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`

### Ollama (Local)
- `llama2`
- `mistral`
- `phi3`
- Any model you have installed

---

## 🔍 Troubleshooting

### Port already in use
```bash
# Use different port
PORT=3001 docker-compose up -d
```

### API key errors
```bash
# Check .env has valid keys
cat .env | grep API_KEY

# Test OpenAI key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### WebSocket not connecting
```bash
# Check CORS_ORIGIN matches frontend
CORS_ORIGIN=http://localhost:5173

# Check server is running
curl http://localhost:3000/health
```

---

## 📚 Full Documentation

- **README.md** - Complete usage guide
- **API.md** - Full API reference
- **ARCHITECTURE.md** - System design
- **BUILD_SUMMARY.md** - What was built

---

## 🎉 You're Ready!

Backend is running. Now build the frontend or test with:
```bash
node test-client.js
```

Watch AI models debate in real-time! 🎭

---

**Need help?** Check README.md or API.md
