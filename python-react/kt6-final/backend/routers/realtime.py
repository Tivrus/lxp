from fastapi import APIRouter, WebSocket, WebSocketDisconnect

import db
from config import settings
from models.comment import Activity
from services.events import log_activity, publish_presence
from services.manager import manager

router = APIRouter(tags=["realtime"])


@router.get("/activity", response_model=list[Activity])
def list_activity() -> list[Activity]:
    return list(reversed(db.activity))


@router.get("/users/online", response_model=list[str])
def list_online_users() -> list[str]:
    return manager.online


@router.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str) -> None:
    username = username.strip()[: settings.max_username_length]
    is_first_tab = not manager.is_online(username)

    await manager.connect(username, websocket)
    await publish_presence()
    if is_first_tab:
        await log_activity(f"{username} теперь онлайн")

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(username, websocket)
        await publish_presence()
        if not manager.is_online(username):
            await log_activity(f"{username} теперь офлайн")
