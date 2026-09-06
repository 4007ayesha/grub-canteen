from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # order_id -> list of connected WebSocket clients
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, order_id: int, websocket: WebSocket):
        await websocket.accept()

        self.active_connections.setdefault(order_id, []).append(websocket)

    def disconnect(self, order_id: int, websocket: WebSocket):
        if order_id in self.active_connections:
            self.active_connections[order_id].remove(websocket)

            if not self.active_connections[order_id]:
                del self.active_connections[order_id]

    async def broadcast(self, order_id: int, message: dict):
        for connection in self.active_connections.get(order_id, []):
            await connection.send_json(message)


manager = ConnectionManager()