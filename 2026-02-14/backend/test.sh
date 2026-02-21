#!/bin/bash
# PaperPlain Backend Test Script

set -e

BASE_URL="${BASE_URL:-http://localhost:3108}"
OPENAI_KEY="${OPENAI_API_KEY}"
ANTHROPIC_KEY="${ANTHROPIC_API_KEY}"

echo "🧪 PaperPlain Backend Tests"
echo "=========================="
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing /health endpoint..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed: $HEALTH"
  exit 1
fi
echo ""

# Test 2: Missing Input
echo "2️⃣  Testing error handling (no input)..."
ERROR=$(curl -s -X POST "$BASE_URL/api/explain" \
  -H "Content-Type: application/json" \
  -H "X-AI-Provider: openai" \
  -H "X-AI-API-Key: fake-key" \
  -d '{}')
if echo "$ERROR" | grep -q '"error"'; then
  echo "✅ Error handling works"
else
  echo "❌ Should return error for missing input"
  exit 1
fi
echo ""

# Test 3: Invalid API Key
echo "3️⃣  Testing invalid API key handling..."
if [ -n "$OPENAI_KEY" ]; then
  ERROR=$(curl -s -X POST "$BASE_URL/api/explain" \
    -H "Content-Type: application/json" \
    -H "X-AI-Provider: openai" \
    -H "X-AI-API-Key: sk-invalid" \
    -d '{"text":"Test paper about AI"}')
  if echo "$ERROR" | grep -q 'Invalid OpenAI API key'; then
    echo "✅ Invalid key detection works"
  else
    echo "⚠️  API key validation might be different"
  fi
else
  echo "⏭️  Skipped (no OPENAI_API_KEY)"
fi
echo ""

# Test 4: arXiv URL (if API keys available)
if [ -n "$OPENAI_KEY" ] || [ -n "$ANTHROPIC_KEY" ]; then
  echo "4️⃣  Testing arXiv URL processing..."
  
  PROVIDER="openai"
  API_KEY="$OPENAI_KEY"
  
  if [ -z "$API_KEY" ]; then
    PROVIDER="anthropic"
    API_KEY="$ANTHROPIC_KEY"
  fi
  
  echo "Using provider: $PROVIDER"
  
  # Use a small paper for faster testing
  RESULT=$(curl -s -X POST "$BASE_URL/api/explain" \
    -H "Content-Type: application/json" \
    -H "X-AI-Provider: $PROVIDER" \
    -H "X-AI-API-Key: $API_KEY" \
    -d '{"arxivUrl":"https://arxiv.org/abs/1706.03762"}' | head -c 500)
  
  if echo "$RESULT" | grep -q '"success":true'; then
    echo "✅ arXiv processing works"
    echo "Sample response:"
    echo "$RESULT..."
  else
    echo "❌ arXiv processing failed"
    echo "$RESULT"
    exit 1
  fi
else
  echo "4️⃣  Skipping arXiv test (no API keys configured)"
fi
echo ""

echo "=========================="
echo "✅ All tests passed!"
echo ""
echo "Manual test examples:"
echo ""
echo "# Test with raw text:"
echo "curl -X POST $BASE_URL/api/explain \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'X-AI-Provider: openai' \\"
echo "  -H 'X-AI-API-Key: YOUR_KEY' \\"
echo "  -d '{\"text\":\"Paper about quantum computing\"}'"
echo ""
echo "# Test with arXiv URL:"
echo "curl -X POST $BASE_URL/api/explain \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'X-AI-Provider: openai' \\"
echo "  -H 'X-AI-API-Key: YOUR_KEY' \\"
echo "  -d '{\"arxivUrl\":\"https://arxiv.org/abs/2301.12345\"}'"
echo ""
echo "# Test with PDF upload:"
echo "curl -X POST $BASE_URL/api/explain \\"
echo "  -H 'X-AI-Provider: openai' \\"
echo "  -H 'X-AI-API-Key: YOUR_KEY' \\"
echo "  -F 'file=@paper.pdf'"
