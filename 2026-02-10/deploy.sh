#!/bin/bash

# ViewFinder Deployment Script
# Run this from plex or any machine with SSH access to plex

set -e

PROJECT_DIR="$HOME/daily-apps/2026-02-10"
CONTAINER_NAME="viewfinder-web"

echo "🚀 Deploying ViewFinder to plex..."

# Create directory
mkdir -p "$PROJECT_DIR"

# Navigate to project
cd "$(dirname "$0")"

echo "📦 Building containers..."
docker-compose build

echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || true

echo "▶️  Starting ViewFinder..."
docker-compose up -d

echo "⏳ Waiting for containers to be healthy..."
sleep 5

# Check if running
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "✅ ViewFinder is running!"
    echo ""
    echo "🌐 Access at: http://100.97.65.28:3100"
    echo ""
    docker-compose ps
else
    echo "❌ Deployment failed. Check logs:"
    echo "docker-compose logs"
fi
