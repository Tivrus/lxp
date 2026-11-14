from typing import Any

from fastapi.encoders import jsonable_encoder

import db
from models.comment import Activity
from services.manager import manager


async def publish(event_type: str, **payload: Any) -> None:
    await manager.broadcast(jsonable_encoder({"type": event_type, **payload}))


async def log_activity(text: str) -> None:
    item = Activity(id=next(db.activity_ids), text=text)
    db.activity.append(item)
    await publish("activity", activity=item)


async def notify(username: str, text: str) -> None:
    await manager.send_to(username, {"type": "notification", "text": text})


async def notify_many(usernames: set[str], text: str) -> None:
    for username in usernames:
        await notify(username, text)


async def publish_presence() -> None:
    await publish("presence", users=manager.online)
