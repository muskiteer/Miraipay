from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models import User, Tool, Transaction
from app.schemas import TransactionResponse, EarningsResponse, SpendingResponse
from app.security import get_current_user
from app.crypto import decrypt_private_key, get_web3_instance
from app.config import get_settings
from web3 import Web3
from eth_account import Account
import json

router = APIRouter()
settings = get_settings()

# MNEE ERC-20 ABI (standard transfer function)
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

@router.post("/pay/{tool_id}", response_model=TransactionResponse)
async def pay_for_tool(
    tool_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Execute payment for using a tool"""
    
    # Get tool
    tool = db.query(Tool).filter(
        Tool.id == tool_id,
        Tool.approved == True,
        Tool.active == True
    ).first()
    
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found or not approved"
        )
    
    # Cannot pay yourself
    if tool.owner_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot pay for your own tool"
        )
    
    # Get tool owner
    tool_owner = db.query(User).filter(User.id == tool.owner_id).first()
    
    try:
        # Decrypt sender's private key
        private_key = decrypt_private_key(current_user.encrypted_private_key)
        
        # Setup Web3
        w3 = get_web3_instance()
        account = Account.from_key(private_key)
        
        # Get MNEE contract
        mnee_contract = w3.eth.contract(
            address=Web3.to_checksum_address(settings.mnee_contract_address),
            abi=MNEE_ABI
        )
        
        # Convert MNEE amount to wei (MNEE has 18 decimals like ETH)
        amount_wei = w3.to_wei(tool.price_mnee, 'ether')
        
        # Check balance
        balance = mnee_contract.functions.balanceOf(current_user.public_key).call()
        if balance < amount_wei:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient MNEE balance. Required: {tool.price_mnee}, Available: {w3.from_wei(balance, 'ether')}"
            )
        
        # Build transaction
        nonce = w3.eth.get_transaction_count(current_user.public_key)
        
        transaction = mnee_contract.functions.transfer(
            Web3.to_checksum_address(tool_owner.public_key),
            amount_wei
        ).build_transaction({
            'from': current_user.public_key,
            'nonce': nonce,
            'gas': 100000,
            'gasPrice': w3.eth.gas_price
        })
        
        # Sign transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        tx_hash_hex = tx_hash.hex()
        
        # Create transaction record
        db_transaction = Transaction(
            from_user_id=current_user.id,
            to_user_id=tool_owner.id,
            tool_id=tool.id,
            amount_mnee=tool.price_mnee,
            tx_hash=tx_hash_hex,
            status="pending"
        )
        
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        
        # Note: In production, you'd want to wait for confirmation or have a background job
        # to update transaction status when confirmed on-chain
        
        return TransactionResponse.from_orm(db_transaction)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment failed: {str(e)}"
        )

@router.get("/balance")
async def get_mnee_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's MNEE balance"""
    blockchain_error = None
    
    # For demo/hackathon: Always use simulated balance
    # In production, you would check blockchain first
    
    # Calculate balance from transactions for demo purposes
    # Total earned (received payments from OTHER users)
    total_earned = db.query(func.sum(Transaction.amount_mnee)).filter(
        Transaction.to_user_id == current_user.id,
        Transaction.from_user_id != current_user.id,  # Exclude self-transactions
        Transaction.status.in_(["confirmed", "completed", "pending"])
    ).scalar() or 0.0
    
    # Total spent (sent payments to OTHER users)
    total_spent = db.query(func.sum(Transaction.amount_mnee)).filter(
        Transaction.from_user_id == current_user.id,
        Transaction.to_user_id != current_user.id,  # Exclude self-transactions
        Transaction.status.in_(["confirmed", "completed", "pending"])
    ).scalar() or 0.0
    
    # Mock balance = earned - spent + initial balance (1000 MNEE for demo)
    mock_balance = 1000.0 + total_earned - total_spent
    
    return {
        "address": current_user.public_key,
        "balance_mnee": float(mock_balance),
        "balance_wei": str(int(mock_balance * 10**18)),
        "source": "simulated",
        "note": "Using simulated balance for hackathon demo. Starting balance: 1000 MNEE"
    }

@router.get("/earnings", response_model=EarningsResponse)
async def get_earnings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's earnings from their tools (excluding self-transactions)"""
    transactions = db.query(Transaction).filter(
        Transaction.to_user_id == current_user.id,
        Transaction.from_user_id != current_user.id  # Exclude self-transactions
    ).order_by(Transaction.created_at.desc()).all()
    
    total_earned = db.query(func.sum(Transaction.amount_mnee)).filter(
        Transaction.to_user_id == current_user.id,
        Transaction.from_user_id != current_user.id,  # Exclude self-transactions
        Transaction.status == "confirmed"
    ).scalar() or 0.0
    
    # Add tool names to transactions
    tx_responses = []
    for tx in transactions:
        tx_dict = TransactionResponse.from_orm(tx).model_dump()
        if tx.tool:
            tx_dict['tool_name'] = tx.tool.name
        tx_responses.append(TransactionResponse(**tx_dict))
    
    return {
        "total_earned": total_earned,
        "transaction_count": len(transactions),
        "transactions": tx_responses
    }

@router.get("/spending", response_model=SpendingResponse)
async def get_spending(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's spending on tools (excluding self-transactions)"""
    transactions = db.query(Transaction).filter(
        Transaction.from_user_id == current_user.id,
        Transaction.to_user_id != current_user.id  # Exclude self-transactions
    ).order_by(Transaction.created_at.desc()).all()
    
    total_spent = db.query(func.sum(Transaction.amount_mnee)).filter(
        Transaction.from_user_id == current_user.id,
        Transaction.to_user_id != current_user.id,  # Exclude self-transactions
        Transaction.status == "confirmed"
    ).scalar() or 0.0
    
    # Add tool names to transactions
    tx_responses = []
    for tx in transactions:
        tx_dict = TransactionResponse.from_orm(tx).model_dump()
        if tx.tool:
            tx_dict['tool_name'] = tx.tool.name
        tx_responses.append(TransactionResponse(**tx_dict))
    
    return {
        "total_spent": total_spent,
        "transaction_count": len(transactions),
        "transactions": tx_responses
    }

@router.get("/transactions", response_model=List[TransactionResponse])
async def get_all_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all transactions (sent and received)"""
    transactions = db.query(Transaction).filter(
        (Transaction.from_user_id == current_user.id) | 
        (Transaction.to_user_id == current_user.id)
    ).order_by(Transaction.created_at.desc()).all()
    
    # Add tool names to transactions
    tx_responses = []
    for tx in transactions:
        tx_dict = TransactionResponse.from_orm(tx).model_dump()
        if tx.tool:
            tx_dict['tool_name'] = tx.tool.name
        tx_responses.append(TransactionResponse(**tx_dict))
    
    return tx_responses
