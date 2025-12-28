# Genesis Platform - Bug Report & Analysis

## Critical Bugs Found

### 1. **Price Field Type Mismatch** (CRITICAL)
**Location:** `backend/models/Property.js:18-21`, `frontend/types.ts:12`
**Severity:** Critical
**Impact:** Breaks all numeric calculations, sorting, and comparisons

**Issue:**
- Price is stored as `String` in MongoDB schema
- Frontend types define price as `string`
- This prevents:
  - Mathematical calculations (ROI, average price, etc.)
  - Proper sorting by price
  - Price range queries ($gte, $lte)

**Example Failure:**
```javascript
// analytics.js:108 - This will fail
averagePrice: { $avg: '$price' } // Can't average a string!
```

**Fix Required:**
- Change Property schema to store price as Number
- Add migration script to convert existing string prices to numbers
- Update frontend types
- Parse price strings in seed data

---

### 2. **Analytics Price Aggregation Failure**
**Location:** `backend/controllers/analytics.js:108`
**Severity:** High
**Impact:** Analytics dashboard will show incorrect/null average prices

**Issue:**
```javascript
const propertyStats = await Property.aggregate([
    { $match: { createdBy: userId } },
    {
        $group: {
            _id: '$dealType',
            count: { $sum: 1 },
            averagePrice: { $avg: '$price' } // ❌ FAILS - price is string
        }
    }
]);
```

**Fix:** Remove this aggregation or convert price to number first

---

### 3. **Investment Service Type Mismatch**
**Location:** `frontend/services/investmentService.ts:18`
**Severity:** Medium
**Impact:** Investment calculations will fail if ever called

**Issue:**
- `analyzeInvestment(price: number, estimatedRent: number)` expects number
- `Listing.price` is defined as string
- Function is defined but never actually used in codebase

**Fix:** Either fix types or remove unused code

---

### 4. **Unused Investment Calculation Code**
**Location:** `frontend/services/investmentService.ts`
**Severity:** Low
**Impact:** Dead code, increases bundle size

**Issue:**
- Full investment analysis service created
- Never imported or used anywhere
- PropertyCard shows investment.roi but data never populated

**Fix:** Either implement investment calculations or remove unused code

---

### 5. **Property Type Field Name Inconsistency**
**Location:** `backend/controllers/analytics.js:106, 118`
**Severity:** Medium
**Impact:** Grouping by wrong field, returns no/incorrect results

**Issue:**
```javascript
// Line 106 - groups by dealType (doesn't exist on Property)
$group: {
    _id: '$dealType', // ❌ Property has priceType, not dealType
    ...
}

// Line 118 - groups by type (doesn't exist on Property)
$group: {
    _id: '$type', // ❌ Property has propertyType, not type
    ...
}
```

**Correct fields:**
- `priceType` - 'sale' or 'rental' (line 22-27 in Property.js)
- `propertyType` - 'apartment', 'house', 'condo', 'villa', etc. (line 90-93 in Property.js)

**Fix:** Change line 106 to use `'$priceType'` and line 118 to use `'$propertyType'`

---

## Medium Priority Bugs

### 6. **Console.log in Production Code**
**Location:** Multiple files
**Severity:** Low-Medium
**Impact:** Performance, security (exposes sensitive data)

**Examples:**
- `backend/controllers/properties.js:116-121` - Debug logging
- `backend/controllers/properties.js:195-201` - More debug logging
- `backend/controllers/auth.js:76-78` - Logs passwords/OTPs
- `backend/controllers/users.js:29, 46` - Logs default passwords

**Fix:** Remove or replace with proper winston logger

---

### 7. **Hardcoded Default Passwords**
**Location:** `backend/controllers/users.js:29, 46`
**Severity:** Medium (flagged in plan)
**Impact:** Security risk

**Issue:**
```javascript
const defaultPassword = 'password123'; // Hardcoded and logged
console.log(`Created user with email: ${email}, password: ${defaultPassword}`);
```

**Fix:** Use crypto.randomBytes() for secure random passwords

---

## Low Priority Issues

### 8. **Missing Null Checks**
**Status:** ✅ Fixed (optional chaining added)
**Location:** `backend/services/aiChatService.js:164-165`

Already fixed with optional chaining:
```javascript
agentName: p.createdBy?.name || 'Property Agent',
```

---

### 9. **Inconsistent Error Handling**
**Severity:** Low
**Impact:** User experience

Some endpoints return errors differently:
- Some: `{ success: false, message: '...' }`
- Others: `{ error: '...' }`
- Need standardization

---

### 10. **Frontend Price Parsing Workarounds**
**Location:** `frontend/components/propertyActions/MortgageCalculatorPanel.tsx:22`, `ValuationPanel.tsx:18`
**Severity:** Low-Medium (symptom of Bug #1)
**Impact:** Code complexity, potential parsing errors

**Issue:**
```typescript
// MortgageCalculatorPanel.tsx:22
const propertyPrice = parseFloat(property.price.replace(/[^0-9.]/g, '')) || 0;

// ValuationPanel.tsx:18
const propertyPrice = parseFloat(property.price.replace(/[^0-9.]/g, '')) || 0;
```

Frontend has to parse string prices on every calculation, which:
- Adds unnecessary complexity
- Could fail if price format changes
- Slows down calculations
- Is error-prone (what if price is "Call for Price"?)

**Root Cause:** Price stored as String in backend (Bug #1)

**Fix:** Once price is changed to Number in backend, remove regex parsing and use price directly

---

## Recommendations

### Immediate Actions (Critical):
1. Fix price field type from string to number
2. Create data migration script for existing properties
3. Update analytics aggregations
4. Remove or fix investment service

### Short Term (High):
1. Remove console.log statements
2. Fix field name inconsistencies in analytics
3. Implement proper logging with winston

### Long Term (Medium):
1. Add comprehensive input validation
2. Standardize error response format
3. Implement investment feature properly or remove it

---

## Summary
- **Critical Bugs:** 2 (#1 Price Type Mismatch, #2 Analytics Aggregation Failure)
- **High Priority:** 1 (#3 Investment Service Type Mismatch)
- **Medium Priority:** 3 (#5 Field Name Inconsistency, #6 Console.log in Production, #7 Hardcoded Passwords)
- **Low Priority:** 4 (#4 Unused Code, #8 Fixed null checks, #9 Inconsistent errors, #10 Frontend parsing)
- **Total Issues:** 10

**Most critical issue:** Price type mismatch (Bug #1) affecting calculations across the entire platform.

This single bug cascades to:
- Analytics dashboard showing null/NaN averages (Bug #2)
- Investment service unable to calculate ROI (Bug #3)
- Frontend needing workarounds to parse prices (Bug #10)

**Recommended fix order:**
1. Fix Bug #1 (price String → Number) + migration script
2. Fix Bug #2 & #5 (analytics field names and aggregations)
3. Remove Bug #6 (console.log statements)
4. Decision on Bug #3/#4 (implement or remove investment service)
