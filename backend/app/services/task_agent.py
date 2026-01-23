
##Will Be Replaced by AI agent
import os
import requests
import json
from dotenv import load_dotenv
from ai.task_prompt_builder import build_task_prompt 

load_dotenv()

API_KEY = os.getenv("IOINTELLIGENCE_API_KEY")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

def generate_task(track: str, level: str):
    """
    IO Intelligence API'sine istek atıp task içeriğini oluşturur.
    Veritabanı şemasına uygun JSON formatı zorlanır.
    """
    # Gelen 'Frontend' yazısını 'frontend' yapar, hatayı engeller
    prompt = build_task_prompt(domain=track.lower(), level=level)

    # --- KRİTİK KISIM: Veritabanı formatını AI'a öğretiyoruz ---
    # System prompt dosyasını okuyoruz ama üstüne format kuralı ekliyoruz.
    system_prompt_path = os.path.join(BASE_DIR, "ai", "task_generator.txt")
    
    if os.path.exists(system_prompt_path):
        with open(system_prompt_path, encoding="utf-8") as f:
            base_system_prompt = f.read()
    else:
        base_system_prompt = "You are a helpful assistant that generates coding tasks."

    # Arkadaşının istediği yapıyı burada zorunlu kılıyoruz:
    format_instruction = """
    IMPORTANT: You must respond with a purely JSON object. Do not add any explanation.
    The JSON structure must exactly match these keys to fit our database schema:
    {
        "title": "Short task title",
        "description": "Detailed task description in markdown",
        "difficulty": "Beginner/Intermediate/Advanced" 
    }
    Make sure 'difficulty' is one of: Beginner, Intermediate, Advanced.
    """
    
    final_system_prompt = base_system_prompt + "\n\n" + format_instruction

    try:
        payload = {
            "model": "meta-llama/Llama-3.3-70B-Instruct",
            "messages": [
                {"role": "system", "content": final_system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7  # Biraz düşürdüm ki daha tutarlı olsun
        }

        response = requests.post(
            "https://api.intelligence.io.solutions/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        
        ai_response = response.json()
        content_str = ai_response["choices"][0]["message"]["content"]
        
        # Temizlik
        if "```json" in content_str:
            content_str = content_str.split("```json")[1].split("```")[0].strip()
        elif "```" in content_str:
            content_str = content_str.strip("```")
            
        data = json.loads(content_str)
        
        # Veritabanında difficulty en fazla 30 karakter, onu kontrol edelim
        if "difficulty" in data and len(data["difficulty"]) > 30:
             data["difficulty"] = data["difficulty"][:30]
             
        return data

    except Exception as e:
        print(f"AI Generation Error: {e}")
        # Hata durumunda boş ama yapıyı bozmayan bir cevap dönelim
        return {
            "title": "Generation Failed",
            "description": "Could not generate task at this moment. Please try again.",
            "difficulty": level
        }