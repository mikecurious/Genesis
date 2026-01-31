#!/bin/bash

# Diagnostic script for SSL and environment issues
echo "========================================="
echo "  Genesis Platform Diagnostics"
echo "========================================="
echo ""

# 1. Check nginx-proxy containers
echo "1️⃣  Checking nginx-proxy containers..."
if docker ps -q -f name=nginx-proxy > /dev/null; then
    echo "   ✓ nginx-proxy is running"
    docker ps --filter "name=nginx-proxy" --format "   {{.Names}}: {{.Status}}"
else
    echo "   ❌ nginx-proxy is NOT running"
fi
echo ""

# 2. Check SSL certificates
echo "2️⃣  Checking SSL certificates..."
if docker exec nginx-proxy test -d /etc/nginx/certs 2>/dev/null; then
    echo "   Certificates found:"
    docker exec nginx-proxy ls -la /etc/nginx/certs/ 2>/dev/null | grep -E "\.(crt|key)$" | awk '{print "   -", $9}' || echo "   No certificates found"
else
    echo "   ❌ Certificate directory not accessible"
fi
echo ""

# 3. Check if domains are configured in nginx
echo "3️⃣  Checking nginx virtual hosts..."
if docker exec nginx-proxy test -d /etc/nginx/vhost.d 2>/dev/null; then
    echo "   Virtual hosts configured:"
    docker exec nginx-proxy ls -1 /etc/nginx/vhost.d 2>/dev/null | sed 's/^/   - /' || echo "   No virtual hosts configured"
else
    echo "   ❌ Virtual host directory not accessible"
fi
echo ""

# 4. Check application containers
echo "4️⃣  Checking application containers..."
for container in mygenesisfortune-frontend mygenesisfortune-backend mygenesisfortune-mongodb; do
    if docker ps -q -f name=$container > /dev/null; then
        status=$(docker ps -f name=$container --format "{{.Status}}")
        echo "   ✓ $container: $status"
    else
        echo "   ❌ $container is NOT running"
    fi
done
echo ""

# 5. Check network connectivity
echo "5️⃣  Checking app-network connectivity..."
if docker network inspect app-network >/dev/null 2>&1; then
    echo "   ✓ app-network exists"
    echo "   Containers on app-network:"
    docker network inspect app-network --format '{{range .Containers}}   - {{.Name}}{{println}}{{end}}' 2>/dev/null || echo "   No containers connected"
else
    echo "   ❌ app-network does NOT exist"
fi
echo ""

# 6. Check environment variables in backend
echo "6️⃣  Checking backend environment variables..."
if docker ps -q -f name=mygenesisfortune-backend > /dev/null; then
    echo "   VIRTUAL_HOST: $(docker exec mygenesisfortune-backend printenv VIRTUAL_HOST 2>/dev/null || echo 'NOT SET')"
    echo "   LETSENCRYPT_HOST: $(docker exec mygenesisfortune-backend printenv LETSENCRYPT_HOST 2>/dev/null || echo 'NOT SET')"
    echo "   LETSENCRYPT_EMAIL: $(docker exec mygenesisfortune-backend printenv LETSENCRYPT_EMAIL 2>/dev/null || echo 'NOT SET')"
    echo "   GOOGLE_CLIENT_ID: $(docker exec mygenesisfortune-backend printenv GOOGLE_CLIENT_ID 2>/dev/null | grep -o '^[^.]*' || echo 'NOT SET')"
else
    echo "   ❌ Backend container not running"
fi
echo ""

# 7. Check DNS resolution
echo "7️⃣  Checking DNS resolution..."
for domain in mygenesisfortune.com www.mygenesisfortune.com api.mygenesisfortune.com; do
    if command -v dig &> /dev/null; then
        ip=$(dig +short $domain | head -n1)
        echo "   $domain -> ${ip:-NOT RESOLVED}"
    elif command -v nslookup &> /dev/null; then
        ip=$(nslookup $domain 2>/dev/null | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | head -n1)
        echo "   $domain -> ${ip:-NOT RESOLVED}"
    else
        echo "   ⚠️  dig/nslookup not available, skipping DNS check"
        break
    fi
done
echo ""

# 8. Check .env file
echo "8️⃣  Checking .env file..."
if [ -f ".env" ]; then
    echo "   ✓ .env file exists"
    echo "   Key variables status:"
    grep -E "^(GOOGLE_CLIENT_ID|VITE_GOOGLE_CLIENT_ID|GOOGLE_AI_API_KEY|MONGO_URI)=" .env | sed 's/=.*/=***/' | sed 's/^/   - /' || echo "   ⚠️  Some key variables might be missing"
else
    echo "   ❌ .env file NOT FOUND in current directory"
fi
echo ""

# 9. Check acme-companion logs for certificate generation
echo "9️⃣  Recent acme-companion logs (certificate generation)..."
if docker ps -q -f name=nginx-proxy-acme > /dev/null; then
    docker logs --tail=20 nginx-proxy-acme 2>&1 | grep -E "(Creating|Reloading|Error|api\.mygenesisfortune)" | tail -10 | sed 's/^/   /'
    echo ""
else
    echo "   ❌ acme-companion not running"
fi

echo "========================================="
echo "  Diagnostic Complete"
echo "========================================="
echo ""
echo "📋 Summary:"
echo "   If you see issues above, here's what to do:"
echo "   1. Missing certificates -> Wait 2-5 min for Let's Encrypt, or check acme logs"
echo "   2. NOT SET env vars -> Copy .env file to production directory"
echo "   3. Container not running -> Run 'docker compose up -d'"
echo "   4. DNS not resolved -> Update DNS records with your server IP"
echo ""
