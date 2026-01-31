# Scripts Directory

All project scripts organized by purpose.

## Structure

```
scripts/
├── backend/        # Backend utility scripts
├── deployment/     # Deployment and server setup scripts
└── testing/        # Test scripts
```

## Backend Scripts (`backend/`)

Database and application management scripts:

### User Management
- `createAdmin.js` - Create admin user
- `createTestUser.js` - Create test user
- `createTestSurveyor.js` - Create test surveyor
- `createDummySurveyor.js` - Create dummy surveyor data
- `listUsers.js` - List all users
- `resetSurveyorPassword.js` - Reset surveyor password

### Database Operations
- `setupIndexes.js` - Setup database indexes
- `seedProperties.js` - Seed properties data
- `migrateCurrency.js` - Migrate currency fields
- `migratePriceToNumber.js` - Migrate price fields to numbers

### Payments
- `checkPaymentEndpoint.js` - Check payment endpoint
- `checkPaymentIndexes.js` - Verify payment indexes
- `checkUserPayments.js` - Check user payment history
- `checkTransactionStatus.js` - Check transaction status
- `cleanPendingPayments.js` - Clean pending payments
- `fixPaymentIndexes.js` - Fix payment indexes
- `updatePaymentStatus.js` - Update payment status
- `debugPaymentIssue.js` - Debug payment issues
- `debugLivePayment.js` - Debug live payment
- `testPaymentCreation.js` - Test payment creation
- `testPaymentWithUser.js` - Test payment with user
- `testMpesaPayment.js` - Test M-Pesa payment

### Properties
- `fixPropertyOwnership.js` - Fix property ownership
- `reassignProperties.js` - Reassign properties
- `testLocationMatcher.js` - Test location matching

### Roles & Permissions
- `checkRoles.js` - Check user roles
- `fixSurveyorRole.js` - Fix surveyor role
- `testRolePermissions.sh` - Test role permissions

### Email & Communication
- `gmail-auth.js` - Gmail OAuth authentication
- `gmail-smtp-auth.js` - Gmail SMTP authentication
- `submitWhatsAppTemplates.js` - Submit WhatsApp templates to Meta

### Phone & Utilities
- `testPhoneNormalization.js` - Test phone number normalization
- `debugSurveyorLogin.js` - Debug surveyor login

## Deployment Scripts (`deployment/`)

Server deployment and configuration:

- `deploy-production.sh` - Deploy to production
- `redeploy.sh` - Quick redeploy
- `rebuild-frontend.sh` - Rebuild frontend
- `setup-ssl.sh` - Setup SSL certificates
- `diagnose-ssl.sh` - Diagnose SSL issues
- `fix-server-env.sh` - Fix server environment
- `server-fix-commands.sh` - Server fix commands
- `enable-ai-service.sh` - Enable AI service
- `quick-enable-ai.sh` - Quick AI service enable
- `fix-oauth-and-gemini.sh` - Fix OAuth and Gemini
- `sync-colleague-changes.sh` - Sync colleague changes

## Testing Scripts (`testing/`)

Test and debugging scripts:

### Database Tests
- `test-db.js` - Test database connection
- `test-db-debug.js` - Debug database issues

### API Tests
- `test-groq.js` - Test Groq AI
- `test-new-features.js` - Test new features
- `test-oauth-email.js` - Test OAuth email
- `test-registration.sh` - Test user registration

### Payment Tests
- `test-mpesa-auth.js` - Test M-Pesa authentication
- `test-mpesa-query.js` - Test M-Pesa query
- `test-mpesa-stk.js` - Test M-Pesa STK push

## Usage

### Running Backend Scripts

```bash
cd /path/to/Genesis
node scripts/backend/<script-name>.js
```

### Running Deployment Scripts

```bash
cd /path/to/Genesis
bash scripts/deployment/<script-name>.sh
```

### Running Test Scripts

```bash
cd /path/to/Genesis
node scripts/testing/<script-name>.js
# OR for shell scripts
bash scripts/testing/<script-name>.sh
```

## Environment Variables

Most scripts require environment variables to be set. Ensure you have a `.env` file in the backend directory with:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `TWILIO_*` - Twilio credentials (for WhatsApp)
- `MPESA_*` - M-Pesa credentials (for payments)
- `GMAIL_*` - Gmail credentials (for email)
- And other service-specific variables

## Notes

- All scripts assume they are run from the project root directory
- Backend scripts require `backend/.env` file
- Deployment scripts may require sudo permissions
- Test scripts are safe to run multiple times
- Always backup your database before running migration scripts

## Adding New Scripts

When adding new scripts:

1. Place in appropriate subdirectory:
   - `backend/` - Database, user, or app management
   - `deployment/` - Server setup or deployment
   - `testing/` - Tests or debugging

2. Follow naming conventions:
   - Use descriptive names (e.g., `createAdmin.js`)
   - Test scripts: `test-<feature>.js`
   - Fix scripts: `fix<Issue>.js`

3. Add documentation to this README

4. Include proper error handling and logging
