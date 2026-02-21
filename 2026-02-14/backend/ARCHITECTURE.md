# PaperPlain Backend - Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Frontend)                        │
│  • React + Tailwind                                          │
│  • BYOK Settings Panel                                       │
│  • File Upload / URL Input                                   │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/JSON
                 │ Headers: X-AI-Provider, X-AI-API-Key
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                Express Server (Port 3108)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Middleware Layer                                    │   │
│  │  • CORS                                              │   │
│  │  • Body Parser (JSON + multipart)                    │   │
│  │  • Request Logging                                   │   │
│  │  • Error Handler                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                        │                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Routes                                              │   │
│  │  • GET  /health         → {status: "ok"}            │   │
│  │  • POST /api/explain    → Paper Analysis            │   │
│  └─────────────────────────────────────────────────────┘   │
│                        │                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Validation Layer                                    │   │
│  │  • AI Config (provider, apiKey, model)              │   │
│  │  • File Upload (type, size)                         │   │
│  │  • Input Type Detection                             │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────┬──────────────┬──────────────┬─────────────────┘
             │              │              │
             │              │              │
    ┌────────▼──────┐  ┌───▼────────┐  ┌─▼──────────────┐
    │ arXiv Service │  │ AI Service │  │ PDF Parser     │
    │               │  │            │  │                │
    │ • Extract ID  │  │ • OpenAI   │  │ • pdf-parse    │
    │ • Fetch API   │  │ • Anthropic│  │ • Text extract │
    │ • Download PDF│  │ • Validate │  │                │
    └───────┬───────┘  └─────┬──────┘  └────────────────┘
            │                │
            │                │
    ┌───────▼────────────────▼──────────────────────────┐
    │          External Services                        │
    │  • arXiv API (export.arxiv.org)                   │
    │  • OpenAI API (api.openai.com)                    │
    │  • Anthropic API (api.anthropic.com)              │
    └───────────────────────────────────────────────────┘
```

## 📂 Code Organization

### **server.js** - Entry Point
- Express app initialization
- Middleware registration
- Route mounting
- Graceful shutdown handling
- Error handling

### **routes/explain.js** - Main API Logic
- Request parsing (URL/PDF/text)
- Input type detection
- Orchestration of services
- Response formatting
- Multer configuration for uploads

### **services/arxiv.js** - arXiv Integration
```javascript
extractArxivId(url)      // Parse arXiv ID from URL
fetchArxivPaper(url)     // Fetch paper metadata from API
downloadArxivPdf(id)     // Download PDF content
```

### **services/ai.js** - AI Provider Abstraction
```javascript
analyzePaper(text, provider, apiKey, model)  // Main interface
analyzeWithOpenAI(text, key, model)          // OpenAI handler
analyzeWithAnthropic(text, key, model)       // Anthropic handler
parseAIResponse(content)                     // JSON validation
```

### **middleware/validation.js** - Input Validation
```javascript
validateAIConfig(req)       // Extract & validate AI settings
validateFileUpload(file)    // PDF validation
errorHandler(err, req, res) // Global error handler
```

### **utils/logger.js** - Structured Logging
- Winston-based logging
- Colored console output
- Timestamp + metadata
- Configurable log levels

## 🔄 Request Flow

### 1. arXiv URL Flow
```
POST /api/explain { "arxivUrl": "..." }
  ↓
Validate AI config (headers or .env)
  ↓
Extract arXiv ID from URL
  ↓
Fetch paper metadata from arXiv API (XML)
  ↓
Download PDF from arXiv
  ↓
Parse PDF to text (pdf-parse)
  ↓
Send text to AI provider (OpenAI/Anthropic)
  ↓
Parse JSON response
  ↓
Return { success, metadata, analysis, provider }
```

### 2. PDF Upload Flow
```
POST /api/explain (multipart/form-data)
  ↓
Validate AI config
  ↓
Validate file (type, size)
  ↓
Parse PDF from buffer (pdf-parse)
  ↓
Extract text content
  ↓
Send to AI provider
  ↓
Parse & validate response
  ↓
Return structured JSON
```

### 3. Raw Text Flow
```
POST /api/explain { "text": "..." }
  ↓
Validate AI config
  ↓
Use text directly
  ↓
Send to AI provider
  ↓
Parse response
  ↓
Return analysis
```

## 🤖 AI Integration

### Prompt Structure
```
System: Expert research paper analyst
        Output pure JSON with structure:
        { tldr, keyFindings, methodology, implications, eli5, relatedWork }

User:   Analyze this research paper:
        [paper text...]
```

### OpenAI Integration
- Endpoint: `POST https://api.openai.com/v1/chat/completions`
- Auth: `Authorization: Bearer {key}`
- Default model: `gpt-4o`
- Max tokens: 2000
- Temperature: 0.7

### Anthropic Integration
- Endpoint: `POST https://api.anthropic.com/v1/messages`
- Auth: `x-api-key: {key}`
- Header: `anthropic-version: 2023-06-01`
- Default model: `claude-3-5-sonnet-20241022`
- Max tokens: 2000

### Response Validation
1. Extract JSON from potential markdown wrappers
2. Parse JSON
3. Validate required fields (6 total)
4. Ensure arrays are arrays
5. Return structured object

## 🛡️ Error Handling

### Validation Errors (400)
- No input provided
- Invalid arXiv URL format
- Wrong file type (not PDF)
- File too large (>10MB)
- Missing required fields

### Authentication Errors (401)
- Invalid API key
- No API key provided (and none in .env)
- Insufficient permissions

### Processing Errors (422)
- Paper not found on arXiv
- PDF text extraction failed
- AI response invalid format

### Service Errors (500/503)
- arXiv API timeout
- AI provider timeout
- Network errors
- Parsing failures

### Error Response Format
```json
{
  "error": "Descriptive error message",
  "stack": "..." // Only in development
}
```

## 📊 Data Flow

### Input Formats
```javascript
// arXiv URL
{ "arxivUrl": "https://arxiv.org/abs/2301.12345" }

// PDF Upload
Content-Type: multipart/form-data
file: <binary PDF data>

// Raw Text
{ "text": "Paper content..." }
```

### Output Format
```javascript
{
  "success": true,
  "metadata": {
    "title": "Paper Title",
    "authors": "Author 1, Author 2",
    "published": "2023-01-15",
    "source": "arxiv|upload|text",
    "arxivId": "2301.12345"  // If from arXiv
  },
  "analysis": {
    "tldr": "One sentence summary",
    "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
    "methodology": "Research approach description",
    "implications": "Real-world impact and significance",
    "eli5": "Simple explanation for non-experts",
    "relatedWork": ["Paper 1", "Paper 2", "Paper 3"]
  },
  "provider": "openai",
  "processingTime": "3245ms"
}
```

## 🔧 Configuration

### Environment Variables
```bash
PORT=3108                              # Server port
NODE_ENV=production                    # Environment
LOG_LEVEL=info                         # Logging verbosity
OPENAI_API_KEY=sk-...                 # OpenAI fallback key
ANTHROPIC_API_KEY=sk-ant-...          # Anthropic fallback key
```

### Request Headers (BYOK)
```
X-AI-Provider: openai | anthropic     # AI provider selection
X-AI-API-Key: sk-...                  # Per-request API key
X-AI-Model: gpt-4o                    # Optional model override
```

### Limits
- JSON body: 1MB
- File upload: 10MB
- PDF text for AI: 15KB (truncated)
- Request timeout: 60s
- arXiv timeout: 10s

## 🐳 Docker Architecture

### Dockerfile
```dockerfile
FROM node:20-alpine              # Minimal base image
WORKDIR /app                     # Working directory
COPY package*.json ./            # Dependencies first (cache)
RUN npm install                  # Install (NOT npm ci)
COPY . .                         # Application code
EXPOSE 3108                      # Port
HEALTHCHECK ...                  # Built-in health monitoring
CMD ["node", "server.js"]        # Start command
```

### Health Check
- Command: `node -e "require('http').get('http://localhost:3108/health', ...)"`
- Interval: 30s
- Timeout: 3s
- Start period: 10s
- Retries: 3

## 📈 Performance Characteristics

### Response Times
- Health check: <10ms
- arXiv metadata: ~500ms
- arXiv PDF download: 1-3s
- PDF parsing: 100-500ms
- AI analysis: 5-30s (depends on model)

### Resource Usage
- Memory: 50-200MB (idle-processing)
- CPU: Minimal except during PDF parsing
- Disk: None (all in-memory)
- Network: Moderate (arXiv + AI calls)

### Scalability
- Stateless design (can scale horizontally)
- No database required
- No session storage
- Each request is independent

## 🔐 Security Features

1. **Input Validation**
   - File type checking
   - Size limits
   - URL format validation

2. **API Key Protection**
   - Never logged
   - Header-based BYOK
   - Environment variable fallback

3. **Error Handling**
   - No sensitive data in error messages
   - Stack traces only in development

4. **CORS**
   - Enabled for cross-origin requests
   - Configurable if needed

5. **Dependencies**
   - Regular security audits
   - Minimal dependency tree

## 🚀 Deployment Modes

### Development
```bash
npm install
npm run dev  # nodemon with auto-reload
```

### Production (Node)
```bash
npm install --production
npm start
```

### Docker (Standalone)
```bash
docker build -t paperplain-backend .
docker run -p 3108:3108 paperplain-backend
```

### Docker Compose
```bash
docker-compose up -d
```

## 📝 Logging Structure

### Log Levels
- `error` - Critical failures
- `warn` - Non-critical issues
- `info` - General information
- `debug` - Detailed debugging

### Log Format
```json
{
  "timestamp": "2026-02-14 12:34:56",
  "level": "info",
  "message": "Request processed",
  "service": "paperplain-backend",
  "metadata": {
    "path": "/api/explain",
    "duration": "3245ms"
  }
}
```

## ✅ Quality Checklist

- [x] Clean architecture (routes/services/middleware/utils)
- [x] Comprehensive error handling
- [x] Structured logging (Winston)
- [x] Input validation
- [x] API key security (BYOK + .env fallback)
- [x] Multi-provider support (OpenAI + Anthropic)
- [x] PDF parsing (pdf-parse)
- [x] arXiv integration (API + PDF download)
- [x] Health checks
- [x] Docker ready
- [x] Production optimized
- [x] Well documented
- [x] Test suite included

---

**Architecture Version:** 1.0  
**Date:** 2026-02-14  
**Status:** Production Ready ✅
