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
    call_gemini_for_tool_selection,
    generate_final_response
)

router = APIRouter()


class AgentChatRequest(BaseModel):
    message: str
    model: Optional[str] = "gemini-2.5-flash"


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
        
        # Auto-inject user's wallet address if not provided or missing
        if user.wallet_address:
            if 'user_wallet' not in parameters or parameters.get('user_wallet') in ['MISSING_REQUIRED_PARAMETER', 'MISSING', None, '']:
                parameters['user_wallet'] = user.wallet_address
            if 'wallet_address' not in parameters or parameters.get('wallet_address') in ['MISSING_REQUIRED_PARAMETER', 'MISSING', None, '']:
                parameters['wallet_address'] = user.wallet_address
        
        # Merge parameters into body template
        body = {**body_template, **parameters}
        
        # Debug logging
        print(f"\n=== Tool Execution Debug ===")
        print(f"Tool: {tool.name}")
        print(f"URL: {tool.api_url}")
        print(f"Method: {tool.api_method}")
        print(f"Parameters: {parameters}")
        print(f"Body: {body}")
        print(f"===========================\n")
        
        # Make API request (120s timeout for cold starts on Render)
        async with httpx.AsyncClient(timeout=120.0) as client:
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
        
        # Create transaction record for successful payment
        tx_hash = f"0x{'0' * 64}"  # Placeholder transaction hash
        
        transaction = Transaction(
            from_user_id=user.id,
            to_user_id=tool.owner_id,
            tool_id=tool.id,
            amount_mnee=tool.price_mnee,
            tx_hash=tx_hash,
            status="confirmed"
        )
        db.add(transaction)
        db.commit()
        
        return result, None
        
    except httpx.HTTPStatusError as e:
        # Handle X402 Payment Required
        if e.response.status_code == 402:
            print(f"\n=== X402 Payment Protocol ===")
            print(f"402 Payment Required received")
            
            try:
                payment_info = e.response.json()
                print(f"Payment details: {payment_info}")
                
                # Create proper mock transaction hash (66 chars: 0x + 64 hex)
                import hashlib
                hash_input = f"{user.id}{tool.id}{int(datetime.utcnow().timestamp())}"
                tx_hash = "0x" + hashlib.sha256(hash_input.encode()).hexdigest()
                print(f"Mock transaction hash: {tx_hash}")
                
                transaction = Transaction(
                    from_user_id=user.id,
                    to_user_id=tool.owner_id,
                    tool_id=tool.id,
                    amount_mnee=tool.price_mnee,
                    tx_hash=tx_hash,
                    status="confirmed"
                )
                db.add(transaction)
                db.commit()
                print(f"Transaction recorded in database")
                
                # Add payment proof to request body
                body['payment_proof'] = tx_hash
                
                # Retry the request with payment proof
                headers['X-Payment-Proof'] = tx_hash
                print(f"Retrying request with payment proof in body and header")
                
                # Retry with same extended timeout for cold starts
                async with httpx.AsyncClient(timeout=120.0) as client:
                    if tool.api_method.upper() == "POST":
                        retry_response = await client.post(tool.api_url, headers=headers, json=body)
                    elif tool.api_method.upper() == "GET":
                        retry_response = await client.get(tool.api_url, headers=headers, params=body)
                    else:
                        retry_response = await client.request(tool.api_method, tool.api_url, headers=headers, json=body)
                
                retry_response.raise_for_status()
                result = retry_response.json()
                print(f"Success! Booking completed")
                print(f"===========================\n")
                
                return result, None
                
            except Exception as payment_error:
                print(f"Payment processing error: {payment_error}")
                return None, f"Payment processing failed: {str(payment_error)}"
        
        error_detail = f"Tool API error: {e.response.status_code} - {e.response.text}"
        print(f"HTTP Error: {error_detail}")
        return None, error_detail
    except httpx.RequestError as e:
        error_detail = f"Tool request failed: {str(e)}"
        print(f"Request Error: {error_detail}")
        return None, error_detail
    except Exception as e:
        error_detail = f"Tool execution error: {str(e)}"
        print(f"Execution Error: {error_detail}")
        import traceback
        traceback.print_exc()
        return None, error_detail


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(
    request: AgentChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Main AI agent chat endpoint
    
    Flow:
    1. Check if user has Gemini API key configured
    2. Fetch all approved/active tools
    3. Format tools for LLM
    4. Call Gemini to select appropriate tool
    5. Execute selected tool with payment
    6. Call Gemini again with result to generate final response
    7. Save conversation history
    8. Return response to user
    """
    try:
        # Step 1: Verify Gemini API key
        if not current_user.groq_api_key:
            raise HTTPException(
                status_code=400,
                detail="Gemini API key not configured. Please set your API key in settings."
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
        
        # Step 4: Call Gemini for tool selection
        print(f"\n=== Tool Selection Debug ===")
        print(f"User message: {request.message}")
        print(f"Available tools: {[t.name for t in tools]}")
        
        selection = call_gemini_for_tool_selection(
            user_message=request.message,
            tools_json=tools_json,
            encrypted_api_key=current_user.groq_api_key,
            encryption_key=encryption_key,
            model=request.model
        )
        
        print(f"Gemini selection result: {selection}")
        print(f"===========================\n")
        
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
            print(f"\n=== Tool Execution ===")
            print(f"Selected tool_id: {tool_id}")
            print(f"Parameters from Gemini: {parameters}")
            
            tool = db.query(Tool).filter(Tool.id == tool_id).first()
            
            if not tool:
                error_message = f"Tool {tool_name} not found"
                print(f"ERROR: Tool not found in database")
            else:
                print(f"Executing tool: {tool.name}")
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
