#!/bin/bash

# Fix Google OAuth and Update Gemini Model
# Run this on production server

set -e

echo "========================================="
echo "  Fix OAuth & Update Gemini Model"
echo "========================================="
echo ""

# Detect docker-compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Error: Docker compose not available"
    exit 1
fi

# 1. Check if Google Client ID is in frontend bundle
echo "1️⃣  Checking Google OAuth in frontend..."
if docker exec mygenesisfortune-frontend grep -q "942278300063" /usr/share/nginx/html/assets/*.js 2>/dev/null; then
    echo "   ✅ Google Client ID found in frontend bundle"
else
    echo "   ❌ Google Client ID NOT in bundle"
    echo "   📝 Need to rebuild frontend with VITE_GOOGLE_CLIENT_ID"
    REBUILD_FRONTEND=true
fi
echo ""

# 2. Update .env file with Gemini 2.0 Flash
echo "2️⃣  Updating Gemini model to 2.0 Flash..."
if [ -f ".env" ]; then
    # Update GEMINI_MODEL_NAME to gemini-2.0-flash-exp
    if grep -q "GEMINI_MODEL_NAME=" .env; then
        sed -i 's/GEMINI_MODEL_NAME=.*/GEMINI_MODEL_NAME=gemini-2.0-flash-exp/' .env
        echo "   ✅ Updated GEMINI_MODEL_NAME to gemini-2.0-flash-exp"
    else
        echo "GEMINI_MODEL_NAME=gemini-2.0-flash-exp" >> .env
        echo "   ✅ Added GEMINI_MODEL_NAME=gemini-2.0-flash-exp"
    fi
else
    echo "   ❌ .env file not found"
    exit 1
fi
echo ""

# 3. Rebuild frontend if needed
if [ "$REBUILD_FRONTEND" = true ]; then
    echo "3️⃣  Rebuilding frontend with Google OAuth..."
    $DOCKER_COMPOSE stop frontend
    $DOCKER_COMPOSE build --no-cache frontend
    $DOCKER_COMPOSE up -d frontend
    echo "   ✅ Frontend rebuilt"
else
    echo "3️⃣  Skipping frontend rebuild (OAuth already present)"
fi
echo ""

# 4. Restart backend to pick up new Gemini model
echo "4️⃣  Restarting backend for Gemini update..."
$DOCKER_COMPOSE restart backend
echo "   ✅ Backend restarted"
echo ""

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 10

# Check status
echo "📋 Service Status:"
$DOCKER_COMPOSE ps
echo ""

echo "========================================="
echo "  Updates Complete!"
echo "========================================="
echo ""
echo "✅ Changes made:"
echo "   1. Gemini model updated to 2.0-flash-exp"
if [ "$REBUILD_FRONTEND" = true ]; then
    echo "   2. Frontend rebuilt with Google OAuth"
fi
echo ""
echo "🌐 Test your application:"
echo "   - Frontend: https://mygenesisfortune.com"
echo "   - Google Sign-In should now be visible"
echo "   - AI chat using Gemini 2.0 Flash Experimental"
echo ""
