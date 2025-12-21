"""
RANGER Messaging Utilities

Provides a standardized way for agents to publish AgentBriefingEvent objects
to Redis for consumption by the API Gateway and Command Console.
"""

import json
import logging
from typing import Any, Optional

import redis
from agent_common.types.briefing import AgentBriefingEvent

logger = logging.getLogger(__name__)


class AgentEventPublisher:
    """
    Publisher for AgentBriefingEvent objects.
    
    Standardizes the Redis channel naming and serialization.
    """

    def __init__(
        self, 
        redis_url: str = "redis://localhost:6379",
        channel_prefix: str = "ranger:briefings"
    ) -> None:
        """
        Initialize the publisher.
        
        Args:
            redis_url: URL for the Redis server
            channel_prefix: Prefix for the briefing channels
        """
        self.redis = redis.from_url(redis_url, decode_responses=True)
        self.channel_prefix = channel_prefix

    def publish(self, session_id: str, event: AgentBriefingEvent) -> bool:
        """
        Publish an event to the session's briefing channel.
        
        Args:
            session_id: Unique session identifier
            event: The AgentBriefingEvent to publish
            
        Returns:
            True if published successfully, False otherwise
        """
        channel = f"{self.channel_prefix}:{session_id}"
        
        try:
            # Convert event to JSON string
            message = event.model_dump_json()
            
            # Publish to Redis
            receivers = self.redis.publish(channel, message)
            
            logger.info(
                f"Published {event.type} from {event.source_agent} to {channel}. "
                f"Receivers: {receivers}"
            )
            return True
        except Exception as e:
            logger.error(f"Failed to publish event to {channel}: {e}")
            return False

    def close(self) -> None:
        """Close the Redis connection."""
        self.redis.close()
