#!/bin/bash

# Frontend Build Verification Script
# This script verifies the frontend structure and optionally builds it

set -e

FRONTEND_DIR="/Users/helix/.openclaw/workspace/projects/daily-apps/2026-02-13/frontend"
cd "$FRONTEND_DIR"

echo "🔍 Agent Rep Check - Frontend Build Verification"
echo "=================================================="
echo ""

# Check required files
echo "✓ Checking file structure..."
REQUIRED_FILES=(
  "package.json"
  "vite.config.js"
  "tailwind.config.js"
  "postcss.config.js"
  "index.html"
  "Dockerfile"
  "nginx.conf"
  "src/main.jsx"
  "src/App.jsx"
  "src/index.css"
  "src/components/SettingsModal.jsx"
  "src/components/SearchInterface.jsx"
  "src/components/ResultsDisplay.jsx"
  "src/components/RiskScore.jsx"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "❌ Missing: $file"
    exit 1
  fi
done

echo "✅ All required files present"
echo ""

# Check dependencies in package.json
echo "✓ Checking dependencies..."
REQUIRED_DEPS=("react" "framer-motion" "lucide-react" "chart.js" "tailwindcss")
for dep in "${REQUIRED_DEPS[@]}"; do
  if ! grep -q "\"$dep\"" package.json; then
    echo "❌ Missing dependency: $dep"
    exit 1
  fi
done

echo "✅ All dependencies defined"
echo ""

# Verify Dockerfile
echo "✓ Checking Dockerfile..."
if ! grep -q "FROM node:18-alpine AS builder" Dockerfile; then
  echo "❌ Dockerfile missing builder stage"
  exit 1
fi

if ! grep -q "npm install" Dockerfile; then
  echo "❌ Dockerfile should use 'npm install' (not npm ci)"
  exit 1
fi

echo "✅ Dockerfile valid"
echo ""

# Check for proper BYOK implementation
echo "✓ Checking BYOK implementation..."
if ! grep -q "localStorage.getItem('openai_api_key')" src/App.jsx; then
  echo "❌ Missing OpenAI BYOK in App.jsx"
  exit 1
fi

if ! grep -q "X-OpenAI-Key" src/App.jsx; then
  echo "❌ Missing custom header X-OpenAI-Key"
  exit 1
fi

echo "✅ BYOK implementation found"
echo ""

echo "=================================================="
echo "🎉 Frontend verification complete!"
echo ""
echo "Next steps:"
echo "  1. npm install     - Install dependencies"
echo "  2. npm run dev     - Run development server"
echo "  3. npm run build   - Build for production"
echo "  4. docker build -t agent-rep-check-frontend ."
echo ""
echo "The orchestrator will handle deployment."
