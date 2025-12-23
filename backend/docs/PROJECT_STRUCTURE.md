# 📁 Genesis Project Structure

**Last Updated**: 2025-12-22
**Project**: Genesis Real Estate Platform

---

## 🏗️ Directory Structure

```
Genesis/
│
├── 📂 frontend/                    # React + TypeScript Frontend
│   │
│   ├── 📂 components/             # React Components
│   │   ├── 📂 dashboard/         # Dashboard components
│   │   │   ├── 📂 agent/        # Agent role dashboard
│   │   │   ├── 📂 owner/        # Owner role dashboard
│   │   │   ├── 📂 tenant/       # Tenant role dashboard
│   │   │   ├── 📂 seller/       # Seller role dashboard
│   │   │   ├── 📂 landlord/     # Landlord role dashboard
│   │   │   ├── 📂 combined/     # Combined role dashboard
│   │   │   ├── 📂 ai-manager/   # AI management components
│   │   │   └── 📂 verification/ # Document verification
│   │   ├── 📂 icons/            # SVG icon components
│   │   ├── 📂 signin/           # Sign in pages
│   │   ├── 📂 signup/           # Registration flow
│   │   ├── 📂 modals/           # Modal dialogs
│   │   ├── 📂 propertyActions/  # Property action panels
│   │   ├── 📂 interaction/      # Property interaction
│   │   └── 📂 surveyor/         # Surveyor components
│   │
│   ├── 📂 services/               # API & Service Layer
│   │   ├── aiChatService.ts      # AI chat functionality
│   │   ├── apiService.ts         # Main API client
│   │   ├── backendService.ts     # Backend integration
│   │   ├── geminiService.ts      # Gemini AI service
│   │   ├── websocketClient.ts    # WebSocket client
│   │   └── ... (other services)
│   │
│   ├── 📂 public/                 # Static Assets
│   │   └── test-ai-chat.html     # Testing page
│   │
│   ├── 📄 App.tsx                 # Main App component
│   ├── 📄 index.tsx               # App entry point
│   ├── 📄 types.ts                # TypeScript type definitions
│   │
│   ├── 📄 .env                    # Environment variables (NOT in git)
│   ├── 📄 .env.example            # Environment template
│   ├── 📄 .gitignore              # Frontend git ignore
│   │
│   ├── 📄 package.json            # Frontend dependencies
│   ├── 📄 vite.config.ts          # Vite configuration
│   ├── 📄 tsconfig.json           # TypeScript config
│   ├── 📄 tailwind.config.js      # TailwindCSS config
│   └── 📄 vercel.json             # Vercel deployment config
│
├── 📂 backend/                     # Node.js + Express Backend
│   │
│   ├── 📂 config/                 # Configuration
│   │   ├── db.js                 # Database connection
│   │   ├── email.js              # Email configuration
│   │   ├── logger.js             # Winston logger
│   │   └── validateEnv.js        # Environment validation
│   │
│   ├── 📂 controllers/            # Route Controllers
│   │   ├── auth.js               # Authentication
│   │   ├── properties.js         # Property management
│   │   ├── users.js              # User management
│   │   ├── aiChat.js             # AI chat endpoints
│   │   └── ... (other controllers)
│   │
│   ├── 📂 middleware/             # Express Middleware
│   │   ├── auth.js               # JWT authentication
│   │   ├── authorize.js          # Role-based authorization
│   │   ├── errorHandler.js       # Global error handler
│   │   └── rateLimiter.js        # Rate limiting
│   │
│   ├── 📂 models/                 # MongoDB Models
│   │   ├── User.js               # User model
│   │   ├── Property.js           # Property model
│   │   ├── Lead.js               # Lead model
│   │   ├── Payment.js            # Payment model
│   │   ├── Notification.js       # Notification model
│   │   └── ... (other models)
│   │
│   ├── 📂 routes/                 # API Routes
│   │   ├── auth.js               # /api/auth/*
│   │   ├── properties.js         # /api/properties/*
│   │   ├── users.js              # /api/users/*
│   │   ├── aiChat.js             # /api/ai-chat/*
│   │   └── ... (other routes)
│   │
│   ├── 📂 services/               # Business Logic
│   │   ├── emailService.js       # Email notifications
│   │   ├── websocketService.js   # WebSocket server
│   │   └── whatsappService.js    # WhatsApp integration
│   │
│   ├── 📂 scripts/                # Utility Scripts
│   │   ├── setupIndexes.js       # Database index setup
│   │   ├── seedProperties.js     # Seed sample data
│   │   └── ... (other scripts)
│   │
│   ├── 📂 utils/                  # Utilities
│   │   └── cloudinary.js         # Image upload
│   │
│   ├── 📂 logs/                   # Application Logs (NOT in git)
│   │   ├── combined.log          # All logs
│   │   └── error.log             # Error logs only
│   │
│   ├── 📄 server.js               # Express server entry point
│   ├── 📄 test-email.js           # Email testing script
│   │
│   ├── 📄 .env                    # Backend environment (NOT in git)
│   ├── 📄 .env.example            # Environment template
│   ├── 📄 .gitignore              # Backend git ignore
│   │
│   ├── 📄 package.json            # Backend dependencies
│   │
│   ├── 📄 README_IMPROVEMENTS.md  # Production improvements doc
│   └── 📄 SECURITY_ROTATION_REQUIRED.md # Credential rotation guide
│
├── 📂 docs/                        # Documentation
│   ├── 📄 PROJECT_STRUCTURE.md    # This file
│   ├── 📄 DEPLOYMENT_AUDIT_REPORT.md # Full security audit
│   ├── 📄 SECURITY_SUMMARY.md     # Security issues summary
│   ├── 📄 SECURITY_FIXES_APPLIED.md # Security fixes log
│   ├── 📄 SECURITY_CHECKLIST.md   # Security checklist
│   ├── 📄 QUICK_FIXES.md          # Quick deployment guide
│   ├── 📄 SYSTEM_DOCUMENTATION.md # System overview
│   ├── 📄 RENDER_DEPLOYMENT_GUIDE.md # Render deployment
│   ├── 📄 CHAT_SETUP_GUIDE.md     # AI chat setup
│   ├── 📄 GEMINI_API_SETUP.md     # Gemini API guide
│   ├── 📄 GOOGLE_OAUTH_SETUP.md   # Google OAuth setup
│   ├── 📄 metadata.json           # Project metadata
│   └── 📄 render.yaml             # Render configuration
│
├── 📂 .github/                     # GitHub Configuration
│   └── 📄 SECURITY.md             # Security policy
│
├── 📂 .git/                        # Git repository (hidden)
│   └── hooks/
│       └── pre-commit             # Pre-commit hook (prevents secret leaks)
│
├── 📄 .gitignore                   # Root git ignore rules
├── 📄 README.md                    # Main project README
│
└── 📂 .claude/                     # Claude Code configuration (local only)
```

---

## 📋 File Descriptions

### Frontend Files

#### Core Application
- **App.tsx**: Main application component, routing, state management
- **index.tsx**: React entry point, renders App
- **types.ts**: TypeScript type definitions for the entire frontend

#### Configuration
- **.env**: Environment variables (API URLs, OAuth keys) - NOT committed
- **.env.example**: Template for environment variables
- **vite.config.ts**: Vite build and dev server configuration
- **tsconfig.json**: TypeScript compiler options
- **tailwind.config.js**: TailwindCSS theme and plugins
- **vercel.json**: Vercel deployment configuration

#### Components Structure
- **dashboard/**: Role-based dashboards (agent, owner, tenant, etc.)
- **signin/signup/**: Authentication and registration flows
- **modals/**: Reusable modal dialogs
- **icons/**: Custom SVG icon components
- **propertyActions/**: Property action panels (viewing, valuation, etc.)

### Backend Files

#### Core Server
- **server.js**: Express server setup, middleware, routes
- **test-email.js**: Script to test email configuration

#### Configuration
- **config/db.js**: MongoDB connection with logging
- **config/email.js**: Nodemailer email setup
- **config/logger.js**: Winston logger configuration
- **config/validateEnv.js**: Environment variable validation

#### Business Logic
- **controllers/**: Handle HTTP requests, call services
- **services/**: Business logic (email, WebSocket, etc.)
- **models/**: MongoDB schema definitions
- **routes/**: API endpoint definitions

#### Security & Middleware
- **middleware/auth.js**: JWT token verification
- **middleware/authorize.js**: Role-based access control
- **middleware/rateLimiter.js**: Brute force protection
- **middleware/errorHandler.js**: Global error handling

---

## 🔑 Environment Files

### Frontend (.env)
```bash
VITE_GOOGLE_CLIENT_ID=...        # Google OAuth
VITE_API_URL=...                 # Backend URL
GEMINI_MODEL_NAME=...            # AI model name
```

### Backend (.env)
```bash
NODE_ENV=production              # Environment
PORT=5000                        # Server port
MONGO_URI=...                    # MongoDB connection
JWT_SECRET=...                   # JWT signing key
EMAIL_*=...                      # Email credentials
GEMINI_API_KEY=...              # AI API key
FRONTEND_URL=...                 # CORS origin
```

---

## 🚀 Getting Started

### Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Setup Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd frontend
cp .env.example .env
# Edit .env with backend URL
```

### Run Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 📦 Dependencies

### Frontend
- React 19
- TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Axios (HTTP client)
- Socket.IO Client (real-time)

### Backend
- Express (web framework)
- MongoDB + Mongoose (database)
- Socket.IO (WebSocket)
- Winston (logging)
- Morgan (request logging)
- Helmet (security)
- JWT (authentication)
- Nodemailer (email)

---

## 🔒 Security Features

- Pre-commit hook prevents secret leaks
- Rate limiting on auth endpoints
- NoSQL injection protection
- XSS attack protection
- JWT token authentication
- Role-based authorization
- Environment variable validation
- Structured logging

---

## 📊 Key Features by Folder

### Frontend Components
- **dashboard/**: Full-featured role-based dashboards
- **signin/signup/**: Complete auth flow with email verification
- **propertyActions/**: Valuation, viewing scheduling, verification
- **modals/**: Payment, plan selection, chat history

### Backend Services
- **emailService**: Lead notifications, welcome emails
- **websocketService**: Real-time updates, notifications
- **aiChat**: Natural language property search

### Backend Routes
- **/api/auth**: Login, register, password reset
- **/api/properties**: CRUD + smart search
- **/api/ai-chat**: AI-powered property queries
- **/api/leads**: Lead management
- **/api/health**: Service health monitoring

---

## 🧪 Testing

```bash
# Backend tests
cd backend
node test-email.js                    # Test email
node scripts/setupIndexes.js          # Setup DB indexes
curl http://localhost:5000/api/health # Health check

# Frontend build
cd frontend
npm run build                         # Production build
npm run preview                       # Preview build
```

---

## 📝 Notes

- **Never commit** `.env` files
- **Always use** `.env.example` as template
- **Pre-commit hook** blocks secrets automatically
- **Logs** are in `backend/logs/` (not committed)
- **Documentation** is in `docs/` folder

---

_Generated: 2025-12-22_
_Project: Genesis Real Estate Platform_
