import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Settings:
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    step_delay: float = float(os.getenv("STEP_DELAY", "1"))


settings = Settings()
