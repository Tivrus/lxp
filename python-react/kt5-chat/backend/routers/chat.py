from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

from config import settings
from manager import SYSTEM_USER, manager
from models.message import ChatMessage

router = APIRouter(tags=["chat"])


@router.get("/users", response_model=list[str])
def list_users() -> list[str]:
    return manager.usernames


async def reject(websocket: WebSocket, reason: str) -> None:
    error = ChatMessage(type="error", username=SYSTEM_USER, text=reason)
    await websocket.send_json(error.model_dump(mode="json"))
    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)


@router.websocket("/ws/{username}")
async def chat(websocket: WebSocket, username: str) -> None:
    await websocket.accept()
    username = username.strip()[: settings.max_username_length]

    if not username:
        await reject(websocket, "Имя не может быть пустым")
        return
    if manager.is_taken(username):
        await reject(websocket, f'Имя "{username}" уже занято')
        return

    manager.connect(username, websocket)
    await manager.send_system(f"{username} теперь в чате")

    try:
        while True:
            data = await websocket.receive_json()
            text = str(data.get("text", "")).strip()[: settings.max_message_length]
            if text:
                await manager.broadcast(ChatMessage(type="message", username=username, text=text))
    except WebSocketDisconnect:
        manager.disconnect(username)
        await manager.send_system(f"{username} больше не в чате")
