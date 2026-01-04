from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.routes import auth, tools, payments, admin, mcp, settings, agent, demo
from app.config import get_settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: cleanup if needed

app = FastAPI(
    title="StableTool API",
    description="MCP Server with MNEE Stablecoin Payments for AI Agent Tools",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tools.router, prefix="/api/tools", tags=["Tools"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(mcp.router, prefix="/mcp", tags=["MCP Server"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(agent.router, prefix="/api/agent", tags=["AI Agent"])
app.include_router(demo.router, prefix="/api/demo", tags=["Demo Tools"])

@app.get("/")
async def root():
    return {
        "message": "StableTool API - MCP Server with MNEE Payments",
        "docs": "/docs",
        "mcp_endpoint": "/mcp",
        "x402_protocol": "Supported",
        "demo_tools": "/api/demo"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
