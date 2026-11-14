import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Environment variable {name} is not set, see .env.example")
    return value


def parse_list(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    app_title: str = os.getenv("APP_TITLE", "Team Board API")
    app_description: str = "Доска задач команды с обновлениями в реальном времени"
    frontend_urls: list[str] = field(
        default_factory=lambda: parse_list(require_env("FRONTEND_URLS"))
    )
    activity_limit: int = int(os.getenv("ACTIVITY_LIMIT", "50"))
    max_username_length: int = 30
    database_path: str = os.getenv("DATABASE_PATH", "board.db")


settings = Settings()
