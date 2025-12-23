# Genesis Real Estate Platform

AI-powered real estate platform with advanced property management, AI chat, and comprehensive analytics.

## 📁 Project Structure

```
Genesis/
├── frontend/           # React + TypeScript + Vite frontend
│   ├── components/    # React components
│   ├── services/      # API and service layers
│   ├── public/        # Static assets
│   ├── .env          # Frontend environment variables (NOT in git)
│   ├── .env.example  # Frontend environment template
│   └── package.json  # Frontend dependencies
│
├── backend/           # Node.js + Express backend
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Express middleware
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── scripts/      # Utility scripts
│   ├── docs/         # Backend & deployment documentation
│   ├── .env         # Backend environment variables (NOT in git)
│   ├── .env.example # Backend environment template
│   └── package.json # Backend dependencies
│
├── render.yaml       # Render deployment configuration
├── .gitignore       # Git ignore rules
└── README.md        # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Gmail account (for email features)
- Gemini API key (for AI features)

### 1. Clone Repository

```bash
git clone https://github.com/mikecurious/Genesis.git
cd Genesis
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env

# Setup database indexes
node scripts/setupIndexes.js

# Start development server
npm run dev
```

Backend will run on: http://localhost:5000

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with backend URL
nano .env

# Start development server
npm run dev
```

Frontend will run on: http://localhost:3000

## 🔑 Environment Variables

### Backend (.env)

See `backend/.env.example` for all required variables:
- MongoDB connection string
- JWT secret
- Email credentials (Gmail)
- Gemini API key
- Frontend URL (for CORS)

### Frontend (.env)

See `frontend/.env.example` for required variables:
- Backend API URL
- Google OAuth Client ID

## 📚 Documentation

All documentation is in the `backend/docs/` folder:

- **Security**: `backend/docs/SECURITY_SUMMARY.md`
- **Deployment**: `backend/docs/RENDER_DEPLOYMENT_GUIDE.md`
- **Security Actions**: `backend/SECURITY_ACTION_REQUIRED.md`
- **Improvements**: `backend/README_IMPROVEMENTS.md`

## 🔒 Security

**IMPORTANT**: Before deploying to production:

1. **Read**: `backend/SECURITY_ACTION_REQUIRED.md` (CRITICAL)
2. **Rotate credentials**: Follow the rotation guide
3. **Security checklist**: `backend/docs/SECURITY_CHECKLIST.md`

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Test email configuration
node test-email.js

# Test database connection
node -e "require('dotenv').config(); require('./config/db')();"

# Check health endpoint
curl http://localhost:5000/api/health | jq
```

### Frontend Tests

```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Connect GitHub repository
2. Set environment variables from `backend/.env`
3. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variables from `frontend/.env`
5. Deploy

See `backend/docs/RENDER_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## 📊 Features

- **AI Chat**: Property search using natural language
- **Property Management**: List, edit, manage properties
- **Lead Capture**: Automated lead collection
- **Analytics**: Real-time insights and metrics
- **Notifications**: Email and in-app notifications
- **Multi-role Support**: Agent, Owner, Tenant, Surveyor
- **Document Verification**: AI-powered document analysis
- **Real-time Updates**: WebSocket-based live updates

## 🛠️ Tech Stack

**Frontend**:
- React 19
- TypeScript
- Vite
- TailwindCSS
- Socket.IO Client
- Axios

**Backend**:
- Node.js
- Express
- MongoDB + Mongoose
- Socket.IO
- Winston (Logging)
- Helmet (Security)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📝 License

Private - All rights reserved

## 🆘 Support

For issues or questions:
- Check `backend/docs/` folder for documentation
- Open an issue on GitHub
- Email: mikkohbrayoh@gmail.com

## 🎉 Acknowledgments

Built with Claude Code by Anthropic
