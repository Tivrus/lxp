import logging

from fastapi import WebSocket, WebSocketDisconnect

from models.message import ChatMessage

logger = logging.getLogger(__name__)

SYSTEM_USER = "system"


class ConnectionManager:
    def __init__(self) -> None:
        self.connections: dict[str, WebSocket] = {}

    @property
    def usernames(self) -> list[str]:
        return sorted(self.connections)

    def is_taken(self, username: str) -> bool:
        return username in self.connections

    def connect(self, username: str, websocket: WebSocket) -> None:
        self.connections[username] = websocket

    def disconnect(self, username: str) -> None:
        self.connections.pop(username, None)

    async def broadcast(self, message: ChatMessage) -> None:
        payload = message.model_dump(mode="json")
        for username, websocket in list(self.connections.items()):
            try:
                await websocket.send_json(payload)
            except (RuntimeError, WebSocketDisconnect):
                logger.warning("Failed to deliver message to %s", username)
                self.disconnect(username)

    async def send_system(self, text: str) -> None:
        await self.broadcast(ChatMessage(type="system", username=SYSTEM_USER, text=text, users=self.usernames))


manager = ConnectionManager()
