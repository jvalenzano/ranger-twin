"""
Redis Client Service

Provides a shared Redis connection pool for the API Gateway.
"""

import os
import logging
from typing import Optional

import redis.asyncio as redis

logger = logging.getLogger(__name__)

# Global Redis client
_redis_client: Optional[redis.Redis] = None


async def get_redis_client() -> redis.Redis:
    """
    Get or initialize the shared async Redis client.
    """
    global _redis_client
    if _redis_client is None:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        _redis_client = redis.from_url(
            redis_url, 
            decode_responses=True,
            encoding="utf-8"
        )
        logger.info(f"Initialized Redis client connecting to {redis_url}")
    return _redis_client


async def close_redis_client() -> None:
    """
    Close the shared Redis client connection.
    """
    global _redis_client
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None
        logger.info("Redis client closed.")
