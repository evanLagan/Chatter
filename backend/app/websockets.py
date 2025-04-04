from typing import Dict
from fastapi import WebSocket
from collections import defaultdict

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, list[WebSocket]] = defaultdict(list)
        
    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id].append(websocket)
        
    def disconnect(self, user_id: int, websocket: WebSocket):
        self.active_connections[user_id].remove(websocket)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]
            
    async def send_personal_message(self, message: dict, user_id: int):
        for connection in self.active_connections.get(user_id, []):
            await connection.send_json(message)
            
    async def broadcast(self, message: dict):
        for conns in self.active_connections.values():
            for conn in conns:
                await conn.send_json(message)