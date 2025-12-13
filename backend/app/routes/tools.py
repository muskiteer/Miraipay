from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Tool
from app.schemas import ToolCreate, ToolUpdate, ToolResponse
from app.security import get_current_user
from app.crypto import calculate_metadata_hash

router = APIRouter()

@router.post("/", response_model=ToolResponse, status_code=status.HTTP_201_CREATED)
async def create_tool(
    tool_data: ToolCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new tool (pending admin approval)"""
    
    # Calculate metadata hash
    metadata_hash = calculate_metadata_hash(
        tool_data.api_url,
        tool_data.api_method,
        tool_data.api_headers or "",
        tool_data.api_body_template or ""
    )
    
    # Create tool
    tool = Tool(
        name=tool_data.name,
        description=tool_data.description,
        api_url=tool_data.api_url,
        api_method=tool_data.api_method,
        api_headers=tool_data.api_headers,
        api_body_template=tool_data.api_body_template,
        metadata_hash=metadata_hash,
        price_mnee=tool_data.price_mnee,
        owner_id=current_user.id,
        approved=False  # Requires admin approval
    )
    
    db.add(tool)
    db.commit()
    db.refresh(tool)
    
    return ToolResponse.from_orm(tool)

@router.get("/", response_model=List[ToolResponse])
async def list_tools(
    approved_only: bool = True,
    db: Session = Depends(get_db)
):
    """List all tools (approved by default)"""
    query = db.query(Tool).filter(Tool.active == True)
    
    if approved_only:
        query = query.filter(Tool.approved == True)
    
    tools = query.all()
    return [ToolResponse.from_orm(tool) for tool in tools]

@router.get("/my-tools", response_model=List[ToolResponse])
async def list_my_tools(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List tools owned by current user"""
    tools = db.query(Tool).filter(Tool.owner_id == current_user.id).all()
    return [ToolResponse.from_orm(tool) for tool in tools]

@router.get("/{tool_id}", response_model=ToolResponse)
async def get_tool(tool_id: int, db: Session = Depends(get_db)):
    """Get specific tool by ID"""
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found"
        )
    
    return ToolResponse.from_orm(tool)

@router.patch("/{tool_id}", response_model=ToolResponse)
async def update_tool(
    tool_id: int,
    tool_data: ToolUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update tool (owner only)"""
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found"
        )
    
    if tool.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this tool"
        )
    
    # Update fields
    if tool_data.name is not None:
        tool.name = tool_data.name
    if tool_data.description is not None:
        tool.description = tool_data.description
    if tool_data.price_mnee is not None:
        tool.price_mnee = tool_data.price_mnee
    if tool_data.active is not None:
        tool.active = tool_data.active
    
    db.commit()
    db.refresh(tool)
    
    return ToolResponse.from_orm(tool)

@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tool(
    tool_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft delete tool (deactivate)"""
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found"
        )
    
    if tool.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this tool"
        )
    
    tool.active = False
    db.commit()
