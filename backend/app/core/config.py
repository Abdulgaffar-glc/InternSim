import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "mentorunAI"
    VERSION: str = "1.0.0"
    
    # io.net Configuration
    IO_NET_API_KEY: str = os.getenv("IO_NET_API_KEY", "")
    # Defaulting to a specific model ID, can be overridden
    IO_NET_MODEL_ID: str = os.getenv("IO_NET_MODEL_ID", "meta-llama/Llama-3.3-70B-Instruct")
    IO_NET_API_URL: str = os.getenv("IO_NET_API_URL", "https://api.intelligence.io.solutions/api/v1/chat/completions")

settings = Settings()
