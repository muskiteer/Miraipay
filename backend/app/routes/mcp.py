from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import httpx
import json
from app.database import get_db
from app.models import User, Tool, Transaction
from app.crypto import decrypt_private_key, get_web3_instance, verify_metadata_hash
from app.config import get_settings
from web3 import Web3
from eth_account import Account

router = APIRouter()
settings = get_settings()

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

@router.get("/tools")
async def mcp_list_tools(db: Session = Depends(get_db)):
    """MCP endpoint: List all available tools for AI agents"""
    tools = db.query(Tool).filter(
        Tool.approved == True,
        Tool.active == True
    ).all()
    
    mcp_tools = []
    for tool in tools:
        mcp_tools.append({
            "name": tool.name,
            "description": f"{tool.description} | Price: {tool.price_mnee} MNEE",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "user_email": {
                        "type": "string",
                        "description": "Email of the user making the request"
                    },
                    "parameters": {
                        "type": "object",
                        "description": "Parameters to pass to the API"
                    }
                },
                "required": ["user_email"]
            },
            "tool_id": tool.id,
            "price_mnee": tool.price_mnee
        })
    
    return {
        "tools": mcp_tools,
        "server_info": {
            "name": "StableTool MCP Server",
            "version": "1.0.0",
            "description": "AI Agent Tool Marketplace with MNEE Payments"
        }
    }

@router.post("/execute/{tool_id}")
async def mcp_execute_tool(
    tool_id: int,
    user_email: str = Header(..., alias="X-User-Email"),
    parameters: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db)
):
    """MCP endpoint: Execute a tool and handle payment automatically"""
    
    # Get user
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get tool
    tool = db.query(Tool).filter(
        Tool.id == tool_id,
        Tool.approved == True,
        Tool.active == True
    ).first()
    
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found or not available"
        )
    
    # Verify metadata hasn't been tampered with
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
            detail="Tool metadata verification failed"
        )
    
    # Get tool owner
    tool_owner = db.query(User).filter(User.id == tool.owner_id).first()
    
    # Process payment
    try:
        private_key = decrypt_private_key(user.encrypted_private_key)
        w3 = get_web3_instance()
        account = Account.from_key(private_key)
        
        mnee_contract = w3.eth.contract(
            address=Web3.to_checksum_address(settings.mnee_contract_address),
            abi=MNEE_ABI
        )
        
        amount_wei = w3.to_wei(tool.price_mnee, 'ether')
        
        # Check balance
        balance = mnee_contract.functions.balanceOf(user.public_key).call()
        if balance < amount_wei:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient MNEE balance"
            )
        
        # Build and sign transaction
        nonce = w3.eth.get_transaction_count(user.public_key)
        transaction = mnee_contract.functions.transfer(
            Web3.to_checksum_address(tool_owner.public_key),
            amount_wei
        ).build_transaction({
            'from': user.public_key,
            'nonce': nonce,
            'gas': 100000,
            'gasPrice': w3.eth.gas_price
        })
        
        signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        tx_hash_hex = tx_hash.hex()
        
        # Record transaction
        db_transaction = Transaction(
            from_user_id=user.id,
            to_user_id=tool_owner.id,
            tool_id=tool.id,
            amount_mnee=tool.price_mnee,
            tx_hash=tx_hash_hex,
            status="pending"
        )
        db.add(db_transaction)
        db.commit()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment failed: {str(e)}"
        )
    
    # Execute the actual API call
    try:
        headers = json.loads(tool.api_headers) if tool.api_headers else {}
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            if tool.api_method.upper() == "GET":
                response = await client.get(tool.api_url, headers=headers, params=parameters or {})
            elif tool.api_method.upper() == "POST":
                # Merge parameters into body template if exists
                body = json.loads(tool.api_body_template) if tool.api_body_template else {}
                if parameters:
                    body.update(parameters)
                response = await client.post(tool.api_url, headers=headers, json=body)
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unsupported HTTP method: {tool.api_method}"
                )
            
            response.raise_for_status()
            
            return {
                "success": True,
                "tool_name": tool.name,
                "price_paid": tool.price_mnee,
                "tx_hash": tx_hash_hex,
                "result": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            }
            
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Tool API call failed: {str(e)}"
        )

@router.get("/info")
async def mcp_server_info():
    """MCP endpoint: Server information"""
    return {
        "name": "StableTool MCP Server",
        "version": "1.0.0",
        "protocol_version": "2024-11-05",
        "description": "AI Agent Tool Marketplace with MNEE Stablecoin Payments",
        "capabilities": {
            "tools": True,
            "payments": True,
            "automated_execution": True
        },
        "payment_token": {
            "name": "MNEE",
            "contract": settings.mnee_contract_address,
            "network": "Ethereum"
        }
    }
