# 🔍 Agent Rep Check - Security & Code Audit Report
**Date:** February 13, 2026  
**Auditor:** Code Auditor Agent  
**Scope:** Full codebase review for security, configuration, and best practices

---

## 🚨 CRITICAL ISSUES

### 1. **PORT MISMATCH - Backend Container**
**Severity:** CRITICAL  
**File:** `backend/Dockerfile` (line 14)  
**Issue:** Backend Dockerfile exposes port 3001, but docker-compose and server.js use port 3106

```dockerfile
# Current (WRONG):
EXPOSE 3001

# Should be:
EXPOSE 3106
```

**Impact:** Container health checks and documentation are misleading. While this doesn't break functionality (ENV variable overrides), it creates confusion and potential deployment issues.

**Fix:**
```dockerfile
EXPOSE 3106
```

---

## ⚠️ WARNINGS

### 2. **HTTP Header Case Sensitivity Mismatch**
**Severity:** WARNING  
**Files:** 
- Frontend: `frontend/src/App.jsx` (lines 22-31)
- Backend: `backend/routes/search.js` (line 16), `backend/routes/analyze.js` (line 13)

**Issue:** Frontend sends capitalized header names, but backend reads lowercase versions. Express normalizes headers to lowercase, so this works, but it's inconsistent and fragile.

```javascript
// Frontend sends:
headers['X-OpenAI-Key'] = openaiKey
headers['X-Anthropic-Key'] = anthropicKey

// Backend reads (correctly normalized):
req.headers['x-openai-key']
req.headers['x-anthropic-key']
```

**Impact:** Code inconsistency. Works in Express but could break if middleware changes.

**Recommendation:** Document that Express lowercases all header names, or use consistent casing in comments.

---

### 3. **Missing API Key Validation**
**Severity:** WARNING  
**File:** `backend/services/ai.js` (lines 27-30)

**Issue:** When using BYOK, if user provides no key AND no environment key exists, the API call will fail with unclear error messages.

```javascript
const effectiveApiKey = apiKey || process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
// No validation if effectiveApiKey is undefined/null
```

**Impact:** Confusing error messages for users when API keys are missing.

**Recommended Fix:**
```javascript
const effectiveApiKey = apiKey || process.env[`${selectedProvider.toUpperCase()}_API_KEY`];
if (!effectiveApiKey && selectedProvider !== 'ollama') {
  throw new Error(`${selectedProvider} API key is required`);
}
```

---

### 4. **XSS Risk in URL Fetching**
**Severity:** WARNING  
**File:** `backend/routes/analyze.js` (lines 26-36)

**Issue:** User-provided URLs are fetched and HTML is stripped via regex, but this is not a safe HTML sanitizer. Malicious scripts could potentially slip through.

```javascript
textToAnalyze = response.data
  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
```

**Impact:** Low risk since content goes to AI analysis (not rendered), but regex-based HTML stripping is inherently unsafe.

**Recommended Fix:** Use a proper library like `DOMPurify` or `cheerio` for HTML parsing/sanitization.

---

### 5. **Open CORS Policy**
**Severity:** WARNING  
**File:** `backend/server.js` (line 11)

**Issue:** CORS allows all origins without restriction.

```javascript
app.use(cors()); // Allows any origin
```

**Impact:** API can be called from any website. For BYOK architecture this is less critical, but still not best practice.

**Recommended Fix:**
```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}));
```

---

### 6. **Input Validation Missing**
**Severity:** WARNING  
**Files:** 
- `backend/routes/search.js` (line 9)
- `backend/routes/analyze.js` (line 8)

**Issue:** Name, username, and URL parameters are not validated for length or malicious content.

**Recommended Fix:**
```javascript
if (!name && !username) {
  return res.status(400).json({ error: 'Name or username is required' });
}

// Add:
if (name && name.length > 200) {
  return res.status(400).json({ error: 'Name too long (max 200 chars)' });
}
if (username && username.length > 100) {
  return res.status(400).json({ error: 'Username too long (max 100 chars)' });
}
```

---

### 7. **GitHub Token Exposure Risk**
**Severity:** WARNING  
**File:** `backend/services/github.js` (line 22)

**Issue:** When GitHub token is invalid, the error message could expose token format.

**Current:**
```javascript
if (error.response?.status === 401) {
  throw new Error('Invalid GitHub token');
}
```

**Recommendation:** ✅ This is actually handled well. No changes needed.

---

## ℹ️ INFORMATIONAL

### 8. **Rate Limiting Configuration**
**Severity:** INFO  
**File:** `backend/server.js` (lines 14-19)

**Status:** ✅ Rate limiting is properly implemented.

**Observation:** Default 100 requests per 15 minutes is reasonable. Consider documenting this in README.

---

### 9. **Error Stack Trace Exposure**
**Severity:** INFO  
**File:** `backend/server.js` (line 31)

**Issue:** Stack traces exposed in development mode.

```javascript
...(process.env.NODE_ENV === 'development' && { stack: err.stack })
```

**Status:** ✅ Acceptable practice - only exposes in dev mode.

---

### 10. **Cache TTL Configuration**
**Severity:** INFO  
**File:** `backend/utils/cache.js` (line 4)

**Status:** ✅ Configurable via env variable, defaults to 1 hour. Good practice.

---

## ✅ VERIFIED CORRECT

### ✓ Port Configuration
- Docker Compose: Backend 3106, Frontend 3105 ✅
- nginx.conf: Proxies to `backend:3106` ✅
- server.js: Uses `PORT` env variable with fallback to 3001 (overridden by docker-compose) ✅
- **EXCEPT:** Dockerfile EXPOSE directive (see Critical #1)

### ✓ Timeout Settings
- nginx.conf: `proxy_read_timeout 300s` ✅ (5 minutes for slow AI operations)

### ✓ Docker Build Commands
- Backend Dockerfile: Uses `npm install` (NOT `npm ci`) ✅
- Frontend Dockerfile: Uses `npm install` ✅

### ✓ BYOK Implementation
- SettingsModal exists and is fully functional ✅
- Keys stored in localStorage only ✅
- Keys transmitted via custom headers ✅
- Privacy notice clearly displayed ✅

### ✓ API Endpoint Consistency
- Frontend calls `/api/search` → Backend route `/api/search` ✅
- Frontend calls `/api/analyze` (commented/unused) → Backend route exists ✅

### ✓ Error Handling
- Global error middleware implemented ✅
- 404 handler implemented ✅
- Try-catch blocks in all async routes ✅
- Proper HTTP status codes (400, 401, 403, 500) ✅

### ✓ Security Headers (nginx)
- X-Frame-Options: SAMEORIGIN ✅
- X-Content-Type-Options: nosniff ✅
- X-XSS-Protection: 1; mode=block ✅

### ✓ Health Checks
- Backend: `/health` endpoint with healthcheck in docker-compose ✅
- Frontend: nginx healthcheck in docker-compose ✅

---

## 📊 SUMMARY

| Category | Count |
|----------|-------|
| **Critical Issues** | 1 |
| **Warnings** | 6 |
| **Informational** | 3 |
| **Verified Correct** | 8 |

---

## 🔧 PRIORITY FIXES

### Must Fix Before Production:
1. ✅ Fix backend Dockerfile EXPOSE directive (Critical #1)

### Should Fix:
2. Add API key validation in ai.js (Warning #3)
3. Add input length validation (Warning #6)
4. Configure CORS allowlist (Warning #5)

### Nice to Have:
5. Use proper HTML parser instead of regex (Warning #4)
6. Document header normalization behavior (Warning #2)

---

## 🎯 OVERALL ASSESSMENT

**Status:** ✅ **GOOD with minor issues**

The codebase is well-structured with:
- ✅ Proper error handling throughout
- ✅ BYOK implementation is secure and functional
- ✅ Rate limiting enabled
- ✅ Docker configuration mostly correct
- ✅ Security headers properly set

**The only CRITICAL issue is a documentation/consistency problem (port number in Dockerfile), not a security vulnerability.**

The warnings are mostly best-practice improvements rather than security holes. The application is production-ready after fixing the port mismatch.

---

## 📝 NOTES

- No hardcoded secrets found ✅
- No SQL injection risks (no database used) ✅
- API keys properly handled via BYOK ✅
- Rate limiting protects against abuse ✅
- Cache properly implemented ✅

**Audit completed successfully.**
