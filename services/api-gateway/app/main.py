"""
RANGER API Gateway - Main Application

The central router for RANGER platform APIs, including:
- REST endpoints for agent queries
- WebSocket endpoints for real-time briefing events
- Health checks and metrics
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import briefings, health


from app.services.redis_client import close_redis_client, get_redis_client


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.
    """
    # Startup: Initialize connections
    logger.info("RANGER API Gateway starting...")
    await get_redis_client()
    yield
    # Shutdown: Clean up resources
    logger.info("RANGER API Gateway shutting down...")
    await close_redis_client()


app = FastAPI(
    title="RANGER API Gateway",
    description="Central API router for the RANGER forest recovery platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware for Command Console
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import briefings, health, chat

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(briefings.router, prefix="/ws", tags=["websocket"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint with API info."""
    return {
        "name": "RANGER API Gateway",
        "version": "0.1.0",
        "status": "operational",
    }
