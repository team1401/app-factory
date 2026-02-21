#!/bin/bash

# DebateArena Frontend Setup Script
# Usage: ./setup.sh [dev|build|docker]

set -e

echo "🎭 DebateArena Frontend Setup"
echo "================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node --version) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  npm not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm $(npm --version) detected"

# Setup .env if not exists
if [ ! -f .env ]; then
    echo -e "${BLUE}→${NC} Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env created"
    echo -e "${YELLOW}⚠️  Please edit .env and set VITE_API_URL${NC}"
else
    echo -e "${GREEN}✓${NC} .env already exists"
fi

# Install dependencies
echo -e "${BLUE}→${NC} Installing dependencies..."
npm install
echo -e "${GREEN}✓${NC} Dependencies installed"

# Determine action
ACTION=${1:-dev}

case $ACTION in
    dev)
        echo ""
        echo -e "${GREEN}🚀 Starting development server...${NC}"
        echo -e "${BLUE}→${NC} Access at http://localhost:5173"
        echo ""
        npm run dev
        ;;
    
    build)
        echo ""
        echo -e "${GREEN}🏗️  Building for production...${NC}"
        npm run build
        echo -e "${GREEN}✓${NC} Build complete! Output in ./dist/"
        echo ""
        echo -e "${BLUE}→${NC} To preview: npm run preview"
        echo -e "${BLUE}→${NC} To serve: npx serve -s dist -p 8080"
        ;;
    
    docker)
        if ! command -v docker &> /dev/null; then
            echo -e "${YELLOW}⚠️  Docker not found${NC}"
            exit 1
        fi
        
        echo ""
        echo -e "${GREEN}🐳 Building Docker image...${NC}"
        docker build -t debate-arena-frontend .
        echo -e "${GREEN}✓${NC} Docker image built"
        echo ""
        echo -e "${BLUE}→${NC} To run: docker run -p 8080:80 -e VITE_API_URL=http://localhost:3000 debate-arena-frontend"
        ;;
    
    *)
        echo -e "${YELLOW}Usage: ./setup.sh [dev|build|docker]${NC}"
        echo ""
        echo "Commands:"
        echo "  dev     - Start development server (default)"
        echo "  build   - Build for production"
        echo "  docker  - Build Docker image"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Done!${NC}"
