import logging
from collections import defaultdict
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        self.connections: defaultdict[str, list[WebSocket]] = defaultdict(list)

    def is_online(self, username: str) -> bool:
        return username in self.connections

    @property
    def online(self) -> list[str]:
        return sorted(self.connections)

    async def connect(self, username: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections[username].append(websocket)

    def disconnect(self, username: str, websocket: WebSocket) -> None:
        sockets = self.connections.get(username)
        if not sockets:
            return
        if websocket in sockets:
            sockets.remove(websocket)
        if not sockets:
            del self.connections[username]

    async def _send(self, username: str, websocket: WebSocket, message: dict[str, Any]) -> None:
        try:
            await websocket.send_json(message)
        except (RuntimeError, WebSocketDisconnect):
            logger.warning("Failed to deliver event to %s", username)
            self.disconnect(username, websocket)

    async def broadcast(self, message: dict[str, Any]) -> None:
        for username, sockets in list(self.connections.items()):
            for websocket in list(sockets):
                await self._send(username, websocket, message)

    async def send_to(self, username: str, message: dict[str, Any]) -> None:
        for websocket in list(self.connections.get(username, [])):
            await self._send(username, websocket, message)


manager = ConnectionManager()
