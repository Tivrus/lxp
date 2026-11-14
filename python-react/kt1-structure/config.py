import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Environment variable {name} is not set, see .env.example")
    return value


@dataclass(frozen=True)
class Settings:
    app_title: str = os.getenv("APP_TITLE", "Task Manager API")
    app_description: str = os.getenv("APP_DESCRIPTION", "API для менеджера задач")
    frontend_url: str = require_env("FRONTEND_URL")


settings = Settings()
