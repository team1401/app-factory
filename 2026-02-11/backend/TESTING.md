# Testing Guide

## Quick Test

Run the automated test script:

```bash
# With local server
./test-backend.sh

# With custom URL
./test-backend.sh http://localhost:3100
```

## Manual Testing

### 1. Start the Backend

**Local:**
```bash
npm install
cp .env.example .env
# Edit .env with your API keys
npm start
```

**Docker:**
```bash
cp .env.example .env
# Edit .env with your API keys
docker-compose up
```

### 2. Test Health Endpoint

```bash
curl http://localhost:3100/health
```

Expected response:
```json
{"status":"ok"}
```

### 3. Test Scan Endpoint (npm)

```bash
curl -X POST http://localhost:3100/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "package.json",
    "fileContent": "{\"dependencies\": {\"express\": \"4.17.1\", \"lodash\": \"4.17.20\"}}"
  }'
```

Expected response (202):
```json
{
  "scanId": "1707654321000-abc123xyz",
  "message": "Scan initiated",
  "statusUrl": "/api/scan/1707654321000-abc123xyz"
}
```

### 4. Test Scan Results

```bash
# Replace SCAN_ID with the ID from step 3
curl http://localhost:3100/api/scan/SCAN_ID
```

**While processing:**
```json
{
  "scanId": "...",
  "status": "processing",
  "progress": 45,
  "totalDependencies": 2,
  "message": "Checked 1/2 dependencies"
}
```

**When complete:**
```json
{
  "scanId": "...",
  "status": "completed",
  "progress": 100,
  "vulnerabilities": [...],
  "summary": {
    "total": 5,
    "critical": 1,
    "high": 2,
    "medium": 1,
    "low": 1
  },
  "aiAnalysis": {
    "summary": "...",
    "topRisks": [...],
    "recommendations": [...]
  }
}
```

### 5. Test Different File Formats

**Python (requirements.txt):**
```bash
curl -X POST http://localhost:3100/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "requirements.txt",
    "fileContent": "Django==3.2.0\nrequests==2.25.1\nFlask>=1.1.0"
  }'
```

**Go (go.mod):**
```bash
curl -X POST http://localhost:3100/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "go.mod",
    "fileContent": "module example.com/myapp\n\ngo 1.20\n\nrequire (\n\tgithub.com/gin-gonic/gin v1.7.0\n\tgithub.com/gorilla/mux v1.8.0\n)"
  }'
```

**Ruby (Gemfile):**
```bash
curl -X POST http://localhost:3100/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "Gemfile",
    "fileContent": "source '\''https://rubygems.org'\''\n\ngem '\''rails'\'', '\''~> 6.1.0'\''\ngem '\''pg'\'', '\''~> 1.2'\''"
  }'
```

### 6. Test Error Handling

**Missing fileName:**
```bash
curl -X POST http://localhost:3100/api/scan \
  -H "Content-Type: application/json" \
  -d '{"fileContent": "test"}'
```

Expected: HTTP 400

**Invalid scan ID:**
```bash
curl http://localhost:3100/api/scan/invalid-id
```

Expected: HTTP 404

**Invalid JSON:**
```bash
curl -X POST http://localhost:3100/api/scan \
  -H "Content-Type: application/json" \
  -d 'not valid json'
```

Expected: HTTP 500 or 400

## Load Testing

Test with multiple concurrent scans:

```bash
for i in {1..10}; do
  curl -X POST http://localhost:3100/api/scan \
    -H "Content-Type: application/json" \
    -d "{\"fileName\": \"package.json\", \"fileContent\": \"{\\\"dependencies\\\": {\\\"express\\\": \\\"4.17.1\\\"}}\"}" &
done
wait
```

## Debugging

### Check Logs

**Local:**
```bash
# Logs printed to console
npm start
```

**Docker:**
```bash
docker-compose logs -f backend
```

### Common Issues

1. **"AI analysis not available"**
   - Check that OPENAI_API_KEY or ANTHROPIC_API_KEY is set in .env
   - Verify API key is valid and has credits

2. **OSV.dev timeout**
   - Check internet connectivity
   - Individual package failures won't stop the scan

3. **Port already in use**
   - Change PORT in .env
   - Check: `lsof -i :3100`

4. **Dependencies won't parse**
   - Verify file format matches fileName
   - Check for syntax errors in fileContent

## Performance Benchmarks

Expected timings (with AI enabled):

- Health check: < 10ms
- Scan initiation: < 100ms
- Small file (5 deps): 3-8 seconds
- Medium file (20 deps): 8-15 seconds
- Large file (50 deps): 15-30 seconds

## Integration Testing

To test with the frontend:

1. Start backend on port 3100
2. Start frontend on port 5173
3. Upload a real dependency file
4. Verify scan completes and results display

## CI/CD Testing

Example GitHub Actions workflow:

```yaml
name: Test Backend

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
        working-directory: ./backend
      
      - name: Start server
        run: npm start &
        working-directory: ./backend
        env:
          PORT: 3100
          NODE_ENV: test
      
      - name: Wait for server
        run: sleep 5
      
      - name: Run tests
        run: ./test-backend.sh
        working-directory: ./backend
```

## Success Criteria

✅ Health check returns 200 OK  
✅ Scan endpoint returns 202 with valid scanId  
✅ Scan results can be retrieved  
✅ Multiple file formats parse correctly  
✅ Vulnerabilities are detected from OSV.dev  
✅ AI analysis generates (when configured)  
✅ Error handling works (400, 404, 500)  
✅ Concurrent scans work without conflicts  
✅ Docker container starts and responds  
✅ Graceful shutdown on SIGTERM/SIGINT  

## Next Steps

- Add unit tests with Jest/Mocha
- Add integration tests
- Add API documentation with Swagger/OpenAPI
- Add rate limiting tests
- Add load testing with Apache Bench or k6
