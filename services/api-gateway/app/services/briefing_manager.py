"""
Briefing Connection Manager

Manages WebSocket connections for briefing event streaming.
Handles:
- Connection lifecycle (connect, disconnect)
- Session-based routing
- Event filtering by agent and type
- Broadcasting to connected clients

In production, this will integrate with Redis pub/sub for
cross-instance event distribution.
"""

import logging
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class BriefingConnectionManager:
    """
    Manages WebSocket connections for real-time briefing events.

    Provides:
    - Per-session connection tracking
    - Event filtering (by agent, event type)
    - Broadcast capabilities

    Thread-safety: This implementation is for single-instance use.
    For multi-instance deployments, use Redis pub/sub.
    """

    def __init__(self) -> None:
        # session_id -> list of WebSocket connections
        self._connections: dict[str, list[WebSocket]] = {}

        # session_id -> filter configuration
        self._filters: dict[str, dict[str, list[str]]] = {}

    async def connect(self, websocket: WebSocket, session_id: str) -> None:
        """Accept a new WebSocket connection for a session."""
        await websocket.accept()

        if session_id not in self._connections:
            self._connections[session_id] = []

        self._connections[session_id].append(websocket)
        logger.info(
            f"Client connected to session {session_id}. "
            f"Total connections: {len(self._connections[session_id])}"
        )

    def disconnect(self, websocket: WebSocket, session_id: str) -> None:
        """Remove a WebSocket connection from a session."""
        if session_id in self._connections:
            if websocket in self._connections[session_id]:
                self._connections[session_id].remove(websocket)

            # Clean up empty sessions
            if not self._connections[session_id]:
                del self._connections[session_id]
                if session_id in self._filters:
                    del self._filters[session_id]

        logger.info(f"Client disconnected from session {session_id}")

    def set_filters(
        self,
        session_id: str,
        agents: list[str] | None = None,
        event_types: list[str] | None = None,
    ) -> None:
        """Set event filters for a session."""
        self._filters[session_id] = {
            "agents": agents or [],
            "event_types": event_types or [],
        }

    def clear_filters(self, session_id: str) -> None:
        """Clear all filters for a session."""
        if session_id in self._filters:
            del self._filters[session_id]

    def _should_send(self, session_id: str, event: dict[str, Any]) -> bool:
        """Check if an event should be sent based on session filters."""
        if session_id not in self._filters:
            return True  # No filters = send all

        filters = self._filters[session_id]

        # Check agent filter
        if filters["agents"]:
            if event.get("source_agent") not in filters["agents"]:
                return False

        # Check event type filter
        if filters["event_types"]:
            if event.get("type") not in filters["event_types"]:
                return False

        return True

    async def broadcast_to_session(
        self,
        session_id: str,
        event: dict[str, Any],
    ) -> int:
        """
        Broadcast an event to all connections in a session.

        Returns the number of clients that received the event.
        """
        if session_id not in self._connections:
            return 0

        if not self._should_send(session_id, event):
            return 0

        sent_count = 0
        dead_connections: list[WebSocket] = []

        for connection in self._connections[session_id]:
            try:
                await connection.send_json(event)
                sent_count += 1
            except Exception as e:
                logger.warning(f"Failed to send to client: {e}")
                dead_connections.append(connection)

        # Clean up dead connections
        for conn in dead_connections:
            self._connections[session_id].remove(conn)

        return sent_count

    async def broadcast_to_all(self, event: dict[str, Any]) -> int:
        """
        Broadcast an event to all connected sessions.

        Returns the total number of clients that received the event.
        """
        total_sent = 0
        for session_id in list(self._connections.keys()):
            total_sent += await self.broadcast_to_session(session_id, event)
        return total_sent

    def get_connection_count(self, session_id: str | None = None) -> int:
        """Get the number of active connections."""
        if session_id:
            return len(self._connections.get(session_id, []))
        return sum(len(conns) for conns in self._connections.values())

    def get_active_sessions(self) -> list[str]:
        """Get list of active session IDs."""
        return list(self._connections.keys())
