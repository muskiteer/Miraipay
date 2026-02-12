# Technology Stack

## Backend

- **Framework**: FastAPI 0.109.0 with Uvicorn ASGI server
- **Language**: Python 3.12+
- **Database**: PostgreSQL with SQLAlchemy 2.0+ ORM
- **Authentication**: JWT (HS256) with bcrypt password hashing
- **AI Integration**: Google Gemini API (google-generativeai)
- **Blockchain**: Web3.py for Ethereum integration, eth-account for wallet management
- **Encryption**: Cryptography library (AES-256-GCM, Fernet, PBKDF2)
- **HTTP Client**: httpx for async external API calls
- **Validation**: Pydantic schemas with email validation

## Frontend

- **Framework**: Next.js 15 with React 18
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS 3
- **UI Components**: Material-UI (MUI) 5+, Lucide React icons
- **Charts**: Chart.js 4+, Recharts 2+, MUI X-Charts
- **HTTP Client**: Axios
- **State Management**: React Hooks, TanStack Query

## Payment Protocol

- **Standard**: X402 (HTTP 402 Payment Required)
- **Token**: MNEE Stablecoin (ERC-20)
- **Contract**: 0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
- **Network**: Ethereum Mainnet

## Common Commands

### Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python migrate.py  # Run database migrations
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Development server on port 3000
npm run build  # Production build
npm start  # Production server
```

### Database
```bash
createdb miraipay  # Create PostgreSQL database
python migrate.py  # Run migrations from backend directory
```

## Environment Variables

### Backend (.env)
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Minimum 32 characters for token signing
- ENCRYPTION_KEY: For wallet/API key encryption
- GEMINI_API_KEY: Google Gemini API key
- FRONTEND_URL: CORS whitelist (default: http://localhost:3000)

### Frontend (.env.local)
- NEXT_PUBLIC_API_URL: Backend API URL (default: http://localhost:8000)

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json
