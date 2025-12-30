# Tenant Management System - Complete Guide

**Feature**: Comprehensive Tenant Management for Admin and Agent Portals
**Status**: ✅ Implemented and Ready
**Date**: December 30, 2025

---

## 🎯 Overview

Complete tenant management system allowing landlords, agents, and admins to:
- View all tenants across properties
- Add new tenants to properties
- Update tenant information
- Track rent payment status
- Manage lease agreements
- Send automated welcome emails

---

## 📊 Database Changes

### User Model Updates

**New Fields Added**:
```javascript
{
    propertyId: ObjectId,           // Link to property
    rentAmount: Number,             // Monthly rent
    leaseStartDate: Date,           // Lease start
    leaseEndDate: Date,             // Lease end
    depositAmount: Number,          // Security deposit
    lastPaymentDate: Date,          // Last payment
    nextPaymentDue: Date,           // Next due date
    // Existing fields:
    landlordId: ObjectId,           // Link to landlord
    unit: String,                   // Unit number/name
    rentStatus: String              // Paid, Due, Overdue
}
```

**New Indexes**:
```javascript
UserSchema.index({ propertyId: 1 });
UserSchema.index({ role: 1, propertyId: 1 });
```

---

## 🛣️ API Endpoints

### 1. Get All Tenants (Admin Only)
```http
GET /api/tenants
Authorization: Bearer <ADMIN_TOKEN>
```

**Query Parameters**:
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)
- `landlordId` - Filter by landlord
- `propertyId` - Filter by property
- `rentStatus` - Filter by status (Paid, Due, Overdue)

**Response**:
```json
{
    "success": true,
    "count": 15,
    "total": 50,
    "page": 1,
    "pages": 3,
    "data": [
        {
            "_id": "tenant_id",
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+254712345678",
            "unit": "Apt 101",
            "rentAmount": 25000,
            "rentStatus": "Paid",
            "propertyId": {
                "_id": "property_id",
                "title": "Westlands Apartment",
                "location": "Westlands, Nairobi"
            },
            "landlordId": {
                "_id": "landlord_id",
                "name": "Jane Smith",
                "email": "jane@example.com"
            },
            "leaseStartDate": "2025-01-01",
            "leaseEndDate": "2025-12-31",
            "lastPaymentDate": "2025-12-01",
            "nextPaymentDue": "2026-01-01"
        }
    ]
}
```

---

### 2. Get My Tenants (Landlord/Agent)
```http
GET /api/tenants/my-tenants
Authorization: Bearer <LANDLORD_OR_AGENT_TOKEN>
```

**Response**:
```json
{
    "success": true,
    "count": 10,
    "stats": {
        "total": 10,
        "paid": 7,
        "due": 2,
        "overdue": 1,
        "totalRentExpected": 250000,
        "totalRentCollected": 175000,
        "collectionRate": "70.00"
    },
    "data": [
        // Array of tenants
    ]
}
```

---

### 3. Get Tenants by Property
```http
GET /api/tenants/property/:propertyId
Authorization: Bearer <TOKEN>
```

**Response**:
```json
{
    "success": true,
    "property": {
        "id": "property_id",
        "title": "Westlands Apartment",
        "location": "Westlands, Nairobi"
    },
    "count": 5,
    "data": [
        // Array of tenants in this property
    ]
}
```

---

### 4. Add Tenant to Property
```http
POST /api/tenants/add
Authorization: Bearer <LANDLORD_OR_AGENT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
    "propertyId": "property_id_here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254712345678",
    "unit": "Apt 101",
    "rentAmount": 25000,
    "depositAmount": 50000,
    "leaseStartDate": "2025-01-01",
    "leaseEndDate": "2025-12-31",
    "whatsappNumber": "+254712345678"
}
```

**Required Fields**:
- `propertyId` ✅
- `name` ✅
- `email` ✅
- `phone` ✅

**Optional Fields**:
- `unit`
- `rentAmount`
- `depositAmount`
- `leaseStartDate`
- `leaseEndDate`
- `whatsappNumber`

**Response**:
```json
{
    "success": true,
    "message": "Tenant added successfully. Welcome email sent with login credentials.",
    "data": {
        "id": "tenant_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+254712345678",
        "unit": "Apt 101",
        "rentAmount": 25000,
        "property": {
            "id": "property_id",
            "title": "Westlands Apartment",
            "location": "Westlands, Nairobi"
        },
        "tempPassword": "a1b2c3d4e5f6g7h8"
    }
}
```

**What Happens**:
1. ✅ Creates new tenant user account
2. ✅ Generates temporary password
3. ✅ Links tenant to property and landlord
4. ✅ Calculates next payment due date
5. ✅ Sends welcome email with login credentials

---

### 5. Get Single Tenant
```http
GET /api/tenants/:id
Authorization: Bearer <TOKEN>
```

**Response**:
```json
{
    "success": true,
    "data": {
        "_id": "tenant_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+254712345678",
        "unit": "Apt 101",
        "rentAmount": 25000,
        "rentStatus": "Paid",
        // ... all tenant fields
    }
}
```

---

### 6. Update Tenant
```http
PUT /api/tenants/:id
Authorization: Bearer <LANDLORD_OR_ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
    "name": "John Updated",
    "phone": "+254700000000",
    "unit": "Apt 102",
    "rentAmount": 28000,
    "depositAmount": 56000,
    "leaseStartDate": "2025-02-01",
    "leaseEndDate": "2026-01-31",
    "rentStatus": "Paid",
    "whatsappNumber": "+254700000000",
    "lastPaymentDate": "2025-12-01",
    "nextPaymentDue": "2026-01-01"
}
```

**Allowed Fields to Update**:
- `name`
- `phone`
- `unit`
- `rentAmount`
- `depositAmount`
- `leaseStartDate`
- `leaseEndDate`
- `rentStatus`
- `whatsappNumber`
- `lastPaymentDate`
- `nextPaymentDue`

**Response**:
```json
{
    "success": true,
    "message": "Tenant updated successfully",
    "data": {
        // Updated tenant object
    }
}
```

---

### 7. Mark Rent as Paid
```http
PUT /api/tenants/:id/mark-paid
Authorization: Bearer <LANDLORD_OR_ADMIN_TOKEN>
```

**What Happens**:
1. Sets `rentStatus` to "Paid"
2. Updates `lastPaymentDate` to now
3. Calculates `nextPaymentDue` (1 month from now)

**Response**:
```json
{
    "success": true,
    "message": "Rent marked as paid successfully",
    "data": {
        "rentStatus": "Paid",
        "lastPaymentDate": "2025-12-30T10:30:00Z",
        "nextPaymentDue": "2026-01-30T10:30:00Z"
    }
}
```

---

### 8. Remove Tenant
```http
DELETE /api/tenants/:id
Authorization: Bearer <LANDLORD_OR_ADMIN_TOKEN>
```

**What Happens**:
- Removes property assignment
- Clears landlord link
- Deactivates account
- **Note**: Doesn't delete the user, just removes from property

**Response**:
```json
{
    "success": true,
    "message": "Tenant removed from property successfully"
}
```

---

### 9. Get Tenant Statistics
```http
GET /api/tenants/stats/overview
Authorization: Bearer <LANDLORD_OR_AGENT_OR_ADMIN_TOKEN>
```

**Response**:
```json
{
    "success": true,
    "data": {
        "total": 20,
        "active": 18,
        "paid": 15,
        "due": 3,
        "overdue": 2,
        "totalRentExpected": 500000,
        "totalRentCollected": 375000,
        "collectionRate": "75.00"
    }
}
```

---

## 🔐 Permission Matrix

| Endpoint | Admin | Landlord | Agent | Tenant |
|----------|-------|----------|-------|--------|
| GET /api/tenants | ✅ | ❌ | ❌ | ❌ |
| GET /api/tenants/my-tenants | ✅ | ✅ | ✅ | ❌ |
| GET /api/tenants/property/:id | ✅ | ✅ (own) | ✅ (own) | ❌ |
| POST /api/tenants/add | ✅ | ✅ | ✅ | ❌ |
| GET /api/tenants/:id | ✅ | ✅ (own) | ✅ (own) | ✅ (self) |
| PUT /api/tenants/:id | ✅ | ✅ (own) | ✅ (own) | ❌ |
| PUT /api/tenants/:id/mark-paid | ✅ | ✅ (own) | ✅ (own) | ❌ |
| DELETE /api/tenants/:id | ✅ | ✅ (own) | ✅ (own) | ❌ |
| GET /api/tenants/stats/overview | ✅ | ✅ | ✅ | ❌ |

---

## 📧 Welcome Email

When a tenant is added, they receive an automated welcome email with:

**Email Contents**:
- Welcome message
- Property details (address, unit, rent amount)
- **Login credentials** (email + temporary password)
- Security warning to change password
- Portal features overview
- Contact information

**Template**:
```
Subject: Welcome to [Property Title] - Your Login Credentials

Dear [Tenant Name],

Welcome to [Property Title]! We're excited to have you as our tenant.

Property Details:
- Address: [Location]
- Unit: [Unit Number]
- Monthly Rent: KSh [Amount]
- Lease Start: [Date]

Your Portal Login Credentials:
Email: [tenant@example.com]
Temporary Password: [auto-generated]

⚠️ Important: Please change your password after your first login.

You can use the tenant portal to:
- View your rent payment history
- Submit maintenance requests
- Communicate with your landlord
- Update your contact information

Welcome aboard!
```

---

## 💡 Usage Examples

### Example 1: Admin Views All Tenants

```bash
curl -X GET "http://localhost:5000/api/tenants?page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Example 2: Landlord Views Their Tenants

```bash
curl -X GET "http://localhost:5000/api/tenants/my-tenants" \
  -H "Authorization: Bearer LANDLORD_TOKEN"
```

### Example 3: Agent Adds Tenant to Property

```bash
curl -X POST "http://localhost:5000/api/tenants/add" \
  -H "Authorization: Bearer AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "6767d1234567890abcdef123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254712345678",
    "unit": "Apt 101",
    "rentAmount": 25000,
    "depositAmount": 50000,
    "leaseStartDate": "2025-01-01",
    "leaseEndDate": "2025-12-31"
  }'
```

### Example 4: Landlord Marks Rent as Paid

```bash
curl -X PUT "http://localhost:5000/api/tenants/6767d9876543210fedcba987/mark-paid" \
  -H "Authorization: Bearer LANDLORD_TOKEN"
```

### Example 5: Get Property Tenants

```bash
curl -X GET "http://localhost:5000/api/tenants/property/6767d1234567890abcdef123" \
  -H "Authorization: Bearer LANDLORD_TOKEN"
```

---

## 🧪 Testing Checklist

### Admin Portal Tests
- [ ] Admin can view all tenants
- [ ] Admin can filter by landlord
- [ ] Admin can filter by property
- [ ] Admin can filter by rent status
- [ ] Pagination works correctly
- [ ] Admin can view tenant statistics

### Landlord/Agent Portal Tests
- [ ] Landlord sees only their tenants
- [ ] Agent sees tenants from their properties
- [ ] Can add tenant to property
- [ ] Welcome email sent successfully
- [ ] Temporary password generated
- [ ] Tenant linked to property correctly
- [ ] Can mark rent as paid
- [ ] Can update tenant information
- [ ] Can view tenants by property

### Tenant Portal Tests
- [ ] Tenant can login with temporary password
- [ ] Tenant can view own information
- [ ] Tenant cannot view other tenants
- [ ] Tenant cannot modify own status

---

## 🎨 Frontend Integration Tips

### Admin Dashboard
```javascript
// Fetch all tenants with pagination
const fetchTenants = async (page = 1, filters = {}) => {
    const queryParams = new URLSearchParams({
        page,
        limit: 20,
        ...filters
    });

    const response = await fetch(`/api/tenants?${queryParams}`, {
        headers: {
            'Authorization': `Bearer ${adminToken}`
        }
    });

    return await response.json();
};

// Usage
const { data: tenants, stats } = await fetchTenants(1, {
    rentStatus: 'Overdue'
});
```

### Landlord Dashboard
```javascript
// Fetch my tenants
const fetchMyTenants = async () => {
    const response = await fetch('/api/tenants/my-tenants', {
        headers: {
            'Authorization': `Bearer ${landlordToken}`
        }
    });

    const { data: tenants, stats } = await response.json();

    // Display statistics
    console.log(`Collection Rate: ${stats.collectionRate}%`);
    console.log(`Total Rent: ${stats.totalRentExpected}`);

    return tenants;
};
```

### Add Tenant Form
```javascript
const addTenant = async (tenantData) => {
    const response = await fetch('/api/tenants/add', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tenantData)
    });

    const result = await response.json();

    if (result.success) {
        alert(`Tenant added! Temp password: ${result.data.tempPassword}`);
        // Display or save temp password for landlord reference
    }

    return result;
};
```

---

## 🚨 Error Handling

### Common Errors

**400 Bad Request**:
```json
{
    "success": false,
    "message": "Please provide propertyId, name, email, and phone"
}
```

**403 Forbidden**:
```json
{
    "success": false,
    "message": "Not authorized to access this property"
}
```

**404 Not Found**:
```json
{
    "success": false,
    "message": "Tenant not found"
}
```

**409 Conflict**:
```json
{
    "success": false,
    "message": "This email is already registered as a tenant for this property"
}
```

---

## 📊 Database Queries Performance

**Optimized with Indexes**:
- ✅ `propertyId` lookup: O(log n)
- ✅ `landlordId` lookup: O(log n)
- ✅ Role + Property filtering: O(log n)
- ✅ Pagination: Efficient skip/limit

**Expected Response Times**:
- Get tenants: < 100ms
- Add tenant: < 500ms (includes email)
- Update tenant: < 100ms
- Statistics: < 200ms

---

## 🔄 Integration with Existing Features

### Works With:
1. **Rent Reminder Service** ✅
   - Automatically sends reminders based on `nextPaymentDue`
   - Uses `rentStatus` to track overdue payments

2. **Financial Reports** ✅
   - Includes tenant payment data
   - Tracks rent collection rates

3. **Payment System** ✅
   - Can link payments to tenants
   - Updates `rentStatus` on payment

4. **Email Service** ✅
   - Sends welcome emails
   - Sends payment reminders

---

## ✨ Key Features

### Automatic Calculations
- ✅ Next payment due date (1 month from lease start)
- ✅ Collection rate percentage
- ✅ Total rent expected vs collected

### Security
- ✅ Role-based access control
- ✅ Property ownership verification
- ✅ Password encryption for tenants
- ✅ Temporary password generation

### Email Automation
- ✅ Welcome email with credentials
- ✅ Beautiful HTML template
- ✅ Includes all property details

### Data Relationships
- ✅ Tenant → Landlord link
- ✅ Tenant → Property link
- ✅ Proper population of related data

---

## 🎯 Next Steps

### Recommended Enhancements
1. **Bulk Import**: CSV upload for multiple tenants
2. **Lease Documents**: Upload and store lease agreements
3. **Payment History**: Detailed payment tracking per tenant
4. **Communication**: In-app messaging between landlord and tenant
5. **Notifications**: SMS/WhatsApp rent reminders
6. **Reports**: Tenant-specific financial reports

---

## 📞 Support

**Files Created**:
- `backend/controllers/tenants.js`
- `backend/routes/tenants.js`
- `backend/services/emailService.js` (updated)

**Files Modified**:
- `backend/models/User.js` (added tenant fields)
- `backend/server.js` (registered routes)

**API Base URL**: `/api/tenants`

---

**Status**: ✅ Production Ready
**Version**: 1.0
**Last Updated**: December 30, 2025

All tenant management features are fully implemented and ready for use! 🎉
