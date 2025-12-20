from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    public_key: str
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Tool Schemas
class ToolCreate(BaseModel):
    name: str
    description: str
    api_url: str
    api_method: str = "GET"
    api_headers: Optional[str] = None
    api_body_template: Optional[str] = None
    price_mnee: float

class ToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_mnee: Optional[float] = None
    active: Optional[bool] = None

class ToolResponse(BaseModel):
    id: int
    name: str
    description: str
    api_url: str
    api_method: str
    price_mnee: float
    owner_id: int
    approved: bool
    active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionResponse(BaseModel):
    id: int
    from_user_id: int
    to_user_id: int
    tool_id: int
    amount_mnee: float
    tx_hash: str
    status: str
    created_at: datetime
    tool_name: str | None = None
    
    class Config:
        from_attributes = True

# Dashboard Schemas
class EarningsResponse(BaseModel):
    total_earned: float
    transaction_count: int
    transactions: list[TransactionResponse]

class SpendingResponse(BaseModel):
    total_spent: float
    transaction_count: int
    transactions: list[TransactionResponse]

# Token Response
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
