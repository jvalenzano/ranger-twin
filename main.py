"""
RANGER ADK Orchestrator

Main entry point for the RANGER multi-agent platform.
Uses Google ADK's FastAPI integration for SSE streaming.

Run locally:
  python main.py
  # or
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Run with ADK web UI (for development):
  adk web --port 8000

Environment variables:
  GOOGLE_API_KEY - Required for Gemini API
  SESSION_SERVICE_URI - Optional Firestore session backend
    Example: firestore://projects/ranger-twin-dev/databases/default
  MCP_FIXTURES_URL - Optional MCP fixtures server URL
    Example: http://localhost:8080/sse
"""

import os
import logging
from pathlib import Path

from google.adk.cli.fast_api import get_fast_api_app

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
