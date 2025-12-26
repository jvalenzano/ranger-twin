"""
NEPA Advisor FastAPI Service

Provides REST endpoints for NEPA compliance guidance and regulatory search.
"""

import logging
import os
from contextlib import asynccontextmanager
from typing import Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .agent import NEPAAdvisorService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("NEPA Advisor service starting...")
    yield
    logger.info("NEPA Advisor service shutting down...")


app = FastAPI(
    title="RANGER NEPA Advisor",
    description="AI-powered NEPA compliance guidance for Forest Service recovery operations",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class ComplianceRequest(BaseModel):
    """Request for NEPA compliance analysis."""
    action_type: str = Field(
        ...,
        description="Type of proposed action",
        examples=["timber_salvage", "trail_repair", "erosion_control"]
    )
    project_context: dict = Field(
        default_factory=dict,
        description="Project details (acres, location, sensitive_species, etc.)"
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Session ID for correlation"
    )


class SearchRequest(BaseModel):
    """Request for regulatory guidance search."""
    query: str = Field(
        ...,
        description="Natural language query about NEPA/FSM/FSH requirements"
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Session ID for correlation"
    )


class ComplianceResponse(BaseModel):
    """Response with NEPA compliance analysis."""
    status: str
    pathway: str
    confidence: float
    synthesis: str
    checklist: str
    citations: list[dict]


class SearchResponse(BaseModel):
    """Response with regulatory guidance."""
    status: str
    guidance: str
    confidence: float
    source: str
    citations: list[dict]


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    version: str
    file_search_configured: bool


# Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    from .tools import get_store_config

    config = get_store_config()

    return HealthResponse(
        status="healthy",
        service="nepa-advisor",
        version="1.0.0",
        file_search_configured=config is not None
    )


@app.post("/analyze", response_model=ComplianceResponse)
async def analyze_compliance(request: ComplianceRequest):
    """
    Analyze NEPA compliance requirements for a proposed action.

    Returns pathway recommendation, compliance checklist, and regulatory citations.
    """
    session_id = request.session_id or str(uuid4())

    try:
        service = NEPAAdvisorService(session_id)
        result = await service.analyze_compliance(
            action_type=request.action_type,
            project_context=request.project_context
        )
        return ComplianceResponse(**result)

    except Exception as e:
        logger.error(f"Compliance analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search", response_model=SearchResponse)
async def search_guidance(request: SearchRequest):
    """
    Search FSM/FSH for regulatory guidance.

    Uses Gemini File Search for RAG over indexed regulatory documents.
    """
    session_id = request.session_id or str(uuid4())

    try:
        service = NEPAAdvisorService(session_id)
        result = await service.search_guidance(request.query)
        return SearchResponse(**result)

    except Exception as e:
        logger.error(f"Guidance search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    """Root endpoint with service info."""
    return {
        "service": "RANGER NEPA Advisor",
        "description": "AI-powered NEPA compliance guidance",
        "endpoints": {
            "/health": "Health check",
            "/analyze": "NEPA compliance analysis",
            "/search": "Regulatory guidance search"
        },
        "documentation": "/docs"
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8004))
    uvicorn.run(app, host="0.0.0.0", port=port)
