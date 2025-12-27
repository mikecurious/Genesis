#!/bin/bash

echo "🧪 Testing Registration to Trigger OTP..."
echo ""
echo "This will:"
echo "1. Register a test user"
echo "2. Trigger OTP generation"
echo "3. You can see the OTP in Render logs"
echo ""
echo "Open Render logs NOW: https://dashboard.render.com/web/srv-cs94dhbuvlqc738rrv80/logs"
echo ""
read -p "Press Enter when logs page is open..."

TIMESTAMP=$(date +%s)
EMAIL="test${TIMESTAMP}@example.com"

echo ""
echo "Registering user: $EMAIL"
echo ""

curl -X POST https://genesis-hezn.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User ${TIMESTAMP}\",
    \"email\": \"${EMAIL}\",
    \"password\": \"testpass123\",
    \"phone\": \"254712345678\"
  }" \
  -s | jq '.'

echo ""
echo "✅ Registration triggered!"
echo ""
echo "Now check your Render logs for:"
echo "   User: ${EMAIL}"
echo "   Look for the OTP code"
echo ""
