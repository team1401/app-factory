# ViralCheck Frontend - Quickstart

## 🚀 Development

```bash
cd /Users/helix/.openclaw/workspace/projects/daily-apps/2026-02-15/frontend

# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build
```

## 🐳 Docker

```bash
# Build
docker build -t viralcheck-frontend .

# Run (standalone)
docker run -p 3000:80 \
  -e VITE_API_URL=http://localhost:3100 \
  viralcheck-frontend

# Access: http://localhost:3000
```

## 🔧 Configuration

Create `.env` file:
```env
VITE_API_URL=http://localhost:3100
```

Or set via docker-compose:
```yaml
environment:
  - VITE_API_URL=http://backend:3100
```

## 📋 Checklist

- [x] Dark mode with purple/blue gradients
- [x] Framer Motion animations (stagger, counter, slide-ins)
- [x] Glassmorphism panels
- [x] Inter typography
- [x] Recharts visualization
- [x] BYOK settings modal
- [x] Real-time persona voting
- [x] Results display (score, chart, reactions, suggestions)
- [x] Mobile responsive
- [x] Dockerfile (npm install + nginx)

## 🎨 Key Features

- **Animated score counter** - Counts from 0 to final score
- **Persona cards** - Staggered animations with spring physics
- **Settings gear** - Top-right corner, opens BYOK modal
- **Glass panels** - Frosted glass effect throughout
- **Responsive grid** - 1/2/3 columns based on screen size
- **Health check** - nginx serves `/health` endpoint

## 🔗 API Integration

Backend expected at: `VITE_API_URL` (default: http://localhost:3100)

Endpoints used:
- `POST /api/generate-personas`
- `POST /api/test-content`

Headers sent (if BYOK configured):
- `X-AI-Provider: openai|anthropic`
- `X-AI-API-Key: sk-...`

## ✨ What Makes It Special

1. **Floating background orbs** - Infinite animations
2. **Gradient text effects** - Purple-to-blue gradients
3. **Spring physics** - Natural, bouncy animations
4. **Glassmorphism** - backdrop-filter blur effects
5. **Custom scrollbar** - Purple-tinted
6. **Input glow** - Focus states with purple rings
7. **Status dots** - Green/red indicators
8. **Micro-interactions** - Hover scales, rotations

Ready to ship! 🚀
