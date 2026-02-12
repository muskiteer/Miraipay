# Project Structure

## Repository Layout

```
miraipay/
├── backend/              # FastAPI backend application
├── frontend/             # Next.js frontend application
├── miraipay-info/        # Marketing site (static HTML)
├── DESIGN.md             # Architecture documentation
├── requirements.md       # System requirements & specifications
└── README.md             # Setup and usage guide
```

## Backend Structure

```
backend/
├── app/
│   ├── routes/           # API endpoint modules
│   │   ├── auth.py       # User authentication (register, login)
│   │   ├── agent.py      # AI agent orchestration (chat, history)
│   │   ├── tools.py      # Tool CRUD operations
│   │   ├── payments.py   # Wallet & transaction management
│   │   ├── admin.py      # Admin operations (approve, reject)
│   │   ├── settings.py   # User settings (Gemini API key)
│   │   ├── mcp.py        # MCP server protocol
│   │   └── demo.py       # Demo tools (movie, QR code)
│   ├── models.py         # SQLAlchemy database models
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── database.py       # Database connection & session management
│   ├── security.py       # JWT & authentication utilities
│   ├── crypto.py         # Wallet encryption/decryption
│   ├── groq_service.py   # Gemini AI integration
│   ├── config.py         # Configuration & environment variables
│   └── __init__.py       # App initialization
├── main.py               # FastAPI app entry point
├── migrate.py            # Database migration script
└── requirements.txt      # Python dependencies
```

## Frontend Structure

```
frontend/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Landing page
│   ├── layout.tsx        # Root layout with providers
│   ├── globals.css       # Global styles & Tailwind imports
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── dashboard/        # User dashboard (with layout)
│   ├── ai-agent/         # AI chat interface
│   ├── tools/            # Tool marketplace listing
│   ├── create-tool/      # Tool creation form
│   ├── wallet/           # Transaction history
│   ├── settings/         # User settings (API key config)
│   ├── admin/            # Admin panel (tool approval)
│   └── tool-guide/       # Developer guide for creating tools
├── components/
│   ├── Navbar.tsx        # Main navigation (landing page)
│   ├── Sidebar.tsx       # Dashboard sidebar navigation
│   ├── TopNavbar.tsx     # Dashboard top bar
│   ├── AnimatedBackground.tsx  # Visual effects
│   └── ui/               # Reusable UI components
├── lib/
│   ├── api.ts            # Axios API client with interceptors
│   ├── auth.ts           # Auth utilities (token management)
│   └── utils.ts          # Helper functions
├── package.json          # Node dependencies & scripts
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── next.config.ts        # Next.js configuration
```

## Key Architectural Patterns

### Backend Patterns
- **Route Organization**: Each domain (auth, tools, agent, payments, admin) has its own route module
- **Service Layer**: Business logic in dedicated services (groq_service.py, crypto.py)
- **ORM Models**: SQLAlchemy models in models.py with relationships
- **Schema Validation**: Pydantic schemas for all API inputs/outputs
- **Dependency Injection**: FastAPI dependencies for auth, database sessions

### Frontend Patterns
- **App Router**: Next.js 13+ file-based routing in app/ directory
- **Layout Nesting**: Shared layouts (root, dashboard) for consistent UI
- **API Client**: Centralized Axios instance in lib/api.ts with auth interceptors
- **Component Organization**: Reusable components in components/, page-specific in app/
- **Type Safety**: TypeScript strict mode throughout

### Database Models
- **User**: email, hashed_password, public_key, encrypted_private_key, wallet_address, groq_api_key, is_admin
- **Tool**: name, description, api_url, api_method, api_headers, api_body_template, price_mnee, owner_id, approved, active
- **Transaction**: from_user_id, to_user_id, tool_id, amount_mnee, tx_hash, status
- **Conversation**: user_id, user_message, tool_selected, tool_result, final_response

### API Endpoint Conventions
- Authentication: `/api/auth/*`
- Tools: `/api/tools/*`
- AI Agent: `/api/agent/*`
- Payments: `/api/payments/*`
- Admin: `/api/admin/*`
- Settings: `/api/settings/*`
- Demo: `/api/demo/*`

## Configuration Files

- **backend/.env**: Database URL, JWT secret, encryption key, Gemini API key
- **frontend/.env.local**: Backend API URL
- **backend/migrate.py**: Creates all database tables (User, Tool, Transaction, Conversation)
- **frontend/next.config.ts**: Next.js build configuration
- **frontend/tailwind.config.ts**: Tailwind CSS customization
