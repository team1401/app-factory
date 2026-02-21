# VulnScout Backend - Quick Start

## 🚀 Get Running in 60 Seconds

### Local Development

```bash
# 1. Navigate to backend
cd /Users/helix/.openclaw/workspace/projects/daily-apps/2026-02-11/backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY or ANTHROPIC_API_KEY

# 4. Start server
npm start

# 5. Test it works
curl http://localhost:3100/health
# Should return: {"status":"ok"}

# 6. Run automated tests
./test-backend.sh
```

### Docker (Production-like)

```bash
# 1. Navigate to backend
cd /Users/helix/.openclaw/workspace/projects/daily-apps/2026-02-11/backend

# 2. Configure environment
cp .env.example .env
# Edit .env and add your API key

# 3. Start with Docker
docker-compose up -d

# 4. Check logs
docker-compose logs -f

# 5. Test it works
curl http://localhost:3100/health

# 6. Stop when done
docker-compose down
```

## 📝 Quick Test

Create a scan:
```bash
curl -X POST http://localhost:3100/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "package.json",
    "fileContent": "{\"dependencies\": {\"express\": \"4.17.1\", \"lodash\": \"4.17.20\"}}"
  }'
```

You'll get back a `scanId`. Wait ~10 seconds, then check results:
```bash
curl http://localhost:3100/api/scan/YOUR_SCAN_ID | jq
```

## 📚 What's Included

- **Core API**: Scan endpoints + health check
- **Multi-format Support**: npm, pip, Go, Ruby
- **OSV.dev Integration**: Real vulnerability database
- **AI Analysis**: Plain-English explanations (OpenAI or Anthropic)
- **Docker**: Full containerization
- **Tests**: Automated test script
- **Documentation**: README, TESTING, DEPLOY guides

## 🎯 Next Steps

1. **Read README.md** for full API documentation
2. **Read TESTING.md** for comprehensive testing guide
3. **Read DEPLOY.md** for production deployment
4. **Integrate with frontend** (coming next!)

## ⚡ Port Configuration

Default port: **3100**

To change:
```bash
# Edit .env
PORT=3200

# Restart
docker-compose down && docker-compose up -d
```

## 🔑 API Keys

You need either:
- **OpenAI**: Get from https://platform.openai.com/api-keys
- **Anthropic**: Get from https://console.anthropic.com/

Add to `.env`:
```env
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...
```

## ✅ Verify Everything Works

```bash
./test-backend.sh
```

Should see:
```
🧪 Testing VulnScout Backend
================================
✅ Health check passed
✅ Scan created successfully
✅ Scan retrieval successful
✅ 404 handling works correctly
✅ Validation works correctly
================================
🎉 All tests passed!
```

## 🐛 Troubleshooting

**Port already in use:**
```bash
lsof -i :3100
# Kill process or change PORT in .env
```

**Dependencies won't install:**
```bash
rm -rf node_modules
npm install
```

**Docker won't start:**
```bash
docker-compose logs
# Check for errors, verify .env exists
```

**AI analysis not working:**
- Check API key is correct in `.env`
- Verify API key has credits/quota
- Check logs for specific error

## 📞 Support

- Issues in scan results? Check OSV.dev connectivity
- AI not working? Verify API keys and quotas
- Performance issues? Check logs for bottlenecks
- Other problems? See TESTING.md for detailed debugging

---

**Ready to build!** 🛠️
