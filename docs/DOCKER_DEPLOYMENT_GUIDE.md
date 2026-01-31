# Docker Deployment Guide - My Genesis Fortune

This guide covers deploying the My Genesis Fortune Real Estate Platform using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- At least 4GB RAM available
- 10GB free disk space

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd Genesis

# Copy environment file
cp .env.example .env

# Edit .env with your actual credentials
nano .env  # or use your preferred editor
```

### 2. Configure Environment Variables

Edit the `.env` file and update the following critical variables:

```bash
# Security
JWT_SECRET=<generate-a-strong-random-secret>
MONGO_ROOT_PASSWORD=<strong-mongodb-password>

# Email (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# SMS Services (choose one or both)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+your_phone_number

CELCOM_AFRICA_API_KEY=your_celcom_key
CELCOM_AFRICA_PARTNER_ID=your_partner_id

# M-Pesa Payment
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
MPESA_BUSINESS_SHORT_CODE=your_shortcode
MPESA_PASSKEY=your_passkey

# AI Services
GROQ_API_KEY=your_groq_key
GOOGLE_AI_API_KEY=your_google_ai_key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 3. Build and Run

```bash
# Build all services
docker-compose build

# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. Verify Deployment

```bash
# Check service health
docker-compose ps

# Test backend API
curl https://api.mygenesisfortune.com/api/health

# Access frontend
# Open https://mygenesisfortune.com in your browser
```

## Service Ports

- **Frontend**: https://mygenesisfortune.com
- **Backend API**: https://api.mygenesisfortune.com
- **MongoDB**: localhost:27017

## Common Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes all data)
docker-compose down -v

# Restart a specific service
docker-compose restart backend

# View resource usage
docker stats

# Execute command in running container
docker-compose exec backend sh
docker-compose exec mongodb mongosh

# Rebuild after code changes
docker-compose up -d --build

# Scale a service (if needed)
docker-compose up -d --scale backend=3
```

## Production Deployment

### 1. Environment Configuration

```bash
# Update .env for production
NODE_ENV=production
FRONTEND_URL=https://mygenesisfortune.com
VITE_API_URL=https://api.mygenesisfortune.com
MPESA_CALLBACK_URL=https://api.mygenesisfortune.com/api/payments/mpesa/callback
```

### 2. Security Hardening

```bash
# Generate strong JWT secret
JWT_SECRET=$(openssl rand -base64 64)

# Use strong MongoDB password
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)
```

### 3. Reverse Proxy Setup (Nginx)

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

### 4. SSL Configuration

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificates
sudo certbot --nginx -d mygenesisfortune.com -d www.mygenesisfortune.com -d api.mygenesisfortune.com

# Auto-renewal is configured automatically
```

## Monitoring and Maintenance

### Health Checks

```bash
# Backend health
curl https://api.mygenesisfortune.com/api/health

# MongoDB health
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Container health status
docker-compose ps
```

### Backup Database

```bash
# Create backup
docker-compose exec mongodb mongodump --out /data/backup

# Copy backup from container
docker cp mygenesisfortune-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)

# Restore backup
docker-compose exec mongodb mongorestore /data/backup
```

### View Logs

```bash
# All services
docker-compose logs --tail=100 -f

# Specific service with timestamps
docker-compose logs --tail=100 -f --timestamps backend

# Export logs to file
docker-compose logs --no-color > logs-$(date +%Y%m%d-%H%M%S).txt
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart services
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify deployment
docker-compose ps
docker-compose logs -f
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. MongoDB not ready - wait for health check
# 2. Missing environment variables - check .env file
# 3. Port already in use - change BACKEND_PORT in .env
```

### Frontend build fails

```bash
# Check Node version in Dockerfile (should be 20+)
# Rebuild with no cache
docker-compose build --no-cache frontend
```

### MongoDB connection issues

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Verify credentials in .env
# Ensure MONGO_URI format is correct:
# mongodb://username:password@mongodb:27017/database?authSource=admin
```

### Port conflicts

```bash
# Change ports in .env
BACKEND_PORT=5001
FRONTEND_PORT=3001
MONGO_PORT=27018

# Restart services
docker-compose down
docker-compose up -d
```

## Performance Optimization

### 1. Resource Limits

Add to docker-compose.yml under each service:

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
    reservations:
      memory: 512M
```

### 2. Enable MongoDB Replica Set (for production)

Update docker-compose.yml to add replica set for better performance and reliability.

### 3. Use Docker Volumes for Persistent Data

Already configured in docker-compose.yml:
- `mongodb_data` - Database files
- `./backend/uploads` - User uploads

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review backend/.env.example for all required variables
- Consult backend/docs/ for SMS and payment integration guides

## Security Checklist

- [ ] Strong JWT_SECRET generated
- [ ] Secure MongoDB password
- [ ] Environment variables not committed to git
- [ ] SSL/TLS enabled in production
- [ ] Firewall configured (only expose 80, 443)
- [ ] Regular backups scheduled
- [ ] Container images updated regularly
- [ ] Secrets not in docker-compose.yml (use .env)
