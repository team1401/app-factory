# ViewFinder Deployment Guide

## Prerequisites

- Docker and Docker Compose installed on plex
- SSH access to plex (helix@plex or helix@100.97.65.28)

## Deployment Steps

### Option 1: From Your Workstation (Recommended)

```bash
# 1. Copy project to plex
rsync -avz /Users/helix/.openclaw/workspace/projects/daily-apps/2026-02-10/ helix@plex:~/daily-apps/2026-02-10/

# 2. SSH into plex
ssh helix@plex

# 3. Navigate to project
cd ~/daily-apps/2026-02-10

# 4. Make deploy script executable
chmod +x deploy.sh

# 5. Run deployment
./deploy.sh
```

### Option 2: Manual Deployment on plex

```bash
# 1. SSH into plex
ssh helix@plex

# 2. Navigate to project
cd ~/daily-apps/2026-02-10

# 3. Build and start containers
docker-compose up -d --build

# 4. Check status
docker-compose ps
docker-compose logs -f
```

## Verify Deployment

Once deployed, access ViewFinder at:

**Local:** http://localhost:3100  
**Network:** http://100.97.65.28:3100

Test the app:
1. The globe should render and slowly auto-rotate
2. Click anywhere on Earth → should calculate longest sight line (~5-10 seconds)
3. Info panel slides up from bottom-left showing distance and coordinates
4. Leaderboard in top-right shows top 10 longest sight lines globally

## Troubleshooting

### Containers won't start

```bash
# Check logs
docker-compose logs

# Specific container
docker-compose logs backend
docker-compose logs frontend
```

### Port already in use

```bash
# Check what's using port 3100
sudo lsof -i :3100

# Stop conflicting container
docker ps
docker stop <container-name>
```

### API not responding

```bash
# Check backend health
curl http://localhost:3100/api/leaderboard

# Should return JSON with top 10 sight lines
```

### Globe not rendering

- Check browser console for errors (F12)
- Ensure WebGL is supported in browser
- Try a different browser (Chrome/Firefox recommended)

## Architecture

```
ViewFinder Stack:
├─ Nginx (port 3100 → host)
│  ├─ Serves React SPA (frontend)
│  └─ Proxies /api → backend:3101
│
└─ Node.js API (port 3101 → internal only)
   ├─ GET /api/sightline?lat=X&lon=Y
   ├─ GET /api/leaderboard
   └─ GET /health
```

## Updating

```bash
cd ~/daily-apps/2026-02-10
docker-compose down
git pull  # if using git
docker-compose up -d --build
```

## Cleanup

To completely remove ViewFinder:

```bash
cd ~/daily-apps/2026-02-10
docker-compose down -v
cd ..
rm -rf 2026-02-10
```

## Environment Variables

No configuration needed for MVP! All settings use sensible defaults.

Optional overrides (in docker-compose.yml):

```yaml
backend:
  environment:
    - PORT=3101
    - NODE_ENV=production
```

---

**Questions?** Check the logs first, then reach out to Helix 🌀
