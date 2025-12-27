# Agent Profile & Admin Dashboard Guide

## 1. Agent Login & Profile Access

### How Agents Login:

**Step 1: Go to Agent Portal**
- Frontend URL: https://genesis-1-wxpr.onrender.com
- Click "Agent Portal" button in navigation

**Step 2: Login with Credentials**
```
Email: agent@example.com
Password: password123
```

Or create a new agent account via signup.

### Accessing Agent Profile:

Once logged in, agents can access their profile in **2 ways**:

#### Option 1: Via Sidebar
1. Click the **hamburger menu** (☰) in dashboard
2. Select **"Profile"** from the sidebar menu
3. Profile settings page will open with:
   - Personal information
   - Profile image upload
   - Bio and specializations
   - Years of experience
   - Certifications
   - Company details

#### Option 2: Via Settings
1. Click **"Settings"** in sidebar
2. Update account settings
3. View subscription status

### What's in Agent Profile:

```typescript
interface AgentProfile {
    profileImage?: string;
    bio?: string;
    specializations?: string[];
    yearsOfExperience?: number;
    serviceAreas?: string[];
    languages?: string[];
    certifications?: string[];
    achievements?: string[];
    rating?: number;
    totalDeals?: number;
    companyCertification?: string;
}
```

### Agent Dashboard Features:

| Section | Description |
|---------|-------------|
| **Overview** | View all properties, manage listings |
| **Leads** | View and manage client leads |
| **Analytics** | Performance metrics, conversion rates |
| **Chat** | Client communication & AI takeover |
| **Marketing** | Boost properties, promotional tools |
| **Automation** | AI automation settings |
| **AI Manager** | Tenant & property management |
| **Profile** | Edit agent profile & portfolio |
| **Settings** | Account & notification settings |

---

## 2. Admin Dashboard - Users Tab

### Viewing Agent Profiles in Admin

**Step 1: Login as Admin**
```
Email: admin@genesis.com
Password: admin123456
```

**Step 2: Access Users Tab**
1. Login to admin dashboard
2. Click **"Users"** tab at the top
3. View list of all users (Agents, Landlords, Sellers, etc.)

### Users Tab Features:

The Users tab shows a **comprehensive table** with:

| Column | Description |
|--------|-------------|
| **Name** | User's full name |
| **Email** | Contact email |
| **Role** | Agent, Landlord, Seller, Surveyor, etc. |
| **Status** | Active, Suspended, Deactivated |
| **Subscription** | Current plan (Basic, MyGF 1.3, etc.) |
| **Verified** | Email verification status |
| **Created** | Registration date |
| **Actions** | Suspend, Reactivate, Delete buttons |

### Filtering by Role:

Currently showing all users. To see **only Agents**:

The admin dashboard already loads all users and you can see their roles in the table.

**Current Agents in Database:**
Based on the API response, you have:
- Sample Agent (agent@example.com)
- 1 verified agent

### Admin Actions on Users:

```javascript
// Suspend User
handleSuspendUser(userId, userName)
// Prompts for reason, then suspends account

// Reactivate User
handleReactivateUser(userId, userName)
// Confirms and reactivates suspended account

// Delete User
handleDeleteUser(userId, userName)
// Permanent deletion (cannot be undone)
```

---

## 3. Troubleshooting Admin UI

### Issue: Buttons Not Displaying Data

**Common Causes:**

#### 1. Authentication Token Expired
**Solution:** Logout and login again
```bash
# Admin credentials
Email: admin@genesis.com
Password: admin123456
```

#### 2. API Loading State
**Check:** Look for loading spinner
- If stuck loading, check browser console for errors (F12)
- Refresh the page

#### 3. Empty Data
**Solution:** Add test data
```bash
cd backend
node check-db.js  # View current data
```

#### 4. CORS or Network Issues
**Check:**
- Open browser developer tools (F12)
- Go to Network tab
- Look for failed API calls
- Check if backend is running: https://genesis-hezn.onrender.com/api/health

### API Endpoints Status:

Test admin APIs directly:

```bash
# Get analytics
curl https://genesis-hezn.onrender.com/api/admin/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all users
curl https://genesis-hezn.onrender.com/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all properties
curl https://genesis-hezn.onrender.com/api/admin/properties \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Getting Your Admin Token:

1. Login to admin dashboard
2. Open browser console (F12)
3. Go to Application → Local Storage
4. Look for `token` key
5. Copy the value

Or check Network tab:
1. Go to Network tab
2. Find any `/api/admin/` request
3. Click on it
4. Look at Request Headers
5. Find `Authorization: Bearer ...`

---

## 4. M-Pesa Payment Testing

### Test STK Push:

```bash
cd backend

# Test with your phone
node test-mpesa-stk.js 254758930908 1

# Test with amount
node test-mpesa-stk.js 254712345678 100
```

### Query Payment Status:

```bash
# After STK push, query status
node test-mpesa-query.js ws_CO_XXXXXXXXX
```

### Test Flow:

1. **Run STK test** → Sends payment prompt to phone
2. **Check phone** → M-Pesa prompt appears
3. **Enter PIN** → Any PIN works in sandbox
4. **Query status** → Check if payment completed
5. **Check callback** → View in Render logs

### Payment Result Codes:

| Code | Meaning |
|------|---------|
| 0 | Success ✅ |
| 1032 | Cancelled by user |
| 1037 | Timeout |
| 1 | Insufficient balance |
| 1001 | Invalid PIN |

---

## 5. Quick Reference Commands

### Database Operations:
```bash
cd backend

# View all users
node check-db.js

# Verify user manually
node verify-user.js email@example.com

# Get user OTP status
node get-user-otp.js email@example.com
```

### M-Pesa Testing:
```bash
# Test STK Push
node test-mpesa-stk.js PHONE_NUMBER AMOUNT

# Query payment
node test-mpesa-query.js CHECKOUT_REQUEST_ID

# Test OAuth
node test-mpesa-auth.js
```

### Server Health:
```bash
# Check backend
curl https://genesis-hezn.onrender.com/api/health

# Check frontend
curl https://genesis-1-wxpr.onrender.com

# View logs
# Go to: https://dashboard.render.com/web/srv-cs94dhbuvlqc738rrv80/logs
```

---

## 6. Default Test Accounts

| Role | Email | Password | Status |
|------|-------|----------|--------|
| **Admin** | admin@genesis.com | admin123456 | ✅ Active |
| **Agent** | agent@example.com | password123 | ✅ Verified |
| **Landlord** | landlord@example.com | password123 | ✅ Verified |
| **Seller** | propertyseller@example.com | password123 | ✅ Verified |
| **Surveyor** | surveyor@example.com | password123 | ✅ Verified |

---

## 7. Support & Resources

- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **M-Pesa Sandbox**: https://developer.safaricom.co.ke
- **API Documentation**: /MPESA_INTEGRATION.md
- **Logs Guide**: /VIEW_LOGS_GUIDE.md

---

## Common Workflows

### Adding New Agent:
1. Signup with agent role
2. Verify email (or use `node verify-user.js`)
3. Complete profile in dashboard
4. Start listing properties

### Admin Monitoring:
1. Login as admin
2. View Users tab → See all agents
3. View Properties tab → See all listings
4. View Activity tab → Monitor actions
5. View Analytics → Check metrics

### Processing Payments:
1. User initiates payment
2. STK push sent to phone
3. User enters PIN
4. Callback received by backend
5. Payment recorded in database
6. User account updated

---

## Need Help?

Check the relevant guide:
- Agent features → This file
- M-Pesa payments → /MPESA_INTEGRATION.md
- Database access → /QUICK_VIEW_LOGS.md
- Viewing logs → /VIEW_LOGS_GUIDE.md
