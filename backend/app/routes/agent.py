"""
AI Agent Orchestration Routes
Handles user interactions with AI agent for tool selection and execution
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
import httpx
from datetime import datetime

from app.database import get_db
from app.models import User, Tool, Transaction, Conversation
from app.security import get_current_user
from app.crypto import get_encryption_key, decrypt_data
from app.groq_service import (
    format_tools_for_llm,
    call_groq_for_tool_selection,
    generate_final_response
)

router = APIRouter()


class AgentChatRequest(BaseModel):
    message: str
    model: Optional[str] = "llama-3.1-70b-versatile"


class AgentChatResponse(BaseModel):
    response: str
    tool_used: Optional[str] = None
    tool_result: Optional[Dict[str, Any]] = None
    price_paid: Optional[float] = None
    transaction_hash: Optional[str] = None
    conversation_id: int


async def execute_tool(
    tool: Tool,
    parameters: Dict[str, Any],
    user: User,
    db: Session
) -> tuple[Dict[str, Any], Optional[str]]:
    """
    Execute a tool API call with payment processing
    
    Args:
        tool: Tool object to execute
        parameters: Parameters for the tool
        user: Current user making the request
        db: Database session
        
    Returns:
        Tuple of (result_dict, error_message)
    """
    try:
        # TODO: Check user's MNEE balance before execution
        # This would require web3 integration to check balance
        
        # Prepare API request
        headers = json.loads(tool.api_headers) if tool.api_headers else {}
        body_template = json.loads(tool.api_body_template) if tool.api_body_template else {}
        
        # Merge parameters into body template
        body = {**body_template, **parameters}
        
        # Make API request
        async with httpx.AsyncClient(timeout=30.0) as client:
            if tool.api_method.upper() == "GET":
                response = await client.get(tool.api_url, headers=headers, params=parameters)
            elif tool.api_method.upper() == "POST":
                response = await client.post(tool.api_url, headers=headers, json=body)
            elif tool.api_method.upper() == "PUT":
                response = await client.put(tool.api_url, headers=headers, json=body)
            elif tool.api_method.upper() == "DELETE":
                response = await client.delete(tool.api_url, headers=headers)
            else:
                return None, f"Unsupported HTTP method: {tool.api_method}"
        
        response.raise_for_status()
        
        # Parse response
        try:
            result = response.json()
        except:
            result = {"response": response.text}
        
        # TODO: Process MNEE payment transaction here
        # For now, create a placeholder transaction record
        tx_hash = f"0x{'0' * 64}"  # Placeholder transaction hash
        
        transaction = Transaction(
            from_user_id=user.id,
            to_user_id=tool.owner_id,
            tool_id=tool.id,
            amount_mnee=tool.price_mnee,
            tx_hash=tx_hash,
            status="confirmed"  # In real implementation, would be "pending" initially
        )
        db.add(transaction)
        db.commit()
        
        return result, None
        
    except httpx.HTTPStatusError as e:
        return None, f"Tool API error: {e.response.status_code} - {e.response.text}"
    except httpx.RequestError as e:
        return None, f"Tool request failed: {str(e)}"
    except Exception as e:
        return None, f"Tool execution error: {str(e)}"


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(
    request: AgentChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Main AI agent chat endpoint
    
    Flow:
    1. Check if user has Groq API key configured
    2. Fetch all approved/active tools
    3. Format tools for LLM
    4. Call Groq to select appropriate tool
    5. Execute selected tool with payment
    6. Call Groq again with result to generate final response
    7. Save conversation history
    8. Return response to user
    """
    try:
        # Step 1: Verify Groq API key
        if not current_user.groq_api_key:
            raise HTTPException(
                status_code=400,
                detail="Groq API key not configured. Please set your API key in settings."
            )
        
        encryption_key = get_encryption_key()
        
        # Step 2: Fetch approved tools
        tools = db.query(Tool).filter(
            Tool.approved == True,
            Tool.active == True
        ).all()
        
        if not tools:
            # No tools available
            final_response = "I apologize, but there are no tools available at the moment. Please check back later."
            
            conversation = Conversation(
                user_id=current_user.id,
                user_message=request.message,
                tool_selected=None,
                tool_result=None,
                final_response=final_response
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            
            return AgentChatResponse(
                response=final_response,
                conversation_id=conversation.id
            )
        
        # Step 3: Format tools for LLM
        tools_json = format_tools_for_llm(tools)
        
        # Step 4: Call Groq for tool selection
        selection = call_groq_for_tool_selection(
            user_message=request.message,
            tools_json=tools_json,
            encrypted_api_key=current_user.groq_api_key,
            encryption_key=encryption_key,
            model=request.model
        )
        
        # Check if tool was selected
        tool_id = selection.get("tool_id")
        tool_name = selection.get("tool_name")
        parameters = selection.get("parameters", {})
        
        tool_result = None
        error_message = None
        price_paid = None
        tx_hash = None
        
        if tool_id:
            # Step 5: Execute tool
            tool = db.query(Tool).filter(Tool.id == tool_id).first()
            
            if not tool:
                error_message = f"Tool {tool_name} not found"
            else:
                tool_result, error_message = await execute_tool(tool, parameters, current_user, db)
                
                if not error_message:
                    price_paid = tool.price_mnee
                    # Get the transaction hash from the last transaction
                    last_tx = db.query(Transaction).filter(
                        Transaction.from_user_id == current_user.id,
                        Transaction.tool_id == tool.id
                    ).order_by(Transaction.created_at.desc()).first()
                    
                    if last_tx:
                        tx_hash = last_tx.tx_hash
        else:
            # No tool selected
            tool_name = None
            error_message = selection.get("reasoning", "No appropriate tool found")
        
        # Step 6: Generate final response
        final_response = generate_final_response(
            user_message=request.message,
            tool_name=tool_name,
            tool_result=tool_result,
            encrypted_api_key=current_user.groq_api_key,
            encryption_key=encryption_key,
            error_message=error_message,
            model=request.model
        )
        
        # Step 7: Save conversation
        conversation = Conversation(
            user_id=current_user.id,
            user_message=request.message,
            tool_selected=tool_name,
            tool_result=json.dumps(tool_result) if tool_result else None,
            final_response=final_response
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        
        # Step 8: Return response
        return AgentChatResponse(
            response=final_response,
            tool_used=tool_name,
            tool_result=tool_result,
            price_paid=price_paid,
            transaction_hash=tx_hash,
            conversation_id=conversation.id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@router.get("/history")
async def get_conversation_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user's conversation history
    """
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.created_at.desc()).limit(limit).all()
    
    return {
        "conversations": [
            {
                "id": conv.id,
                "user_message": conv.user_message,
                "tool_selected": conv.tool_selected,
                "final_response": conv.final_response,
                "created_at": conv.created_at.isoformat()
            }
            for conv in conversations
        ]
    }
