# User Roles Implementation

## Overview
The MyGF AI platform supports 6 distinct user roles, each with specific permissions and capabilities.

## Defined Roles
As defined in `models/User.js:44`:
- **Agent**
- **Property Seller**
- **Landlord**
- **Tenant**
- **Admin**
- **Surveyor**

---

## Role Permissions & Capabilities

### 1. Agent
**Purpose**: Professional real estate agents who list and manage properties for clients.

**Capabilities**:
- ✅ Create, update, and delete properties
- ✅ Boost properties for better visibility
- ✅ View and manage leads on their properties
- ✅ Access analytics dashboard
- ✅ Update maintenance request status
- ✅ Request property surveys
- ✅ Communicate with buyers/renters via chat

**API Endpoints**:
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `PUT /api/properties/:id/boost` - Boost property
- `GET /api/leads` - View leads
- `GET /api/analytics` - View analytics
- `PUT /api/maintenance/:id` - Update maintenance requests

**Database Example**:
```javascript
{
  name: "Jane Doe",
  email: "agent@mygf.com",
  role: "Agent",
  phone: "+254712345678"
}
```

---

### 2. Property Seller
**Purpose**: Property owners who are selling their properties.

**Capabilities**:
- ✅ Create, update, and delete properties (sale type)
- ✅ Boost properties for better visibility
- ✅ View and manage leads
- ✅ Update maintenance request status
- ✅ Request property surveys
- ✅ View property analytics

**API Endpoints**:
- `POST /api/properties` - List property for sale
- `PUT /api/properties/:id` - Update property listing
- `DELETE /api/properties/:id` - Remove property listing
- `PUT /api/properties/:id/boost` - Boost visibility
- `GET /api/leads` - View interested buyers
- `PUT /api/maintenance/:id` - Handle maintenance issues

**Database Example**:
```javascript
{
  name: "Sample Property Seller",
  email: "propertyseller@example.com",
  role: "Property Seller",
  phone: "+254712345678"
}
```

---

### 3. Landlord
**Purpose**: Property owners who rent out properties and manage tenants.

**Capabilities**:
- ✅ Create, update, and delete rental properties
- ✅ Boost properties for better visibility
- ✅ Manage tenant information
- ✅ View and respond to maintenance requests
- ✅ Track rent payment status
- ✅ View property analytics
- ✅ Request property surveys

**Special Features**:
- Tenant management system
- Rent status tracking (Paid, Due, Overdue)
- Link tenants to specific properties/units

**API Endpoints**:
- `POST /api/properties` - List rental property
- `PUT /api/properties/:id` - Update rental listing
- `DELETE /api/properties/:id` - Remove listing
- `GET /api/users/tenants` - View tenant list
- `PUT /api/maintenance/:id` - Respond to maintenance
- `GET /api/analytics` - View rental analytics

**Database Example**:
```javascript
{
  name: "Sample Landlord",
  email: "landlord@example.com",
  role: "Landlord",
  phone: "+254712345678"
}
```

**Tenant Relationship**:
Tenants are linked to landlords via `landlordId` field:
```javascript
{
  name: "John Tenant",
  email: "tenant@example.com",
  role: "Tenant",
  landlordId: "694148f35a3426839443a7fc", // Landlord's ID
  unit: "Apt 3B",
  rentStatus: "Paid"
}
```

---

### 4. Surveyor
**Purpose**: Professional property surveyors who conduct property inspections and assessments.

**Capabilities**:
- ✅ Manage surveyor profile with bio, specializations, and services
- ✅ View and accept survey tasks
- ✅ Update task status (Pending → In Progress → Completed)
- ✅ Upload survey reports (PDF, images)
- ✅ Set availability status
- ✅ Track completed surveys and ratings
- ✅ List professional services with pricing

**Profile Fields** (defined in `models/User.js:121-171`):
```javascript
surveyorProfile: {
  profileImage: String,
  bio: String (max 500 chars),
  specializations: ['Residential', 'Commercial', 'Land', 'Industrial', 'Agricultural', 'Mixed-Use'],
  services: [{
    name: String,
    description: String,
    price: Number
  }],
  yearsOfExperience: Number,
  certifications: [String],
  availability: 'Available' | 'Busy' | 'Unavailable',
  rating: Number (0-5),
  completedSurveys: Number,
  location: String
}
```

**API Endpoints**:
- `GET /api/surveyor/profile` - Get surveyor profile
- `PUT /api/surveyor/profile` - Update profile
- `POST /api/surveyor/upload-image` - Upload profile image
- `GET /api/surveyor/tasks` - View assigned tasks
- `GET /api/surveyor/tasks/pending` - View pending tasks
- `PATCH /api/surveyor/tasks/:id/accept` - Accept task
- `PATCH /api/surveyor/tasks/:id/status` - Update task status
- `POST /api/surveyor/reports` - Upload survey report
- `GET /api/surveyor/available` - List available surveyors (Public)
- `POST /api/surveyor/search` - Search surveyors (Public)

**Database Example**:
```javascript
{
  name: "Sample Surveyor",
  email: "surveyor@example.com",
  role: "Surveyor",
  phone: "+254712345678",
  surveyorProfile: {
    bio: "Professional property surveyor with 10 years experience",
    specializations: ["Residential", "Commercial"],
    services: [
      {
        name: "Basic Property Inspection",
        description: "Full property assessment",
        price: 15000
      }
    ],
    yearsOfExperience: 10,
    availability: "Available",
    rating: 5.0,
    completedSurveys: 0
  }
}
```

---

### 5. Admin
**Purpose**: System administrators with full access to all features.

**Capabilities**:
- ✅ All permissions from other roles
- ✅ View all users
- ✅ Create surveyors
- ✅ Send system-wide announcements
- ✅ Manage all properties
- ✅ Access all analytics
- ✅ Moderate content

**API Endpoints**:
- `GET /api/admin/users` - View all users
- `POST /api/admin/announcements` - Send announcements
- `POST /api/admin/create-surveyor` - Create surveyor account
- All other role endpoints

---

### 6. Tenant
**Purpose**: Property renters who communicate with landlords.

**Capabilities**:
- ✅ Search and view properties
- ✅ Submit maintenance requests
- ✅ Communicate with landlords
- ✅ View rent status
- ✅ Linked to specific landlord and unit

**Special Fields**:
```javascript
{
  landlordId: ObjectId, // Reference to landlord
  unit: String,         // e.g., "Apt 3B", "House 12"
  rentStatus: 'Paid' | 'Due' | 'Overdue'
}
```

**API Endpoints**:
- `GET /api/properties` - Search properties (Public)
- `POST /api/maintenance` - Create maintenance request
- `GET /api/maintenance` - View own requests

---

## Role-Based Access Control (RBAC)

### Middleware Implementation
Located in `middleware/authorize.js`:

```javascript
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized`
            });
        }
        next();
    };
};
```

### Usage Example
```javascript
router.post('/properties',
    protect,  // Verify authentication
    authorize('Agent', 'Property Seller', 'Landlord', 'Admin'),  // Check role
    createProperty
);
```

---

## Sample Users Created

The seed script created sample users for testing:

| Role | Email | Password |
|------|-------|----------|
| Agent | agent@mygf.com | password123 |
| Property Seller | propertyseller@example.com | password123 |
| Landlord | landlord@example.com | password123 |
| Surveyor | surveyor@example.com | password123 |

---

## Property Ownership by Role

Properties are linked to users via `createdBy` field:

```javascript
{
  title: "Luxurious Villa",
  createdBy: "694148f35a3426839443a7f6", // User ID
  // ... other fields
}
```

**Distribution in Sample Data**:
- 3 properties created by Agent
- 3 properties created by Property Seller
- 2 properties created by Landlord
- 2 properties created by Surveyor (for demonstration)

---

## AI Chat Integration

All roles can use the AI chat service for property search:

**Public Endpoints** (No authentication required):
- `POST /api/ai-chat/search` - Search properties
- `POST /api/ai-chat/message` - Conversational search
- `GET /api/ai-chat/greeting` - Get AI greeting
- `GET /api/ai-chat/property/:id` - Get property details

**Protected Endpoints** (Authentication required):
- `GET /api/ai-chat/context` - Get conversation context
- `DELETE /api/ai-chat/context` - Clear context

---

## Testing Role Permissions

### Create a Property as Agent
```bash
# 1. Login as agent
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@mygf.com","password":"password123"}'

# 2. Use returned token to create property
curl -X POST http://localhost:5000/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Property","description":"...","location":"Nairobi",...}'
```

### Access Surveyor Dashboard
```bash
# 1. Login as surveyor
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"surveyor@example.com","password":"password123"}'

# 2. Get surveyor profile
curl -X GET http://localhost:5000/api/surveyor/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. View pending tasks
curl -X GET http://localhost:5000/api/surveyor/tasks/pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Summary

✅ **All 4 requested roles are fully implemented**:
1. **Landlord** - Rental property management with tenant tracking
2. **Property Seller** - Property sales listings and lead management
3. **Agent** - Professional real estate services
4. **Surveyor** - Property inspection and assessment services

✅ **Additional roles**:
5. **Admin** - System administration
6. **Tenant** - Property renters

✅ **Features**:
- Role-based access control (RBAC)
- Distinct permissions per role
- Surveyor profile management system
- Tenant-landlord relationship tracking
- AI-powered property search for all users
- 10 sample properties distributed across roles

✅ **Security**:
- JWT authentication
- Role-based authorization middleware
- Protected routes for sensitive operations
