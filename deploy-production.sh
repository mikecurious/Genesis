#!/bin/bash

# Production Deployment Script
# This script pulls latest code and rebuilds containers on production

set -e

echo "========================================="
echo "  Genesis Production Deployment"
echo "========================================="
echo ""

# Detect docker-compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Error: Neither 'docker-compose' nor 'docker compose' is available"
    exit 1
fi

echo "✓ Using: $DOCKER_COMPOSE"
echo ""

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Show current status
echo "📋 Current Status:"
echo "   Current branch: $(git branch --show-current)"
echo "   Current commit: $(git rev-parse --short HEAD)"
echo ""

# Pull latest code
echo "📥 Pulling latest code from git..."
git fetch origin
git pull origin main
echo "✓ Code updated"
echo "   Latest commit: $(git rev-parse --short HEAD)"
echo ""

# Stop containers
echo "🛑 Stopping containers..."
$DOCKER_COMPOSE down
echo "✓ Containers stopped"
echo ""

# Rebuild all images without cache
echo "🔨 Rebuilding all containers (this may take a few minutes)..."
$DOCKER_COMPOSE build --no-cache
echo "✓ Containers rebuilt"
echo ""

# Start all services
echo "🚀 Starting all services..."
$DOCKER_COMPOSE up -d
echo "✓ Services started"
echo ""

# Wait for containers to initialize
echo "⏳ Waiting for containers to initialize..."
sleep 10

# Check container status
echo "📋 Container Status:"
$DOCKER_COMPOSE ps
echo ""

# Check logs for errors
echo "📝 Recent Backend Logs:"
$DOCKER_COMPOSE logs --tail=20 backend | grep -v "WARN\[0000\]" || true
echo ""

echo "📝 Recent Frontend Logs:"
$DOCKER_COMPOSE logs --tail=10 frontend | grep -v "WARN\[0000\]" || true
echo ""

# Check if backend is healthy
if $DOCKER_COMPOSE ps backend | grep -q "Up"; then
    echo "✅ Backend is running"
    echo ""
    echo "⏳ Waiting for SSL certificate generation..."
    echo "   Let's Encrypt will generate certificates for:"
    echo "   - mygenesisfortune.com"
    echo "   - www.mygenesisfortune.com"
    echo "   - api.mygenesisfortune.com"
    echo ""
    echo "   This takes 1-3 minutes. Check progress with:"
    echo "   docker logs -f nginx-proxy-acme"
    echo ""
else
    echo "❌ Backend failed to start!"
    echo "📝 Full backend logs:"
    $DOCKER_COMPOSE logs backend
    exit 1
fi

echo "========================================="
echo "  Deployment Complete!"
echo "========================================="
echo ""
echo "🌐 Your application should be available at:"
echo "   - Frontend: https://mygenesisfortune.com"
echo "   - Backend API: https://api.mygenesisfortune.com"
echo ""
echo "📋 Useful Commands:"
echo "   View logs: $DOCKER_COMPOSE logs -f [backend|frontend|mongodb]"
echo "   Restart: $DOCKER_COMPOSE restart [service]"
echo "   Status: $DOCKER_COMPOSE ps"
echo "   SSL certs: docker exec nginx-proxy ls -la /etc/nginx/certs/"
echo ""
