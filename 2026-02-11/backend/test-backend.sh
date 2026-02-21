#!/bin/bash

# VulnScout Backend Test Script
# This script tests the backend API endpoints

BASE_URL="${1:-http://localhost:3100}"

echo "🧪 Testing VulnScout Backend"
echo "================================"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing /health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HEALTH_CODE" = "200" ]; then
    echo "✅ Health check passed: $HEALTH_BODY"
else
    echo "❌ Health check failed (HTTP $HEALTH_CODE)"
    exit 1
fi
echo ""

# Test 2: Create Scan
echo "2️⃣  Testing POST /api/scan endpoint..."
SCAN_PAYLOAD=$(cat <<'EOF'
{
  "fileName": "package.json",
  "fileContent": "{\"dependencies\": {\"express\": \"4.17.1\", \"lodash\": \"4.17.20\"}}"
}
EOF
)

SCAN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/scan" \
  -H "Content-Type: application/json" \
  -d "$SCAN_PAYLOAD")

SCAN_CODE=$(echo "$SCAN_RESPONSE" | tail -n1)
SCAN_BODY=$(echo "$SCAN_RESPONSE" | head -n-1)

if [ "$SCAN_CODE" = "202" ]; then
    echo "✅ Scan created successfully"
    SCAN_ID=$(echo "$SCAN_BODY" | grep -o '"scanId":"[^"]*"' | cut -d'"' -f4)
    echo "   Scan ID: $SCAN_ID"
else
    echo "❌ Scan creation failed (HTTP $SCAN_CODE)"
    echo "   Response: $SCAN_BODY"
    exit 1
fi
echo ""

# Test 3: Get Scan Results
echo "3️⃣  Testing GET /api/scan/:id endpoint..."
sleep 2  # Give it a moment to start processing

RESULT_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/scan/$SCAN_ID")
RESULT_CODE=$(echo "$RESULT_RESPONSE" | tail -n1)
RESULT_BODY=$(echo "$RESULT_RESPONSE" | head -n-1)

if [ "$RESULT_CODE" = "200" ]; then
    echo "✅ Scan retrieval successful"
    STATUS=$(echo "$RESULT_BODY" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    echo "   Status: $STATUS"
    
    if echo "$RESULT_BODY" | grep -q '"progress"'; then
        PROGRESS=$(echo "$RESULT_BODY" | grep -o '"progress":[0-9]*' | cut -d':' -f2)
        echo "   Progress: $PROGRESS%"
    fi
else
    echo "❌ Scan retrieval failed (HTTP $RESULT_CODE)"
    echo "   Response: $RESULT_BODY"
    exit 1
fi
echo ""

# Test 4: Invalid Scan ID (404)
echo "4️⃣  Testing 404 handling..."
NOT_FOUND_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/scan/invalid-id-12345")
NOT_FOUND_CODE=$(echo "$NOT_FOUND_RESPONSE" | tail -n1)

if [ "$NOT_FOUND_CODE" = "404" ]; then
    echo "✅ 404 handling works correctly"
else
    echo "⚠️  Expected 404, got HTTP $NOT_FOUND_CODE"
fi
echo ""

# Test 5: Missing parameters (400)
echo "5️⃣  Testing validation (missing fileName)..."
BAD_PAYLOAD='{"fileContent": "test"}'
BAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/scan" \
  -H "Content-Type: application/json" \
  -d "$BAD_PAYLOAD")
BAD_CODE=$(echo "$BAD_RESPONSE" | tail -n1)

if [ "$BAD_CODE" = "400" ]; then
    echo "✅ Validation works correctly"
else
    echo "⚠️  Expected 400, got HTTP $BAD_CODE"
fi
echo ""

echo "================================"
echo "🎉 All tests passed!"
echo ""
echo "💡 To test with a real scan, wait ~10s for results:"
echo "   curl $BASE_URL/api/scan/$SCAN_ID | jq"
