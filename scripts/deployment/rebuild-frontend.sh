#!/bin/bash

# Rebuild Frontend Script for Google OAuth Fix
# This script rebuilds the frontend Docker container with the correct VITE_GOOGLE_CLIENT_ID

set -e  # Exit on error

echo "========================================="
echo "  Rebuilding Frontend for Google OAuth"
echo "========================================="
echo ""

# Detect docker-compose command (v1 vs v2)
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Error: Neither 'docker-compose' nor 'docker compose' is available"
    exit 1
fi

echo "✓ Using: $DOCKER_COMPOSE"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found in current directory"
    exit 1
fi

# Verify VITE_GOOGLE_CLIENT_ID is set
if ! grep -q "VITE_GOOGLE_CLIENT_ID=" .env; then
    echo "❌ Error: VITE_GOOGLE_CLIENT_ID not found in .env file"
    exit 1
fi

echo "✓ Environment configuration verified"
echo ""

# Stop the frontend container
echo "🛑 Stopping frontend container..."
$DOCKER_COMPOSE stop frontend
echo "✓ Frontend stopped"
echo ""

# Remove the old frontend image to force rebuild
echo "🗑️  Removing old frontend image..."
$DOCKER_COMPOSE rm -f frontend
echo "✓ Old image removed"
echo ""

# Rebuild the frontend without cache
echo "🔨 Rebuilding frontend (this may take a few minutes)..."
$DOCKER_COMPOSE build --no-cache frontend
echo "✓ Frontend rebuilt successfully"
echo ""

# Start the frontend
echo "🚀 Starting frontend container..."
$DOCKER_COMPOSE up -d frontend
echo "✓ Frontend started"
echo ""

# Wait a few seconds for the container to initialize
echo "⏳ Waiting for container to initialize..."
sleep 5

# Check if the container is running
if [ "$($DOCKER_COMPOSE ps -q frontend)" ]; then
    echo "✓ Frontend container is running"
    echo ""
    echo "========================================="
    echo "  Frontend Rebuild Complete!"
    echo "========================================="
    echo ""
    echo "📋 Container Status:"
    $DOCKER_COMPOSE ps frontend
    echo ""
    echo "📝 Recent Logs:"
    $DOCKER_COMPOSE logs --tail=20 frontend
    echo ""
    echo "✅ Google OAuth should now be working on:"
    echo "   - https://mygenesisfortune.com"
    echo "   - https://www.mygenesisfortune.com"
    echo ""
    echo "💡 To view live logs, run:"
    echo "   $DOCKER_COMPOSE logs -f frontend"
else
    echo "❌ Error: Frontend container failed to start"
    echo "📝 Checking logs..."
    $DOCKER_COMPOSE logs --tail=50 frontend
    exit 1
fi
