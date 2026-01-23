import asyncio
import httpx
import os
import sys

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.prompts import MENTOR_SYSTEM_PROMPT

async def test_api():
    print(f"DEBUG: API URL: {settings.IO_NET_API_URL}")
    print(f"DEBUG: Model ID: {settings.IO_NET_MODEL_ID}")
    
    headers = {
        "Authorization": f"Bearer {settings.IO_NET_API_KEY}",
        "Content-Type": "application/json"
    }

    # Use the actual prompt content to test if it causes issues
    payload = {
        "model": settings.IO_NET_MODEL_ID,
        "messages": [
            {"role": "system", "content": MENTOR_SYSTEM_PROMPT},
            {"role": "user", "content": "Selam, nasılsın?"}
        ],
        "temperature": 0.2,
        "max_tokens": 100
    }

    print("Sending request with ACTUAL PROMPT...")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.IO_NET_API_URL, 
                json=payload, 
                headers=headers, 
                timeout=60.0 # Same as mentor.py
            )
            print(f"Response Status: {response.status_code}")
            if response.status_code != 200:
                print(f"Response Error Body: {response.text}")
            else:
                print(f"Response Body Sample: {response.text[:200]}...")
    except httpx.ReadTimeout:
        print("ERROR: ReadTimeout occurred after 60 seconds.")
    except Exception as e:
        print(f"ERROR: {type(e).__name__} - {e}")

if __name__ == "__main__":
    asyncio.run(test_api())
