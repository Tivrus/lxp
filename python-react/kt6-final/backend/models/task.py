from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field, field_validator

TaskStatus = Literal["todo", "in_progress", "done"]

STATUS_LABELS: dict[str, str] = {
    "todo": "К выполнению",
    "in_progress": "В работе",
    "done": "Готово",
}

MIN_TITLE_LENGTH = 3


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def blank_to_none(value: str | None) -> str | None:
    if value is None:
        return None
    return value.strip() or None


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    assignee: str | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        value = value.strip()
        if len(value) < MIN_TITLE_LENGTH:
            raise ValueError(f"Название задачи должно быть не короче {MIN_TITLE_LENGTH} символов")
        return value

    @field_validator("assignee")
    @classmethod
    def normalize_assignee(cls, value: str | None) -> str | None:
        return blank_to_none(value)


class TaskUpdate(BaseModel):
    status: TaskStatus | None = None
    assignee: str | None = None

    @field_validator("assignee")
    @classmethod
    def normalize_assignee(cls, value: str | None) -> str | None:
        return blank_to_none(value)


class Task(BaseModel):
    id: int
    title: str
    description: str
    status: TaskStatus = "todo"
    author: str
    assignee: str | None = None
    created_at: datetime = Field(default_factory=utc_now)
