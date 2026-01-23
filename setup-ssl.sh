#!/bin/bash

# Setup SSL with nginx-proxy and Let's Encrypt
# This script sets up automatic SSL certificate generation for your domains

set -e

echo "========================================="
echo "  SSL Setup for Genesis Platform"
echo "========================================="
echo ""

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH"
    exit 1
fi

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

# Create app-network if it doesn't exist
echo "📡 Creating app-network..."
if docker network inspect app-network >/dev/null 2>&1; then
    echo "✓ app-network already exists"
else
    docker network create app-network
    echo "✓ app-network created"
fi
echo ""

# Stop and remove any existing nginx-proxy containers
echo "🧹 Cleaning up old proxy containers..."
docker stop nginx-proxy nginx-proxy-acme 2>/dev/null || true
docker rm nginx-proxy nginx-proxy-acme 2>/dev/null || true
echo "✓ Cleanup complete"
echo ""

# Start nginx-proxy and acme-companion
echo "🚀 Starting nginx-proxy and Let's Encrypt companion..."
$DOCKER_COMPOSE -f docker-compose.proxy.yml up -d
echo "✓ Proxy containers started"
echo ""

# Wait for containers to be healthy
echo "⏳ Waiting for containers to initialize..."
sleep 10

# Check if containers are running
if [ "$(docker ps -q -f name=nginx-proxy)" ] && [ "$(docker ps -q -f name=nginx-proxy-acme)" ]; then
    echo "✓ All proxy containers are running"
    echo ""
    echo "========================================="
    echo "  SSL Proxy Setup Complete!"
    echo "========================================="
    echo ""
    echo "📋 Container Status:"
    docker ps --filter "name=nginx-proxy" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Start your application containers:"
    echo "   $DOCKER_COMPOSE up -d"
    echo ""
    echo "2. Let's Encrypt will automatically generate certificates for:"
    echo "   - mygenesisfortune.com"
    echo "   - www.mygenesisfortune.com"
    echo "   - api.mygenesisfortune.com"
    echo ""
    echo "3. Certificate generation takes 1-2 minutes"
    echo "   Check logs with: docker logs -f nginx-proxy-acme"
    echo ""
    echo "4. Verify certificates:"
    echo "   docker exec nginx-proxy ls -la /etc/nginx/certs/"
    echo ""
    echo "⚠️  IMPORTANT:"
    echo "   - Ensure your domains are pointing to this server's IP"
    echo "   - Port 80 and 443 must be open in your firewall"
    echo "   - DNS records must be configured before certificates can be issued"
else
    echo "❌ Error: Proxy containers failed to start"
    echo "📝 Checking logs..."
    docker logs nginx-proxy 2>&1 || true
    docker logs nginx-proxy-acme 2>&1 || true
    exit 1
fi
