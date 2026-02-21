# ViewFinder 🌀

**Interactive web app to discover the longest lines of sight from any point on Earth**

Built overnight by the AI App Factory on **February 10, 2026**

## Inspiration

Trending on Hacker News (385 points, 158 comments) - [All The Views](https://alltheviews.world)

A research project that algorithmically calculated 4.5 billion lines of sight to find the longest unobstructed views on Earth. The winner: Hindu Kush to Pik Dankova at 530km!

## What It Does

- **Click anywhere on Earth** → Calculates the longest unobstructed line of sight from that point
- **Beautiful 3D globe** with WebGL rendering (Three.js)
- **Top 10 leaderboard** of the longest sight lines globally
- **Award-winning UI** with dark mode, glassmorphism, and smooth animations

## Tech Stack

**Frontend:**
- React + Vite
- Three.js + React Three Fiber (3D globe)
- Framer Motion (animations)
- Glassmorphism design language

**Backend:**
- Node.js + Express
- Simplified viewshed algorithm
- Open-Elevation API for terrain data
- In-memory caching

## Quick Start

```bash
# With Docker Compose
docker-compose up -d

# Access at http://localhost:3100
```

Or run manually:

```bash
# Backend
cd backend
npm install
npm start  # Port 3101

# Frontend
cd frontend
npm install
npm run dev  # Port 3101
```

## Deployment

Currently running on plex (Tailscale IP: 100.97.65.28)

**URL:** http://100.97.65.28:3100

## Architecture

```
┌─────────────────┐
│  Nginx (port 80)│  ← Exposed as 3100 on host
│  Serves frontend│
│  Proxies /api   │
└────────┬────────┘
         │
         ├─→ Static files (React SPA)
         │
         └─→ /api/* → Backend (port 3101)
                      ├─ GET /api/sightline?lat=X&lon=Y
                      └─ GET /api/leaderboard
```

## MVP Scope

✅ Interactive 3D globe  
✅ Click-to-calculate sight lines  
✅ Top 10 leaderboard (hardcoded)  
✅ Sight line visualization (arc on globe)  
✅ Glassmorphism UI with animations  
✅ Share links (copy coordinates)  

## Future V2 Ideas

- Full 360° viewshed rendering
- Multiple sight lines from one point
- AR mode (phone camera overlay)
- Time-of-day shadows
- Weather/atmospheric refraction
- Save favorite viewpoints

## Credits

- Inspired by [All The Views](https://alltheviews.world) by CacheTVS
- Built by Helix 🌀 (OpenClaw Overnight AI App Factory)
- Design philosophy: Linear/Vercel/Stripe-level polish

---

**Part of the daily-apps series** - A new AI-powered web app built every night at 1 AM.
