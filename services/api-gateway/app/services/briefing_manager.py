import asyncio
import json
import logging
from typing import Any, Dict, List, Set

from fastapi import WebSocket
from app.services.redis_client import get_redis_client

logger = logging.getLogger(__name__)


class BriefingConnectionManager:
    """
    Manages WebSocket connections for real-time briefing events.
    
    Integrated with Redis Pub/Sub for cross-instance event distribution.
    """

    def __init__(self) -> None:
        # session_id -> Set of WebSocket connections
        self._connections: Dict[str, Set[WebSocket]] = {}
        
        # session_id -> asyncio Task (Redis subscriber)
        self._subscriber_tasks: Dict[str, asyncio.Task] = {}
        
        # session_id -> filter configuration
        self._filters: Dict[str, Dict[str, List[str]]] = {}

    async def connect(self, websocket: WebSocket, session_id: str) -> None:
        """Accept a new WebSocket connection and start subscribing if needed."""
        await websocket.accept()

        if session_id not in self._connections:
            self._connections[session_id] = set()
            
        self._connections[session_id].add(websocket)
        
        # Start subscriber task for this session if not already running
        if session_id not in self._subscriber_tasks:
            self._subscriber_tasks[session_id] = asyncio.create_task(
                self._redis_subscriber(session_id)
            )

        logger.info(
            f"Client connected to session {session_id}. "
            f"Total connections for session: {len(self._connections[session_id])}"
        )

    def disconnect(self, websocket: WebSocket, session_id: str) -> None:
        """Remove a WebSocket connection and clean up if it was the last one."""
        if session_id in self._connections:
            self._connections[session_id].discard(websocket)

            # If no more connections for this session, clean up
            if not self._connections[session_id]:
                del self._connections[session_id]
                
                # Stop the Redis subscriber task
                if session_id in self._subscriber_tasks:
                    self._subscriber_tasks[session_id].cancel()
                    del self._subscriber_tasks[session_id]
                
                if session_id in self._filters:
                    del self._filters[session_id]

        logger.info(f"Client disconnected from {session_id}")

    async def _redis_subscriber(self, session_id: str) -> None:
        """Background task to listen for events on a Redis channel and broadcast them."""
        channel = f"ranger:briefings:{session_id}"
        redis = await get_redis_client()
        pubsub = redis.pubsub()
        
        try:
            await pubsub.subscribe(channel)
            logger.info(f"Subscribed to Redis channel: {channel}")
            
            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        event_data = json.loads(message["data"])
                        await self.broadcast_to_session(session_id, event_data)
                    except json.JSONDecodeError:
                        logger.error(f"Failed to decode message from {channel}: {message['data']}")
                    except Exception as e:
                        logger.error(f"Error broadcasting message from {channel}: {e}")
        except asyncio.CancelledError:
            logger.info(f"Stopping subscriber for {session_id}")
        finally:
            await pubsub.unsubscribe(channel)
            await pubsub.close()

    def set_filters(
        self,
        session_id: str,
        agents: List[str] | None = None,
        event_types: List[str] | None = None,
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

    def _should_send(self, session_id: str, event: Dict[str, Any]) -> bool:
        """Check if an event should be sent based on session filters."""
        if session_id not in self._filters:
            return True

        filters = self._filters[session_id]
        if filters["agents"] and event.get("source_agent") not in filters["agents"]:
            return False
        if filters["event_types"] and event.get("type") not in filters["event_types"]:
            return False
        return True

    async def broadcast_to_session(self, session_id: str, event: Dict[str, Any]) -> int:
        """Broadcast an event to all connections in a session."""
        if session_id not in self._connections:
            return 0

        if not self._should_send(session_id, event):
            return 0

        sent_count = 0
        dead_connections = set()

        for connection in self._connections[session_id]:
            try:
                await connection.send_json(event)
                sent_count += 1
            except Exception as e:
                logger.warning(f"Failed to send to client in {session_id}: {e}")
                dead_connections.add(connection)

        # Cleanup dead connections
        for conn in dead_connections:
            self._connections[session_id].discard(conn)

        return sent_count

    async def broadcast_to_all(self, event: Dict[str, Any]) -> int:
        """Broadcast to ALL sessions. Expensive, use sparingly."""
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
