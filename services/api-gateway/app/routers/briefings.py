"""
Briefings WebSocket Router

Provides real-time streaming of AgentBriefingEvent objects to the Command Console.

Architecture:
1. Client connects to /ws/briefings/{session_id}
2. Server subscribes to Redis channel ranger:briefings:{session_id}
3. Agent events are published to Redis and forwarded to connected clients
4. Connection maintains heartbeat for reliability

Reference: docs/architecture/AGENT-MESSAGING-PROTOCOL.md
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.briefing_manager import BriefingConnectionManager

logger = logging.getLogger(__name__)

router = APIRouter()

# Global connection manager
manager = BriefingConnectionManager()


@router.websocket("/briefings/{session_id}")
async def briefings_websocket(websocket: WebSocket, session_id: str) -> None:
    """
    WebSocket endpoint for real-time briefing events.

    Args:
        websocket: The WebSocket connection
        session_id: Unique session identifier (from Command Console)

    Protocol:
    - Server sends: AgentBriefingEvent JSON objects
    - Server sends: {"type": "ping"} heartbeats every 30s
    - Client sends: {"type": "pong"} heartbeat responses
    - Client sends: {"type": "subscribe", "agents": ["burn_analyst"]} to filter
    """
    await manager.connect(websocket, session_id)

    try:
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
        })

        # Start heartbeat task
        heartbeat_task = asyncio.create_task(
            _send_heartbeats(websocket, session_id)
        )

        try:
            while True:
                # Wait for client messages (subscription filters, pongs, etc.)
                data = await websocket.receive_json()
                await _handle_client_message(websocket, session_id, data)

        except WebSocketDisconnect:
            logger.info(f"Client disconnected from session {session_id}")
        finally:
            heartbeat_task.cancel()
            try:
                await heartbeat_task
            except asyncio.CancelledError:
                pass

    finally:
        manager.disconnect(websocket, session_id)


async def _send_heartbeats(websocket: WebSocket, session_id: str) -> None:
    """Send periodic heartbeat pings to keep connection alive."""
    while True:
        await asyncio.sleep(30)
        try:
            await websocket.send_json({"type": "ping"})
        except Exception as e:
            logger.warning(f"Heartbeat failed for session {session_id}: {e}")
            break


async def _handle_client_message(
    websocket: WebSocket,
    session_id: str,
    data: dict[str, Any],
) -> None:
    """
    Handle incoming messages from the client.

    Supported message types:
    - pong: Heartbeat response
    - subscribe: Filter events by agent or type
    - unsubscribe: Remove filters
    """
    msg_type = data.get("type")

    if msg_type == "pong":
        # Heartbeat acknowledged
        pass

    elif msg_type == "subscribe":
        agents = data.get("agents", [])
        event_types = data.get("event_types", [])
        manager.set_filters(session_id, agents=agents, event_types=event_types)
        await websocket.send_json({
            "type": "subscribed",
            "agents": agents,
            "event_types": event_types,
        })

    elif msg_type == "unsubscribe":
        manager.clear_filters(session_id)
        await websocket.send_json({"type": "unsubscribed"})

    else:
        logger.warning(f"Unknown message type from {session_id}: {msg_type}")


from agent_common import AgentEventPublisher, AgentBriefingEvent

# Global event publisher for demo/internal use
publisher = AgentEventPublisher()


# Demo endpoint for testing - sends mock briefing events via Redis
@router.get("/briefings/demo/{session_id}")
async def send_demo_event(session_id: str) -> dict[str, str]:
    """
    Send a demo briefing event to test the full Redis -> WebSocket loop.
    """
    demo_event = AgentBriefingEvent.model_validate({
        "schema_version": "1.1.0",
        "event_id": str(uuid4()),
        "parent_event_id": None,
        "correlation_id": str(uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "type": "insight",
        "source_agent": "burn_analyst",
        "severity": "info",
        "ui_binding": {
            "target": "panel_inject",
            "geo_reference": None,
        },
        "content": {
            "summary": "Full Loop Demo: Redis Pub/Sub working.",
            "detail": "This event was published to Redis and received by the WebSocket subscriber.",
            "suggested_actions": [],
        },
        "proof_layer": {
            "confidence": 0.99,
            "citations": [],
            "reasoning_chain": [
                "1. API Gateway received demo request",
                "2. Event published to Redis channel",
                "3. Subscriber task received and broadcasted to WebSocket",
            ],
        },
    })

    success = publisher.publish(session_id, demo_event)

    if success:
        return {"status": "sent_to_redis", "event_id": str(demo_event.event_id)}
    else:
        return {"status": "failed", "error": "Redis publish failed"}
