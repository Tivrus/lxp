import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    max_username_length: int = 30
    max_message_length: int = 1000


settings = Settings()
