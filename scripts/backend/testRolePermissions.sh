#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Role-Based Permissions${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Login as Agent
echo -e "${YELLOW}Test 1: Login as Agent${NC}"
AGENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@mygf.com","password":"password123"}')

AGENT_TOKEN=$(echo $AGENT_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$AGENT_TOKEN" ]; then
    echo -e "${GREEN}✓ Agent login successful${NC}"
    echo "Token: ${AGENT_TOKEN:0:20}..."
else
    echo -e "${RED}✗ Agent login failed${NC}"
    echo $AGENT_RESPONSE
fi
echo ""

# Test 2: Login as Surveyor
echo -e "${YELLOW}Test 2: Login as Surveyor${NC}"
SURVEYOR_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"surveyor@example.com","password":"password123"}')

SURVEYOR_TOKEN=$(echo $SURVEYOR_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$SURVEYOR_TOKEN" ]; then
    echo -e "${GREEN}✓ Surveyor login successful${NC}"
    echo "Token: ${SURVEYOR_TOKEN:0:20}..."
else
    echo -e "${RED}✗ Surveyor login failed${NC}"
    echo $SURVEYOR_RESPONSE
fi
echo ""

# Test 3: Login as Landlord
echo -e "${YELLOW}Test 3: Login as Landlord${NC}"
LANDLORD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"landlord@example.com","password":"password123"}')

LANDLORD_TOKEN=$(echo $LANDLORD_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$LANDLORD_TOKEN" ]; then
    echo -e "${GREEN}✓ Landlord login successful${NC}"
    echo "Token: ${LANDLORD_TOKEN:0:20}..."
else
    echo -e "${RED}✗ Landlord login failed${NC}"
    echo $LANDLORD_RESPONSE
fi
echo ""

# Test 4: Login as Property Seller
echo -e "${YELLOW}Test 4: Login as Property Seller${NC}"
SELLER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"propertyseller@example.com","password":"password123"}')

SELLER_TOKEN=$(echo $SELLER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$SELLER_TOKEN" ]; then
    echo -e "${GREEN}✓ Property Seller login successful${NC}"
    echo "Token: ${SELLER_TOKEN:0:20}..."
else
    echo -e "${RED}✗ Property Seller login failed${NC}"
    echo $SELLER_RESPONSE
fi
echo ""

# Test 5: Surveyor accessing their profile (Should work)
echo -e "${YELLOW}Test 5: Surveyor accessing surveyor profile${NC}"
if [ -n "$SURVEYOR_TOKEN" ]; then
    PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/surveyor/profile" \
      -H "Authorization: Bearer $SURVEYOR_TOKEN")

    if echo $PROFILE_RESPONSE | grep -q "success.*true"; then
        echo -e "${GREEN}✓ Surveyor can access their profile${NC}"
    else
        echo -e "${RED}✗ Surveyor cannot access profile${NC}"
        echo $PROFILE_RESPONSE
    fi
else
    echo -e "${RED}✗ No surveyor token available${NC}"
fi
echo ""

# Test 6: Agent trying to access surveyor profile (Should fail)
echo -e "${YELLOW}Test 6: Agent trying to access surveyor profile (should fail)${NC}"
if [ -n "$AGENT_TOKEN" ]; then
    FAIL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/surveyor/profile" \
      -H "Authorization: Bearer $AGENT_TOKEN")

    if echo $FAIL_RESPONSE | grep -q "not authorized"; then
        echo -e "${GREEN}✓ Authorization correctly blocked Agent from surveyor profile${NC}"
    else
        echo -e "${RED}✗ Agent was able to access surveyor profile (SECURITY ISSUE!)${NC}"
        echo $FAIL_RESPONSE
    fi
else
    echo -e "${RED}✗ No agent token available${NC}"
fi
echo ""

# Test 7: Public AI Chat (No auth required)
echo -e "${YELLOW}Test 7: Public AI Chat access${NC}"
CHAT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/ai-chat/message" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}')

if echo $CHAT_RESPONSE | grep -q "success.*true"; then
    echo -e "${GREEN}✓ AI Chat accessible without authentication${NC}"
else
    echo -e "${RED}✗ AI Chat failed${NC}"
    echo $CHAT_RESPONSE
fi
echo ""

# Test 8: Agent can create property
echo -e "${YELLOW}Test 8: Agent creating a property${NC}"
if [ -n "$AGENT_TOKEN" ]; then
    CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/properties" \
      -H "Authorization: Bearer $AGENT_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Test Property by Agent",
        "description": "This is a test property",
        "location": "Nairobi",
        "price": "50,000 KSh",
        "priceType": "rental",
        "imageUrls": ["https://example.com/image.jpg"],
        "bedrooms": 2,
        "bathrooms": 1,
        "propertyType": "apartment"
      }')

    if echo $CREATE_RESPONSE | grep -q "success.*true"; then
        echo -e "${GREEN}✓ Agent can create properties${NC}"
        PROPERTY_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
        echo "Created Property ID: $PROPERTY_ID"
    else
        echo -e "${RED}✗ Agent cannot create property${NC}"
        echo $CREATE_RESPONSE
    fi
else
    echo -e "${RED}✗ No agent token available${NC}"
fi
echo ""

# Test 9: Landlord can create rental property
echo -e "${YELLOW}Test 9: Landlord creating a rental property${NC}"
if [ -n "$LANDLORD_TOKEN" ]; then
    CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/properties" \
      -H "Authorization: Bearer $LANDLORD_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Test Rental by Landlord",
        "description": "This is a test rental property",
        "location": "Westlands",
        "price": "75,000 KSh",
        "priceType": "rental",
        "imageUrls": ["https://example.com/rental.jpg"],
        "bedrooms": 3,
        "bathrooms": 2,
        "propertyType": "apartment"
      }')

    if echo $CREATE_RESPONSE | grep -q "success.*true"; then
        echo -e "${GREEN}✓ Landlord can create rental properties${NC}"
    else
        echo -e "${RED}✗ Landlord cannot create property${NC}"
        echo $CREATE_RESPONSE
    fi
else
    echo -e "${RED}✗ No landlord token available${NC}"
fi
echo ""

# Test 10: Property Seller can create sale property
echo -e "${YELLOW}Test 10: Property Seller creating a sale property${NC}"
if [ -n "$SELLER_TOKEN" ]; then
    CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/properties" \
      -H "Authorization: Bearer $SELLER_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Test House for Sale",
        "description": "This is a house for sale",
        "location": "Karen",
        "price": "25,000,000 KSh",
        "priceType": "sale",
        "imageUrls": ["https://example.com/house.jpg"],
        "bedrooms": 4,
        "bathrooms": 3,
        "propertyType": "house"
      }')

    if echo $CREATE_RESPONSE | grep -q "success.*true"; then
        echo -e "${GREEN}✓ Property Seller can create sale properties${NC}"
    else
        echo -e "${RED}✗ Property Seller cannot create property${NC}"
        echo $CREATE_RESPONSE
    fi
else
    echo -e "${RED}✗ No seller token available${NC}"
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
