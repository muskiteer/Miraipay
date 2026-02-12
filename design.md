# Miraipay - System Design Document

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [API Design](#api-design)
5. [AI Agent Flow](#ai-agent-flow)
6. [Payment Protocol](#payment-protocol)
7. [Security Design](#security-design)
8. [Frontend Architecture](#frontend-architecture)
9. [Database Schema](#database-schema)
10. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### Vision

Miraipay is an AI-powered marketplace that bridges the gap between API developers and AI agents. It enables:

- **Developers**: Monetize APIs through autonomous agent interactions
- **Users**: Access powerful tools through natural language
- **AI Agents**: Discover and pay for tools automatically

### Core Principles

1. **AI-First Design**: Built for autonomous agent interactions
2. **Frictionless Payments**: X402 protocol for seamless micropayments
3. **Developer-Friendly**: Simple tool registration and monetization
4. **Transparent**: All transactions visible and auditable
5. **Secure**: Enterprise-grade encryption and authentication

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │Dashboard │  │AI Agent  │  │  Admin   │   │
│  │  Page    │  │          │  │   Chat   │  │  Panel   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│                      (FastAPI + CORS)                        │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Auth Service │   │ Tool Service │   │Agent Service │
│              │   │              │   │              │
│ - JWT        │   │ - CRUD       │   │ - Gemini AI  │
│ - Bcrypt     │   │ - Approval   │   │ - Selection  │
│ - Wallet Gen │   │ - Metadata   │   │ - Execution  │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Persistence Layer                    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │  │
│  │  │ Users  │  │ Tools  │  │  Txns  │  │ Convos │    │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Gemini AI   │   │External Tools│   │  Ethereum    │
│              │   │   (X402)     │   │  Network     │
│ - Selection  │   │              │   │              │
│ - Response   │   │ - Movie API  │   │ - MNEE Token │
└──────────────┘   │ - QR Gen     │   │ - Payments   │
                   └──────────────┘   └──────────────┘
```

### Component Breakdown

#### 1. Frontend Layer (Next.js)
- **Purpose**: User interface and interaction
- **Technology**: Next.js 15, React 18, TypeScript
- **Responsibilities**:
  - Render UI components
  - Handle user input
  - Manage client-side state
  - API communication via Axios

#### 2. API Gateway (FastAPI)
- **Purpose**: Request routing and middleware
- **Technology**: FastAPI with Uvicorn
- **Responsibilities**:
  - CORS handling
  - Request validation
  - Route management
  - Error handling

#### 3. Service Layer
- **Auth Service**: User authentication and authorization
- **Tool Service**: Tool CRUD and approval workflow
- **Agent Service**: AI orchestration and tool execution
- **Payment Service**: Transaction management

#### 4. Data Layer
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Caching**: (Future) Redis for session management
- **File Storage**: (Future) S3 for tool metadata



---

## Data Models

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ hashed_password │
│ public_key      │
│ encrypted_pk    │
│ wallet_address  │
│ groq_api_key    │
│ is_admin        │
│ created_at      │
└─────────────────┘
        │
        │ 1:N (owns)
        ▼
┌─────────────────┐
│      Tool       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ description     │
│ api_url         │
│ api_method      │
│ api_headers     │
│ api_body_tmpl   │
│ metadata_hash   │
│ price_mnee      │
│ owner_id (FK)   │
│ approved        │
│ active          │
│ created_at      │
└─────────────────┘
        │
        │ 1:N (used in)
        ▼
┌─────────────────┐
│  Transaction    │
├─────────────────┤
│ id (PK)         │
│ from_user_id(FK)│
│ to_user_id (FK) │
│ tool_id (FK)    │
│ amount_mnee     │
│ tx_hash         │
│ status          │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│  Conversation   │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ user_message    │
│ tool_selected   │
│ tool_result     │
│ final_response  │
│ created_at      │
└─────────────────┘
```

### Model Specifications

#### User Model
```python
class User:
    id: int                      # Primary key
    email: str                   # Unique, indexed
    hashed_password: str         # Bcrypt hashed
    public_key: str              # Ethereum address (unique)
    encrypted_private_key: str   # AES-256 encrypted
    wallet_address: str          # Payment receiving address
    groq_api_key: str           # Encrypted Gemini API key
    is_admin: bool              # Admin flag
    created_at: datetime        # Registration timestamp
```

**Relationships**:
- `owned_tools`: One-to-Many with Tool
- `transactions_sent`: One-to-Many with Transaction (as sender)
- `transactions_received`: One-to-Many with Transaction (as receiver)
- `conversations`: One-to-Many with Conversation

#### Tool Model
```python
class Tool:
    id: int                      # Primary key
    name: str                    # Tool name (indexed)
    description: str             # Detailed description
    api_url: str                 # External API endpoint
    api_method: str              # HTTP method (GET/POST/etc)
    api_headers: str             # JSON string of headers
    api_body_template: str       # JSON template for body
    metadata_hash: str           # SHA-256 of API specs
    price_mnee: float            # Price in MNEE tokens
    owner_id: int                # Foreign key to User
    approved: bool               # Admin approval status
    active: bool                 # Tool availability
    created_at: datetime         # Creation timestamp
    updated_at: datetime         # Last update timestamp
```

**Relationships**:
- `owner`: Many-to-One with User
- `transactions`: One-to-Many with Transaction

#### Transaction Model
```python
class Transaction:
    id: int                      # Primary key
    from_user_id: int            # Sender (Foreign key)
    to_user_id: int              # Receiver (Foreign key)
    tool_id: int                 # Tool used (Foreign key)
    amount_mnee: float           # Payment amount
    tx_hash: str                 # Ethereum tx hash (unique)
    status: str                  # pending/confirmed/failed
    created_at: datetime         # Transaction timestamp
```

**Relationships**:
- `sender`: Many-to-One with User
- `receiver`: Many-to-One with User
- `tool`: Many-to-One with Tool

#### Conversation Model
```python
class Conversation:
    id: int                      # Primary key
    user_id: int                 # User (Foreign key)
    user_message: str            # User's input
    tool_selected: str           # Tool name used (nullable)
    tool_result: str             # JSON result (nullable)
    final_response: str          # AI's response
    created_at: datetime         # Conversation timestamp
```

**Relationships**:
- `user`: Many-to-One with User

---

## API Design

### RESTful Endpoints

#### Authentication Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

**Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response 201:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "public_key": "0x1234...",
    "is_admin": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response 200:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": { ... }
}
```

#### Tool Endpoints

```
GET    /api/tools              # List all approved tools
POST   /api/tools              # Create new tool
GET    /api/tools/{id}         # Get tool details
PUT    /api/tools/{id}         # Update tool
DELETE /api/tools/{id}         # Delete tool
GET    /api/tools/my-tools     # Get user's tools
```

**Create Tool**
```http
POST /api/tools
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Weather Forecast",
  "description": "Get weather forecast for any city",
  "api_url": "https://api.weather.com/forecast",
  "api_method": "POST",
  "api_headers": "{\"Content-Type\": \"application/json\"}",
  "api_body_template": "{\"city\": \"\", \"days\": 7}",
  "price_mnee": 0.5
}

Response 201:
{
  "id": 5,
  "name": "Weather Forecast",
  "approved": false,
  "active": true,
  ...
}
```

#### AI Agent Endpoints

```
POST   /api/agent/chat         # Chat with AI agent
GET    /api/agent/history      # Get conversation history
```

**Chat with Agent**
```http
POST /api/agent/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Book 2 movie tickets for Inception in Mumbai",
  "model": "gemini-2.5-flash"
}

Response 200:
{
  "response": "I've successfully booked 2 tickets...",
  "tool_used": "Movie Ticket Booking",
  "tool_result": {
    "booking_id": "BK-ABC123",
    "movie": "Inception",
    ...
  },
  "price_paid": 2.5,
  "transaction_hash": "0xabc123...",
  "conversation_id": 42
}
```

#### Payment Endpoints

```
GET    /api/payments/balance   # Get wallet balance
GET    /api/payments/earnings  # Get earnings history
GET    /api/payments/spending  # Get spending history
```

#### Admin Endpoints

```
GET    /api/admin/pending-tools    # List pending approvals
POST   /api/admin/approve/{id}     # Approve tool
POST   /api/admin/reject/{id}      # Reject tool
GET    /api/admin/users            # List all users
POST   /api/admin/make-admin/{id}  # Grant admin privileges
```

#### Settings Endpoints

```
GET    /api/settings/groq          # Check if API key exists
POST   /api/settings/groq          # Set Gemini API key
DELETE /api/settings/groq          # Remove API key
POST   /api/settings/groq/validate # Validate API key
```



---

## AI Agent Flow

### Complete Agent Orchestration Flow

```
┌─────────────┐
│ User Input  │
│ "Book 2     │
│  tickets"   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Step 1: Validate User & API Key                         │
│ - Check JWT token                                        │
│ - Verify Gemini API key configured                      │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Step 2: Fetch Available Tools                           │
│ - Query: approved=True AND active=True                   │
│ - Load tool metadata (name, description, price, params) │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Step 3: Format Tools for LLM                            │
│ - Convert to structured JSON                             │
│ - Include: name, description, parameters, price         │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Step 4: Call Gemini for Tool Selection                  │
│ Prompt:                                                  │
│ "You are an AI agent that selects tools..."             │
│ "User request: {message}"                                │
│ "Available tools: {tools_json}"                          │
│ "Select the best tool and extract parameters"           │
│                                                          │
│ Expected Response:                                       │
│ {                                                        │
│   "tool_id": 3,                                         │
│   "tool_name": "Movie Ticket Booking",                  │
│   "parameters": {                                        │
│     "movie_name": "Inception",                          │
│     "city": "Mumbai",                                    │
│     "seats": 2,                                          │
│     "date": "2024-01-20"                                 │
│   },                                                     │
│   "reasoning": "User wants to book movie tickets"       │
│ }                                                        │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Step 5: Execute Selected Tool                           │
│ - Prepare API request (headers, body)                   │
│ - Auto-inject user wallet address                       │
│ - Make HTTP request to tool API                         │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Step 6: Handle X402 Payment Protocol                    │
│                                                          │
│ First Request (no payment):                             │
│   Response: 402 Payment Required                        │
│   Headers:                                               │
│     X-Payment-Address: 0x1234...                        │
│     X-Payment-Amount: 2.5                               │
│                                                          │
│ Payment Processing:                                      │
│   - Generate transaction hash                           │
│   - Create Transaction record in DB                     │
│   - Status: confirmed                                   │
│                                                          │
│ Retry Request (with payment proof):                     │
│   Headers:                                               │
│     X-Payment-Proof: 0xabc123...                        │
│   Response: 200 OK (with booking result)                │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Step 7: Generate Final Response                         │
│ - Call Gemini again with tool result                    │
│ - Prompt: "Format this result naturally for user"       │
│ - Generate human-friendly response                      │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Step 8: Save Conversation                               │
│ - Store in Conversation table                           │
│ - Include: user_message, tool_selected, tool_result,    │
│            final_response                                │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│ Return to   │
│ User        │
│ - Response  │
│ - Tool used │
│ - Price     │
│ - Tx hash   │
└─────────────┘
```

### Gemini Prompt Engineering

#### Tool Selection Prompt
```python
def create_tool_selection_prompt(user_message: str, tools_json: str) -> str:
    return f"""You are an AI agent that helps users by selecting and using appropriate tools.

User Request: {user_message}

Available Tools:
{tools_json}

Your task:
1. Analyze the user's request
2. Select the MOST appropriate tool from the list
3. Extract all required parameters from the user's message
4. If a parameter is missing, use "MISSING_REQUIRED_PARAMETER"

Respond ONLY with valid JSON in this exact format:
{{
  "tool_id": <number>,
  "tool_name": "<tool name>",
  "parameters": {{
    "param1": "value1",
    "param2": "value2"
  }},
  "reasoning": "<brief explanation>"
}}

If NO tool is appropriate, respond with:
{{
  "tool_id": null,
  "tool_name": null,
  "parameters": {{}},
  "reasoning": "<explanation why no tool fits>"
}}
"""
```

#### Response Generation Prompt
```python
def create_response_prompt(user_message: str, tool_name: str, 
                          tool_result: dict) -> str:
    return f"""You are a helpful AI assistant.

User asked: {user_message}

You used the tool: {tool_name}

Tool returned this result:
{json.dumps(tool_result, indent=2)}

Generate a natural, friendly response to the user that:
1. Confirms what was done
2. Highlights key information from the result
3. Is conversational and helpful
4. Doesn't include technical details like JSON

Response:"""
```

---

## Payment Protocol

### X402 Protocol Implementation

The X402 protocol extends HTTP with payment semantics for AI agents.

#### Protocol Flow

```
Client                          Server
  │                               │
  │  1. POST /api/tool           │
  │  (no payment proof)          │
  ├──────────────────────────────>│
  │                               │
  │  2. 402 Payment Required      │
  │  X-Payment-Address: 0x...     │
  │  X-Payment-Amount: 2.5        │
  │<──────────────────────────────┤
  │                               │
  │  3. Process Payment           │
  │  (MNEE transfer on-chain)     │
  │                               │
  │  4. POST /api/tool            │
  │  X-Payment-Proof: 0xabc...    │
  ├──────────────────────────────>│
  │                               │
  │  5. Validate Payment          │
  │  (check blockchain)           │
  │                               │
  │  6. 200 OK                    │
  │  (with result)                │
  │<──────────────────────────────┤
```

#### Response Headers

**402 Payment Required Response**
```http
HTTP/1.1 402 Payment Required
X-Accept-Payment: MNEE
X-Payment-Address: 0x1234567890abcdef1234567890abcdef12345678
X-Payment-Amount: 2.5
X-Payment-Network: ethereum
X-Payment-Contract: 0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
X-Payment-Required: true
Content-Type: application/json

{
  "error": "Payment Required",
  "message": "Please pay 2.5 MNEE to use this service",
  "payment_address": "0x1234567890abcdef1234567890abcdef12345678",
  "amount": "2.5",
  "currency": "MNEE",
  "network": "ethereum"
}
```

**Retry Request with Payment Proof**
```http
POST /api/demo/book-movie-tickets
X-Payment-Proof: 0xabc123def456...
Content-Type: application/json

{
  "movie_name": "Inception",
  "city": "Mumbai",
  "seats": 2,
  "date": "2024-01-20",
  "user_wallet": "0x9876..."
}
```

#### Payment Validation

```python
async def validate_payment(tx_hash: str, 
                          expected_amount: float,
                          recipient_address: str) -> bool:
    """
    Validate payment on Ethereum blockchain
    
    In production:
    1. Connect to Ethereum node (Infura/Alchemy)
    2. Fetch transaction by hash
    3. Verify:
       - Transaction exists and is confirmed
       - Recipient matches
       - Amount matches (in MNEE tokens)
       - Token contract is correct
    
    Current implementation:
    - Mock validation (always returns True)
    - Transaction recorded in database
    """
    # TODO: Implement actual blockchain validation
    return tx_hash.startswith("0x") and len(tx_hash) == 66
```

### MNEE Token Integration

**Token Details**
- **Contract Address**: `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`
- **Network**: Ethereum Mainnet
- **Standard**: ERC-20
- **Decimals**: 18
- **Symbol**: MNEE

**Transfer Example (Python/Web3.py)**
```python
from web3 import Web3
from eth_account import Account
import json

# MNEE ERC-20 ABI
MNEE_ABI = json.loads('''[
    {
        "constant": false,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    }
]''')

async def transfer_mnee(w3: Web3, private_key: str, 
                       recipient_address: str, amount_mnee: float):
    """
    Transfer MNEE tokens to recipient
    
    Args:
        w3: Web3 instance
        private_key: Sender's private key
        recipient_address: Recipient's Ethereum address
        amount_mnee: Amount in MNEE tokens
    
    Returns:
        Transaction hash (for X-Payment-Proof header)
    """
    # Setup account
    account = Account.from_key(private_key)
    
    # Get MNEE contract
    mnee_contract = w3.eth.contract(
        address=Web3.to_checksum_address('0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF'),
        abi=MNEE_ABI
    )
    
    # Convert MNEE to wei (18 decimals)
    amount_wei = w3.to_wei(amount_mnee, 'ether')
    
    # Check balance
    balance = mnee_contract.functions.balanceOf(account.address).call()
    if balance < amount_wei:
        raise ValueError(f"Insufficient balance: {w3.from_wei(balance, 'ether')} MNEE")
    
    # Build transaction
    nonce = w3.eth.get_transaction_count(account.address)
    transaction = mnee_contract.functions.transfer(
        Web3.to_checksum_address(recipient_address),
        amount_wei
    ).build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 100000,
        'gasPrice': w3.eth.gas_price
    })
    
    # Sign and send transaction
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    
    return tx_hash.hex()  # Use as X-Payment-Proof header
```



---

## Security Design

### Authentication & Authorization

#### JWT Token Flow

```
┌──────────┐                    ┌──────────┐
│  Client  │                    │  Server  │
└────┬─────┘                    └────┬─────┘
     │                               │
     │  1. POST /api/auth/login      │
     │  {email, password}            │
     ├──────────────────────────────>│
     │                               │
     │                          2. Verify
     │                          credentials
     │                          (bcrypt)
     │                               │
     │  3. JWT Token                 │
     │  {access_token, user}         │
     │<──────────────────────────────┤
     │                               │
     │  4. Store token               │
     │  localStorage.setItem()       │
     │                               │
     │  5. API Request               │
     │  Authorization: Bearer {token}│
     ├──────────────────────────────>│
     │                               │
     │                          6. Validate
     │                          JWT signature
     │                          & expiry
     │                               │
     │  7. Response                  │
     │<──────────────────────────────┤
```

#### JWT Token Structure

```python
# Token Payload
{
  "sub": "user@example.com",  # Subject (user email)
  "exp": 1705334400,          # Expiration (24 hours)
  "iat": 1705248000           # Issued at
}

# Token Generation
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm="HS256"
    )
    return encoded_jwt
```

### Wallet Security

#### Private Key Encryption

```python
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2

# Key Derivation
def get_encryption_key() -> bytes:
    """
    Derive encryption key from environment variable
    Uses PBKDF2 with 100,000 iterations
    """
    password = settings.encryption_key.encode()
    salt = b'miraipay_salt_v1'  # In production: use random salt per user
    
    kdf = PBKDF2(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return base64.urlsafe_b64encode(kdf.derive(password))

# Encryption
def encrypt_private_key(private_key: str) -> str:
    """
    Encrypt Ethereum private key using AES-256-GCM
    """
    key = get_encryption_key()
    f = Fernet(key)
    encrypted = f.encrypt(private_key.encode())
    return encrypted.decode()

# Decryption
def decrypt_private_key(encrypted_private_key: str) -> str:
    """
    Decrypt Ethereum private key
    """
    key = get_encryption_key()
    f = Fernet(key)
    decrypted = f.decrypt(encrypted_private_key.encode())
    return decrypted.decode()
```

#### Wallet Generation

```python
from eth_account import Account

def create_ethereum_wallet() -> tuple[str, str]:
    """
    Generate new Ethereum wallet
    Returns: (public_key/address, private_key)
    """
    account = Account.create()
    return (account.address, account.key.hex())
```

### API Key Encryption

User's Gemini API keys are encrypted before storage:

```python
from cryptography.fernet import Fernet

def encrypt_data(data: str, encryption_key: bytes) -> str:
    """
    Encrypt sensitive data (API keys, etc.)
    
    Args:
        data: Plain text data to encrypt
        encryption_key: Fernet encryption key
    
    Returns:
        Encrypted data as string
    """
    f = Fernet(encryption_key)
    encrypted = f.encrypt(data.encode())
    return encrypted.decode()

def decrypt_data(encrypted_data: str, encryption_key: bytes) -> str:
    """
    Decrypt sensitive data
    
    Args:
        encrypted_data: Encrypted data string
        encryption_key: Fernet encryption key
    
    Returns:
        Decrypted plain text
    """
    f = Fernet(encryption_key)
    decrypted = f.decrypt(encrypted_data.encode())
    return decrypted.decode()

# Usage in settings route
@router.post("/groq")
async def save_groq_api_key(request: GroqAPIKeyRequest, 
                           current_user: User):
    # Validate API key first
    is_valid, message = validate_gemini_api_key(request.api_key)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    # Encrypt and save
    encryption_key = get_encryption_key()
    encrypted_key = encrypt_data(request.api_key, encryption_key)
    current_user.groq_api_key = encrypted_key
    db.commit()
```

### Input Validation

All API inputs are validated using Pydantic schemas:

```python
from pydantic import BaseModel, EmailStr, validator

class UserCreate(BaseModel):
    email: EmailStr  # Validates email format
    password: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class ToolCreate(BaseModel):
    name: str
    description: str
    api_url: str
    price_mnee: float
    
    @validator('price_mnee')
    def price_positive(cls, v):
        if v <= 0:
            raise ValueError('Price must be positive')
        return v
    
    @validator('api_url')
    def url_valid(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('Invalid URL format')
        return v
```

### SQL Injection Prevention

SQLAlchemy ORM with parameterized queries:

```python
# SAFE: Using ORM
user = db.query(User).filter(User.email == email).first()

# SAFE: Using parameters
db.execute(
    text("SELECT * FROM users WHERE email = :email"),
    {"email": email}
)

# UNSAFE: String concatenation (NEVER DO THIS)
# db.execute(f"SELECT * FROM users WHERE email = '{email}'")
```

### CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://miraipay.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Frontend Architecture

### Component Hierarchy

```
App (layout.tsx)
│
├── Landing Page (page.tsx)
│   ├── Navbar
│   ├── AnimatedBackground
│   └── Feature Cards
│
├── Auth Pages
│   ├── Login (login/page.tsx)
│   └── Register (register/page.tsx)
│
└── Dashboard Layout (dashboard/layout.tsx)
    ├── Sidebar
    ├── TopNavbar
    │
    ├── Dashboard (dashboard/page.tsx)
    │   ├── Stats Cards
    │   ├── Charts (Chart.js)
    │   └── Transaction Lists
    │
    ├── AI Agent (ai-agent/page.tsx)
    │   ├── Message List
    │   ├── Tool Result Display
    │   └── Input Area
    │
    ├── Tools (tools/page.tsx)
    │   └── Tool Cards Grid
    │
    ├── Create Tool (create-tool/page.tsx)
    │   └── Tool Form
    │
    ├── Wallet (wallet/page.tsx)
    │   └── Transaction History
    │
    ├── Settings (settings/page.tsx)
    │   └── API Key Form
    │
    └── Admin (admin/page.tsx)
        ├── Pending Tools Table
        └── User Management
```

### State Management

#### Local State (React Hooks)
```typescript
// Component-level state
const [messages, setMessages] = useState<Message[]>([]);
const [loading, setLoading] = useState(false);

// Effect for data fetching
useEffect(() => {
  const fetchData = async () => {
    const response = await api.get('/api/tools');
    setTools(response.data);
  };
  fetchData();
}, []);
```

#### Global State (localStorage)
```typescript
// Auth state persistence
export const saveAuth = (authData: AuthResponse) => {
  localStorage.setItem('token', authData.access_token);
  localStorage.setItem('user', JSON.stringify(authData.user));
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
```

### API Client Configuration

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Routing Structure

```
/                    → Landing page
/login               → Login page
/register            → Registration page
/dashboard           → User dashboard (protected)
/ai-agent            → AI chat interface (protected)
/tools               → Tool marketplace (protected)
/create-tool         → Tool creation form (protected)
/wallet              → Transaction history (protected)
/settings            → User settings (protected)
/admin               → Admin panel (protected, admin only)
/tool-guide          → Developer guide (public)
```

### Protected Routes

```typescript
// Middleware pattern
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
  }
}, []);
```



---

## Database Schema

### PostgreSQL Schema Definition

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    public_key VARCHAR(42) UNIQUE NOT NULL,
    encrypted_private_key TEXT NOT NULL,
    wallet_address VARCHAR(42),
    groq_api_key TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_public_key (public_key)
);

-- Tools Table
CREATE TABLE tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    api_url VARCHAR(500) NOT NULL,
    api_method VARCHAR(10) DEFAULT 'GET',
    api_headers TEXT,
    api_body_template TEXT,
    metadata_hash VARCHAR(64) NOT NULL,
    price_mnee DECIMAL(10, 2) NOT NULL,
    owner_id INTEGER NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_name (name),
    INDEX idx_owner (owner_id),
    INDEX idx_approved_active (approved, active)
);

-- Transactions Table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    tool_id INTEGER NOT NULL,
    amount_mnee DECIMAL(10, 2) NOT NULL,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
    INDEX idx_from_user (from_user_id),
    INDEX idx_to_user (to_user_id),
    INDEX idx_tool (tool_id),
    INDEX idx_tx_hash (tx_hash),
    INDEX idx_created_at (created_at)
);

-- Conversations Table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_message TEXT NOT NULL,
    tool_selected VARCHAR(255),
    tool_result TEXT,
    final_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
);
```

### Database Indexes

**Purpose**: Optimize query performance

```sql
-- User lookups by email (login)
CREATE INDEX idx_users_email ON users(email);

-- Tool queries (marketplace, agent selection)
CREATE INDEX idx_tools_approved_active ON tools(approved, active);

-- Transaction history queries
CREATE INDEX idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Conversation history
CREATE INDEX idx_conversations_user_created ON conversations(user_id, created_at DESC);
```

### Database Migrations

```python
# migrate.py
from sqlalchemy import create_engine
from app.database import Base
from app.models import User, Tool, Transaction, Conversation
from app.config import get_settings

def run_migrations():
    settings = get_settings()
    engine = create_engine(settings.database_url)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")

if __name__ == "__main__":
    run_migrations()
```

### Query Optimization Examples

```python
# Efficient: Load only needed columns
tools = db.query(Tool.id, Tool.name, Tool.price_mnee)\
    .filter(Tool.approved == True)\
    .all()

# Efficient: Use joins to avoid N+1 queries
from sqlalchemy.orm import joinedload

transactions = db.query(Transaction)\
    .options(joinedload(Transaction.tool))\
    .filter(Transaction.from_user_id == user_id)\
    .all()

# Efficient: Pagination
tools = db.query(Tool)\
    .filter(Tool.approved == True)\
    .offset(page * page_size)\
    .limit(page_size)\
    .all()

# Efficient: Aggregation
from sqlalchemy import func

total_earned = db.query(func.sum(Transaction.amount_mnee))\
    .filter(Transaction.to_user_id == user_id)\
    .scalar()
```

---

## Deployment Architecture

### Production Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                      CDN (Vercel Edge)                       │
│                    Static Assets + SSR                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (Vercel)                          │
│                   Next.js Application                        │
│                   - SSR/SSG Pages                            │
│                   - API Routes (optional)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Railway)                          │
│                   FastAPI Application                        │
│                   - Uvicorn Server                           │
│                   - Auto-scaling                             │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │  Gemini API  │  │  External    │
│ (Railway)    │  │  (Google)    │  │  Tool APIs   │
│              │  │              │  │  (X402)      │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Environment Configuration

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Security
JWT_SECRET=your-super-secret-key-minimum-32-characters
ENCRYPTION_KEY=your-encryption-key-for-wallets

# AI Integration
GEMINI_API_KEY=AIzaSy...your-gemini-api-key

# CORS
FRONTEND_URL=https://miraipay.vercel.app

# Server
PORT=8000
HOST=0.0.0.0
WORKERS=4

# Logging
LOG_LEVEL=INFO
```

#### Frontend (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://miraipay-api.railway.app
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Deployment Steps

#### Backend Deployment (Railway)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add PostgreSQL
railway add --plugin postgresql

# 5. Set environment variables
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set GEMINI_API_KEY=your-key
railway variables set ENCRYPTION_KEY=$(openssl rand -hex 32)

# 6. Deploy
railway up

# 7. Run migrations
railway run python migrate.py
```

#### Frontend Deployment (Vercel)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd frontend
vercel

# 4. Set environment variables (in Vercel dashboard)
# NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# 5. Deploy to production
vercel --prod
```

### Monitoring & Logging

#### Application Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Usage
logger.info(f"User {user.email} logged in")
logger.error(f"Tool execution failed: {error}")
```

#### Health Checks
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }
```

### Scaling Considerations

#### Horizontal Scaling
- **Frontend**: Vercel automatically scales based on traffic
- **Backend**: Railway supports auto-scaling with multiple instances
- **Database**: PostgreSQL connection pooling

#### Caching Strategy (Future)
```python
# Redis for session management
import redis

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    decode_responses=True
)

# Cache tool list (5 minute TTL)
@app.get("/api/tools")
async def list_tools():
    cache_key = "tools:approved"
    cached = redis_client.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    tools = db.query(Tool).filter(Tool.approved == True).all()
    redis_client.setex(cache_key, 300, json.dumps(tools))
    return tools
```

#### Database Optimization
- Connection pooling (SQLAlchemy)
- Read replicas for analytics queries
- Periodic vacuum and analyze

---

## Performance Optimization

### Backend Optimizations

#### Async Operations
```python
import asyncio
import httpx

# Parallel tool execution
async def execute_multiple_tools(tools: list[Tool]):
    async with httpx.AsyncClient() as client:
        tasks = [
            client.post(tool.api_url, json=params)
            for tool in tools
        ]
        results = await asyncio.gather(*tasks)
    return results
```

#### Database Query Optimization
```python
# Use joinedload to avoid N+1 queries
from sqlalchemy.orm import joinedload

transactions = db.query(Transaction)\
    .options(
        joinedload(Transaction.tool),
        joinedload(Transaction.sender)
    )\
    .filter(Transaction.to_user_id == user_id)\
    .all()

# Efficient aggregation for balance calculation
from sqlalchemy import func

total_earned = db.query(func.sum(Transaction.amount_mnee))\
    .filter(
        Transaction.to_user_id == user_id,
        Transaction.from_user_id != user_id,  # Exclude self-transactions
        Transaction.status == "confirmed"
    )\
    .scalar() or 0.0
```

### Frontend Optimizations

#### Code Splitting
```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
  loading: () => <div className="text-white">Loading chart...</div>,
  ssr: false
});
```

#### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Miraipay"
  width={200}
  height={50}
  priority
/>
```

#### API Request Optimization
```typescript
// Efficient data fetching with error handling
const fetchDashboardData = async () => {
  try {
    const [balanceRes, earningsRes, spendingRes] = await Promise.all([
      api.get('/api/payments/balance'),
      api.get('/api/payments/earnings'),
      api.get('/api/payments/spending')
    ]);
    
    setBalance(balanceRes.data.balance_mnee || '0.00');
    setEarnings(earningsRes.data.transactions || []);
    setSpending(spendingRes.data.transactions || []);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  }
};
```

---

## Future Enhancements

### Planned Features

1. **Real Blockchain Integration**
   - Actual MNEE token transfers on Ethereum
   - Web3 wallet connection (MetaMask)
   - On-chain payment verification

2. **Advanced AI Features**
   - Multi-tool workflows (chain multiple tools)
   - Context-aware conversations
   - Tool recommendation engine

3. **Developer Tools**
   - SDK for tool creation
   - Testing sandbox
   - Analytics dashboard for tool owners

4. **Platform Features**
   - Tool ratings and reviews
   - Usage analytics
   - API rate limiting
   - Webhook notifications

5. **Security Enhancements**
   - 2FA authentication
   - API key rotation
   - Audit logs
   - DDoS protection

---

## Conclusion

Miraipay represents a new paradigm in API monetization, designed specifically for the age of AI agents. By combining intelligent tool selection, seamless payments, and developer-friendly infrastructure, it creates a sustainable ecosystem where both tool creators and users benefit.

The architecture is built with scalability, security, and developer experience as core principles, ensuring the platform can grow while maintaining reliability and ease of use.

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Maintained By**: MiraiPay Development Team
