"""
RANGER ADK Orchestrator

Main entry point for the RANGER multi-agent platform.
Uses Google ADK's FastAPI integration for SSE streaming.

Architecture:
  - Single Cloud Run service hosting Recovery Coordinator + all specialists
  - AgentTool pattern for orchestration (ADR-008)
  - Fixture-First data strategy (ADR-009): real federal data bundled in image

Run locally:
  python main.py
  # or
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Run with ADK web UI (for development):
  adk web --port 8000

Environment variables:
  GOOGLE_API_KEY - Required for Gemini API (dev mode)
  GOOGLE_GENAI_USE_VERTEXAI - Set to TRUE for production (uses ADC)
  SESSION_SERVICE_URI - Optional Firestore session backend (Phase 2)
    Example: firestore://projects/ranger-twin-dev/databases/default
  ALLOW_ORIGINS - CORS allowed origins (comma-separated)
"""

import os
import logging
from pathlib import Path
from typing import Optional, List, Any

from pydantic import BaseModel, Field
from google.adk.cli.fast_api import get_fast_api_app

# Import legacy CoordinatorService for /api/v1/chat compatibility
# We add agents/ to path so imports within implementation.py work
import sys
AGENTS_DIR_FOR_PATH = str(Path(__file__).parent / "agents")
if AGENTS_DIR_FOR_PATH not in sys.path:
    sys.path.insert(0, AGENTS_DIR_FOR_PATH)
from coordinator.implementation import CoordinatorService

class ChatRequest(BaseModel):
    """Legacy chat request model for frontend compatibility."""
    session_id: str
    query: str
    fire_context: Optional[dict[str, Any]] = None

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("ranger-orchestrator")

# Configuration from environment
AGENTS_DIR = os.environ.get("AGENTS_DIR", str(Path(__file__).parent / "agents"))
SESSION_SERVICE_URI = os.environ.get(
    "SESSION_SERVICE_URI",
    None  # Use in-memory by default, Firestore in production
)
ALLOW_ORIGINS = os.environ.get("ALLOW_ORIGINS", "*").split(",")

# Log configuration
logger.info(f"RANGER ADK Orchestrator starting...")
logger.info(f"Agents directory: {AGENTS_DIR}")
logger.info(f"Session service: {SESSION_SERVICE_URI or 'in-memory'}")
logger.info(f"CORS origins: {ALLOW_ORIGINS}")


def create_app():
    """Create the FastAPI application with ADK integration."""
    try:
        # Create the ADK FastAPI app
        # This provides:
        # - POST /run_sse - SSE streaming endpoint
        # - GET /dev-ui - ADK development UI (if web=True)
        # - Session management via session_service_uri
        app = get_fast_api_app(
            agents_dir=AGENTS_DIR,
            session_service_uri=SESSION_SERVICE_URI,
            allow_origins=ALLOW_ORIGINS,
            web=False,  # Disable built-in UI, use our React console
        )

        # Add custom health check endpoint
        @app.get("/health")
        async def health_check():
            """Health check for Cloud Run."""
            import google.adk
            return {
                "status": "healthy",
                "service": "ranger-orchestrator",
                "adk_version": getattr(google.adk, "__version__", "unknown"),
                "agents_dir": AGENTS_DIR,
                "session_backend": "firestore" if SESSION_SERVICE_URI else "in-memory"
            }

        # Add root endpoint
        @app.get("/")
        async def root():
            """Root endpoint with API info."""
            return {
                "service": "RANGER ADK Orchestrator",
                "description": "Multi-agent post-fire forest recovery platform",
                "endpoints": {
                    "POST /run_sse": "Stream agent responses via SSE",
                    "GET /health": "Health check",
                },
                "agents": [
                    "coordinator",
                    "burn_analyst",
                    "trail_assessor",
                    "cruising_assistant",
                    "nepa_advisor"
                ]
            }

        # Legacy /api/v1/chat endpoint for Phase 1 frontend compatibility
        coordinator_service = CoordinatorService()

        @app.post("/api/v1/chat")
        async def legacy_chat(request: ChatRequest):
            """Legacy chat endpoint that routes to CoordinatorService."""
            logger.info(f"Legacy chat request: {request.query[:100]}...")
            
            result = await coordinator_service.handle_message(
                query=request.query,
                context={
                    "session_id": request.session_id,
                    "fire_context": request.fire_context
                }
            )
            
            # Map CoordinatorService response to frontend expected format
            return {
                "success": True,
                "response": {
                    "agentRole": result.get("agent_role", "recovery-coordinator"),
                    "summary": result.get("summary", ""),
                    "reasoning": result.get("reasoning", []),
                    "confidence": result.get("confidence", 0),
                    "citations": result.get("citations", []),
                    "recommendations": result.get("recommendations", [])
                },
                "processingTimeMs": result.get("processing_time_ms", 0)
            }

        logger.info("FastAPI app created successfully")
        return app

    except Exception as e:
        logger.error(f"Failed to create FastAPI app: {e}")
        raise


# Create the app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")

    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
