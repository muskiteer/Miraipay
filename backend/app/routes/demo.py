from fastapi import APIRouter, HTTPException, Header, Response
from pydantic import BaseModel
from typing import Optional
import hashlib
from datetime import datetime, timedelta

router = APIRouter()

class MovieBookingRequest(BaseModel):
    movie_name: str
    city: str
    date: str
    seats: int
    user_wallet: str
    email: Optional[str] = None

class MovieBookingResponse(BaseModel):
    success: bool
    booking_id: str
    movie: str
    theater: str
    city: str
    date: str
    showtime: str
    seats: list[str]
    total_tickets: int
    price_per_ticket: float
    total_price: float
    qr_code_url: str
    confirmation_email: str
    booking_reference: str

@router.post("/book-movie-tickets", response_model=MovieBookingResponse)
async def book_movie_tickets(
    booking: MovieBookingRequest,
    x_payment_proof: Optional[str] = Header(None),
    response: Response = None
):
    """
    X402 Protocol Compatible Movie Ticket Booking API
    
    This endpoint demonstrates the X402 payment protocol:
    1. First call without payment returns 402 Payment Required
    2. Client processes payment (MNEE transfer)
    3. Retry with X-Payment-Proof header containing transaction hash
    4. Service validates payment and returns booking
    
    Price: 2.5 MNEE per booking
    """
    
    # X402 Protocol: Check for payment proof
    if not x_payment_proof:
        # Return 402 Payment Required with payment details
        response.status_code = 402
        response.headers["X-Accept-Payment"] = "MNEE"
        response.headers["X-Payment-Address"] = "0x1234567890abcdef1234567890abcdef12345678"  # Tool owner wallet
        response.headers["X-Payment-Amount"] = "2.5"
        response.headers["X-Payment-Network"] = "ethereum"
        response.headers["X-Payment-Contract"] = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF"
        response.headers["X-Payment-Required"] = "true"
        
        raise HTTPException(
            status_code=402,
            detail={
                "error": "Payment Required",
                "message": "Please pay 2.5 MNEE to use this service",
                "payment_address": "0x1234567890abcdef1234567890abcdef12345678",
                "amount": "2.5",
                "currency": "MNEE",
                "network": "ethereum"
            }
        )
    
    # Validate payment proof (in production, verify on-chain)
    if not x_payment_proof.startswith("0x") or len(x_payment_proof) != 66:
        raise HTTPException(
            status_code=400,
            detail="Invalid transaction hash format"
        )
    
    # Generate unique booking ID
    booking_hash = hashlib.sha256(
        f"{booking.movie_name}{booking.user_wallet}{datetime.now().isoformat()}".encode()
    ).hexdigest()[:12].upper()
    booking_id = f"BK-{booking_hash}"
    
    # Mock theater selection based on city
    theaters = {
        "toronto": "Cineplex Scotiabank Theatre Toronto",
        "new york": "AMC Lincoln Square 13",
        "los angeles": "TCL Chinese Theatre",
        "london": "Odeon Leicester Square",
        "mumbai": "PVR INOX Phoenix Palladium",
    }
    theater = theaters.get(booking.city.lower(), f"MoviePlex {booking.city}")
    
    # Generate seat numbers
    seat_letters = ['A', 'B', 'C', 'D', 'E', 'F']
    start_seat = 12
    seats_list = [f"{seat_letters[i % len(seat_letters)]}{start_seat + i}" for i in range(booking.seats)]
    
    # Mock showtime (2 hours from now)
    showtime_dt = datetime.now() + timedelta(hours=2)
    showtime = showtime_dt.strftime("%I:%M %p")
    
    # Generate QR code URL
    qr_data = f"{booking_id}|{booking.movie_name}|{theater}|{showtime}"
    qr_code_url = f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={qr_data}"
    
    # Mock pricing
    price_per_ticket = 15.99
    total_price = price_per_ticket * booking.seats
    
    return MovieBookingResponse(
        success=True,
        booking_id=booking_id,
        movie=booking.movie_name,
        theater=theater,
        city=booking.city.title(),
        date=booking.date,
        showtime=showtime,
        seats=seats_list,
        total_tickets=booking.seats,
        price_per_ticket=price_per_ticket,
        total_price=total_price,
        qr_code_url=qr_code_url,
        confirmation_email=booking.email or f"{booking.user_wallet[:8]}@example.com",
        booking_reference=booking_id
    )

@router.get("/x402-example")
async def x402_protocol_example():
    """
    X402 Protocol Documentation & Example
    
    Returns documentation on how to implement X402-compatible tools
    """
    return {
        "protocol": "X402 Payment Required",
        "description": "HTTP extension for AI agent micropayments",
        "specification": "https://github.com/bitcoin-dev-project/bips/pull/1521",
        "how_it_works": {
            "step_1": "Client makes request without payment",
            "step_2": "Server returns 402 with payment headers",
            "step_3": "Client processes payment (MNEE transfer)",
            "step_4": "Client retries with X-Payment-Proof header",
            "step_5": "Server validates payment and returns response"
        },
        "headers": {
            "request": {
                "X-Payment-Proof": "Transaction hash from blockchain (0x...)"
            },
            "response_402": {
                "X-Accept-Payment": "MNEE (or other token)",
                "X-Payment-Address": "Ethereum address to receive payment",
                "X-Payment-Amount": "Amount in tokens",
                "X-Payment-Network": "ethereum, polygon, etc.",
                "X-Payment-Contract": "Token contract address (for ERC-20)",
                "X-Payment-Required": "true"
            }
        },
        "example_code": {
            "curl": """curl -X POST http://localhost:8000/api/demo/book-movie-tickets \\
  -H "Content-Type: application/json" \\
  -H "X-Payment-Proof: 0xabc123..." \\
  -d '{
    "movie_name": "Avatar 3",
    "city": "Toronto",
    "date": "2025-12-20",
    "seats": 2,
    "user_wallet": "0x..."
  }'""",
            "javascript": """// Step 1: Try without payment
const response = await fetch('/api/demo/book-movie-tickets', {
  method: 'POST',
  body: JSON.stringify(data)
});

if (response.status === 402) {
  // Step 2: Get payment details from headers
  const paymentAddress = response.headers.get('X-Payment-Address');
  const amount = response.headers.get('X-Payment-Amount');
  
  // Step 3: Process payment (via Web3)
  const txHash = await sendMNEE(paymentAddress, amount);
  
  // Step 4: Retry with proof
  const finalResponse = await fetch('/api/demo/book-movie-tickets', {
    method: 'POST',
    headers: { 'X-Payment-Proof': txHash },
    body: JSON.stringify(data)
  });
}"""
        },
        "mnee_integration": {
            "contract": "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF",
            "network": "Ethereum Mainnet",
            "decimals": 18,
            "transfer_example": """// Using ethers.js
const mneeContract = new ethers.Contract(
  '0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF',
  ['function transfer(address to, uint256 amount) returns (bool)'],
  signer
);

const tx = await mneeContract.transfer(
  paymentAddress,
  ethers.parseUnits(amount, 18)
);
await tx.wait();
return tx.hash; // Use as X-Payment-Proof"""
        }
    }

@router.get("/movies/search")
async def search_movies(query: str):
    """
    Mock movie search endpoint
    Returns popular movies matching the query
    """
    mock_movies = [
        {
            "id": 1,
            "title": "Avatar 3",
            "genre": "Sci-Fi",
            "duration": "192 min",
            "rating": "PG-13",
            "description": "Jake Sully and Neytiri's story continues"
        },
        {
            "id": 2,
            "title": "Dune: Part Three",
            "genre": "Sci-Fi",
            "duration": "165 min",
            "rating": "PG-13",
            "description": "The epic conclusion to the Dune trilogy"
        },
        {
            "id": 3,
            "title": "The Batman 2",
            "genre": "Action",
            "duration": "178 min",
            "rating": "PG-13",
            "description": "Batman faces new threats in Gotham"
        }
    ]
    
    # Filter movies by query
    results = [m for m in mock_movies if query.lower() in m["title"].lower()]
    return {"results": results, "count": len(results)}
