# PaperPlain Backend - Deployment Checklist

## 📋 Pre-Deployment Verification

### ✅ File Structure
```
backend/
├── server.js              ✓ Main entry point
├── package.json           ✓ Dependencies
├── Dockerfile             ✓ Container config
├── docker-compose.yml     ✓ Orchestration
├── .env.example           ✓ Environment template
├── .gitignore             ✓ Git exclusions
├── .dockerignore          ✓ Docker exclusions
├── README.md              ✓ Documentation
├── test.sh                ✓ Test suite
├── routes/
│   └── explain.js         ✓ Main API endpoint
├── services/
│   ├── arxiv.js          ✓ arXiv integration
│   └── ai.js             ✓ AI providers
├── middleware/
│   └── validation.js     ✓ Validation & errors
└── utils/
    └── logger.js         ✓ Logging
```

## 🚀 Deployment Steps

### 1. Local Testing (Standalone)

```bash
cd backend/

# Copy environment template
cp .env.example .env

# Edit .env (optional - can use BYOK via headers)
nano .env

# Install dependencies
npm install

# Start server
npm start

# In another terminal, run tests
./test.sh

# Test manually
curl http://localhost:3108/health
```

### 2. Docker Build & Test

```bash
# Build image
docker build -t paperplain-backend .

# Run container
docker run -d \
  --name paperplain-test \
  -p 3108:3108 \
  -e OPENAI_API_KEY=sk-... \
  paperplain-backend

# Check logs
docker logs -f paperplain-test

# Run tests
./test.sh

# Cleanup
docker stop paperplain-test
docker rm paperplain-test
```

### 3. Docker Compose (Standalone Backend)

```bash
# Set environment variables (optional)
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...

# Start with compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Run tests
./test.sh

# Stop
docker-compose down
```

### 4. Full Stack Deployment (with Frontend)

See main project `docker-compose.yml` in parent directory.

```bash
cd ../  # Go to project root
docker-compose up -d
```

## 🧪 Verification Tests

### Health Check
```bash
curl http://localhost:3108/health
# Expected: {"status":"ok"}
```

### Test with Raw Text
```bash
curl -X POST http://localhost:3108/api/explain \
  -H "Content-Type: application/json" \
  -H "X-AI-Provider: openai" \
  -H "X-AI-API-Key: sk-YOUR_KEY" \
  -d '{
    "text": "Title: Quantum Computing\n\nAbstract: This paper explores quantum algorithms..."
  }'
```

### Test with arXiv URL
```bash
curl -X POST http://localhost:3108/api/explain \
  -H "Content-Type: application/json" \
  -H "X-AI-Provider: openai" \
  -H "X-AI-API-Key: sk-YOUR_KEY" \
  -d '{
    "arxivUrl": "https://arxiv.org/abs/1706.03762"
  }'
```

### Test with PDF Upload
```bash
curl -X POST http://localhost:3108/api/explain \
  -H "X-AI-Provider: anthropic" \
  -H "X-AI-API-Key: sk-ant-YOUR_KEY" \
  -F "file=@test-paper.pdf"
```

## 🔍 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs paperplain-backend

# Common issues:
# - Port 3108 already in use: lsof -i :3108
# - Missing dependencies: rebuild image
# - Invalid .env: check syntax
```

### Health Check Failing
```bash
# Check if server is running
docker exec paperplain-backend ps aux

# Check server logs
docker exec paperplain-backend cat /proc/1/fd/1

# Manual health check
docker exec paperplain-backend curl http://localhost:3108/health
```

### API Errors
```bash
# Check environment variables
docker exec paperplain-backend env | grep API_KEY

# Test API key manually
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-YOUR_KEY"
```

### PDF Parsing Issues
```bash
# Check if pdf-parse is installed
docker exec paperplain-backend npm list pdf-parse

# Test with simple PDF
# Ensure PDF is not scanned/encrypted
```

## 📊 Production Monitoring

### Health Checks
- Endpoint: `GET /health`
- Expected: 200 OK, `{"status":"ok"}`
- Frequency: Every 30s
- Timeout: 3s

### Logs
```bash
# Docker logs
docker logs -f paperplain-backend --tail 100

# JSON logs can be parsed with jq
docker logs paperplain-backend 2>&1 | grep -E '^\{' | jq .
```

### Metrics to Monitor
- Response time (target: <5s for arXiv, <60s for AI)
- Error rate (target: <5%)
- Container health status
- Memory usage (should stay under 512MB)
- CPU usage (spikes during AI calls are normal)

## 🔒 Security Checklist

- [ ] `.env` file is gitignored
- [ ] API keys are not hardcoded
- [ ] CORS is properly configured
- [ ] File upload limits are enforced (10MB)
- [ ] Request size limits are set (1MB JSON)
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up to date (`npm audit`)

## 📝 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3108 | Server port |
| `NODE_ENV` | No | production | Environment |
| `OPENAI_API_KEY` | No* | - | OpenAI key (fallback) |
| `ANTHROPIC_API_KEY` | No* | - | Anthropic key (fallback) |
| `LOG_LEVEL` | No | info | Logging level |

*At least one AI provider key required (can be via headers)

## ✅ Success Criteria

Backend is production-ready when:

- [x] All files are present
- [x] Port 3108 is consistent everywhere
- [x] Health endpoint returns 200 OK
- [x] Can process arXiv URLs
- [x] Can parse PDF uploads
- [x] Can handle raw text input
- [x] BYOK headers work (X-AI-Provider, X-AI-API-Key)
- [x] OpenAI integration works
- [x] Anthropic integration works
- [x] Error handling is comprehensive
- [x] Logging is structured
- [x] Validation catches bad input
- [x] Docker builds successfully
- [x] Dockerfile uses `npm install` (not npm ci)
- [x] Documentation is complete
- [x] Tests pass

## 🎯 Next Steps

1. **Deploy Frontend** - Build React frontend (see ../frontend/)
2. **Integration Test** - Test full stack with real papers
3. **Monitor** - Set up log aggregation and alerts
4. **Optimize** - Cache arXiv results, add rate limiting
5. **Scale** - Add Redis for session storage if needed

---

**Built:** 2026-02-14  
**Port:** 3108  
**Stack:** Node.js 20 + Express + OpenAI/Anthropic  
**Status:** Production Ready ✅
