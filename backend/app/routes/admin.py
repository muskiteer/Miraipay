from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Tool
from app.schemas import ToolResponse, UserResponse
from app.security import get_current_admin_user
from app.crypto import verify_metadata_hash

router = APIRouter()

@router.get("/pending-tools", response_model=List[ToolResponse])
async def list_pending_tools(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """List all tools pending approval"""
    tools = db.query(Tool).filter(Tool.approved == False).all()
    return [ToolResponse.from_orm(tool) for tool in tools]

@router.post("/approve-tool/{tool_id}", response_model=ToolResponse)
async def approve_tool(
    tool_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Approve a tool"""
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found"
        )
    
    # Verify metadata hash
    is_valid = verify_metadata_hash(
        tool.api_url,
        tool.api_method,
        tool.api_headers or "",
        tool.api_body_template or "",
        tool.metadata_hash
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tool metadata has been tampered with"
        )
    
    tool.approved = True
    db.commit()
    db.refresh(tool)
    
    return ToolResponse.from_orm(tool)

@router.post("/reject-tool/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
async def reject_tool(
    tool_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Reject/delete a tool"""
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found"
        )
    
    db.delete(tool)
    db.commit()

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """List all users"""
    users = db.query(User).all()
    return [UserResponse.from_orm(user) for user in users]

@router.post("/make-admin/{user_id}", response_model=UserResponse)
async def make_user_admin(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Grant admin privileges to a user"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_admin = True
    db.commit()
    db.refresh(user)
    
    return UserResponse.from_orm(user)
