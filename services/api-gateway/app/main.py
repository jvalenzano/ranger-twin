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


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.

    Handles startup and shutdown events for:
    - Redis connection pool
    - Background task cleanup
    """
    # Startup: Initialize connections
    # TODO: Initialize Redis connection pool when Redis is configured
    print("RANGER API Gateway starting...")
    yield
    # Shutdown: Clean up resources
    print("RANGER API Gateway shutting down...")


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

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(briefings.router, prefix="/ws", tags=["websocket"])


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint with API info."""
    return {
        "name": "RANGER API Gateway",
        "version": "0.1.0",
        "status": "operational",
    }
