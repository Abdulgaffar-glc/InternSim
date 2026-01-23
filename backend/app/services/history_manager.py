import json
import os
import uuid
from typing import List, Dict, Optional
from pathlib import Path

class HistoryManager:
    def __init__(self, storage_dir: str = "backend/data/sessions"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def _get_file_path(self, session_id: str) -> Path:
        return self.storage_dir / f"{session_id}.json"

    def create_session(self) -> str:
        session_id = str(uuid.uuid4())
        self.save_history(session_id, [])
        return session_id

    def get_history(self, session_id: str) -> List[Dict[str, str]]:
        file_path = self._get_file_path(session_id)
        if not file_path.exists():
            return []
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading history for {session_id}: {e}")
            return []

    def save_history(self, session_id: str, messages: List[Dict[str, str]]):
        file_path = self._get_file_path(session_id)
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(messages, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving history for {session_id}: {e}")

    def append_message(self, session_id: str, role: str, content: str):
        history = self.get_history(session_id)
        history.append({"role": role, "content": content})
        self.save_history(session_id, history)

history_manager = HistoryManager()
