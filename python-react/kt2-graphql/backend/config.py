import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    app_title: str = os.getenv("APP_TITLE", "Task Manager API")
    app_description: str = os.getenv("APP_DESCRIPTION", "API для менеджера задач")
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:5173")


settings = Settings()
