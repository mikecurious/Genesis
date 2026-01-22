# My Genesis Fortune - Quick Deployment Guide

## Your Domains
- **Frontend**: https://mygenesisfortune.com
- **Backend API**: https://api.mygenesisfortune.com

## Prerequisites on Server

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Install Make (optional but recommended)
sudo apt-get install make

# Install Nginx for reverse proxy
sudo apt-get install nginx

# Install Certbot for SSL
sudo apt-get install certbot python3-certbot-nginx
```

## Step 1: Clone and Configure

```bash
# Clone your repository
git clone https://github.com/mikecurious/Genesis.git
cd Genesis

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Critical Environment Variables to Set:

```bash
# Security (MUST CHANGE!)
JWT_SECRET=$(openssl rand -base64 64)
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)

# Domains
FRONTEND_URL=https://mygenesisfortune.com
VITE_API_URL=https://api.mygenesisfortune.com

# M-Pesa
MPESA_CALLBACK_URL=https://api.mygenesisfortune.com/api/payments/mpesa/callback

# Add all your other API keys for:
# - Email (Gmail/SendGrid)
# - SMS (Twilio, Celcom Africa)
# - M-Pesa payment
# - AI services (Groq, Google AI)
# - Cloudinary
```

## Step 2: Setup DNS Records

Point your domains to your server IP:

```
A Record:     mygenesisfortune.com        →  YOUR_SERVER_IP
A Record:     www.mygenesisfortune.com    →  YOUR_SERVER_IP
A Record:     api.mygenesisfortune.com    →  YOUR_SERVER_IP
```

## Step 3: Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/mygenesisfortune`:

```nginx
server {
    listen 80;
    server_name mygenesisfortune.com www.mygenesisfortune.com;

    location / {
        proxy_pass http://localhost:3000;
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

server {
    listen 80;
    server_name api.mygenesisfortune.com;

    location / {
        proxy_pass http://localhost:5000;
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
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/mygenesisfortune /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 4: Get SSL Certificates

```bash
sudo certbot --nginx -d mygenesisfortune.com -d www.mygenesisfortune.com -d api.mygenesisfortune.com
```

Follow the prompts. Certbot will automatically configure HTTPS and set up auto-renewal.

## Step 5: Deploy with Docker

```bash
# Build and start services
make build
make up

# Or without Make:
docker-compose build
docker-compose up -d

# View logs
make logs
# or
docker-compose logs -f
```

## Step 6: Verify Deployment

```bash
# Check containers are running
docker-compose ps

# Check health
curl https://api.mygenesisfortune.com/api/health

# Visit your site
# Open https://mygenesisfortune.com in browser
```

## Common Management Commands

```bash
# View logs
make logs

# Restart services
make restart

# Stop services
make down

# Backup database
make backup

# Update application
git pull
make update
```

## Monitoring

```bash
# View container resource usage
docker stats

# Check service health
make health

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

## Backup & Restore

```bash
# Create backup
make backup
# Backup saved to ./backups/backup-YYYYMMDD-HHMMSS/

# Restore from backup
make restore FILE=./backups/backup-20240116-120000
```

## Troubleshooting

### Services won't start
```bash
# Check logs for errors
docker-compose logs

# Verify .env file has all required variables
cat .env
```

### Can't connect to database
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

### SSL certificate issues
```bash
# Check Certbot status
sudo certbot certificates

# Renew manually if needed
sudo certbot renew
```

### Port conflicts
```bash
# Check what's using the ports
sudo netstat -tulpn | grep -E ':(80|443|5000|3000|27017)'

# Stop conflicting services or change ports in .env
```

## Security Checklist

- [ ] Changed JWT_SECRET from default
- [ ] Changed MONGO_ROOT_PASSWORD from default
- [ ] SSL certificates installed and working
- [ ] Firewall configured (allow 80, 443; restrict 5000, 3000, 27017)
- [ ] All API keys added to .env
- [ ] .env file has correct permissions (600)
- [ ] Regular backups scheduled

## Production Best Practices

1. **Set up automated backups**
   ```bash
   # Add to crontab for daily backups at 2 AM
   0 2 * * * cd /path/to/Genesis && make backup
   ```

2. **Monitor disk space**
   ```bash
   df -h
   docker system df
   ```

3. **Update regularly**
   ```bash
   git pull
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **Monitor logs for errors**
   ```bash
   docker-compose logs --tail=100 -f
   ```

## Support

- Full documentation: See `DOCKER_DEPLOYMENT_GUIDE.md`
- SMS setup: See `backend/docs/SMS_INTEGRATION_GUIDE.md`
- Issues: Check container logs with `docker-compose logs`

## Quick Reference

| Service | URL | Container Port | Host Port |
|---------|-----|----------------|-----------|
| Frontend | https://mygenesisfortune.com | 80 | 3000 |
| Backend | https://api.mygenesisfortune.com | 5000 | 5000 |
| MongoDB | Internal only | 27017 | 27017 |

**Note**: The Nginx reverse proxy handles HTTPS (443) and forwards to the container ports listed above.
