from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from models.task import utc_now


class CommentCreate(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Комментарий не может быть пустым")
        return value


class Comment(BaseModel):
    id: int
    task_id: int
    author: str
    text: str
    created_at: datetime = Field(default_factory=utc_now)


class Activity(BaseModel):
    id: int
    text: str
    created_at: datetime = Field(default_factory=utc_now)
