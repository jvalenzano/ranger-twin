"""
Health Check Router

Provides endpoints for:
- Liveness probe (is the service running?)
- Readiness probe (is the service ready to accept traffic?)
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Liveness probe - is the service running?"""
    return {"status": "healthy"}


@router.get("/ready")
async def readiness_check() -> dict[str, str | bool]:
    """
    Readiness probe - is the service ready to accept traffic?

    Checks:
    - Redis connection (when configured)
    - Agent services availability
    """
    # TODO: Add Redis and agent service checks
    return {
        "status": "ready",
        "redis": False,  # Not yet configured
        "agents": False,  # Not yet configured
    }
