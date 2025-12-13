from cryptography.fernet import Fernet
from eth_account import Account
from web3 import Web3
from app.config import get_settings
import base64
import hashlib

settings = get_settings()

def get_encryption_key() -> bytes:
    """Get or derive encryption key from settings"""
    key = settings.encryption_key.encode()
    # Ensure key is 32 bytes for Fernet
    return base64.urlsafe_b64encode(hashlib.sha256(key).digest())

def create_ethereum_wallet() -> tuple[str, str]:
    """Create new Ethereum wallet and return (public_key, private_key)"""
    account = Account.create()
    return account.address, account.key.hex()

def encrypt_private_key(private_key: str) -> str:
    """Encrypt private key with Fernet symmetric encryption"""
    fernet = Fernet(get_encryption_key())
    encrypted = fernet.encrypt(private_key.encode())
    return encrypted.decode()

def decrypt_private_key(encrypted_private_key: str) -> str:
    """Decrypt private key"""
    fernet = Fernet(get_encryption_key())
    decrypted = fernet.decrypt(encrypted_private_key.encode())
    return decrypted.decode()

def get_web3_instance() -> Web3:
    """Get Web3 instance connected to Ethereum"""
    w3 = Web3(Web3.HTTPProvider(settings.ethereum_rpc_url))
    return w3

def calculate_metadata_hash(api_url: str, api_method: str, api_headers: str, api_body_template: str) -> str:
    """Calculate SHA-256 hash of API metadata for verification"""
    metadata = f"{api_url}|{api_method}|{api_headers or ''}|{api_body_template or ''}"
    return hashlib.sha256(metadata.encode()).hexdigest()

def verify_metadata_hash(
    api_url: str,
    api_method: str,
    api_headers: str,
    api_body_template: str,
    stored_hash: str
) -> bool:
    """Verify if API metadata hasn't changed"""
    current_hash = calculate_metadata_hash(api_url, api_method, api_headers, api_body_template)
    return current_hash == stored_hash
