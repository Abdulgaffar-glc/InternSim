import httpx
from backend.app.core.config import settings
from backend.app.core.prompts import MENTOR_SYSTEM_PROMPT

class MentorService:
    def __init__(self):
        self.api_key = settings.IO_NET_API_KEY
        self.model_id = settings.IO_NET_MODEL_ID
        self.api_url = settings.IO_NET_API_URL
        
        # Using centralized system prompt
        self.system_prompt = MENTOR_SYSTEM_PROMPT

    async def get_review(self, history: list) -> str:
        """
        Sends the conversation history to the io.net inference API.
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Use the provided history directly
        messages = [{"role": "system", "content": self.system_prompt}] + history
        
        payload = {
            "model": self.model_id,
            "messages": messages,
            "temperature": 0.7,  # Increased for more creativity/naturalness
            "top_p": 0.9,        # Better sampling for natural flow
            "presence_penalty": 0.6, # Prevents repetitive robotic phrases
            "frequency_penalty": 0.5,
            "max_tokens": 2048
        }

        async with httpx.AsyncClient() as client:
            try:
                # Note: Adjusting for potential standard OpenAI-compatible API format often used by inference providers
                print(f"DEBUG: Using API URL: {self.api_url}")
                response = await client.post(self.api_url, json=payload, headers=headers, timeout=60.0)
                response.raise_for_status()
                result = response.json()
                
                # Assuming standard OpenAI-like response structure
                if "choices" in result and len(result["choices"]) > 0:
                    return result["choices"][0]["message"]["content"]
                else:
                    return "Error: No content returned from inference API."
            except httpx.HTTPStatusError as e:
                print(f"HTTP Status Error: {e.response.status_code} - {e.response.text}")
                return f"API Error: {e.response.status_code} - {e.response.text}"
            except Exception as e:
                import traceback
                traceback.print_exc()
                return f"System Error ({type(e).__name__}): {str(e)}"

mentor_service = MentorService()
