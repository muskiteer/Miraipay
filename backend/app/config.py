from pydantic_settings import BaseSettings
from functools import lru_cache

# setting up the contract

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    encryption_key: str
    ethereum_rpc_url: str
    mnee_contract_address: str = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF"
    admin_email: str
    frontend_url: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()
