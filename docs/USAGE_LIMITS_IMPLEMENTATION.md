# Usage Limits Implementation - Free Plan Restrictions

## Overview

Implemented subscription-based usage limits for free plan users:
- **AI Searches:** 2 per month
- **Agent Connections:** 2 per month

These limits encourage upgrades to paid plans while allowing free users to experience the platform.

---

## Implementation Details

### 1. Database Model

**File:** `backend/models/UsageTracking.js`

Tracks feature usage per user per month:

```javascript
{
    userId: ObjectId,
    period: "2026-01", // YYYY-MM format
    aiSearches: {
        count: 0,
        lastUsed: Date,
        history: [{ timestamp, query, success }]
    },
    agentConnections: {
        count: 0,
        lastUsed: Date,
        history: [{ timestamp, leadId, propertyId, type, success }]
    },
    otherFeatures: {
        leadScoring: 0,
        maintenanceAnalyses: 0,
        financialReports: 0,
        aiVoiceInteractions: 0
    }
}
```

**Key Features:**
- Automatic monthly reset via period-based tracking
- History tracking for audit purposes (last 50-100 entries)
- Expandable for future feature limits

**Methods:**
- `findOrCreateForUser(userId)` - Get or create usage tracking for current month
- `incrementAISearch(query, success)` - Increment AI search counter
- `incrementAgentConnection(data)` - Increment agent connection counter
- `getSummary()` - Get usage overview

---

### 2. Usage Tracking Service

**File:** `backend/services/usageTrackingService.js`

Centralized service for checking and enforcing limits.

#### Plan Limits Configuration

```javascript
const PLAN_LIMITS = {
    'Free': {
        aiSearches: 2,
        agentConnections: 2
    },
    'None': {
        aiSearches: 2,
        agentConnections: 2
    },
    'Basic': {
        aiSearches: 50,
        agentConnections: 20
    },
    'MyGF 1.3': {
        aiSearches: 200,
        agentConnections: 100
    },
    'MyGF 3.2': {
        aiSearches: -1, // Unlimited
        agentConnections: -1 // Unlimited
    }
};
```

#### Key Methods

**Check if user can use feature:**
```javascript
await usageTrackingService.canUseAISearch(userId);
// Returns: { allowed: true/false, remaining: N, limit: N, used: N, message: '...' }

await usageTrackingService.canUseAgentConnection(userId);
// Returns: { allowed: true/false, remaining: N, limit: N, used: N, message: '...' }
```

**Track usage:**
```javascript
await usageTrackingService.trackAISearch(userId, query, success);
await usageTrackingService.trackAgentConnection(userId, { leadId, propertyId, type, success });
```

**Get usage statistics:**
```javascript
await usageTrackingService.getUsageStats(userId);
// Returns detailed stats with warnings and recommendations
```

---

### 3. Middleware

**File:** `backend/middleware/usageLimits.js`

Enforces usage limits before processing requests.

#### Check Middleware

**`checkAISearchLimit`** - Applied to AI search routes
- Checks if user can perform AI search
- Returns 429 (Too Many Requests) if limit exceeded
- Works for both authenticated and unauthenticated users
- Attaches usage info to request for later tracking

**`checkAgentConnectionLimit`** - Applied to lead creation routes
- Checks if user can create agent connection
- Returns 429 if limit exceeded
- Allows unauthenticated users (public leads)

**Response Format (429):**
```json
{
    "success": false,
    "error": "AI search limit reached",
    "message": "You've reached your AI search limit of 2 for this month. Upgrade your plan for more searches.",
    "limit": {
        "used": 2,
        "limit": 2,
        "remaining": 0
    },
    "upgradeRequired": true,
    "upgradePath": "/pricing"
}
```

#### Tracking Functions

**`trackAISearchUsage(req, query, success)`** - Called after successful AI search

**`trackAgentConnectionUsage(req, data)`** - Called after successful lead creation

These are called in controllers AFTER the operation succeeds to ensure accurate tracking.

---

### 4. Optional Authentication Middleware

**File:** `backend/middleware/auth.js`

Added `optionalProtect` middleware:
- Attempts to authenticate user if token provided
- Does NOT fail if no token or invalid token
- Allows routes to work for both authenticated and unauthenticated users
- Sets `req.user` if authentication succeeds

**Usage:**
```javascript
router.post('/search', optionalProtect, checkAISearchLimit, chatSearch);
// Works for both logged-in and guest users
```

---

### 5. API Routes Updated

#### AI Chat Routes (`backend/routes/aiChat.js`)

**Updated Routes:**
```javascript
POST /api/ai-chat/search        // optionalProtect + checkAISearchLimit
POST /api/ai-chat/message       // optionalProtect + checkAISearchLimit
```

**Controller Tracking:** `backend/controllers/aiChat.js`
- Tracks usage after successful search in `chatSearch()` and `processMessage()`

#### Lead Routes (`backend/routes/leads.js`)

**Updated Routes:**
```javascript
POST /api/leads  // leadLimiter + optionalProtect + checkAgentConnectionLimit
```

**Controller Tracking:** `backend/controllers/leads.js`
- Tracks usage after successful lead creation in `createLead()`

---

### 6. Usage Statistics API

**File:** `backend/routes/usage.js`

New endpoints for users to check their usage and limits.

#### Endpoints

**GET `/api/usage/stats`** - Get current usage statistics (Protected)
```json
{
    "success": true,
    "usage": {
        "period": "2026-01",
        "plan": "Free",
        "limits": {
            "aiSearches": 2,
            "agentConnections": 2
        },
        "current": {
            "aiSearches": 1,
            "agentConnections": 0
        },
        "remaining": {
            "aiSearches": 1,
            "agentConnections": 2
        }
    }
}
```

**GET `/api/usage/detailed`** - Get detailed usage with warnings (Protected)
```json
{
    "success": true,
    "usage": {
        "period": "2026-01",
        "plan": "Free",
        "percentageUsed": {
            "aiSearches": 50,
            "agentConnections": 0
        },
        "warnings": [
            {
                "type": "warning",
                "feature": "aiSearches",
                "message": "You've used 1 of 2 AI searches. Consider upgrading your plan."
            }
        ],
        "recommendations": [
            {
                "type": "upgrade",
                "message": "Upgrade to Basic plan for 50 AI searches and 20 agent connections per month.",
                "targetPlan": "Basic",
                "benefits": ["50 AI searches/month", "20 agent connections/month", ...]
            }
        ]
    }
}
```

**GET `/api/usage/limits`** - Get plan limits (Protected)
```json
{
    "success": true,
    "plan": "Free",
    "limits": {
        "aiSearches": 2,
        "agentConnections": 2,
        "leadScoring": 0,
        ...
    },
    "status": "inactive"
}
```

**GET `/api/usage/can-use/:feature`** - Check if user can use feature (Protected)
```bash
GET /api/usage/can-use/ai-search
GET /api/usage/can-use/agent-connection
```

**POST `/api/usage/reset`** - Reset usage (Protected, for testing)

---

## File Structure

### New Files Created

```
backend/
├── models/
│   └── UsageTracking.js              # Usage tracking database model
├── services/
│   └── usageTrackingService.js       # Usage limits business logic
├── middleware/
│   └── usageLimits.js                # Usage limit enforcement middleware
└── routes/
    └── usage.js                      # Usage statistics API endpoints
```

### Modified Files

```
backend/
├── middleware/
│   └── auth.js                       # Added optionalProtect middleware
├── routes/
│   ├── aiChat.js                     # Added usage limit checks
│   └── leads.js                      # Added usage limit checks
├── controllers/
│   ├── aiChat.js                     # Added usage tracking
│   └── leads.js                      # Added usage tracking
└── server.js                         # Registered /api/usage routes
```

---

## How It Works

### Flow for AI Search

1. **User Request:** `POST /api/ai-chat/search` with query
2. **Optional Auth:** `optionalProtect` middleware sets `req.user` if authenticated
3. **Limit Check:** `checkAISearchLimit` middleware:
   - If authenticated: Check user's monthly AI search limit
   - If limit exceeded: Return 429 error
   - If limit OK: Continue to controller
4. **Search:** Controller performs AI property search
5. **Track Usage:** Controller calls `trackAISearchUsage()` after success
6. **Response:** Return search results to user

### Flow for Agent Connection

1. **User Request:** `POST /api/leads` with lead data
2. **Rate Limit:** IP-based rate limiter (5 per 15 minutes)
3. **Optional Auth:** `optionalProtect` middleware
4. **Limit Check:** `checkAgentConnectionLimit` middleware:
   - If authenticated: Check monthly agent connection limit
   - If limit exceeded: Return 429 error
5. **Create Lead:** Controller creates lead in database
6. **Track Usage:** Controller calls `trackAgentConnectionUsage()` after success
7. **Response:** Return success to user

### Monthly Reset

Usage automatically resets monthly via period-based tracking:
- Period format: `"2026-01"` (YYYY-MM)
- Each month, `findOrCreateForUser()` creates new tracking document
- Previous months' data remains for historical analysis

---

## Testing

### Test as Free User

```bash
# 1. Register or login as free user
POST /api/auth/login
{
    "email": "freeuser@test.com",
    "password": "password123"
}

# 2. Check initial usage
GET /api/usage/stats
Authorization: Bearer <token>

# Expected: aiSearches: 0/2, agentConnections: 0/2

# 3. Perform first AI search
POST /api/ai-chat/search
Authorization: Bearer <token>
{
    "query": "3 bedroom house in Nairobi"
}

# Expected: Success, remaining: 1

# 4. Perform second AI search
POST /api/ai-chat/search
Authorization: Bearer <token>
{
    "query": "apartment for rent"
}

# Expected: Success, remaining: 0

# 5. Attempt third AI search
POST /api/ai-chat/search
Authorization: Bearer <token>
{
    "query": "villa in Mombasa"
}

# Expected: 429 Error - Limit reached

# 6. Create first lead (agent connection)
POST /api/leads
Authorization: Bearer <token>
{
    "propertyId": "...",
    "client": { ... },
    "dealType": "purchase"
}

# Expected: Success, remaining: 1

# 7. Create second lead
POST /api/leads
Authorization: Bearer <token>
{...}

# Expected: Success, remaining: 0

# 8. Attempt third lead
POST /api/leads
Authorization: Bearer <token>
{...}

# Expected: 429 Error - Limit reached

# 9. Check detailed usage
GET /api/usage/detailed
Authorization: Bearer <token>

# Expected: Warnings and upgrade recommendations
```

### Test as Unauthenticated User

```bash
# AI searches work without auth (no limits for guests)
POST /api/ai-chat/search
{
    "query": "house for sale"
}

# Expected: Success (no limits for unauthenticated)

# Lead creation works without auth (no limits for guests)
POST /api/leads
{
    "propertyId": "...",
    "client": { ... },
    "dealType": "purchase"
}

# Expected: Success (no limits for unauthenticated)
```

### Reset Usage for Testing

```bash
POST /api/usage/reset
Authorization: Bearer <token>

# Expected: Usage counters reset to 0
```

---

## Upgrade Path

When users hit limits, they see upgrade recommendations:

### Free Plan Hit Limit

**Message:**
> You've reached your AI search limit of 2 for this month. Upgrade your plan for more searches.

**Recommendation:**
> Upgrade to Basic plan for 50 AI searches and 20 agent connections per month.

**Benefits:**
- 50 AI searches/month
- 20 agent connections/month
- 100 lead scoring operations
- 5 financial reports

**Action:** Redirect to `/pricing` page

### Basic Plan Approaching Limit

**Warning at 80%:**
> You've used 40 of 50 AI searches. Consider upgrading your plan.

**Recommendation:**
> Upgrade to MyGF 1.3 for 200 AI searches and 100 agent connections per month.

---

## Future Enhancements

### 1. Daily Reset for Some Features

Currently monthly reset. Could add daily counters for:
- AI searches per day
- Agent connections per day

### 2. Grace Period

Allow 1-2 extra uses after limit with upgrade prompt.

### 3. Usage Analytics Dashboard

Frontend dashboard showing:
- Usage over time (chart)
- Limit warnings
- Upgrade recommendations
- Historical usage

### 4. Email Notifications

Email users when:
- 80% of limit reached
- 100% of limit reached
- New month (limit reset)

### 5. Admin Dashboard

Admin interface to:
- View all users' usage
- Adjust limits per user
- Generate usage reports
- Monitor platform-wide usage

---

## Configuration

### Adjust Plan Limits

Edit `backend/services/usageTrackingService.js`:

```javascript
const PLAN_LIMITS = {
    'Free': {
        aiSearches: 2,          // Change this
        agentConnections: 2     // Change this
    },
    // ...
};
```

### Add New Features to Track

1. Add field to `UsageTracking` model
2. Add limit to `PLAN_LIMITS` in service
3. Create `canUseFeature()` and `trackFeature()` methods in service
4. Create middleware function
5. Apply middleware to routes
6. Track usage in controller

---

## Error Handling

### 429 Too Many Requests

**When:** User exceeds monthly limit

**Response:**
```json
{
    "success": false,
    "error": "AI search limit reached",
    "message": "You've reached your AI search limit of 2 for this month. Upgrade your plan for more searches.",
    "limit": {
        "used": 2,
        "limit": 2,
        "remaining": 0
    },
    "upgradeRequired": true,
    "upgradePath": "/pricing"
}
```

**Frontend Handling:**
- Show upgrade modal
- Display remaining quota in UI
- Redirect to pricing page

### Fail-Open Strategy

If usage tracking fails (database error, etc.):
- Middleware logs error
- Request proceeds (doesn't block user)
- Ensures service availability over strict enforcement

---

## Security Considerations

### IP-Based Rate Limiting

Existing IP rate limiter (5 leads per 15 min) still applies to prevent spam.

### Unauthenticated Users

- No usage tracking for guests
- Rely on IP-based rate limiting for abuse prevention
- Encourage sign-up to track usage and enforce limits

### Token Validation

- `optionalProtect` safely handles invalid tokens
- No security risk - just treats as unauthenticated

---

## Summary

**What Was Implemented:**
- ✅ Usage tracking database model
- ✅ Usage tracking service with plan limits
- ✅ Middleware to check and enforce limits
- ✅ Applied to AI search routes
- ✅ Applied to lead creation routes
- ✅ Usage statistics API endpoints
- ✅ Optional authentication support
- ✅ Automatic monthly reset
- ✅ Usage warnings and recommendations

**Free Plan Limits:**
- 2 AI searches per month
- 2 agent connections per month

**How Users Upgrade:**
- Hit limit → See 429 error with upgrade message
- Check `/api/usage/stats` → See recommendations
- Visit `/pricing` page → Select paid plan

**Next Steps:**
1. Test the implementation
2. Add frontend UI for usage display
3. Create pricing page with plan comparisons
4. Add email notifications for limits
5. Build admin dashboard for monitoring

---

**Implementation Date:** 2026-01-31
**Status:** ✅ Complete - Ready for Testing
