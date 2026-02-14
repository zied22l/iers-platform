# Getting Started Guide

## Prerequisites

### Required Software
- Node.js 18+ and npm
- Python 3.9+
- MongoDB 6+
- Redis 7+
- Docker and Docker Compose (recommended)
- Git

### Optional
- Kubernetes (for production)
- AWS CLI (for cloud deployment)

## Quick Start with Docker Compose

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/hr-skills-management.git
cd hr-skills-management
```

### 2. Environment Setup
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-service/.env.example ai-service/.env

# Edit environment variables as needed
```

### 3. Start Services
```bash
docker-compose up -d
```

This will start:
- MongoDB (port 27017)
- Redis (port 6379)
- Backend API (port 3000)
- AI Service (port 8000)
- Frontend (port 5173)

### 4. Initialize Database
```bash
cd backend
npm run seed
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs
- AI Service: http://localhost:8000

### Default Credentials
```
HR Admin:
Email: admin@example.com
Password: Admin123!

Manager:
Email: manager@example.com
Password: Manager123!

Employee:
Email: employee@example.com
Password: Employee123!
```

## Manual Setup (Without Docker)

### Backend Setup

#### 1. Install Dependencies
```bash
cd backend
npm install
```

#### 2. Setup Database
```bash
# MongoDB should be running on localhost:27017
# Database will be created automatically

# Seed database
npm run seed
```

#### 3. Start Backend
```bash
npm run start:dev
```

### AI Service Setup

#### 1. Create Virtual Environment
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 2. Install Dependencies
```bash
pip install -r requirements.txt
python -m spacy download en_core_web_lg
```

#### 3. Start AI Service
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

#### 1. Install Dependencies
```bash
cd frontend
npm install
```

#### 2. Start Development Server
```bash
npm run dev
```

## Project Structure

```
hr-skills-management/
├── backend/              # NestJS backend
│   ├── src/
│   ├── prisma/
│   ├── test/
│   └── package.json
├── frontend/             # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── ai-service/           # Python AI service
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── docs/                 # Documentation
├── docker-compose.yml
└── README.md
```

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write code
- Add tests
- Update documentation

### 3. Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# AI service tests
cd ai-service
pytest
```

### 4. Commit and Push
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

### 5. Create Pull Request
- Open PR on GitHub
- Wait for CI/CD checks
- Request review
- Merge after approval

## Common Commands

### Backend
```bash
npm run start:dev        # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Lint code
npm run seed             # Seed database
```

### Frontend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm test                 # Run tests
npm run lint             # Lint code
```

### AI Service
```bash
uvicorn app.main:app --reload  # Start development server
pytest                          # Run tests
python -m app.train            # Train models
```

## Troubleshooting

### Database Connection Issues
```bash
# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/hr_skills_db
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # On Mac/Linux
netstat -ano | findstr :3000  # On Windows

# Kill process
kill -9 <PID>
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Issues
```bash
# Drop database and reseed
npm run seed:reset

# Check MongoDB connection
mongosh mongodb://localhost:27017/hr_skills_db
```

## Next Steps

1. Read the [Architecture Overview](./ARCHITECTURE_OVERVIEW.md)
2. Explore [Module Documentation](./modules/)
3. Review [API Documentation](./API_DOCUMENTATION.md)
4. Check [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md)
5. Follow [Deployment Guide](./DEPLOYMENT.md)

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@example.com
- Slack: #hr-skills-dev
