from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    public_key = Column(String, unique=True, nullable=False)  # Ethereum address
    encrypted_private_key = Column(Text, nullable=False)
    groq_api_key = Column(Text, nullable=True)  # Encrypted Groq API key
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owned_tools = relationship("Tool", back_populates="owner", foreign_keys="Tool.owner_id")
    transactions_sent = relationship("Transaction", back_populates="sender", foreign_keys="Transaction.from_user_id")
    transactions_received = relationship("Transaction", back_populates="receiver", foreign_keys="Transaction.to_user_id")
    conversations = relationship("Conversation", back_populates="user")

class Tool(Base):
    __tablename__ = "tools"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    api_url = Column(String, nullable=False)
    api_method = Column(String, default="GET")  # GET, POST, etc.
    api_headers = Column(Text)  # JSON string
    api_body_template = Column(Text)  # JSON string template
    metadata_hash = Column(String, nullable=False)  # SHA-256 hash of API specs
    price_mnee = Column(Float, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved = Column(Boolean, default=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="owned_tools", foreign_keys=[owner_id])
    transactions = relationship("Transaction", back_populates="tool")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=False)
    amount_mnee = Column(Float, nullable=False)
    tx_hash = Column(String, unique=True, nullable=False)  # Ethereum transaction hash
    status = Column(String, default="pending")  # pending, confirmed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = relationship("User", back_populates="transactions_sent", foreign_keys=[from_user_id])
    receiver = relationship("User", back_populates="transactions_received", foreign_keys=[to_user_id])
    tool = relationship("Tool", back_populates="transactions")


class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_message = Column(Text, nullable=False)
    tool_selected = Column(String, nullable=True)  # Tool name that was selected
    tool_result = Column(Text, nullable=True)  # JSON result from tool execution
    final_response = Column(Text, nullable=False)  # LLM's final response to user
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="conversations")
