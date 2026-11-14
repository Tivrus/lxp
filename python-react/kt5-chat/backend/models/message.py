from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field

MessageType = Literal["message", "system", "error"]


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ChatMessage(BaseModel):
    type: MessageType
    username: str
    text: str
    timestamp: datetime = Field(default_factory=utc_now)
    users: list[str] | None = None
