# Deployment Guide

## Quick Deploy to Plex Server

### 1. Prepare Environment

On your local machine:
```bash
cd /Users/helix/.openclaw/workspace/projects/daily-apps/2026-02-11/backend

# Create production .env file
cat > .env << 'EOF'
PORT=3100
NODE_ENV=production
OPENAI_API_KEY=your-key-here
# OR
# ANTHROPIC_API_KEY=your-key-here
EOF
```

### 2. Deploy to Plex

**Option A: Docker Compose (Recommended)**

```bash
# Copy to plex
scp -r /Users/helix/.openclaw/workspace/projects/daily-apps/2026-02-11/backend helix@plex:~/vulnscout-backend/

# SSH to plex
ssh helix@plex

# Navigate and start
cd ~/vulnscout-backend
docker-compose up -d

# Check logs
docker-compose logs -f

# Test
curl http://localhost:3100/health
```

**Option B: Systemd Service**

```bash
# Copy to plex
scp -r /Users/helix/.openclaw/workspace/projects/daily-apps/2026-02-11/backend helix@plex:~/vulnscout-backend/

# SSH to plex
ssh helix@plex

# Install dependencies
cd ~/vulnscout-backend
npm install

# Create systemd service
sudo tee /etc/systemd/system/vulnscout-backend.service << 'EOF'
[Unit]
Description=VulnScout Backend
After=network.target

[Service]
Type=simple
User=helix
WorkingDirectory=/home/helix/vulnscout-backend
Environment=NODE_ENV=production
EnvironmentFile=/home/helix/vulnscout-backend/.env
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl daemon-reload
sudo systemctl enable vulnscout-backend
sudo systemctl start vulnscout-backend

# Check status
sudo systemctl status vulnscout-backend

# View logs
sudo journalctl -u vulnscout-backend -f
```

### 3. Configure Nginx Reverse Proxy

On plex:

```bash
# Create nginx config
sudo tee /etc/nginx/sites-available/vulnscout << 'EOF'
server {
    listen 80;
    server_name vulnscout.local;  # or your domain

    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/vulnscout /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Health Monitoring

**Add to cron for health checks:**

```bash
# On plex
crontab -e

# Add this line (check every 5 minutes)
*/5 * * * * curl -f http://localhost:3100/health || systemctl restart vulnscout-backend
```

**Or use existing Tactical RMM for monitoring:**

Create a script check that hits the health endpoint.

### 5. Firewall Configuration

```bash
# Allow port 3100 (if needed)
sudo ufw allow 3100/tcp

# Or just allow nginx
sudo ufw allow 'Nginx Full'
```

## Production Checklist

- [ ] Environment variables configured in `.env`
- [ ] API keys are valid and have quota
- [ ] Service starts automatically on boot
- [ ] Health endpoint responds
- [ ] Logs are being written
- [ ] Nginx reverse proxy configured (if applicable)
- [ ] Firewall rules configured
- [ ] SSL/TLS certificate installed (if external)
- [ ] Monitoring/alerts configured
- [ ] Backup strategy for configuration files

## Updating the Backend

### Docker Method

```bash
ssh helix@plex
cd ~/vulnscout-backend

# Pull latest changes (if using git)
git pull

# Or copy new files
# scp -r backend/* helix@plex:~/vulnscout-backend/

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### Systemd Method

```bash
ssh helix@plex
cd ~/vulnscout-backend

# Pull/copy latest changes
git pull  # or scp

# Reinstall dependencies if package.json changed
npm install

# Restart service
sudo systemctl restart vulnscout-backend

# Check status
sudo systemctl status vulnscout-backend
```

## Rollback

### Docker

```bash
# Stop current version
docker-compose down

# Restore from backup
cp -r ~/vulnscout-backend.backup ~/vulnscout-backend

# Start
docker-compose up -d
```

### Systemd

```bash
# Stop service
sudo systemctl stop vulnscout-backend

# Restore from backup
sudo rm -rf ~/vulnscout-backend
sudo cp -r ~/vulnscout-backend.backup ~/vulnscout-backend

# Start service
sudo systemctl start vulnscout-backend
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
sudo journalctl -u vulnscout-backend -n 50

# Or for Docker
docker-compose logs --tail=50

# Common issues:
# - Port already in use
# - Missing .env file
# - Invalid API keys
# - Node.js not installed
```

### High Memory Usage

```bash
# Check memory
docker stats vulnscout-backend

# Or
ps aux | grep node

# Consider adding memory limits in docker-compose.yml:
# services:
#   backend:
#     mem_limit: 512m
```

### Slow Response Times

```bash
# Check OSV.dev connectivity
curl -X POST https://api.osv.dev/v1/query \
  -H "Content-Type: application/json" \
  -d '{"package":{"name":"express","ecosystem":"npm"},"version":"4.17.1"}'

# Check AI provider
# OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

## Monitoring & Logs

### View Logs

```bash
# Docker
docker-compose logs -f backend

# Systemd
sudo journalctl -u vulnscout-backend -f

# Last 100 lines
sudo journalctl -u vulnscout-backend -n 100
```

### Log Rotation

For systemd, logs are automatically rotated by journald.

For Docker, configure in docker-compose.yml:

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Backup

```bash
# Backup entire directory
tar -czf vulnscout-backend-$(date +%Y%m%d).tar.gz ~/vulnscout-backend

# Backup just configuration
cp ~/vulnscout-backend/.env ~/vulnscout-backend.env.backup
```

## Security Hardening

1. **Use environment variables for secrets** (already done)
2. **Run as non-root user** (already configured)
3. **Enable HTTPS** with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d vulnscout.yourdomain.com
   ```
4. **Add rate limiting** in nginx:
   ```nginx
   limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
   
   location /api/ {
       limit_req zone=api burst=20;
       proxy_pass http://localhost:3100;
   }
   ```
5. **Keep dependencies updated**:
   ```bash
   npm audit
   npm audit fix
   ```

## Performance Optimization

1. **Enable compression** in nginx
2. **Add caching** for static responses
3. **Use PM2** for process management (if not using Docker):
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name vulnscout-backend
   pm2 startup
   pm2 save
   ```

## Next Steps

- [ ] Set up SSL certificate
- [ ] Configure log aggregation (if needed)
- [ ] Add alerting for downtime
- [ ] Create automated backup cron job
- [ ] Document any custom configuration
