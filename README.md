# Miraipay 🛠️

**AI-Powered Tool Marketplace with MNEE Token Payments**

Miraipay is a decentralized platform where users can discover, create, and monetize AI tools using the X402 payment protocol. Built for the MNEE Hackathon 2026.

---

## 🌟 Features

- **AI Agent** - Chat with an intelligent agent that selects and executes the right tool for your request
- **Tool Marketplace** - Browse and use tools created by the community
- **X402 Payment Protocol** - Automatic micropayments using MNEE tokens
- **Tool Creation** - Build and monetize your own APIs with simple registration
- **Wallet System** - Track earnings and spending with transaction history
- **Admin Dashboard** - Review and approve new tools

---

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL
- Google Gemini API key

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up database
createdb stabletool

# Run migrations
python migrate.py

# Set environment variables
export JWT_SECRET="your-secret-key"
export GEMINI_API_KEY="your-gemini-api-key"

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000`

---

## 🎯 How It Works

1. **Register & Login** - Create your account and get started
2. **Configure API Key** - Add your Google Gemini API key in settings
3. **Use Tools** - Ask the AI agent to perform tasks:
   - "Book 2 movie tickets for Inception in Mumbai"
   - "Generate a QR code for https://example.com"
4. **Create Tools** - Build your own tool and register it on the platform
5. **Earn MNEE** - Get paid when others use your tools

---

## 🔧 Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy
- JWT Authentication
- Google Gemini API

**Frontend:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

**Payment Protocol:**
- X402 (HTTP 402 Payment Required)
- MNEE Token (simulated)

---

## 📦 Available Tools

### Movie Ticket Booking
- Price: 2.5 MNEE
- Features: Multi-city support, seat selection, QR code tickets
- Usage: "Book 3 tickets for Avatar in New York on January 15th"

### QR Code Generator
- Price: 0.5 MNEE
- Features: Custom size, custom color, instant generation
- Usage: "Generate QR code for https://github.com"

---

## 🏗️ Project Structure

```
Miraipay/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── migrate.py           # Database migrations
│   ├── requirements.txt     # Python dependencies
│   └── app/
│       ├── models.py        # Database models
│       ├── routes/          # API endpoints
│       │   ├── auth.py      # Authentication
│       │   ├── agent.py     # AI agent logic
│       │   ├── tools.py     # Tool management
│       │   └── payments.py  # Wallet & transactions
│       ├── groq_service.py  # Gemini integration
│       └── security.py      # JWT & encryption
│
└── frontend/
    ├── app/
    │   ├── page.tsx         # Landing page
    │   ├── login/           # Authentication pages
    │   ├── dashboard/       # User dashboard
    │   ├── ai-agent/        # Chat interface
    │   ├── tools/           # Browse tools
    │   ├── create-tool/     # Tool creation
    │   ├── wallet/          # Transactions
    │   └── admin/           # Admin panel
    ├── components/          # React components
    └── lib/
        └── api.ts          # API client
```

---

## 🔐 Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:password@localhost/stabletool
JWT_SECRET=your-super-secret-key-min-32-chars
GEMINI_API_KEY=AIzaSy...
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🎨 Demo Accounts

**Admin:**
- Email: vansh@gmail.com
- Password: test123

**Regular User:**
- Email: demo@stabletool.com
- Password: test123

---

## 🚀 Deployment

### Backend (Railway)
```bash
railway login
railway init
railway add --plugin postgresql
railway up
```

### Frontend (Vercel)
```bash
vercel
```

See detailed deployment guide in the project documentation.

---

## 🛠️ Creating Your Own Tool

1. Build an API that follows X402 protocol:
   - Return 402 on first request without payment proof
   - Accept `Payment-Proof` header on retry
   - Process and return result

2. Register your tool on StableTool:
   - Go to "Create Tool"
   - Fill in details (name, price, API endpoint)
   - Submit for admin approval

3. Example tool structure:
```python
@app.post("/your-tool")
async def your_tool(payment_proof: str = Header(None)):
    if not payment_proof:
        raise HTTPException(status_code=402, detail={
            "price": 1.0,
            "currency": "MNEE",
            "recipient_wallet": "0x..."
        })
    
    # Process request
    return {"result": "success"}
```

---

## 📝 License

MIT License - Built for MNEE Hackathon 2026

---

## 🤝 Contributing

This project was built for the MNEE Hackathon. Feel free to fork and extend!

---

## 📧 Contact

For questions or issues, please open a GitHub issue.

---

**Built with ❤️ for MNEE Hackathon 2026**
