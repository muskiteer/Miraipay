"""
Settings routes for user configuration (Groq API key, preferences, etc.)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import User
from app.security import get_current_user
from app.crypto import encrypt_data, get_encryption_key
from app.groq_service import validate_groq_api_key

router = APIRouter()


class GroqAPIKeyRequest(BaseModel):
    api_key: str


class GroqAPIKeyResponse(BaseModel):
    has_key: bool
    message: str


@router.post("/groq", response_model=GroqAPIKeyResponse)
async def save_groq_api_key(
    request: GroqAPIKeyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save or update user's Groq API key (encrypted)
    """
    try:
        # Validate the API key first
        is_valid, validation_message = validate_groq_api_key(request.api_key)
        
        if not is_valid:
            raise HTTPException(status_code=400, detail=validation_message)
        
        # Encrypt the API key
        encryption_key = get_encryption_key()
        encrypted_key = encrypt_data(request.api_key, encryption_key)
        
        # Update user record
        current_user.groq_api_key = encrypted_key
        db.commit()
        
        return GroqAPIKeyResponse(
            has_key=True,
            message="Groq API key saved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save API key: {str(e)}")


@router.get("/groq", response_model=GroqAPIKeyResponse)
async def check_groq_api_key(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Check if user has configured a Groq API key (don't return the actual key)
    """
    has_key = current_user.groq_api_key is not None and current_user.groq_api_key != ""
    
    return GroqAPIKeyResponse(
        has_key=has_key,
        message="API key is configured" if has_key else "No API key configured"
    )


@router.delete("/groq", response_model=GroqAPIKeyResponse)
async def delete_groq_api_key(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete user's Groq API key
    """
    try:
        current_user.groq_api_key = None
        db.commit()
        
        return GroqAPIKeyResponse(
            has_key=False,
            message="Groq API key deleted successfully"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete API key: {str(e)}")
