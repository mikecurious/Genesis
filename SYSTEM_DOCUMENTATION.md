# MyGF AI - Complete System Documentation 🏠🤖

 Landlord:        landlord@example.com / password123
  Property Seller: propertyseller@example.com / password123
  Surveyor:        surveyor@example.com / password123
  Agent:           agent@mygf.com / (needs password reset)

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [Technical Stack](#technical-stack)
5. [Data Models](#data-models)
6. [AI Integration](#ai-integration)
7. [User Flows](#user-flows)
8. [API Reference](#api-reference)
9. [Deployment](#deployment)

---

## System Overview

**MyGF AI** is an intelligent real estate platform that combines a **Property Marketplace** with an **AI-Powered Property Management System**. It solves the "two-app problem" by unifying property search, listing management, and tenant management into a single, beautiful experience.

### Key Value Propositions

1. **For Property Seekers**: Conversational AI search that understands natural language queries
2. **For Agents**: Intelligent lead management with AI-powered deal closure detection
3. **For Landlords**: Automated tenant management with AI-driven maintenance triage
4. **For Property Sellers**: Analytics dashboard with investment scoring (ROI, Cap Rate)

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Property     │  │ Agent        │  │ Landlord     │      │
│  │ Explorer     │  │ Dashboard    │  │ Dashboard    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth         │  │ Properties   │  │ Payments     │      │
│  │ Controller   │  │ Controller   │  │ Controller   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Smart Query  │  │ Leads        │  │ Analytics    │      │
│  │ Controller   │  │ Controller   │  │ Controller   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   MongoDB Atlas (Database)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Users        │  │ Properties   │  │ Leads        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              Google Gemini AI (External API)                 │
│  • Property Search Intelligence                              │
│  • Deal Closure Detection                                    │
│  • Maintenance Triage                                        │
│  • Investment Analysis                                       │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **State Management**: React Context + Hooks
- **UI Components**: Custom components with Tailwind-inspired styling
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Authentication**: Google OAuth 2.0 (`@react-oauth/google`)
- **Real-time Communication**: Socket.IO Client
- **Data Visualization**: Chart.js + React Chart.js 2
- **Image Handling**: React Zoom Pan Pinch

#### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS
- **Real-time**: Socket.IO (WebSocket)
- **File Uploads**: Multer (for property images)
- **Email**: Nodemailer (for notifications)

#### External Services
- **AI**: Google Gemini 2.5 Pro & Flash
- **Database**: MongoDB Atlas (Cloud)
- **Deployment**: 
  - Frontend: Vercel
  - Backend: Render
  - Database: MongoDB Atlas

---

## Core Features

### 1. AI-Powered Property Explorer

#### Conversational Search
Users can search for properties using natural language:
- **Example**: "Show me a 2-bedroom apartment near Westlands for under 60,000 KSh"
- **AI Processing**: 
  1. Query is sent to `generatePropertyResponse()` in `geminiService.ts`
  2. AI detects intent (buy vs rent) using keyword analysis
  3. Smart search API (`smartQuery.js`) performs semantic matching
  4. Results are ranked by similarity score using cosine similarity

#### Smart Query Engine
Located in `backend/controllers/smartQuery.js`:
- **Embedding Generation**: Properties are converted to vector embeddings
- **Semantic Matching**: User queries are matched against property embeddings
- **Intent Detection**: Automatically detects buy/rent intent from keywords
- **Confidence Scoring**: Returns match confidence (0-100%)

```javascript
// Example Smart Search Flow
POST /api/properties/smart-search
{
  "query": "modern 3-bedroom apartment with gym",
  "filters": { "minPrice": 50000, "maxPrice": 100000 },
  "limit": 10
}

// Response
{
  "success": true,
  "count": 5,
  "data": [ /* matched properties with scores */ ],
  "confidence": 87,
  "detectedIntent": "rent"
}
```

### 2. Intelligent Lead Management

#### Deal Closure Detection
The system uses AI to detect when a client is ready to commit:
- **Location**: `generateInteractionResponse()` in `geminiService.ts`
- **Buying Signals**:
  - Purchase commitment: "I'll buy it", "Let's proceed"
  - Rental commitment: "I'll rent it", "Sign the lease"
  - Viewing requests: "Book a viewing", "When can I visit"

```typescript
// AI analyzes conversation and returns:
{
  "dealClosure": true,
  "dealType": "viewing",
  "confidence": 0.92
}
```

#### Lead Tracking
- **Model**: `backend/models/Lead.js`
- **Fields**: Property, client details, deal type, status, conversation history
- **Statuses**: new → contacted → in-progress → closed/lost

### 3. Property Management Dashboard

#### For Agents
- **My Listings**: View, edit, delete properties
- **Active Leads**: Track client conversations with deal closure indicators
- **Analytics**: Property views, lead conversion rates
- **AI Insights**: Market trends and pricing recommendations

#### For Landlords
- **Tenant Management**: Add, view, and manage tenants
- **Rent Tracking**: Monitor payment status (Paid, Due, Overdue)
- **Maintenance Requests**: AI-powered triage and technician assignment
- **Financial Reports**: Automated rent collection and expense tracking

#### For Property Sellers
- **Investment Scoring**: AI calculates ROI, Cap Rate, Market Pulse
- **Performance Analytics**: Track property views and inquiries
- **Market Insights**: AI-generated recommendations

### 4. AI Tenant Management

#### Automated Maintenance Triage
- **Location**: `backend/controllers/maintenance.js`
- **Process**:
  1. Tenant submits maintenance request
  2. AI analyzes description and images
  3. Assigns priority (Low, Medium, High, Emergency)
  4. Suggests technician and estimated cost
  5. Sends notifications to landlord and tenant

#### Rent Reminders
- **Automation Engine**: `services/automationEngine.ts`
- **Rules**: Configurable reminders (e.g., 3 days before due date)
- **Channels**: Email, WhatsApp, Push notifications

---

## Data Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  googleId: String (for OAuth),
  authProvider: 'local' | 'google',
  phone: String,
  role: 'Agent' | 'Property Seller' | 'Landlord' | 'Tenant' | 'Admin',
  
  // Tenant-specific fields
  landlordId: ObjectId (ref: User),
  unit: String,
  rentStatus: 'Paid' | 'Due' | 'Overdue',
  
  // Subscription
  subscription: {
    plan: 'Basic' | 'MyGF 1.3' | 'MyGF 3.2',
    status: 'active' | 'inactive' | 'pending',
    expiresAt: Date
  },
  
  // Notifications
  whatsappNumber: String,
  notificationPreferences: {
    email: Boolean,
    whatsapp: Boolean,
    push: Boolean
  }
}
```

### Property Model
```javascript
{
  title: String,
  description: String,
  location: String,
  price: String,
  priceType: 'sale' | 'rental',
  imageUrls: [String] (max 5),
  tags: [String],
  createdBy: ObjectId (ref: User),
  status: 'active' | 'sold' | 'rented',
  boosted: Boolean,
  views: Number,
  
  // AI fields
  embedding: [Number] (768-dimensional vector),
  semanticTags: [String],
  
  // Structured details
  bedrooms: Number,
  bathrooms: Number,
  propertyType: 'apartment' | 'house' | 'condo' | 'villa' | ...,
  amenities: [String],
  squareFeet: Number,
  yearBuilt: Number
}
```

### Lead Model
```javascript
{
  property: ObjectId (ref: Property),
  client: {
    name: String,
    address: String,
    contact: String,
    email: String,
    whatsappNumber: String
  },
  dealType: 'purchase' | 'rental' | 'viewing',
  status: 'new' | 'contacted' | 'in-progress' | 'closed' | 'lost',
  conversationHistory: [Message],
  createdBy: ObjectId (ref: User),
  notes: String,
  createdAt: Date,
  closedAt: Date
}
```

---

## AI Integration

### Google Gemini Models Used

1. **Gemini 2.5 Pro** (`gemini-2.5-pro`)
   - Property search with structured JSON output
   - Complex reasoning for investment analysis
   - Dashboard insights generation

2. **Gemini 2.5 Flash** (`gemini-2.5-flash`)
   - Real-time chat responses
   - Deal closure detection
   - Property description generation
   - Maintenance triage

3. **Gemini Flash Lite** (`gemini-flash-lite-latest`)
   - Chat title generation
   - Quick classifications
   - Low-latency responses

### AI Services Architecture

#### `geminiService.ts` - Core AI Functions

1. **`generatePropertyResponse()`**
   - Matches user queries to properties
   - Returns structured JSON with properties array
   - Fallback to smart search API

2. **`generateGroundedResponseStream()`**
   - Streaming responses with Google Search grounding
   - Used for general knowledge questions
   - Provides citations and sources

3. **`generateInitialPitch()`**
   - Creates warm, emotional opening message
   - Highlights property benefits
   - Invites client engagement

4. **`generateInteractionResponse()`**
   - Professional sales conversation
   - Implements "Closer's Loop" methodology:
     - Qualify → Value Proposition → Objection Handling → Urgency → Close
   - Detects deal closure signals

5. **`detectDealClosure()`**
   - Analyzes conversation history
   - Returns confidence score (0-100%)
   - Identifies deal type (purchase/rental/viewing)

#### `smartQueryService.ts` - Semantic Search

- Integrates with backend smart search API
- Handles query preprocessing
- Manages result ranking and filtering

#### `investmentService.ts` - Financial Analysis

- Calculates ROI (Return on Investment)
- Computes Cap Rate (Capitalization Rate)
- Generates investment scores and badges

---

## User Flows

### 1. Property Search Flow

```
User enters query
    ↓
AI detects intent (buy/rent)
    ↓
Smart search API matches properties
    ↓
Results ranked by similarity
    ↓
User views property cards
    ↓
User clicks "Connect" → Opens interaction chat
    ↓
AI generates initial pitch
    ↓
Conversation begins
    ↓
AI detects deal closure
    ↓
Lead automatically created
```

### 2. Agent Dashboard Flow

```
Agent logs in
    ↓
Dashboard loads listings & leads
    ↓
Agent views active leads
    ↓
Lead shows deal closure indicator
    ↓
Agent takes over chat (optional)
    ↓
Agent closes deal manually
    ↓
Lead status updated to "closed"
```

### 3. Landlord Tenant Management Flow

```
Landlord adds tenant
    ↓
Tenant receives invitation email
    ↓
Tenant sets password & logs in
    ↓
Tenant submits maintenance request
    ↓
AI analyzes request & assigns priority
    ↓
Landlord receives notification
    ↓
Landlord assigns technician
    ↓
Status updated to "In Progress"
    ↓
Tenant receives update notification
```

---

## API Reference

### Authentication Endpoints

#### `POST /api/auth/register`
Register a new user (Agent, Landlord, Property Seller)

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "Agent",
  "phone": "+254712345678"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": { /* user object */ }
}
```

#### `POST /api/auth/login`
Login with email and password

#### `POST /api/auth/google-signin`
Login with Google OAuth credential

#### `POST /api/auth/forgot-password`
Request password reset email

#### `POST /api/auth/reset-password/:token`
Reset password with token

### Property Endpoints

#### `GET /api/properties`
Get all active properties

**Query Parameters:**
- `status`: Filter by status (active, sold, rented)
- `priceType`: Filter by sale or rental
- `limit`: Number of results (default: 50)

#### `POST /api/properties`
Create new property (requires authentication)

**Request:**
```json
{
  "title": "Modern 2-Bedroom Apartment",
  "description": "Spacious apartment with gym...",
  "location": "Westlands, Nairobi",
  "price": "60,000 KSh/month",
  "priceType": "rental",
  "bedrooms": 2,
  "bathrooms": 2,
  "propertyType": "apartment",
  "amenities": ["gym", "pool", "parking"],
  "tags": ["modern", "luxury"]
}
```

#### `POST /api/properties/smart-search`
Intelligent property search with AI

**Request:**
```json
{
  "query": "3-bedroom house with garden",
  "filters": {
    "minPrice": 50000,
    "maxPrice": 150000,
    "location": "Westlands"
  },
  "limit": 10
}
```

### Lead Endpoints

#### `GET /api/leads`
Get all leads for authenticated user

#### `POST /api/leads`
Create new lead

#### `PATCH /api/leads/:id`
Update lead status

### User Endpoints

#### `GET /api/users/me`
Get current user profile

#### `POST /api/users/invite-tenant`
Invite a tenant (Landlord/Agent only)

#### `GET /api/users/tenants`
Get all tenants for authenticated landlord

### Maintenance Endpoints

#### `GET /api/maintenance`
Get all maintenance requests

#### `POST /api/maintenance`
Submit new maintenance request

#### `PATCH /api/maintenance/:id`
Update maintenance request status

---

## Deployment

### Environment Variables

#### Frontend (`.env`)
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_API_URL=https://your-backend-url.com
```

#### Backend (`.env`)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mygf-ai
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
FRONTEND_URL=https://your-frontend-url.com

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Deployment Guide

See [deployment_guide.md](.agent/workflows/deployment_guide.md) for detailed instructions on deploying to:
- **Frontend**: Vercel (free tier)
- **Backend**: Render (free tier)
- **Database**: MongoDB Atlas (free tier)

---

## Security Features

1. **Authentication**
   - JWT-based authentication
   - Password hashing with bcrypt (10 salt rounds)
   - Google OAuth 2.0 integration
   - Password reset with secure tokens

2. **Authorization**
   - Role-based access control (RBAC)
   - Protected routes with middleware
   - User-specific data isolation

3. **Data Protection**
   - Helmet.js for HTTP headers
   - CORS configuration
   - Input validation and sanitization
   - MongoDB injection prevention

4. **API Security**
   - Rate limiting (planned)
   - API key rotation support
   - Secure token storage

---

## Performance Optimizations

1. **Database**
   - Indexed fields for fast queries
   - Selective field projection
   - Pagination support

2. **Frontend**
   - Lazy loading of components
   - Image optimization
   - Memoization of expensive computations

3. **AI**
   - Model selection based on task complexity
   - Streaming responses for better UX
   - Caching of embeddings

---

## Future Enhancements

1. **Mobile App**: React Native version
2. **Advanced Analytics**: Predictive pricing models
3. **Virtual Tours**: 3D property visualization
4. **Blockchain**: Smart contracts for property transactions
5. **Multi-language**: Support for Swahili and other languages
6. **Payment Integration**: Flutterwave, M-Pesa integration
7. **Voice Search**: Voice-activated property search

---

## Support & Contact

For technical support or questions:
- **GitHub**: [DidierNiy/MyGF-AI](https://github.com/DidierNiy/MyGF-AI)
- **Email**: support@mygf.ai

---

**Last Updated**: November 24, 2025
**Version**: 1.0.0
