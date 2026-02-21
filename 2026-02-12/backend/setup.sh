#!/bin/bash

# DebateArena Backend Setup Script
set -e

echo "🎯 DebateArena Backend Setup"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  IMPORTANT: Edit .env and add your API keys!"
  echo ""
else
  echo "✅ .env already exists"
  echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Check for API keys
echo "🔑 Checking configuration..."
if grep -q "your-openai-key-here" .env 2>/dev/null; then
  echo "⚠️  OpenAI API key not configured in .env"
fi

if grep -q "your-anthropic-key-here" .env 2>/dev/null; then
  echo "⚠️  Anthropic API key not configured in .env"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your API keys"
echo "2. Run: npm start"
echo "3. Test: curl http://localhost:3000/health"
echo ""
echo "Or use Docker:"
echo "docker-compose up -d"
echo ""
