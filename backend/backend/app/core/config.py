"""
Configuration settings for the application
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "internsim")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # io.net API
    IO_NET_API_KEY: str = os.getenv("IO_NET_API_KEY", "")
    IO_NET_MODEL_ID: str = os.getenv("IO_NET_MODEL_ID", "meta-llama/Llama-3.3-70B-Instruct")
    IO_NET_API_URL: str = os.getenv("IO_NET_API_URL", "https://api.intelligence.io.solutions/api/v1/chat/completions")
    IOINTELLIGENCE_API_KEY: str = os.getenv("IOINTELLIGENCE_API_KEY", "")

settings = Settings()
