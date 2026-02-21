# 🚀 DebateArena Frontend - Deployment Guide

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Backend API running (see backend README)

## 🏗️ Build & Deploy

### Option 1: Docker (Recommended)

#### Single Container

```bash
# Build the image
docker build -t debate-arena-frontend .

# Run the container
docker run -d \
  --name debate-arena-frontend \
  -p 8080:80 \
  -e VITE_API_URL=http://localhost:3000 \
  debate-arena-frontend

# Check logs
docker logs -f debate-arena-frontend

# Health check
curl http://localhost:8080/health
```

#### With Docker Compose (Full Stack)

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: debate-arena-backend
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - PORT=3000
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    container_name: debate-arena-frontend
    ports:
      - "8080:80"
    environment:
      - VITE_API_URL=http://localhost:3000
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: debate-arena-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - frontend
      - backend
```

Run the stack:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your backend URL

# Start dev server with hot reload
npm run dev

# Access at http://localhost:5173
```

### Option 3: Static Build + Nginx

```bash
# Build static files
npm run build

# Output in ./dist/

# Serve with any static server:
npx serve -s dist -p 8080

# Or copy to nginx:
sudo cp -r dist/* /usr/share/nginx/html/
sudo systemctl restart nginx
```

## 🌐 Production Deployment

### Environment Variables

Set these before building:

```bash
# Required
export VITE_API_URL=https://api.yourdomain.com

# Build
npm run build
```

**⚠️ Important**: Vite environment variables are embedded at **build time**, not runtime. You must rebuild if you change `VITE_API_URL`.

### Nginx Reverse Proxy Setup

Create `/etc/nginx/sites-available/debate-arena`:

```nginx
# Upstream backends
upstream backend_api {
    server localhost:3000;
}

upstream frontend_app {
    server localhost:8080;
}

# Main server block
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://frontend_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API & WebSocket
    location /socket.io/ {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/debate-arena /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

## 🔍 Health Checks

### Frontend Health

```bash
curl http://localhost:8080/health
# Expected: "healthy"
```

### Backend Health

```bash
curl http://localhost:3000/health
# Expected: {"status":"ok"}
```

### Docker Health

```bash
# Check container health
docker ps

# Should show "healthy" status after 30 seconds
```

## 📊 Monitoring

### Container Stats

```bash
# Real-time stats
docker stats debate-arena-frontend

# Resource usage
docker inspect debate-arena-frontend | grep -A 10 Memory
```

### Nginx Access Logs

```bash
# Inside container
docker exec debate-arena-frontend tail -f /var/log/nginx/access.log

# Error logs
docker exec debate-arena-frontend tail -f /var/log/nginx/error.log
```

### Application Logs

Open browser console (F12) to see:
- WebSocket connection status
- Debate events
- Component renders
- API calls

## 🐛 Troubleshooting

### "WebSocket connection failed"

**Cause**: Backend not reachable or CORS issue

**Fix**:
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check `VITE_API_URL` matches backend URL
3. Ensure backend CORS allows frontend origin
4. Check firewall rules

### "404 on refresh"

**Cause**: SPA routing not configured

**Fix**:
- Nginx config includes `try_files $uri $uri/ /index.html;` (already in our config)
- If using Apache, add `.htaccess` with rewrite rules

### "Styles not loading"

**Cause**: Base URL mismatch or build issue

**Fix**:
```bash
# Clean rebuild
rm -rf node_modules dist
npm install
npm run build
```

### "Module not found" errors

**Cause**: Missing dependencies

**Fix**:
```bash
# Delete lockfile and reinstall
rm package-lock.json
npm install
```

### Container won't start

**Cause**: Port already in use or build failure

**Fix**:
```bash
# Check port usage
lsof -i :8080

# Kill conflicting process
kill -9 <PID>

# Rebuild image
docker build --no-cache -t debate-arena-frontend .
```

## 🔒 Security Checklist

- [ ] HTTPS enabled (use Let's Encrypt)
- [ ] Security headers configured (already in nginx.conf)
- [ ] CORS properly configured on backend
- [ ] Environment variables not committed to git
- [ ] Docker images regularly updated
- [ ] Nginx logs rotated
- [ ] Rate limiting configured (optional)
- [ ] Firewall rules set (UFW/iptables)

## 📈 Performance Optimization

### Enable Gzip in nginx.conf (already included)

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### CDN Setup (optional)

Use Cloudflare or similar:
1. Point DNS to your server
2. Enable Cloudflare proxy
3. Configure cache rules for static assets
4. Enable HTTP/3

### Asset Optimization

```bash
# Image compression
npm install -D vite-plugin-imagemin

# Bundle analysis
npm run build -- --mode analyze
```

## 🎯 Production Checklist

Before going live:

- [ ] Backend API is secured and running
- [ ] Environment variables set correctly
- [ ] SSL certificate installed
- [ ] Health checks passing
- [ ] Monitoring/logging configured
- [ ] Backups enabled (if stateful)
- [ ] Domain DNS configured
- [ ] CORS allows frontend domain
- [ ] Rate limiting on API endpoints
- [ ] Error tracking (Sentry, etc.)

## 📚 Additional Resources

- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Nginx WebSocket Proxying](https://nginx.org/en/docs/http/websocket.html)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Let's Encrypt SSL](https://letsencrypt.org/getting-started/)

---

**Need help?** Check the main README or backend documentation.
